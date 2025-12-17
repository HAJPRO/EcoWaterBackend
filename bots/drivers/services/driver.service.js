const Order = require("../../../models/Sale/orders/sales.model"); // SaleOrder modeliga moslandi
const Customer = require("../../../models/Customers/customer.model");
const { bot } = require("../bot");
const { Types } = require("mongoose"); // ObjectId bilan ishlash uchun

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");

// =====================================================================
// 🚨 Global Holatlar (Listenerlarni nazorat qilish uchun)
// =====================================================================
const locationHandlers = new Map(); // orderId -> locationHandler function
const userLocationUpdateMap = new Map(); // chatId -> customerId (Manzilni yangilash uchun)

/**
 * Haydovchiga yangi buyurtma yuborish va uning joylashuvini so'rash.
 * @param {Object} order - Populated SaleOrder modeli (driverId, customerId populated bo'lgan)
 */
const SentOrder = async (order) => {
    // Buyurtma oldindan jo'natilganligini tekshirish - status orqali tekshirish yaxshiroq
    if (order.status !== "Haydovchiga yuborildi" && order.status !== "Yetkazilmoqda") {
        // Faqat birinchi marta yuborish uchun
        await Order.findByIdAndUpdate(order._id, { isSent: true, status: "Haydovchiga yuborilmoqda" });
    }

    const chatId = order.driverId.chatId;
    const customer = order.customerId;
    const orderId = order._id;

    if (!order || !customer || !chatId) {
        console.error("Xato: SentOrder uchun etarli ma'lumot yo'q.", order);
        return;
    }

    try {
        await bot.sendMessage(
            chatId,
            `🚨 Sizda yangi buyurtma bor!\n\n📦 Buyurtma raqami: *${order.orderNumber}*\n\n📍 Iltimos, joylashuvingizni yuboring (Buyurtma qabul qilishdan avval!)`,
            {
                parse_mode: "Markdown",
                reply_markup: {
                    keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
                    one_time_keyboard: true,
                    resize_keyboard: true,
                },
            }
        );

        // Bir martalik listener yaratish
        const locationHandler = async (msg) => {
            if (msg.chat.id !== chatId) return; // Faqat ushbu haydovchi uchun
            
            // Listenerni darhol olib tashlash
            bot.removeListener("message", locationHandler);
            locationHandlers.delete(orderId.toString());

            if (!msg.location) {
                // Agar foydalanuvchi joylashuv o'rniga matn yuborsa
                await bot.sendMessage(chatId, "❗ Iltimos, faqatgina joylashuv yuboring. Buyurtmani qayta yuboring.");
                return;
            }

            const { latitude, longitude } = msg.location;

            // Mijoz manzili mavjudligini tekshirish
            if (!customer?.location?.lat || !customer?.location?.long) {
                console.log("Mijoz joylashuvi mavjud emas:", order._id);
                // Agar manzil bo'lmasa ham davom etamiz, lekin navigatsiya tugmasi bo'lmaydi
            }

            // 1. Mahsulotlar ro'yxatini shakllantirish (SaleOrder.items ga moslab)
            const productLines = order.items
                .map(
                    (item) =>
                        `🛒 ${item.productName} - ${formatNumber(item.quantity)} ${item.unit} x ${formatNumber(item.salePrice)} so'm = ${formatNumber(
                            item.total
                        )} so'm`
                )
                .join("\n");
            
            // 2. Buyurtma matnini yaratish
            const addressString = customer.address
                ? `${customer.address.region || "-"}, ${customer.address.district || "-"}, ${customer.address.neighborhood || "-"}, ${customer.address.street || "-"}, ${customer.address.house ? customer.address.house + "-uy" : ""}`
                : "Manzil kiritilmagan";

            const text = `
🧾 <b>Buyurtma ma’lumotlari</b>  
━━━━━━━━━━━━━━━  
📦 <b>Buyurtma raqami</b>: <code>${order.orderNumber}</code>  

👤 <b>Mijoz</b>: ${customer.fullname}  
📞 <b>Telefon</b>: <code>${customer.phoneNumber}</code>  

📍 <b>Manzil</b>: ${addressString}  

📌 <b>Location</b>:  
${customer.is_location ? "✅ Kordinata mavjud" : "❌ Kordinata kiritilmagan"}  

🎯 <b>Mo‘ljal (Izoh)</b>:  
${customer.discription || "-"}  

📋 <b>Mahsulotlar</b>:  
${productLines}

━━━━━━━━━━━━━━━  
💰 <b>Jami summa</b>: <b>${formatNumber(order.totalAmount)} so‘m</b> 🟢
`;
            
            // 3. Yandex URL yaratish (Faqat mijoz lokatsiyasi bo'lsa)
            const yandexUrl = (customer.is_location && customer.location.lat && customer.location.long)
                ? `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${customer.location.lat},${customer.location.long}&rtt=auto`
                : null;

            // 4. Xabarni jo'natish
            await bot.sendPhoto(chatId, "https://explorerbyx.org/assets/images/ecowater-logo.jpg", {
                caption: text,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "✅ Qabul qilish", callback_data: `accept_${order._id}` },
                            { text: "❌ Bekor qilish", callback_data: `cancel_${order._id}` },
                        ],
                        ...(yandexUrl ? [[{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }]] : []),
                    ],
                },
            });

            // 5. Ma'lumotlar bazasini yangilash
            await Order.findByIdAndUpdate(order._id, {
                driverLocation: { lat: latitude, long: longitude },
                status: "Haydovchiga yuborildi", // Jo'natildi
                isSent: true,
            });

            // Foydalanuvchi joylashuv yuborgan xabarni o'chirish (UX uchun)
            try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) { /* silent */ }

        };
        
        // Listenerni Mapga saqlash
        locationHandlers.set(orderId.toString(), locationHandler);
        bot.on("message", locationHandler);

    } catch (error) {
        console.error("Buyurtmani yuborishda global xato:", error);
    }
};


// 📦 Callback query handler
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const orderId = data.split("_")[1];

    // Query tugmasini yuklanmoqda holatiga o'tkazish
    await bot.answerCallbackQuery(query.id, { text: "Yuklanmoqda..." });

    // 1. ✅ Qabul qilish
    if (data.startsWith("accept_")) {
        const order = await Order.findById(orderId).populate("customerId");

        if (!order) return bot.sendMessage(chatId, `❌ Buyurtma topilmadi!`);

        // Buyurtmani qabul qilish
        const updated = await Order.findByIdAndUpdate(orderId, {
            status: "Yetkazib berilmoqda",
            driverAcceptedTime: new Date(),
        }, { new: true });

        // Navigatsiya URL'ini yangilash
        const { lat: driverLat, long: driverLong } = updated.driverLocation || {};
        const { lat: customerLat, long: customerLong } = order.customerId.location || {};
        
        const yandexUrl = (order.customerId.is_location && customerLat && customerLong && driverLat && driverLong)
            ? `https://yandex.com/maps/?rtext=~${driverLat},${driverLong}~${customerLat},${customerLong}&rtt=auto`
            : null;

        await bot.editMessageReplyMarkup({
            inline_keyboard: [
                ...(yandexUrl ? [[{ text: "🚗 Yandex navigatsiya", url: yandexUrl }]] : []),
                [{ text: "🤝 Mijozga yetkazildi", callback_data: `delivered_${orderId}` }],
            ],
        }, {
            chat_id: chatId,
            message_id: query.message.message_id,
        });
        
        await bot.sendMessage(chatId, `✅ *Buyurtma ${order.orderNumber} qabul qilindi!* Yo'lga chiqing.`, { parse_mode: "Markdown" });
        return;
    }

    // 2. ❌ Bekor qilish
    if (data.startsWith("cancel_")) {
        const order = await Order.findById(orderId).populate("customerId");

        if (!order) return bot.sendMessage(chatId, `❌ Buyurtma topilmadi!`);

        await Order.findByIdAndUpdate(orderId, { status: "Bekor qilindi" });

        await bot.editMessageCaption(
            `📦 Buyurtma raqami: ${order.orderNumber}\n\n❌ Buyurtma *BEKOR QILINDI*`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{ text: "❌ Bekor qilindi", callback_data: `cancelled_${orderId}` }]],
                },
            }
        );
        return;
    }

    // 3. 🤝 Mijozga yetkazildi
    if (data.startsWith("delivered_")) {
        const order = await Order.findById(orderId).populate("customerId");
        
        if (!order) return bot.sendMessage(chatId, "❌ Buyurtma topilmadi!");

        // Statusni yangilash
        await Order.findByIdAndUpdate(orderId, {
            status: "Yetkazib berildi",
            driverArrivedTime: new Date(),
        });

        // Kordinatani yangilash taklifini berish
        await bot.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: "✅ Buyurtma muvaffaqiyatli yakunlandi", callback_data: `delivered_confirmed_${orderId}` }],
                [{ text: `🏡 Mijoz manzilini yangilash`, callback_data: `customer_update_location_${order.customerId._id}` }],
            ],
        }, {
            chat_id: chatId,
            message_id: query.message.message_id,
        });

        await bot.sendMessage(chatId,
            `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n✅ *Buyurtma yetkazildi. Iltimos, yakunlang yoki manzilni yangilang.*`,
            { parse_mode: "Markdown" });
        return;
    }

    // 4. 🧭 Mijoz manzilini yangilash boshlanishi
    if (data.startsWith("customer_update_location_")) {
        const customerId = data.split("_")[3]; // customer_update_location_ID
        
        // Bu bosqichda haydovchining keyingi joylashuv yuborishini ushlab turish uchun Mapga joylaymiz
        userLocationUpdateMap.set(chatId, customerId);

        const sentMsg = await bot.sendMessage(chatId,
            `🏡 *Mijozga joylashuvni yangilash uchun!*\n\n🛑 *Aynan mijoz manzilida turgan bo'lishingiz kerak.*\n⚠️ *Aks holda siz noto'g'ri manzilni yuborasiz.*\n\n📍 Iltimos, joylashuvingizni yuboring:`,
            {
                parse_mode: "Markdown",
                reply_markup: {
                    keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
                    one_time_keyboard: true,
                    resize_keyboard: true,
                },
            }
        );
        // Bu xabarni keyinchalik o'chirish uchun (Optional, avvalgi kodda bor edi)
        // chatMessagesMap ni ishlatish mantiqiy, lekin tozalash qiyinligi uchun o'chirildi.
        
        return;
    }
});

// 🗺️ Foydalanuvchi joylashuv yuborganini tutish (Global Listener)
bot.on("message", async (msg) => {
    // Agar joylashuv yuborilmagan bo'lsa yoki manzil yangilash rejimida bo'lmasa, e'tiborsiz qoldiramiz
    if (!msg.location || !userLocationUpdateMap.has(msg.chat.id)) return;

    const chatId = msg.chat.id;
    const customerId = userLocationUpdateMap.get(chatId);
    const { latitude, longitude } = msg.location;
    
    // DBni yangilash
    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
        location: {
            lat: latitude,
            long: longitude,
        },
        is_location: true,
    }, { new: true });

    await bot.sendMessage(chatId, `✅ Mijoz ${updatedCustomer.fullname}ning kordinatasi muvaffaqiyatli yangilandi!`, {
        reply_markup: { remove_keyboard: true } // Klaviyaturani o'chirish
    });

    // Holatni tozalash
    userLocationUpdateMap.delete(chatId);

    // Oldingi manzil so'rovi xabarini o'chirishni bu yerda bajarish qiyin,
    // shuning uchun manzil so'rovi xabarini yuborish joyida delete qilish mantiqiyroq edi.
    // Hozircha global listener qismida o'chirish qoldi.
});


module.exports = { SentOrder };