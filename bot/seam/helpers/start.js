const { bot } = require("../bot");
const SeamUserModel = require("../../../models/bots/seam/auth.model");

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
    { fullname, action: "request_code" },
    { new: true }
  );
  bot.sendMessage(
    chatId,
    `Masteringiz tomonidan berilgan 4 xonali kodni kiriting
  `
  );
};
const RequestCode = async (data) => {
  const chatId = data.msg.from.id;
  const code = data.msg.text;
  await SeamUserModel.findByIdAndUpdate(
    data.id,
    { code, action: "request_phone_number" },
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
  await SeamUserModel.findByIdAndUpdate(
    id,
    { phone_number, action: "request_department" },
    { new: true }
  );
  bot.sendMessage(chatId, `Bo'limingizni tanlang !`, {
    reply_markup: {
      keyboard: [
        [
          {
            text: `Bo'lim 1`,
          },
          {
            text: `Bo'lim 2`,
          },
          {
            text: `Bo'lim 3`,
          },
        ],
        [
          {
            text: `Bo'lim 4`,
          },
          {
            text: `Bo'lim 5`,
          },
          {
            text: `Bo'lim 6`,
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
};
const RequestDepartment = async (data) => {
  const chatId = data.msg.from.id;
  const department = data.msg.text;
  await SeamUserModel.findByIdAndUpdate(
    data.id,
    { department, action: "menu" },
    { new: true }
  );
  bot.sendMessage(
    chatId,
    `Siz muvaffaqiyatli ro'yxatdan o'tdingiz ! Tabriklaymiz 😁😁😁
Hisobot qo'shishni boshlash uchun ish turini tanlang !`,
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: `Ko'ylak`,
            },
            {
              text: `Futbolka`,
            },
            {
              text: `Mayka`,
            },
          ],
        ],
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
