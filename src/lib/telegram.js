/**
 * Telegram Bot Notification Utility
 * Sends formatted order notifications to the store owner via Telegram Bot API.
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Send a message via Telegram Bot API with retry logic.
 * @param {string} text - The message text (HTML format supported)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendTelegramMessage(text) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn('Telegram: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return { success: false, error: 'Missing Telegram configuration' };
    }

    const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
    };

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.ok) {
                console.log('Telegram: Message sent successfully');
                return { success: true };
            }

            // If rate limited, wait and retry
            if (response.status === 429 && data.parameters?.retry_after) {
                const waitTime = data.parameters.retry_after * 1000;
                console.warn(`Telegram: Rate limited, retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            console.error(`Telegram: API error (attempt ${attempt}/${MAX_RETRIES}):`, data.description);

            // Don't retry on client errors (except rate limit)
            if (response.status >= 400 && response.status < 500) {
                return { success: false, error: data.description || 'Telegram API client error' };
            }

        } catch (err) {
            console.error(`Telegram: Network error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
        }

        // Exponential backoff before retry
        if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 500; // 1s, 2s
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return { success: false, error: 'Failed after maximum retries' };
}

/**
 * Format and send an order notification to Telegram.
 * @param {Object} orderData
 * @param {string} orderData.id - Order ID
 * @param {string} orderData.customer_name - Customer full name
 * @param {string} orderData.customer_phone - Customer phone number
 * @param {string} orderData.car_name - Product/car name
 * @param {number} orderData.total_amount - Total price
 * @param {string} orderData.customer_city - Wilaya (state)
 * @param {string} orderData.payment_method - Payment method
 * @param {string} [orderData.pickup_date] - Pickup date
 * @param {string} [orderData.return_date] - Return date
 * @param {number} [orderData.total_days] - Total rental days
 * @param {string} [orderData.notes] - Additional notes
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendOrderNotification(orderData) {
    const {
        id,
        customer_name,
        customer_phone,
        car_name,
        total_amount,
        customer_city,
        payment_method,
        pickup_date,
        return_date,
        total_days,
        notes,
    } = orderData;

    // Map payment method to Arabic
    const paymentMethodAr = {
        'espece': 'نقدي 💵',
        'cheque': 'شيك 📄',
    }[payment_method] || payment_method || 'غير محدد';

    // Format total amount
    const formattedAmount = total_amount
        ? `${Number(total_amount).toLocaleString('ar-DZ')} مليون`
        : 'غير محدد';

    // Format dates
    const formatDate = (d) => {
        if (!d) return 'غير محدد';
        try {
            return new Date(d).toLocaleDateString('ar-DZ', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return d;
        }
    };

    const message = [
        `🛒 <b>طلب جديد #${id || ''}</b>`,
        ``,
        `👤 <b>الاسم:</b> ${customer_name || 'غير محدد'}`,
        `📞 <b>الهاتف:</b> ${customer_phone || 'غير محدد'}`,
        `🚗 <b>المنتج:</b> ${car_name || 'غير محدد'}`,
        `💰 <b>المبلغ الإجمالي:</b> ${formattedAmount}`,
        `📍 <b>الولاية:</b> ${customer_city || 'غير محدد'}`,
        `💳 <b>طريقة الدفع:</b> ${paymentMethodAr}`,
        ``,
        `📅 <b>من:</b> ${formatDate(pickup_date)}`,
        `📅 <b>إلى:</b> ${formatDate(return_date)}`,
        `⏱ <b>عدد الأيام:</b> ${total_days || 'غير محدد'}`,
        ...(notes ? [``, `📝 <b>ملاحظات:</b> ${notes}`] : []),
        ``,
        `━━━━━━━━━━━━━━━━━`,
        `✅ تم استلام الطلب بنجاح`,
    ].join('\n');

    return sendTelegramMessage(message);
}

/**
 * Format and send a Custom Pack notification to Telegram.
 * @param {Object} packData
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendCustomPackNotification(packData) {
    const {
        id,
        customer_name,
        customer_phone,
        customer_city,
        pickup_date,
        return_date,
        total_days,
        event_type,
        with_chauffeur,
        with_decoration,
        selected_cars = [],
        estimated_total,
        notes,
    } = packData;

    const formatDate = (d) => {
        if (!d) return 'غير محدد';
        try {
            return new Date(d).toLocaleDateString('fr-DZ', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch {
            return d;
        }
    };

    const formatPriceHelper = (p) => {
        const num = Number(p || 0);
        const val = num > 100 ? (num / 10000) : num;
        const formatted = val.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
        return `${formatted} ${val > 1 ? 'Millions' : 'Million'}`;
    };

    const carsListText = selected_cars.length > 0
        ? selected_cars.map(c => `• <b>${c.name}</b> (${c.formatted_price || formatPriceHelper(c.price)}/j)`).join('\n')
        : 'لم يتم تحديد سيارات';

    const cleanPhone = (customer_phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.substring(1) : cleanPhone;

    const displayTotal = packData.formatted_total || formatPriceHelper(estimated_total);

    const message = [
        `👑 <b>طلب باقة مخصصة جديدة / NOUVEAU PACK VIP</b> 👑`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 <b>العميل / Client:</b> ${customer_name || 'غير محدد'}`,
        `📞 <b>الهاتف / Tél:</b> ${customer_phone || 'غير محدد'}`,
        `📍 <b>الولاية / Wilaya:</b> ${customer_city || 'غير محدد'}`,
        `🎉 <b>المناسبة / Événement:</b> ${event_type || 'غير محدد'}`,
        ``,
        `🚗 <b>السيارات المختارة / Véhicules (${selected_cars.length}):</b>`,
        carsListText,
        ``,
        `🎩 <b>سائق / Chauffeur:</b> ${with_chauffeur ? 'نعم / Oui ✅' : 'بدون سائق / Non ❌'}`,
        `💐 <b>تزيين الموكب / Décoration:</b> ${with_decoration ? 'نعم (ورود وأشرطة) / Oui ✅' : 'بدون تزيين / Non ❌'}`,
        ``,
        `📅 <b>من:</b> ${formatDate(pickup_date)}`,
        `📅 <b>إلى:</b> ${formatDate(return_date)}`,
        `⏱ <b>المدة / Durée:</b> ${total_days || 1} يوم / jours`,
        `💰 <b>التقدير المالي / Estimation:</b> ${displayTotal}`,
        ...(notes ? [``, `📝 <b>ملاحظات / Remarques:</b>\n${notes}`] : []),
        `━━━━━━━━━━━━━━━━━━━━`,
        `📲 <b>واتساب العميل:</b> https://wa.me/${waPhone}`,
        `✨ <i>تم استلام الطلب من موقع Luxury Location</i>`,
    ].join('\n');

    return sendTelegramMessage(message);
}

