const { bot } = require("../bot");
const { AdminKeyboard, UserKeyboard } = require("../../../bot/seam/helpers/keyboards/keyboard");
const SeamUserModel = require("../../../models/bots/seam/seam_user.model");
const SeamDepartmentModel = require("../../../models/bots/seam/seam_department.model");

const start = async (msg) => {
  const chatId = msg.from.id;
  const CheckUser = await SeamUserModel.findOne({ chatId: chatId });

  if (CheckUser) {
    bot.sendMessage(
      chatId,

      {
        reply_markup: {
          keyboard: [
            [
              {
                text: `Kunlik hisobot yuborish`,
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
  const chatId = data.msg.from.id;
  const phone_number = data.msg.contact.phone_number;
  const id = data.id;

  if (phone_number === `+998930043939`) {
    const User = await SeamUserModel.findByIdAndUpdate(
      id,
      { phone_number, admin: true, department: "Admin", role: 1000, action: "menu" },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      `Siz admin siz!`,
      {
        reply_markup: {
          keyboard: User.admin ? AdminKeyboard : UserKeyboard,
          resize_keyboard: true,
        },
      }
    );
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

};
const RequestCode = async (data, page = 1) => {
  const chatId = data.msg.from.id;
  const code = data.msg.text;
  const user = data.user;
  await SeamUserModel.findByIdAndUpdate(
    data.id,
    { code, action: "request_department" },
    { new: true }
  );
  const limit = 5
  const skip = (page - 1) * limit
  const departments = await SeamDepartmentModel.find().skip(skip).limit(limit).lean();
  const list = departments.map((department) => {
    return [
      {
        text: department.name,
        callback_data: `department_${department._id}`
      }
    ]
  })

  bot.sendMessage(chatId, `Bo'limingizni tanlang !`, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          { text: 'Orqaga', callback_data: "back_department" },
          { text: '1', callback_data: "page" },
          { text: 'Keyingi', callback_data: "next_department" },

        ],
        user.admin ? [
          {
            text: `Yangi kategory`,
            callback_data: "add_category"
          }
        ] : []
      ]


    },
  });



};

const RequestDepartment = async (data) => {
  const chatId = data.msg.from.id;
  const department = data.msg.text;
  const checkUser = await SeamUserModel.findById(data.id)
  await SeamUserModel.findByIdAndUpdate(
    data.id,
    { department, action: "menu" },
    { new: true }
  );
  bot.sendMessage(
    chatId,
    `${checkUser.admin ? 'Siz admin siz!' : `Siz muvaffaqiyatli ro'yxatdan o'tdingiz! Tabriklaymiz 😁😁😁
    Hisobot qo'shishni boshlash uchun ish turini tanlang !`} `,
    {
      reply_markup: {
        keyboard: checkUser.admin ? AdminKeyboard : UserKeyboard,
        resize_keyboard: true,
      },
    }
  );
};

module.exports = {
  start,
  RequestFullname,
  CreateFullname,
  RequestCode,
  RequestPhoneNumber,
  RequestDepartment,
};
