const Order = require("../../../models/Sale/orders/sales.model");
const Customer = require("../../../models/Customers/customer.model");
const User = require("../../../models/user.model");
const { bot } = require("../bot");

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");
const userLocationUpdateMap = new Map();

// --- VIZUAL FORMATLASH FUNKSIYALARI ---
const divider = "━━━━━━━━━━━━━━━━━━";
const header = (title) => `<b>✨ ${title} ✨</b>\n${divider}`;

/**
 * Haydovchiga buyurtma yuborish (Premium Design)
 */
const SentOrder = async (order) => {
    try {
        const customer = await Customer.findById(order.customerId);
        const driver = await User.findById(order.driverId);

        if (!driver?.chatId) return console.error("XATO: Driver chatId topilmadi!");

        const chatId = driver.chatId;

        // 1. Initial Alert
        await bot.sendMessage(chatId, 
            `${header("YANGI BUYURTMA KELDI")}\n` +
            `🆔 Buyurtma: <code>#${order.orderNumber}</code>\n\n` +
            `📍 <i>Davom etish va navigatsiyani ko'rish uchun joylashuvingizni yuboring.</i>`, 
            {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: [[{ text: "📍 Joylashuvni ulashish", request_location: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
        );

        const onMsg = async (msg) => {
            if (msg.chat.id.toString() !== chatId.toString()) return;

            if (msg.location) {
                bot.removeListener("message", onMsg);

                // ✅ Lokatsiyani o'chirish (Chatni toza saqlash)
                try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}

                const { latitude, longitude } = msg.location;

                // Mahsulotlarni chiroyli formatlash
                const itemsList = (order.items || []).map((item, index) => {
                    const total = Number(item.quantity) * Number(item.salePrice);
                    return `📦 <b>${item.name}</b>\n    <code>${item.quantity} ${item.unit || 'ta'} × ${formatNumber(item.salePrice)} = ${formatNumber(total)} so'm</code>`;
                }).join("\n\n");

                const addr = customer?.address;
                const fullAddress = `${addr?.region || ""} ${addr?.district || ""} ${addr?.street || ""}`.trim() || "Kiritilmagan";

                // ASOSIY PREMIUM DIZAYN
                const mainMessage = `
📝 <b>BUYURTMA TAFSILOTLARI</b>
${divider}
🆔 <b>Raqam:</b> <code>#${order.orderNumber}</code>
👤 <b>Mijoz:</b> <b>${customer?.fullname}</b>
📞 <b>Tel:</b> <code>${customer?.phoneNumber}</code>

📍 <b>MANZIL:</b>
<code>${fullAddress}</code>
${customer?.discription ? `🎯 <b>Mo'ljal:</b> <i>${customer.discription}</i>` : ""}

📋 <b>MAHSULOTLAR:</b>
${itemsList}

${divider}
💰 <b>JAMI SUMMA:</b> <u><b>${formatNumber(order.totalAmount || 0)} so‘m</b></u>
💳 <b>TO'LOV:</b> ${order.paymentType === 'cash' ? '💵 NAQD' : '💳 KARTA'}
${divider}`;

                let buttons = [
                    [
                        { text: "✅ QABUL QILISH", callback_data: `accept_${order._id}` },
                        { text: "❌ BEKOR QILISH", callback_data: `cancel_${order._id}` }
                    ]
                ];

                if (customer?.location?.lat) {
                    const yandexUrl = `https://yandex.com/maps/?rtext=${latitude},${longitude}~${customer.location.lat},${customer.location.long}&rtt=auto`;
                    buttons.push([{ text: "🚗 NAVIGATSIYA (YANDEX)", url: yandexUrl }]);
                }

                await bot.sendPhoto(chatId, "https://explorerbyx.org/assets/images/ecowater-logo.jpg", {
                    caption: mainMessage,
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: buttons }
                });

                // Klaviatura yopilganini tasdiqlash (UX uchun vaqtinchalik xabar)
                const tempMsg = await bot.sendMessage(chatId, "✨ Ma'lumotlar yuklandi", { reply_markup: { remove_keyboard: true } });
                setTimeout(() => bot.deleteMessage(chatId, tempMsg.message_id), 1500);
            }
        };

        bot.on("message", onMsg);
    } catch (error) { console.error("SentOrder Error:", error); }
};

/**
 * Interaktiv tugmalar mantiqi
 */
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const [action, id] = query.data.split("_");

    try {
        if (action === "accept") {
            const order = await Order.findByIdAndUpdate(id, { status: "Yetkazib berilmoqda", driverAcceptedTime: new Date() }, { new: true });
            
            await bot.editMessageReplyMarkup({
                inline_keyboard: [[{ text: "🤝 MIJOZGA TOPSHIRILDI", callback_data: `delivered_${id}` }]]
            }, { chat_id: chatId, message_id: messageId });

            await bot.answerCallbackQuery(query.id, { text: "Buyurtma qabul qilindi!", show_alert: false });
            await bot.sendMessage(chatId, `🚀 <b>#${order.orderNumber}</b> yetkazilmoqda...`, { parse_mode: "HTML" });
        }

        if (action === "delivered") {
            const order = await Order.findByIdAndUpdate(id, { status: "Yetkazib berildi", driverArrivedTime: new Date() }, { new: true });
            
            await bot.editMessageReplyMarkup({
                inline_keyboard: [[{ text: "📍 MANZILNI YANGILASH (LOKATSIYA)", callback_data: `updloc_${order.customerId}` }]]
            }, { chat_id: chatId, message_id: messageId });
            
            await bot.sendMessage(chatId, `🏁 <b>#${order.orderNumber}</b> muvaffaqiyatli yakunlandi. Baraka toping!`, { parse_mode: "HTML" });
            await bot.answerCallbackQuery(query.id);
        }

        if (action === "updloc") {
            userLocationUpdateMap.set(chatId, id); // id = customerId
            await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });

            await bot.sendMessage(chatId, 
                `🏡 <b>MANZILNI ANIQLASHTIRISH</b>\n${divider}\n📍 Iltimos, mijoz darvozasi oldida turib joylashuvni yuboring.`, 
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [[{ text: "📍 Aniq manzilni saqlash", request_location: true }]],
                        resize_keyboard: true, one_time_keyboard: true
                    }
                }
            );
        }
    } catch (e) { console.error("Callback Error:", e); }
});

/**
 * Manzilni saqlash va chatni tozalash
 */
bot.on("message", async (msg) => {
    if (msg.location && userLocationUpdateMap.has(msg.chat.id)) {
        const chatId = msg.chat.id;
        const customerId = userLocationUpdateMap.get(chatId);

        try {
            await bot.deleteMessage(chatId, msg.message_id);
            const customer = await Customer.findByIdAndUpdate(customerId, {
                location: { lat: msg.location.latitude, long: msg.location.longitude },
                is_location: true
            }, { new: true });

            await bot.sendMessage(chatId, 
                `✅ <b>MANZIL YANGILANDI!</b>\n${divider}\n👤 Mijoz: <b>${customer.fullname}</b>\n\n<i>Endi bu mijozga navigatsiya 100% aniqlikda ishlaydi.</i>`, 
                { parse_mode: "HTML", reply_markup: { remove_keyboard: true } }
            );
            userLocationUpdateMap.delete(chatId);
        } catch (e) { console.error("Update Location Error:", e); }
    }
});

module.exports = { SentOrder };