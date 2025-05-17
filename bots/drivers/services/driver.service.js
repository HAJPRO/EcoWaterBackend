const SentOrder = async (order, msg) => {
  const chatId = order.driverId.chatId;

  // Agar bu haydovchiga ilgari yuborilgan zakazlar bo‘lsa va u hali qabul qilmagan bo‘lsa, location yuborganda barchasini tekshiradi
  const pendingOrders = await Order.find({
    driverId: order.driverId._id,
    status: { $in: ["Yangi", "Haydovchiga yuborildi"] },
    isSent: { $ne: true },
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
