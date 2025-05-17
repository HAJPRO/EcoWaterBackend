const { uuid } = require("uuidv4");
const Order = require("../../../models/Sale/orders/order.model");
const { bot } = require("../bot");

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");

let handledChatIds = new Set(); // Har bir location event faqat 1 marta ishlashi uchun

const SentOrder = async (order, msg) => {
  const ID = order._id;
  const chatId = order.driverId.chatId;
  const products = order.products;
  const customer = order.customerId;
  const { lat, long } = customer.location;

  // if (
  //   ["Haydovchiga yuborildi", "Yetkazib berilmoqda", "Yetkazildi"].includes(order.status) &&
  //   order.isSent === true
  // ) return;
  // Agar bu haydovchiga ilgari yuborilgan zakazlar bo‘lsa va u hali qabul qilmagan bo‘lsa, location yuborganda barchasini tekshiradi
  const pendingOrders = await Order.find({
    driverId: order.driverId._id,
    status: "Haydovchiga yuborilmoqda",
    isSent: false,
  }).populate("customerId");

  if (!pendingOrders.length) return;

  // 🧭 Haydovchidan joylashuv so‘rash
  await bot.sendMessage(chatId, `🚨 *Sizda ${pendingOrders.length} ta yangi buyurtma bor!*\n\n📍 Joylashuvingizni yuboring`, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });


  // ⏳ Har bir haydovchi uchun 1 marta location olaylik
  const locationHandler = async (msg) => {
    const { latitude, longitude } = msg.location;

    // Har bir zakazga location bo‘yicha ishlov berish
    for (let order of pendingOrders) {
      const ID = order._id;
      const customer = order.customerId;
      const { lat, long } = customer.location;

      // Mahsulotlar formati
      const productLines = order.products
        .map((p) =>
          `🛒 ${p.pro_name} - ${formatNumber(p.pro_quantity)} ${p.pro_unit} x ${formatNumber(p.pro_price)} so'm = ${formatNumber(p.pro_total_price)} so'm`
        )
        .join("\n");

      const text = `📦 Buyurtma nomeri: ${order.orderNumber}
📍 Manzil: ${customer.address.region}
🕒 <b>Yetkazib berish muddati</b>: ${order.deliveryTime.toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
      })}

👤 Mijoz: ${customer.fullname}
📞 Tel: ${customer.phoneNumber}
🏢 Status: ${customer.category}

${productLines}
💰🟢 Jami: ${formatNumber(order.totalAmount)} so'm`;

      const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${lat},${long}&rtt=auto`;

      // Yuborish
      await bot.sendPhoto(chatId, "https://explorerbyx.org/assets/images/ecowater-logo.jpg", {
        caption: text,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Qabul qilish", callback_data: `accept_${ID}` },
              { text: "❌ Bekor qilish", callback_data: `cancel_${ID}` },
            ],
            [{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }],
          ],
        },
      });

      // Ma'lumotni yangilash
      await Order.findByIdAndUpdate(ID, {
        driverLocation: {
          lat: latitude,
          long: longitude,
        },
        isSent: true,
        status: "Haydovchiga yuborildi",
      });
    }

    // Klaviaturani o‘chirish
    if (msg?.message_id) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
      } catch (error) {
        console.error("Xabarni o'chirishda xatolik:", error.message);
      }
    }

    // Location faqat 1 marta ishlashi uchun
    bot.removeListener("location", locationHandler);
  };

  // Har bir haydovchi uchun faqat 1 marta location olaylik
  bot.once("location", locationHandler);
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

      const { lat: latitude, long: longitude } = updated.driverLocation;
      const { lat, long } = order.customerId.location;
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
        inline_keyboard: [[{ text: "✅ Buyurtma muvaffaqiyatli yetkazildi", callback_data: `Delivered_${orderId}` }]],
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
});

module.exports = {
  SentOrder,
};
