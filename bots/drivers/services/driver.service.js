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
 * Navigatsiya tugmasini shakllantirish uchun yordamchi
 */
const getNavButton = (driverLat, driverLong, customer) => {
    if (customer?.location?.lat && customer?.location?.long) {
        const yandexUrl = `https://yandex.com/maps/?rtext=${driverLat},${driverLong}~${customer.location.lat},${customer.location.long}&rtt=auto`;
        return [{ text: "🚗 NAVIGATSIYA (YANDEX)", url: yandexUrl }];
    }
    return null;
};

/**
 * Haydovchiga buyurtma yuborish
 */
const SentOrder = async (order) => {
    try {
        const customer = await Customer.findById(order.customerId);
        const driver = await User.findById(order.driverId);

        if (!driver?.chatId) return console.error("XATO: Driver chatId topilmadi!");

        const chatId = driver.chatId;

        // 1. Lokatsiya so'rash
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

                try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}

                const { latitude, longitude } = msg.location;

                // Mahsulotlar ro'yxati
                const itemsList = (order.items || []).map((item) => {
                    const total = Number(item.quantity) * Number(item.salePrice);
                    return `📦 <b>${item.name}</b>\n    <code>${item.quantity} ${item.unit || 'ta'} × ${formatNumber(item.salePrice)} = ${formatNumber(total)} so'm</code>`;
                }).join("\n\n");

                const addr = customer?.address;
                const fullAddress = `${addr?.region || ""} ${addr?.district || ""} ${addr?.street || ""}`.trim() || "Kiritilmagan";

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

                // ✅ Tugmalarga koordinatalarni biriktiramiz
                let inline_keyboard = [
                    [
                        { text: "✅ QABUL QILISH", callback_data: `accept_${order._id}_${latitude}_${longitude}` },
                        { text: "❌ BEKOR QILISH", callback_data: `cancel_${order._id}` }
                    ]
                ];

                const navBtn = getNavButton(latitude, longitude, customer);
                if (navBtn) inline_keyboard.push(navBtn);

                await bot.sendPhoto(chatId, "https://explorerbyx.org/assets/images/ecowater-logo.jpg", {
                    caption: mainMessage,
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard }
                });

                const tempMsg = await bot.sendMessage(chatId, "✨ Ma'lumotlar yuklandi", { reply_markup: { remove_keyboard: true } });
                setTimeout(() => bot.deleteMessage(chatId, tempMsg.message_id), 1500);
            }
        };

        bot.on("message", onMsg);
    } catch (error) { console.error("SentOrder Error:", error); }
};

/**
 * Callback tugmalar mantiqi
 */
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const [action, id, lat, long] = query.data.split("_");

    try {
        // --- BUYURTMANI QABUL QILISH ---
        if (action === "accept") {
            const order = await Order.findByIdAndUpdate(id, { 
                status: "Yetkazib berilmoqda", 
                driverAcceptedTime: new Date() 
            }, { new: true });
            
            const customer = await Customer.findById(order.customerId);

            // ✅ Navigator tugmasini saqlab qolgan holda topshirish tugmasini chiqarish
            let buttons = [[{ text: "🤝 MIJOZGA TOPSHIRILDI", callback_data: `delivered_${id}_${lat}_${long}` }]];
            
            const navBtn = getNavButton(lat, long, customer);
            if (navBtn) buttons.push(navBtn);

            await bot.editMessageReplyMarkup({ inline_keyboard: buttons }, { chat_id: chatId, message_id: messageId });
            await bot.answerCallbackQuery(query.id, { text: "Yo'lingiz bexatar bo'lsin!" });
        }

        // --- BUYURTMANI TOPSHIRISH ---
        if (action === "delivered") {
            const order = await Order.findByIdAndUpdate(id, { 
                status: "Yetkazib berildi", 
                driverArrivedTime: new Date() 
            }, { new: true });
            
            // Endi navigatsiya shart emas, faqat lokatsiyani yangilash tugmasi
            await bot.editMessageReplyMarkup({
                inline_keyboard: [[{ text: "📍 MANZILNI YANGILASH (ANIQLIK)", callback_data: `updloc_${order.customerId}` }]]
            }, { chat_id: chatId, message_id: messageId });
            
            await bot.sendMessage(chatId, `🏁 <b>#${order.orderNumber}</b> muvaffaqiyatli topshirildi.`, { parse_mode: "HTML" });
            await bot.answerCallbackQuery(query.id);
        }

        // --- LOKATSIYANI YANGILASH ---
        if (action === "updloc") {
            userLocationUpdateMap.set(chatId, id);
            await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });

            await bot.sendMessage(chatId, 
                `🏡 <b>ANIQ MANZILNI SAQLASH</b>\n${divider}\n📍 Iltimos, mijoz darvozasi oldida turib joylashuvni yuboring.`, 
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [[{ text: "📍 Darvoza koordinatasini yuborish", request_location: true }]],
                        resize_keyboard: true, one_time_keyboard: true
                    }
                }
            );
        }
    } catch (e) { console.error("Callback Error:", e); }
});

/**
 * Lokatsiya yuborilganda manzilni bazaga yozish
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
                `✅ <b>MANZIL SAQLANDI!</b>\n${divider}\n👤 Mijoz: <b>${customer.fullname}</b>\n\n<i>Navigatsiya endi 100% aniqlikda ishlaydi.</i>`, 
                { parse_mode: "HTML", reply_markup: { remove_keyboard: true } }
            );
            userLocationUpdateMap.delete(chatId);
        } catch (e) { console.error("Update Location Error:", e); }
    }
});

module.exports = { SentOrder };