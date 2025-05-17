const UserService = require("../../../socket/service/user/user.service");

class UserController {
    // 🔹 Foydalanuvchini ro'yxatdan o'tkazish
    static RegisterUser(data, socket, io) {
        console.log("📥 Foydalanuvchi ma'lumoti keldi:", data);

        // 🔍 Ma’lumot to‘g‘riligini tekshirish
        if (!data || !data.id) {
            socket.emit("register_failed", { message: "❌ Ma'lumotlar noto‘g‘ri!" });
            return;
        }

        // 🔹 UserService orqali ro‘yxatga olish
        const result = UserService.RegisterUser(data, socket, io);

        if (result === false) {
            socket.emit("register_failed", { message: "❌ Foydalanuvchi allaqachon tizimda." });
        } else {
            socket.emit("register_success", { message: "✅ Foydalanuvchi ro‘yxatga olindi!" });
        }
    }

    // 🔹 Foydalanuvchi uzilganda chaqiriladi
    static userDisconnected(socket, io) {
        console.log(`❌ Foydalanuvchi uzildi: ${socket.id}`);
        UserService.RemoveUser(socket, io);
    }
}

module.exports = UserController;
