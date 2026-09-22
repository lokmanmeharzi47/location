# Spécification de Conception : Vérification de la Disponibilité des Voitures (Supabase)

## 1. Contexte & Problématique
Actuellement, le formulaire de réservation (`BookingModal.jsx`) permet aux clients de sélectionner une **Date de retrait** (`pickup_date`) et une **Date de retour** (`return_date`), puis d'enregistrer la commande dans la table `bookings` sans vérifier si le véhicule sélectionné est déjà réservé par un autre client pour ces mêmes dates.
Cela peut entraîner des réservations en doublon (par exemple, la *Mercedes CLE 2025* possède déjà une réservation confirmée pour le 22-23 septembre 2026, mais le formulaire autorise une nouvelle demande).

## 2. Objectifs
1. **Empêcher les conflits de dates** : Bloquer toute réservation chevauchant une réservation active (`confirmed` ou `قيد التنفيذ`).
2. **Information proactive du client** : Afficher immédiatement dans la fenêtre de réservation les créneaux déjà réservés pour le véhicule sélectionné.
3. **Validation visuelle en temps réel** :
   - Dès que le client saisit ou modifie ses dates de retrait et retour, calcul immédiat de la disponibilité.
   - Si chevauchement : message d'avertissement rouge clair mentionnant la période occupée + désactivation du bouton de validation.
   - Si disponible : badge vert confirmant la disponibilité.
4. **Sécurité côté serveur** : Bloquer toute tentative d'insertion d'une réservation conflictuelle dans `POST /api/orders` (retour HTTP 409 Conflict).
5. **Correction SQL Supabase** : Mettre à jour la fonction PL/pgSQL `check_car_availability` pour corriger les encodages de statuts annulés (`ملغي`, `ملغى`, `cancelled`, etc.) et fixer le `search_path`.

---

## 3. Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js)                       │
│  BookingModal.jsx                                           │
│  ├─ 1. Chargement du modal -> GET /api/cars/[id]/availability│
│  ├─ 2. Affichage des périodes déjà occupées                 │
│  ├─ 3. Choix date retrait & retour                          │
│  └─ 4. Feedback dynamique (Disponible ✅ / Indisponible ❌)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               fetch / POST    │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Next.js (App Router)              │
│  ├─ GET  /api/cars/[id]/availability                        │
│  └─ POST /api/orders (Vérification atomique pré-insertion)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                         │
│  ├─ Table `bookings` (car_id, pickup_date, return_date)     │
│  └─ Fonction SQL `check_car_availability`                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Détails des Composants

### A. Base de données Supabase
- **Critère de conflit** :
  Un conflit existe si une réservation existante pour la même voiture a :
  - `status NOT IN ('cancelled', 'ملغي', 'ملغى', 'annulée', 'annulee', 'rejected', 'refused')`
  - et `pickup_date < nouvelle_date_retour`
  - et `return_date > nouvelle_date_retrait`
- Mise à jour de la fonction `check_car_availability` avec `SET search_path = public`.

### B. Endpoint API Next.js : `GET /api/cars/[id]/availability`
- Reçoit l'ID de la voiture (`[id]`).
- Renvoie la liste des réservations actives à partir d'aujourd'hui :
  ```json
  {
    "success": true,
    "carId": 37,
    "bookedRanges": [
      {
        "id": 505,
        "startDate": "2026-09-22",
        "endDate": "2026-09-23"
      },
      {
        "id": 508,
        "startDate": "2026-09-25",
        "endDate": "2026-09-26"
      }
    ]
  }
  ```

### C. Validation Côté Serveur dans `POST /api/orders`
- Avant d'insérer dans `bookings`, exécute une requête de vérification de conflit :
  ```sql
  SELECT id, pickup_date, return_date 
  FROM bookings 
  WHERE car_id = $1 
    AND (status IS NULL OR status NOT IN ('cancelled', 'ملغي', 'ملغى', 'annulée', 'annulee', 'rejected', 'refused'))
    AND pickup_date < $3::timestamp 
    AND return_date > $2::timestamp
  LIMIT 1;
  ```
- Si un enregistrement est retourné, renvoie une erreur HTTP 409 :
  `{ success: false, error: "CAR_NOT_AVAILABLE", message: "Cette voiture est déjà réservée pour ces dates..." }`

### D. Interface Utilisateur (`BookingModal.jsx`)
1. **Indicateur des créneaux réservés** :
   - Sous les sélecteurs de dates, un conteneur stylé affiche les dates indisponibles (ex. `Réservé : 22/09 - 23/09, 25/09 - 26/09`).
2. **Détection en direct** :
   - Dès que `pickupDate` et `returnDate` sont saisis, vérification immédiate contre les créneaux occupés.
3. **Alerte visuelle et verrouillage du bouton** :
   - Si indisponible : bandeau d'avertissement ambre/rouge + bouton de confirmation grisé et libellé *"Véhicule indisponible pour ces dates"*.
   - Si disponible : badge vert *"Véhicule disponible pour ces dates"*.

---

## 5. Dictionnaires de Traduction (`fr.json`, `ar.json`, `en.json`)
Ajout des clés :
- `already_booked_dates`: Périodes déjà réservées
- `car_available`: Voiture disponible pour ces dates
- `car_unavailable`: Voiture déjà réservée pour cette période
- `dates_overlap_error`: Veuillez modifier vos dates de location.
