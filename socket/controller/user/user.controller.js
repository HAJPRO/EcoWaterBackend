const UserService = require("../../../socket/service/user/user.service");

class UserController {
    // 🔹 Foydalanuvchini ro'yxatdan o'tkazish
    static RegisterUser(data, socket, io) {
        console.log("📥 Foydalanuvchi ma'lumoti keldi:", data);

        // 🔹 Xizmat (service) orqali ro‘yxatga olish
        UserService.RegisterUser(data, socket, io);

        // 🔹 Foydalanuvchiga javob yuborish
        socket.emit("register_success", { message: "Foydalanuvchi ro‘yxatga olindi!" });
    }

    // 🔹 Foydalanuvchi uzilganda chaqiriladi
    static userDisconnected(socket, io) {
        console.log(`❌ Foydalanuvchi uzildi: ${socket.id}`);
        UserService.RemoveUser(socket, io);
    }
}

module.exports = UserController;
