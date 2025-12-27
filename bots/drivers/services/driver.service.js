const Order = require("../../../models/Sale/orders/sales.model");
const Customer = require("../../../models/Customers/customer.model");
const User = require("../../../models/user.model");
const { bot } = require("../bot");

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");
const userLocationUpdateMap = new Map();
const divider = "━━━━━━━━━━━━━━━━━━";

/**
 * Navigatsiya tugmasi
 */
const getNavButton = (driverLat, driverLong, customer) => {
    if (customer?.location?.lat && customer?.location?.long) {
        const yandexUrl = `https://yandex.com/maps/?rtext=${driverLat},${driverLong}~${customer.location.lat},${customer.location.long}&rtt=auto`;
        return [{ text: "🚗 NAVIGATSIYA (YANDEX)", url: yandexUrl }];
    }
    return null;
};

/**
 * Haydovchiga buyurtma haqida xabar yuborish (Faqat lokatsiya so'rash)
 */
const SentOrder = async (order) => {
    try {
        const driver = await User.findById(order.driverId);
        if (!driver?.chatId) return;

        // Haydovchiga faqat xabar yuboramiz, listener bu yerda ochilmaydi
        await bot.sendMessage(driver.chatId, 
            `🔔 <b>YANGI BUYURTMA!</b> (ID: #${order.orderNumber})\n` +
            `📍 Ma'lumotlarni ko'rish uchun pastdagi tugmani bosing.`, 
            {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: [[{ text: "📍 Joylashuvni ulashish va buyurtmalarni ko'rish", request_location: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
        );
    } catch (error) { console.error("SentOrder Error:", error); }
};

/**
 * Lokatsiya kelganda barcha "Kutilmoqda" holatidagi buyurtmalarni chiqarish
 */
bot.on("location", async (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;

    // Agar bu mijoz manzilini yangilash bo'lsa
    if (userLocationUpdateMap.has(chatId)) {
        return handleLocationUpdate(msg); 
    }

    try {
        // 1. Haydovchini topamiz
        const driver = await User.findOne({ chatId });
        if (!driver) return;

        // 2. Shu haydovchiga tegishli va hali qabul qilinmagan buyurtmalarni topamiz
        // Status modelga qarab o'zgartirilishi mumkin (masalan: 'pending' yoki 'new')
        const pendingOrders = await Order.find({ 
            driverId: driver._id, 
            status: "Kutilmoqda" ,// yoki sizdagi boshlang'ich status
            isSentDriver : false
        }).lean();

        if (pendingOrders.length === 0) {
            return bot.sendMessage(chatId, "Sizda hozircha yangi buyurtmalar yo'q.", {
                reply_markup: { remove_keyboard: true }
            });
        }

      // 3. Har bir buyurtma uchun alohida xabar yuboramiz
for (const order of pendingOrders) {
    const customer = await Customer.findById(order.customerId);
    
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

    let inline_keyboard = [
        [
            { text: "✅ QABUL QILISH", callback_data: `accept_${order._id}_${latitude}_${longitude}` },
            { text: "❌ BEKOR QILISH", callback_data: `cancel_${order._id}` }
        ]
    ];

    const navBtn = getNavButton(latitude, longitude, customer);
    if (navBtn) inline_keyboard.push(navBtn);

    // Xabarni yuborish
    await bot.sendPhoto(chatId, "https://img.freepik.com/premium-psd/blue-white-milk-carton-with-cup-milk-it_1267171-130.jpg?semt=ais_hybrid", {
        caption: mainMessage,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard }
    });

    // ✅ BUYURTMANI YANGILASH: Haydovchiga yuborilganini belgilash
    await Order.findByIdAndUpdate(order._id, { isSentDriver: true });
}

        // Keyboardni yopish
        const tempMsg = await bot.sendMessage(chatId, "✅ Barcha buyurtmalar yuklandi", { reply_markup: { remove_keyboard: true } });
        setTimeout(() => bot.deleteMessage(chatId, tempMsg.message_id), 2000);

    } catch (error) {
        console.error("Location process error:", error);
    }
});

/**
 * Callback tugmalar mantiqi (O'zgarishsiz qolishi mumkin, lekin xavfsizlik uchun tekshirildi)
 */
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data.split("_");
    const action = data[0];
    const id = data[1];
    const lat = data[2];
    const long = data[3];

    try {
        if (action === "accept") {
            const order = await Order.findByIdAndUpdate(id, { 
                status: "Yetkazib berilmoqda", 
                driverAcceptedTime: new Date() 
            }, { new: true });
            
            const customer = await Customer.findById(order.customerId);
            let buttons = [[{ text: "🤝 MIJOZGA TOPSHIRILDI", callback_data: `delivered_${id}_${lat}_${long}` }]];
            const navBtn = getNavButton(lat, long, customer);
            if (navBtn) buttons.push(navBtn);

            await bot.editMessageReplyMarkup({ inline_keyboard: buttons }, { chat_id: chatId, message_id: messageId });
            await bot.answerCallbackQuery(query.id, { text: "Buyurtma qabul qilindi!" });
        }

        if (action === "delivered") {
            const order = await Order.findByIdAndUpdate(id, { 
                status: "Yetkazib berildi", 
                driverArrivedTime: new Date() 
            }, { new: true });
            
            await bot.editMessageReplyMarkup({
                inline_keyboard: [[{ text: "📍 MANZILNI YANGILASH (ANIQLIK)", callback_data: `updloc_${order.customerId}` }]]
            }, { chat_id: chatId, message_id: messageId });
            
            await bot.sendMessage(chatId, `🏁 <b>#${order.orderNumber}</b> topshirildi.`, { parse_mode: "HTML" });
            await bot.answerCallbackQuery(query.id);
        }

        if (action === "updloc") {
            userLocationUpdateMap.set(chatId, id); // id bu yerda customerId bo'lib keladi
            await bot.sendMessage(chatId, `📍 Darvoza oldida turib "Joylashuvni yuborish" tugmasini bosing.`, {
                reply_markup: {
                    keyboard: [[{ text: "📍 Darvoza koordinatasini yuborish", request_location: true }]],
                    resize_keyboard: true, one_time_keyboard: true
                }
            });
        }
    } catch (e) { console.error("Callback Error:", e); }
});

// Manzilni yangilash uchun alohida funksiya
async function handleLocationUpdate(msg) {
    const chatId = msg.chat.id;
    const customerId = userLocationUpdateMap.get(chatId);
    try {
        const customer = await Customer.findByIdAndUpdate(customerId, {
            location: { lat: msg.location.latitude, long: msg.location.longitude },
            is_location: true
        }, { new: true });

        await bot.sendMessage(chatId, `✅ <b>${customer.fullname}</b> manzili yangilandi!`, { 
            parse_mode: "HTML", 
            reply_markup: { remove_keyboard: true } 
        });
        userLocationUpdateMap.delete(chatId);
    } catch (e) { console.error(e); }
}

module.exports = { SentOrder };