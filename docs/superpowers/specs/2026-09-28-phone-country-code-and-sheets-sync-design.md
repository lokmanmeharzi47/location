# Spécification de Conception : Préfixe Téléphonique International & Synchronisation Google Sheet

## 1. Contexte & Problématique
Lors de la réservation d'un véhicule (via le formulaire de réservation `BookingModal.jsx` ou le pack personnalisé `CustomPackClient.jsx`), le numéro de téléphone est actuellement saisi sous forme d'un simple champ texte local (ex: `0559309680`).
Cela pose deux problèmes :
1. **Absence d'indicatif pays** : Les clients internationaux ou résidant à l'étranger (diaspora algérienne en France, Canada, etc.) ne peuvent pas facilement indiquer leur code pays, et le numéro stocké manque de contexte international.
2. **Affichage dans Google Sheets** : Lorsque le numéro avec un indicatif international (ex: `+213...`) est envoyé à Google Sheet via le webhook/script, Google Sheets interprète le symbole `+` comme le début d'une formule mathématique ou convertit la valeur en notation scientifique (ex: `2.14E+11`) ou tronque des chiffres.

## 2. Objectifs
1. **Sélecteur d'indicatif pays intégré (`PhoneInput.jsx`)** :
   - Proposer une liste des indicatifs pays les plus fréquents (Algérie 🇩🇿 `+213` par défaut, France 🇫🇷 `+33`, Tunisie 🇹🇳 `+216`, Maroc 🇲🇦 `+212`, Émirats 🇦🇪 `+971`, Espagne 🇪🇸 `+34`, Canada/USA 🇨🇦/🇺🇸 `+1`, etc.).
   - Permettre à l'utilisateur de sélectionner son pays et de saisir son numéro local.
   - Nettoyer automatiquement le premier `0` redondant lors de la concaténation (ex: `+213` + `0559309680` -> `+213 559309680`).
2. **Cohérence multi-pages** :
   - Intégrer ce composant à la fois dans `BookingModal.jsx` (modal de réservation de véhicule) et `CustomPackClient.jsx` (créateur de pack cortège/VIP).
3. **Formatage textuel pour Google Sheets** :
   - Dans `src/app/api/orders/route.js`, formater le numéro destiné à Google Sheet avec une apostrophe de tête (`'+213 559309680`) pour forcer Google Sheets à afficher la chaîne textuelle intégrale sans erreur de formule ni troncature.
4. **Conservation des formats Telegram & WhatsApp** :
   - Affichage propre dans les notifications Telegram.
   - Génération correcte du lien WhatsApp direct (`wa.me/213559309680`).

---

## 3. Architecture & Composants

### A. Composant Réutilisable : `src/components/PhoneInput.jsx`
* **Props** :
  * `value`: Chaîne du numéro complet (ou local).
  * `onChange(fullNumber, details)`: Émetteur de la valeur finale `+<dialCode> <localNumber>`.
  * `defaultCountry`: `"DZ"` (`+213`).
  * `placeholder`: Chaîne d'exemple.
  * `required`: Booléen.
  * `disabled`: Booléen.
* **Comportement** :
  * Menu déroulant stylé avec drapeau, nom et indicatif.
  * Champ de saisie numérique en `dir="ltr"` respectant le design luxury (bordures `slate-700`, focus doré `gold-400`).
  * Normalisation automatique des entrées utilisateur.

### B. Intégration Formulaires
* **`BookingModal.jsx`** :
  * Remplacement du champ `<input type="tel">` par `<PhoneInput>`.
  * Mise à jour de l'état `formData.phoneNumber` avec la valeur internationale.
* **`CustomPackClient.jsx`** :
  * Remplacement du champ téléphone par `<PhoneInput>`.
  * Mise à jour de `formData.customerPhone`.

### C. Backend API & Synchronisation Google Sheet (`src/app/api/orders/route.js`)
* Lors de la construction de l'objet `sheetData.record` envoyé à `GOOGLE_SHEET_SCRIPT_URL` :
  ```javascript
  const sheetPhone = customer_phone
      ? (customer_phone.startsWith("'") ? customer_phone : `'${customer_phone}`)
      : '-';
  ```
* Stockage dans la table PostgreSQL `bookings` : `customer_phone` reste au format propre `+213 559309680` sans apostrophe.

---

## 4. Tests & Validation
1. **Validation TypeScript & ESLint** : Vérifier que `npm run typecheck` et `npm run lint` passent sans erreur.
2. **Test Réservation Véhicule** :
   - Ouvrir la modal de réservation.
   - Vérifier le pays par défaut (Algérie `+213`).
   - Tester avec un numéro commençant par `0` (ex: `0559309680`) -> Vérifier que la valeur envoyée est `+213 559309680`.
   - Changer le pays pour la France (`+33 612345678`) -> Vérifier la transmission.
3. **Test Pack Personnalisé** :
   - Vérifier le fonctionnement du sélecteur d'indicatif et le lien WhatsApp généré.
4. **Vérification Payload Google Sheet** :
   - Vérifier que `customer_phone` transmis au webhook Google Sheet commence par `'` pour préserver le signe `+` et tous les chiffres.
