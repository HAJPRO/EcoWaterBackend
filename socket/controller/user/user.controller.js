const UserService = require("../../../socket/service/user/user.service");

class UserController {
    static RegisterUser(socket, io) {
        // 🔹 Frontenddan "register" hodisasi kelganida uni logga chiqarish
        socket.on("register", (data) => {
            console.log("📥 Frontenddan keldi:");

            // 🔹 Foydalanuvchini ro‘yxatga olish
            UserService.RegisterUser(data, socket, io);

            // 🔹 Foydalanuvchiga ro‘yxatga olingani haqida xabar yuborish
            socket.emit("register_success", { message: "Foydalanuvchi ro‘yxatga olindi!" });
        });

        // 🔹 Foydalanuvchi uzilganda
        socket.on("disconnect", () => {
            console.log(`❌ Foydalanuvchi uzildi: ${socket.id}`);
            UserService.RemoveUser(socket, io);
        });
    }
}

module.exports = UserController;
