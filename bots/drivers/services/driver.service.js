const Order = require("../../../models/Sale/orders/order.model");
const { bot } = require("../bot");

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");

const handledChatIds = new Set(); // Har bir haydovchi uchun location faqat 1 marta qabul qilinsin

const SentOrder = async (order, msg) => {
  const chatId = order.driverId.chatId;
  const driverId = order.driverId._id;

  // Faqat hali yuborilmagan va statusi "Haydovchiga yuborilmoqda" bo‘lgan buyurtmalarni olish
  const pendingOrders = await Order.find({
    driverId,
    status: "Haydovchiga yuborilmoqda",
    isSent: false,
  }).populate("customerId");

  if (!pendingOrders.length) return;

  await bot.sendMessage(chatId, `🚨 *Sizda ${pendingOrders.length} ta yangi buyurtma bor!*\n\n📍 Joylashuvingizni yuboring`, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });

  const locationHandler = async (msg) => {
    try {
      // Agar chat uchun location allaqachon qabul qilingan bo‘lsa, yana ishlatmaymiz
      if (handledChatIds.has(chatId)) return;
      handledChatIds.add(chatId);

      if (!msg.location) {
        await bot.sendMessage(chatId, "❗ Iltimos, faqatgina joylashuv yuboring.");
        return;
      }

      const { latitude, longitude } = msg.location;

      for (let order of pendingOrders) {
        const customer = order.customerId;
        if (!customer?.location?.lat || !customer?.location?.long) {
          console.log("Mijozning joylashuvi yetarli emas", order._id);
          continue;
        }

        const productLines = order.products
          .map(p =>
            `🛒 ${p.pro_name} - ${formatNumber(p.pro_quantity)} ${p.pro_unit} x ${formatNumber(p.pro_price)} so'm = ${formatNumber(p.pro_total_price)} so'm`
          )
          .join("\n");

        const text = `📦 Buyurtma nomeri: ${order.orderNumber}
📍 Manzil: ${customer.address.region}
🕒 <b>Yetkazib berish muddati</b>: ${order.deliveryTime.toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
👤 Mijoz: ${customer.fullname}
📞 Tel: ${customer.phoneNumber}
🏢 Status: ${customer.category}

${productLines}
💰🟢 Jami: ${formatNumber(order.totalAmount)} so'm`;

        const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${customer.location.lat},${customer.location.long}&rtt=auto`;

        await bot.sendPhoto(chatId, "https://explorerbyx.org/assets/images/ecowater-logo.jpg", {
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

        // Buyurtmani yangilash
        await Order.findByIdAndUpdate(order._id, {
          driverLocation: { lat: latitude, long: longitude },
          isSent: true,
          status: "Haydovchiga yuborildi",
        });
      }

      await bot.deleteMessage(chatId, msg.message_id);

    } catch (err) {
      console.error("Location handlerda xatolik:", err);
      await bot.sendMessage(chatId, "❌ Ichki tizim xatosi yuz berdi. Iltimos, qayta urinib ko‘ring.");
    } finally {
      bot.removeListener("message", locationHandler);
    }
  };

  // Location event faqat bir marta tinglansin
  bot.once("message", locationHandler);
};


// 📦 Callback query handler
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const callbackData = query.data;

  if (callbackData.startsWith("accept_")) {
    const orderId = callbackData.split("_")[1];
    const order = await Order.findById(orderId).populate("customerId");

    if (order) {
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { status: "Yetkazib berilmoqda", driverAcceptedTime: new Date() },
        { new: true }
      );

      const { lat: latitude, long: longitude } = updated.driverLocation || {};
      const { lat, long } = order.customerId.location || {};
      const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${lat},${long}&rtt=auto`;

      await bot.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }],
          [{ text: "🤝 Mijozga yetkazildi", callback_data: `delivered_${orderId}` }],
        ],
      }, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
    } else {
      await bot.sendMessage(chatId, `❌ Buyurtma topilmadi!`);
    }
  }

  if (callbackData.startsWith("cancel_")) {
    const orderId = callbackData.split("_")[1];
    const order = await Order.findById(orderId).populate("customerId");

    if (order) {
      await Order.findByIdAndUpdate(orderId, { status: "Bekor qilindi" });

      await bot.sendMessage(chatId, `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n❌ *Buyurtma bekor qilindi!*`, {
        parse_mode: "Markdown",
      });

      await bot.editMessageReplyMarkup({
        inline_keyboard: [[{ text: "❌ Buyurtma bekor qilindi", callback_data: `cancelled_${orderId}` }]],
      }, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
    } else {
      await bot.sendMessage(chatId, `❌ Buyurtma topilmadi!`);
    }
  }

  if (callbackData.startsWith("delivered_")) {
    const orderId = callbackData.split("_")[1];
    const order = await Order.findById(orderId);

    if (order) {
      await Order.findByIdAndUpdate(orderId, {
        status: "Yetkazib berildi",
        driverArrivedTime: new Date(),
      });

      await bot.editMessageReplyMarkup({
        inline_keyboard: [[{ text: "✅ Buyurtma muvaffaqiyatli yetkazildi", callback_data: `delivered_confirmed_${orderId}` }]],
      }, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });

      await bot.sendMessage(chatId, `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n✅ *Buyurtma muvaffaqiyatli yetkazildi!*`, {
        parse_mode: "Markdown",
      });
    } else {
      await bot.sendMessage(chatId, `❌ Buyurtma topilmadi!`);
    }
  }

  if (callbackData.startsWith("delivered_confirmed_")) {
    // Qo‘shimcha tasdiqlash bo‘lsa ishlatiladi, hozircha bo‘sh qoladi yoki boshqa funksiyalar qo‘shishingiz mumkin
  }
});

module.exports = {
  SentOrder,
};
