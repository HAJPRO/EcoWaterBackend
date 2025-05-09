const { uuid } = require("uuidv4");
const Order = require("../../../models/Sale/orders/order.model");
const { bot } = require("../bot");
const formatNumber = (num) => {
  return Number(num).toLocaleString("uz-UZ"); // 1 000 000
};


let driverLocation = { latitude: null, longitude: null };
const SentOrder = async (order, msg) => {
  console.log(order);
  
  const ID = order._id;
  const chatId = order.driverId.chatId;
  const products = order.products;
  const customer = order.customerId;
  const { lat, long } = order.customerId.location; // yoki order.location
  if (order.status === 'Haydovchiga yuborildi' && order.isSent ){
    console.log(order);
    return;
  } 

   // 📍 Haydovchidan joylashuv so‘rash
  bot.sendMessage(chatId, `🚨 *Yangi buyurtma!* 🚨\n\n📦 Buyurtmani qabul qilish uchun hozirgi joylashuvingizni yuboring.\n\n👇 Pastdagi "📍 Yuborish" tugmasini bosing:`, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });

  // Haydovchi joylashuvni yuborganidan keyin
  bot.on("location", async (msg) => {
    const { latitude, longitude } = msg.location;
    // Haydovchining joylashuvini saqlash
    driverLocation = { latitude, longitude };

    await Order.findByIdAndUpdate(ID, {
      driverLocation: {
        lat: latitude,
        long: longitude,
      },
    });
    // Mahsulotlar ro'yxatini tayyorlash
    const productLines = products
      .map(
        (p) =>
          `🛒 ${p.pro_name} - ${formatNumber(p.pro_quantity)} ${p.pro_unit} x ${formatNumber(p.pro_price)} so'm = ${formatNumber(p.pro_total_price)} so'm`
      )
      .join("\n");

    const text = `📦 Buyurtma nomeri: ${order.orderNumber}
📍 Manzil: ${order.customerId.address.region}
🕒 <b>Yetkazib berish muddati</b>: ${order.deliveryTime.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}

👤 Mijoz: ${customer.fullname}
📞 Tel: ${customer.phoneNumber}
🏢 Status: ${customer.category}

${productLines}
💰🟢 Jami: ${formatNumber(order.totalAmount)} so'm`;

    // Yandex navigatsiya URL (agar address mavjud bo'lsa)
    const yandexUrl = `https://yandex.com/maps/?rtext=~${driverLocation.latitude},${driverLocation.longitude}~${lat},${long}&rtt=auto`;
// 📤 Xabarni yuborish (foto bilan, karta ko‘rinishida)
await bot.sendPhoto(chatId, 'https://explorerbyx.org/assets/images/ecowater-logo.jpg', {
  caption: text,
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Qabul qilish", callback_data: `accept_${order._id}` },
        { text: "❌ Bekor qilish", callback_data: `cancel_${order._id}` },
      ],
      [{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }],
    ],
  },
});
 // ✅ Xabar muvaffaqiyatli yuborilgandan keyin isSent = true qilish
 await Order.findByIdAndUpdate(ID, { isSent: true, status : "Haydovchiga yuborildi" });
    if (msg && msg.message_id) {
      try {
        await bot.deleteMessage(chatId, msg.message_id); // Joylashuvni o'chirish
      } catch (error) {
        console.error("Xabarni o'chirishda xatolik:", error.message);
      }
    } else {
      console.error("Xabarni o'chirish uchun msg.message_id mavjud emas");
    }
  });
};
// Callback Queryni qabul qilish va backendga so'rov yuborish
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const callbackData = query.data; // "accept_<orderId>" yoki "cancel_<orderId>"

  if (callbackData.startsWith("accept_")) {
    const orderId = callbackData.split("_")[1]; // order ID olish
    const order = await Order.findById(orderId).populate("customerId"); // customerId ni populate qilish
    if (order) {
      const UpdateOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "Yetkazib berilmoqda",
          driverAcceptedTime: new Date(),
        },
        { new: true }
      );
      const { lat: latitude, long: longitude } = UpdateOrder.driverLocation;
      const { lat, long } = order.customerId.location;

      const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${lat},${long}&rtt=auto`;
      await bot.editMessageReplyMarkup(
        {
          inline_keyboard: [
            [{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }],
            [{ text: "🤝 Mijozga yetkazildi", callback_data: `delivered_${order._id}` }],
          ],
        },
        {
          chat_id: chatId,
          message_id: query.message.message_id,
        }
      );
    } else {
      await bot.sendMessage(chatId, `❌ Buyurtma topilmadi !`);
    }
  }
  if(callbackData.startsWith("cancel_")) {
    const orderId = callbackData.split("_")[1]; // order ID olish
    const order = await Order.findById(orderId).populate("customerId"); // customerId ni populate qilish
    if (order) {
      await Order.findByIdAndUpdate(
        orderId,
        { status: "Bekor qilindi" },
        { new: true }
      );
      await bot.sendMessage(chatId, `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n❌ *Buyurtma bekor qilindi!*`, {
        parse_mode: "Markdown"
      });
     // Tugmani va xabarni yangilash
     await bot.editMessageReplyMarkup({
      inline_keyboard: [
        [{ text: "❌ Buyurtma bekor qilindi", callback_data: `cancelled_${orderId}` }] // Bekor qilindi degan xabar
      ]
    }, {
      chat_id: chatId,
      message_id: query.message.message_id
    });
    } else {
      await bot.sendMessage(chatId, `❌ Buyurtma topilmadi !`);
    }
  }
  // Buyurtma yetkazilganligini tasdiqlash
  if (callbackData.startsWith("delivered_")) {
    const orderId = callbackData.split("_")[1];
    const order = await Order.findById(orderId);

    if (order) {
      await Order.findByIdAndUpdate(orderId, {
        status: "Yetkazib berildi",
        driverArrivedTime: new Date()
      });

      await bot.editMessageReplyMarkup({
        inline_keyboard: [ [{ text: "✅ Buyurtma muvaffaqiyatli yetkazildi", callback_data: `Delivered_${order._id}` }],] 
      }, {
        chat_id: chatId,
        message_id: query.message.message_id
      });

      await bot.sendMessage(chatId, `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n✅ *Buyurtma muvaffaqiyatli yetkazildi!*`, {
        parse_mode: "Markdown"
      });
    } else {
      await bot.sendMessage(chatId, "❌ Buyurtma topilmadi!");
    }
  }
});

module.exports = {
  SentOrder,
};
