const { uuid } = require("uuidv4");
const { bot } = require("../bot");
const { format } = require("date-fns");
const {
  AdminKeyboard,
  UserKeyboard,
  UserKeyboardContinue,
} = require("../../../bot/seam/helpers/keyboards/keyboard");
const SeamUserModel = require("../../../models/bots/seam/seam_user.model");
const SeamDepartmentModel = require("../../../models/bots/seam/seam_department.model");
const SeamProductModel = require("../../../models/bots/seam/seam_product.model");
const SeamWorkModel = require("../../../models/bots/seam/seam_work.model");
const SeamWorkerDayReport = require("../../../models/bots/seam/SeamWorkerDayReport.model");
const model = {
  party_number: "",
  product: "",
  work: "",
  quantity: "",
};
const SendReply = async (data) => {
  bot.sendMessage(
    data.chatId,
    `Partya nomer: ${data.update.party_number}
Mahsulot: ${data.update.product}
Ish turi: ${data.update.work}
Miqdori: ${data.update.quantity}
Yuborilgan vaqti: ${format(data.update.createdAt, "dd.MM.yyyy HH:mm")}
Tasdiqlangan vaqti: ${format(data.update.received_time, "dd.MM.yyyy HH:mm")}

Hisobtingiz ${data.update.status}.`
  );
};
const start = async (msg) => {
  const chatId = msg.from.id;
  const CheckUser = await SeamUserModel.findOne({ chatId: chatId });

  if (CheckUser) {
    bot.sendMessage(
      chatId,
      `Kunlik hisobot yubormoqchi bo'lsangiz

Hisobot yuborish tugmasni bosing.`,

      {
        reply_markup: {
          keyboard: [
            [
              {
                text: `Hisobot yuborish`,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    bot.sendMessage(
      chatId,
      `Assalomu alaykum. Hurmatli foydalanuvchi.

Agar siz tikuv bo'limi xodimi bo'lsangiz.
Kunlik bajargan ishlaringizni hisobotini kirtib borishingiz 
shart!

Eslatib o'tamiz kunlik hisobotlar , ish vaqtidan so'ng
ya'niy  soat 18:00 - 00:00 ga qadar qabul qilinadi!
 
Hisobotlarni kiritish uchun dastlab ro'yxatdan o'tishingiz
kerak

  `,

      {
        reply_markup: {
          keyboard: [
            [
              {
                text: `Ro'yxatdan o'tish`,
              },
              {
                text: `Bekor qilish`,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  }
};
const RequestFullname = async (msg) => {
  const chatId = msg.from.id;
  const username = msg.from.username;
  const first_name = msg.from.first_name;
  await SeamUserModel.create({ chatId, username, first_name });
  bot.sendMessage(
    chatId,
    `Ism familyangizni yozing (FIO)
Namuna : Nazarova Naima Narziyevna
  `
  );
};
const CreateFullname = async (data) => {
  const chatId = data.msg.from.id;
  const fullname = data.msg.text;
  await SeamUserModel.findByIdAndUpdate(
    data.id,
    { fullname, action: "request_phone_number" },
    { new: true }
  );
  bot.sendMessage(chatId, `Telefon raqamingizni yuboring !`, {
    reply_markup: {
      keyboard: [
        [
          {
            text: `Telefon raqamni yuborish`,
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
};
const RequestPhoneNumber = async (data) => {
  if (data.msg.contact) {
    const chatId = data.msg.from.id;
    const phone_number = data.msg.contact.phone_number;
    const id = data.id;
    if (phone_number && phone_number === `998930043936`) {
      const User = await SeamUserModel.findByIdAndUpdate(
        id,
        {
          phone_number,
          admin: true,
          department: "Admin",
          role: 1000,
          action: "menu",
        },
        { new: true }
      );

      bot.sendMessage(chatId, `Siz admin siz!`, {
        reply_markup: {
          keyboard: User.admin ? AdminKeyboard : UserKeyboard,
          resize_keyboard: true,
        },
      });
    } else {
      await SeamUserModel.findByIdAndUpdate(
        id,
        { phone_number, action: "request_code" },
        { new: true }
      );
      bot.sendMessage(
        chatId,
        `Masteringiz tomonidan berilgan 4 xonali kodni kiriting`
      );
    }
  } else {
    bot.sendMessage(
      data.msg.from.id,
      `Telefon nomerni yuborish tugmasini bosing !`
    );
  }
};
const RequestCode = async (data, page = 1) => {
  if (data.msg.text) {
    const chatId = data.msg.from.id;
    const code = data.msg.text;
    const user = data.user;
    await SeamUserModel.findByIdAndUpdate(
      data.user.id,
      { code, action: "request_department" },
      { new: true }
    );
    // const limit = 5;
    // const skip = (page - 1) * limit;
    const departments = await SeamDepartmentModel.find();
    // .skip(skip)
    // .limit(limit)
    // .lean();
    const list = departments.map((department) => {
      return [
        {
          text: department.name,
          callback_data: `${department.name}`,
        },
      ];
    });

    bot.sendMessage(chatId, `Bo'limingizni tanlang !`, {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [
          ...list,
          [
            { text: "Orqaga", callback_data: "back_department" },
            { text: "1", callback_data: "page" },
            { text: "Keyingi", callback_data: "next_department" },
          ],
          user.admin
            ? [
                {
                  text: `Yangi kategory`,
                  callback_data: "add_category",
                },
              ]
            : [],
        ],
      },
    });
  } else {
    bot.sendMessage(
      data.msg.from.id,
      `Master tomonidan berilgan 4 xonali kodni yozing!`
    );
  }
};

const RequestDepartment = async (data) => {
  const chatId = data.chatId;
  const department = data.data;
  const user_id = data.user._id;
  await SeamUserModel.findByIdAndUpdate(
    user_id,
    { department, action: "request_party_number" },
    { new: true }
  );
  bot.sendMessage(
    chatId,
    `Tabriklaymiz siz muvaffaqiyatli ro'yxatdan o'tdingiz!
Kunlik hisobot yubormoqchi bo'lsangiz

Mahsulot partya nomerini kiriting.`
  );
};
const RequestPartyNumber = async (data) => {
  const chatId = data.msg.from.id;
  const user_id = data.user._id;
  const party_number = data.msg.text;
  model.party_number = party_number;
  await SeamUserModel.findByIdAndUpdate(
    user_id,
    { action: "request_product" },
    { new: true }
  );
  // const limit = 5;
  // const skip = (page - 1) * limit;
  const products = await SeamProductModel.find();
  const list = products.map((product) => {
    return [
      {
        text: product.name,
        callback_data: `${product.name}`,
      },
    ];
  });

  bot.sendMessage(chatId, `Mahsulot tanlang !`, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          { text: "Orqaga", callback_data: "back_department" },
          { text: "1", callback_data: "page" },
          { text: "Keyingi", callback_data: "next_department" },
        ],
      ],
    },
  });
};
const RequestProduct = async (data) => {
  const chatId = data.chatId;
  const product = data.data;
  const user_id = data.user._id;
  model.product = product;
  await SeamUserModel.findByIdAndUpdate(
    user_id,
    { action: "request_work" },
    { new: true }
  );
  // const limit = 5;
  // const skip = (page - 1) * limit;
  const works = await SeamWorkModel.find();
  const list = works.map((work) => {
    return [
      {
        text: work.name,
        callback_data: `${work.name}`,
      },
    ];
  });

  bot.sendMessage(chatId, `Ish turini  tanlang !`, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          { text: "Orqaga", callback_data: "back_work" },
          { text: "1", callback_data: "page" },
          { text: "Keyingi", callback_data: "next_work" },
        ],
        data.user.admin
          ? [
              {
                text: `Yangi ish`,
                callback_data: "add_work",
              },
            ]
          : [],
      ],
    },
  });
};
const RequestWork = async (data) => {
  const chatId = data.chatId;
  const work = data.data;
  const user_id = data.user._id;
  model.work = work;
  await SeamUserModel.findByIdAndUpdate(
    user_id,
    { action: "request_quantity" },
    { new: true }
  );
  bot.sendMessage(chatId, `Bajargan ishingizni miqdorini kiriting!`);
};
const RequestQuantity = async (data) => {
  const chatId = data.msg.from.id;
  const quantity = data.msg.text;
  const user_id = data.user._id;
  model.quantity = quantity;
  await SeamUserModel.findByIdAndUpdate(
    user_id,
    { action: "request_create" },
    { new: true }
  );
  bot.sendMessage(
    chatId,
    `Hisobot muvaffaqiyatli shakillandi.
Ma'muriyatga yuborish uchun Saqlash tugmasini bosing
yoki Bekor qiling !`,
    {
      reply_markup: {
        keyboard: UserKeyboard,
        resize_keyboard: true,
      },
    }
  );
};
const RequestCreate = async (data) => {
  const chatId = data.msg.from.id;
  const text = data.msg.text;
  const user_id = data.user._id;
  if (text === "Saqlash") {
    await SeamWorkerDayReport.create({
      ...model,
      author: user_id,
      chatId: chatId,
    });
    await SeamUserModel.findByIdAndUpdate(
      user_id,
      { action: "request_finshed" },
      { new: true }
    );
    bot.sendMessage(chatId, `Hisobot muvaffaqiyatli yuborildi.`, {
      reply_markup: {
        keyboard: UserKeyboardContinue,
        resize_keyboard: true,
      },
    });
  }
};
const RequestContinue = async (data) => {
  const chatId = data.msg.from.id;
  const text = data.msg.text;
  const user_id = data.user._id;
  if (text === "Davom etish") {
    await SeamUserModel.findByIdAndUpdate(
      user_id,
      { action: "request_party_number" },
      { new: true }
    );
    bot.sendMessage(chatId, `Partya nomerini kiriting !`);
  }
  if (text === "Hisobot yuborish") {
    await SeamUserModel.findByIdAndUpdate(
      user_id,
      { action: "request_party_number" },
      { new: true }
    );
    bot.sendMessage(chatId, `Partya nomerini kiriting !`);
  }
};
module.exports = {
  SendReply,
  start,
  RequestFullname,
  CreateFullname,
  RequestCode,
  RequestPhoneNumber,
  RequestDepartment,
  RequestPartyNumber,
  RequestProduct,
  RequestWork,
  RequestQuantity,
  RequestCreate,
  RequestContinue,
};
