const Order = require("../../../models/Sale/orders/order.model");
const Customer = require("../../../models/Customers/customer.model");
const { bot } = require("../bot");

const formatNumber = (num) => Number(num).toLocaleString("uz-UZ");
const handledOrders = new Set(); // oldindan yuborilgan buyurtmalarni nazorat qilish

const userLocationUpdateMap = new Map(); // chatId -> customerId
const chatMessagesMap = new Map(); // chatId -> messageIds

const SentOrder = async (order, msg) => {

  const chatId = order.driverId.chatId;
  const driverId = order.driverId._id;
  const customer = order.customerId;

  // Buyurtma bor-yo'qligini tekshirish
  if (!order || !customer) return;

  await bot.sendMessage(
    chatId,
    `🚨 Sizda yangi buyurtma bor!\n\n📍 Joylashuvingizni yuboring`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    }
  );

  const locationHandler = async (msg) => {
    if (!msg.location) {
      await bot.sendMessage(chatId, "❗ Iltimos, faqatgina joylashuv yuboring.");
      return;
    }

    const { latitude, longitude } = msg.location;

    if (!customer?.location?.lat || !customer?.location?.long) {
      console.log("Mijoz joylashuvi mavjud emas:", order._id);
      return;
    }

    const productLines = order.products
      .map(
        (p) =>
          `🛒 ${p.pro_name}${p.packingType} - ${formatNumber(p.pro_quantity)} ${p.pro_unit} x ${formatNumber(p.pro_price)} so'm = ${formatNumber(
            p.pro_total_price
          )} so'm`
      )
      .join("\n");

   const text = `
🧾 <b>Buyurtma ma’lumotlari</b>  
━━━━━━━━━━━━━━━  
📦 <b>Buyurtma raqami</b>: <code>${order.orderNumber}</code>  

👤 <b>Mijoz</b>: ${customer.fullname}  
📞 <b>Telefon</b>: ${customer.phoneNumber}  

📍 <b>Manzil</b>:  
${customer.address.region || "-"}, ${customer.address.district || "-"}  
${customer.address.neighborhood || "-"}, ${customer.address.street || "-"}  
${customer.address.house ? customer.address.house + "-uy" : ""}  

🕒 <b>Yetkazib berish muddati</b>:  
${order.deliveryTime.toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}  

📌 <b>Location</b>:  
${customer.is_location ? "✅ Kordinata mavjud" : "❌ Kordinata kiritilmagan"}  

🎯 <b>Mo‘ljal</b>:  
${customer.discription || "-"}  

📋 <b>Mahsulotlar</b>:  
${productLines}

━━━━━━━━━━━━━━━  
💰 <b>Jami summa</b>: <b>${formatNumber(order.totalAmount)} so‘m</b> 🟢
`;


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
          customer.is_location ? [{ text: "🚗 Yandex Navigatsiya", url: yandexUrl }] : [],
        ],
      },
    });

    await Order.findByIdAndUpdate(order._id, {
      driverLocation: { lat: latitude, long: longitude },
      isSent: true,
      status: "Haydovchiga yuborildi",
    });

    bot.removeListener("message", locationHandler);
    await bot.deleteMessage(chatId, msg.message_id);
  };

  bot.on("message", locationHandler);
};


// 📦 Callback query handler
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // ✅ Qabul qilish
  if (data.startsWith("accept_")) {
    const orderId = data.split("_")[1];
    const order = await Order.findById(orderId).populate("customerId");

    if (order) {
      const updated = await Order.findByIdAndUpdate(orderId, {
        status: "Yetkazib berilmoqda",
        driverAcceptedTime: new Date(),
      }, { new: true });

      const { lat: latitude, long: longitude } = updated.driverLocation || {};
      const { lat, long } = order.customerId.location || {};
      const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}~${lat},${long}&rtt=auto`;

      await bot.editMessageReplyMarkup({
        inline_keyboard: [
          order.customerId.is_location ? [{ text: "🚗 Yandex navigatsiya", url: yandexUrl }] : [],
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

  // ❌ Bekor qilish
  if (data.startsWith("cancel_")) {
    const orderId = data.split("_")[1];
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

  // 🤝 Mijozga yetkazildi
  if (data.startsWith("delivered_")) {
    const orderId = data.split("_")[1];

    const order = await Order.findById(orderId).populate("customerId");

    if (!order) return bot.sendMessage(chatId, "❌ Buyurtma topilmadi!");

    await Order.findByIdAndUpdate(orderId, {
      status: "Yetkazib berildi",
      driverArrivedTime: new Date(),
    });

    await bot.editMessageReplyMarkup({
      inline_keyboard: [
        [{ text: "✅ Buyurtma muvaffaqiyatli yetkazildi", callback_data: `delivered_confirmed_${orderId}` }],
        [{ text: `🏡 Mijoz manzilini yangilash`, callback_data: `customer_${order.customerId._id}` }],
      ],
    }, {
      chat_id: chatId,
      message_id: query.message.message_id,
    });

    await bot.sendMessage(chatId,
      `📦 *Buyurtma raqami:* ${order.orderNumber}\n\n✅ *Buyurtma muvaffaqiyatli yetkazildi!*`,
      { parse_mode: "Markdown" });
  }

  // 🧭 Mijoz manzilini yangilash
  if (data.startsWith("customer_")) {
    const customerId = data.split("_")[1];

    userLocationUpdateMap.set(chatId, customerId);

    if (chatMessagesMap.has(chatId)) {
      for (const msgId of chatMessagesMap.get(chatId)) {
        try {
          await bot.deleteMessage(chatId, msgId);
        } catch (err) {
          console.warn("❗ Oldingi xabarni o‘chirishda xatolik:", err);
        }
      }
    }

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

    chatMessagesMap.set(chatId, [sentMsg.message_id]);
  }
});

// 🗺️ Foydalanuvchi joylashuv yuborganini tutish
bot.on("message", async (msg) => {
  if (!msg.location) return;

  const chatId = msg.chat.id;
  if (!userLocationUpdateMap.has(chatId)) return;

  const customerId = userLocationUpdateMap.get(chatId);
  const { latitude, longitude } = msg.location;

  const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
    location: {
      lat: latitude,
      long: longitude,
    },
    is_location: true,
  }, { new: true });

  await bot.sendMessage(chatId, `✅ Mijoz ${updatedCustomer.fullname}ning kordinatasi muvaffaqiyatli yangilandi!`);

  if (chatMessagesMap.has(chatId)) {
    for (const msgId of chatMessagesMap.get(chatId)) {
      try {
        await bot.deleteMessage(chatId, msgId);
      } catch (err) { }
    }
    chatMessagesMap.delete(chatId);
  }

  userLocationUpdateMap.delete(chatId);
});

module.exports = { SentOrder };
