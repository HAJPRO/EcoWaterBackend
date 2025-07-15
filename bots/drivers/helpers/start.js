const { uuid } = require("uuidv4");
const { bot } = require("../bot");
const UserModel = require("../../../models/user.model");
// import moment from "moment-timezone"; ///
const {
  AuthKeyboard,
} = require("../../../bots/drivers/helpers/keyboards/auth.js");
const {
  WorkKeyboard,
} = require("../../../bots/drivers/helpers/keyboards/driver.keyboards.js");
const start = async (msg) => {
  const chatId = msg.from.id;
  bot.sendMessage(
    chatId,
    `Assalomu alaykum hurmatli foydalanuvchi!
Agar siz EcoWater korxonasi xodimi bo'lsangiz, kirish tugmani bosing va o'z ishingizni boshlang.
Agar sizda hali hisob qaydnomangiz bo'lmasa, ro'yxatdan o'tish tugmasini bosing va o'z hisobingizni yarating.`,

    {
      reply_markup: {
        keyboard: AuthKeyboard,
        resize_keyboard: true,
        remove_keyboard: true,
      },
    }
  );
};
const login = async (msg) => {
  const chatId = msg.from.id;

  const driver = await UserModel.findOne({ chatId });
  if (driver?.chatId === String(chatId) && driver?.role === 'driver' && driver?.action === 'login_successfully') {
    bot.sendMessage(
      chatId,
      `Hurmatli foydalanuvchi! 
    
✅ Siz muavffaqiyatli kirish qildingiz.
🎯Ishingizga omad tilaymiz.`,
      {
        reply_markup: {
          keyboard: WorkKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
  if (driver?.chatId === String(chatId) && driver?.role === 'driver' && driver?.action === 'register_successfully') {
    driver.action = "login_username"; // Keyingi bosqich
    await driver.save();

  } else {
    bot.sendMessage(
      chatId,
      `Hurmatli foydalanuvchi tizimga kirish uchun Ro'yxatdan o'tishingiz kerak!
           
🆔 Ro'yxatdan o'tish tugmasini bosing!`
    );
  }
};
const LoginUsername = async (msg) => {
  const chatId = msg.from.id;
  const username = msg.text.trim();

  const driver = await UserModel.findOne({ chatId });
  if (driver.username === username) {
    driver.action = "login_password"; // Keyingi bosqich
    await driver.save();
    bot.sendMessage(
      chatId,
      `🔐 Parolingizni kiriting:\n\n📝 Namuna: 25369`)
  } else {
    bot.sendMessage(
      chatId,
      `❗️ Bunday foydalanuvchi yo'q`)
  }
}
const LoginPassword = async (msg) => {
  const chatId = msg.from.id;
  const password = msg.text.trim();

  const driver = await UserModel.findOne({ chatId });
  if (driver.password === password) {
    driver.action = "login_successfully"; // Keyingi bosqich
    await driver.save();

    bot.sendMessage(
      chatId,
      `Hurmatli foydalanuvchi! 
       
 ✅ Siz muavffaqiyatli kirish qildingiz.
 🎯Ishingizga omad tilaymiz.`,
      {
        reply_markup: {
          keyboard: WorkKeyboard,
          resize_keyboard: true,
        },
      }
    );
  } else {
    bot.sendMessage(
      chatId,
      `❗️ Kirish paroli noto'g'ri !`)
  }
}

const register = async (msg) => {
  const chatId = msg.from.id;

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    driver = await UserModel.create({
      chatId,
      action: "register",
    });

    await bot.sendMessage(
      chatId,
      `Hurmatli foydalanuvchi, ro'yxatdan o'tish boshlandi! 👇\n\n✍️ Iltimos, F.I.O. (to‘liq ism-sharifingizni) kiriting:`
    );
  } else if (driver?.chatId === String(chatId), driver.role === "driver" && driver.action === 'register_successfully') {
    // Agar allaqachon mavjud bo‘lsa
    await bot.sendMessage(chatId, `📌 Siz allaqachon ro'yxatdan o'tgansiz!
Tizimga kirish uchun 🔐 Kirish tugmasini bosing `);
  }
};
const CreateFullname = async (msg) => {
  const chatId = msg.from.id;
  const fullname = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    // Foydalanuvchi yo'q bo‘lsa, yangi yaratamiz
    driver = await UserModel.create({
      chatId,
      fullname,
      action: "register_gender", // keyingi bosqich
      position: "Haydovchi", // Foydalanuvchi roli
      // registerData: [fullname], // inputlarni yigish
    });

    await bot.sendMessage(
      chatId,
      `✅ Ismingiz qabul qilindi!\n\n👫 Endi jinsingizni kiriting (Erkak yoki Ayol):`
    );
  } else if (!driver.fullname) {
    // Foydalanuvchi bor, lekin fullname yo‘q — yangilaymiz
    driver.fullname = fullname;
    driver.action = "register_gender";
    // driver.registerData = [fullname];
    await driver.save();

    await bot.sendMessage(
      chatId,
      `✅ Ismingiz qabul qilindi!\n\n👫 Endi jinsingizni kiriting (Erkak yoki Ayol):`
    );
  } else if (driver.role === "driver") {
    // Allaqachon ro‘yxatdan o‘tgan bo‘lsa
    await bot.sendMessage(chatId, `📌 Siz allaqachon ro'yxatdan o'tgansiz!`);

    await UserModel.findOneAndUpdate(
      { chatId },
      { action: "login" },
      { new: true }
    );

    await bot.sendMessage(
      chatId,
      `🔐 Tizimga kirish uchun login kiriting:\n\n📝 Namuna: anavar001`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );
  }
};
const CreateGender = async (msg) => {
  const chatId = msg.from.id;
  const gender = msg.text.trim();

  // Faqat "Erkak" yoki "Ayol" bo‘lishi kerak
  if (!["Erkak", "Ayol"].includes(gender)) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, "Erkak" yoki "Ayol" deb yozing.`
    );
  }

  let driver = await UserModel.findOne({ chatId });

  if (!driver.fullname) {
    // Avval fullname kiritilmagan — noto‘g‘ri oqim
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ism-sharifingizni kiriting.`
    );
  }

  // Gender kiritamiz va registerData massiviga push qilamiz
  driver.gender = gender;
  driver.action = "register_age"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Jinsingiz saqlandi!\n\n🔢 Endi yoshingizni kiriting:`
  );
};
const CreateAge = async (msg) => {
  const chatId = msg.from.id;
  const age = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver.gender) {
    return bot.sendMessage(chatId, `❗️ Iltimos, avval jinsingizni kiriting.`);
  }

  driver.age = age;
  driver.action = "register_username"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Yoshingiz saqlandi!\n\n🔐 Endi login (foydalanuvchi nomi) kiriting:`
  );
};
const CreateUsername = async (msg) => {
  const chatId = msg.from.id;
  const username = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver.age) {
    return bot.sendMessage(chatId, `❗️ Iltimos, avval yoshingizni kiriting.`);
  }

  driver.username = username;
  driver.action = "register_password"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Foydalanuvchi nomi saqlandi!\n\n🔐 Endi password (foydalanuvchi paroli) kiriting:`
  );
};
const CreatePassword = async (msg) => {
  const chatId = msg.from.id;
  const password = msg.text.trim();
  console.log(password);

  let driver = await UserModel.findOne({ chatId });

  if (!driver.username) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval login (foydalanuvchi nomi)  kiriting.`
    );
  }

  driver.password = password;
  driver.action = "register_passport"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Foydalanuvchi paroli saqlandi!\n\n🔐 Endi passport serya raqamini (AA1234567) kiriting:`
  );
};
const CreatePassport = async (msg) => {
  const chatId = msg.from.id;
  const passportNumber = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  if (driver.passportNumber) {
    return bot.sendMessage(chatId, `❗️ Bunday passport nomer tizimda mavjud!`);
  }

  driver.passportNumber = passportNumber;
  driver.action = "register_region"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Passport raqamingiz saqlandi!\n\n🏠 Endi yashash viloyatingizni kiriting (masalan: Buxoro viloyati):`
  );
};
const CreateRegion = async (msg) => {
  const chatId = msg.from.id;
  const region = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }

  driver.address.region = region;

  driver.action = "register_district"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Viloyat saqlandi!\n\n🏠 Endi yashash tumaningizni kiriting (masalan: G'ijduvon tumani):`
  );
};
const CreateDistrict = async (msg) => {
  const chatId = msg.from.id;
  const district = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }

  driver.address.district = district;
  driver.action = "register_neighborhood"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Tuman saqlandi!\n\n🏠 Endi yashash mahallangizni kiriting (masalan: Nodirabegim MFY):`
  );
};
const CreateNeighborhood = async (msg) => {
  const chatId = msg.from.id;
  const neighborhood = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  driver.address.neighborhood = neighborhood;
  driver.action = "register_street"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Mahalla saqlandi!\n\n🏠 Endi yashash ko'changiz yoki qishlogingizni kiriting (masalan: Yangihayot ko'chasi):`
  );
};
const CreateStreet = async (msg) => {
  const chatId = msg.from.id;
  const street = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  driver.address.street = street;
  driver.action = "register_house_number"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Ko'cha saqlandi!\n\n🏠 Endi yashash uy raqamingizni  kiriting (masalan: 567-uy):`
  );
};
const CreateHouse = async (msg) => {
  const chatId = msg.from.id;
  const house = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  driver.address.house = house;
  driver.action = "register_phone_number"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Uy saqlandi!\n\n🏠 Endi telefon nomeringizni kiriting (masalan: +99893 001 00 01):`
  );
};
const CreatePhoneNumber = async (msg) => {
  const chatId = msg.from.id;
  const phoneNumber = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  driver.phoneNumber = phoneNumber;
  driver.action = "register_car_type"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Telefon nomer saqlandi!\n\n🚗 Endi mashina nomini  kiriting (masalan: Damas,Labo ):`
  );
};
const CreateCarType = async (msg) => {
  const chatId = msg.from.id;
  const carType = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  driver.carType = carType;
  driver.action = "register_car_number"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Mashina nomi saqlandi!\n\n🚗 Endi mashina nomerini kiriting (masalan: 80 A 888 BB ):`
  );
};
const CreateCarNumber = async (msg) => {
  const chatId = msg.from.id;
  const carNumber = msg.text.trim();

  let driver = await UserModel.findOne({ chatId });

  if (!driver) {
    return bot.sendMessage(
      chatId,
      `❗️ Iltimos, avval ro'yxatdan o'tishni boshlang!`
    );
  }
  // Takroriy mashina raqamini tekshirish
  if (driver.carNumber && driver.chatId !== chatId) {
    return bot.sendMessage(chatId, `❗️ Bu mashina raqami allaqachon boshqa haydovchi tomonidan ro'yxatdan o'tgan.`);
  }
  driver.carNumber = carNumber;
  driver.action = "register_next"; // Keyingi bosqich
  await driver.save();

  await bot.sendMessage(
    chatId,
    `✅ Mashina nomeri saqlandi!\n\n👨‍💻 Endi ish boshqaruvchiga murojaat qilib ishni boshlash uchun ruxsatlarni qo'shtiring`
  );
};

const cancel = async (msg) => {
  const chatId = msg.from.id;
  await UserModel.deleteOne({ chatId });
  // Foydalanuvchiga habar yuborish va klaviaturani olib tashlash
  bot.sendMessage(
    chatId,
    "Sizning ma'lumotlaringiz o'chirildi. Ro'yxatdan o'tish jarayonini tugatdingiz.",
    {
      reply_markup: {
        remove_keyboard: true, // Klaviaturani olib tashlash
      },
    }
  );
  // Yangi klaviatura yuborish (istalgan joyda)
  bot.sendMessage(
    chatId,
    `Qayta ro'yxatdan o'tish uchun 
           
🆔 Ro'yxatdan o'tish tugmasini bosing!`,
    {
      reply_markup: {
        keyboard: AuthKeyboard,
        resize_keyboard: true,
      },
    }
  );
};

module.exports = {
  start,
  login,
  cancel,
  register,
  CreateFullname,
  CreateGender,
  CreateGender,
  CreateAge,
  CreateUsername,
  CreatePassword,
  CreatePassport,
  CreateRegion,
  CreateDistrict,
  CreateNeighborhood,
  CreateStreet,
  CreateHouse,
  CreatePhoneNumber,
  CreateCarNumber,
  CreateCarType,
  LoginUsername,
  LoginPassword
};
