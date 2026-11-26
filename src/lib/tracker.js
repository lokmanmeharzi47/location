/**
 * Envoi des demandes vers Cars Tracker (suivi centralisé des demandes).
 * Ne bloque et ne fait jamais échouer le parcours client : en cas de
 * problème, l'erreur est seulement journalisée.
 *
 * Variables d'environnement (si absentes, l'envoi est simplement ignoré) :
 *   TRACKER_URL       https://<tracker>/api/ingest
 *   TRACKER_SITE_KEY  clé générée par scripts/create-site-key.mjs côté tracker
 *
 * Luxury Location n'a qu'une agence : le tracker l'applique d'office.
 */

const ATTEMPTS = 2;

/**
 * @param {object} lead - voir le format documenté dans le README du tracker
 * @returns {Promise<boolean>}
 */
export async function sendToTracker(lead) {
    const url = process.env.TRACKER_URL;
    const key = process.env.TRACKER_SITE_KEY;
    if (!url || !key) return false;

    const body = JSON.stringify({ ...lead, submitted_at: new Date().toISOString() });

    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                body,
                cache: 'no-store',
                signal: AbortSignal.timeout(5000),
            });
            if (res.ok) return true;
            // 4xx : inutile de réessayer (clé ou données refusées).
            if (res.status < 500) {
                console.error('[tracker] refusé', res.status, (await res.text().catch(() => '')).slice(0, 300));
                return false;
            }
            console.warn(`[tracker] erreur ${res.status} (essai ${attempt}/${ATTEMPTS})`);
        } catch (err) {
            console.warn(`[tracker] réseau (essai ${attempt}/${ATTEMPTS})`, err?.message || err);
        }
    }
    return false;
}

/**
 * Les prix du site sont stockés soit en DA (> 100), soit en « millions »
 * (<= 100, 1 million = 10 000 DA). L'unité se lit sur le prix par jour,
 * pas sur le total (un total de plusieurs jours peut dépasser 100).
 * @param {number|string} value - montant à convertir
 * @param {number|string} [dailyPrice] - prix par jour de référence
 * @returns {number|undefined} montant en DA
 */
export function toDzd(value, dailyPrice) {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) return undefined;
    const ref = Number(dailyPrice);
    const inMillions = Number.isFinite(ref) && ref > 0 ? ref <= 100 : v <= 100;
    return Math.round(inMillions ? v * 10000 : v);
}

/** Garde une URL d'image seulement si elle est absolue. */
export function absoluteUrl(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined;
}

/** "2026-12-01" ou Date → "2026-12-01" */
export function toDay(value) {
    if (!value) return undefined;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}
