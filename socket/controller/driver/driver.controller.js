const DriverService = require("../../../socket/service/drivers/driver.service");

class UserController {
    static RegisterDriver(socket, io) {
        // 🔹 Frontenddan "register" hodisasi kelganida uni logga chiqarish
        socket.on("register", (data) => {
            console.log("📥 Frontenddan keldi:");

            // 🔹 Foydalanuvchini ro‘yxatga olish
            DriverService.RegisterDriver(data, socket, io);

            // 🔹 Foydalanuvchiga ro‘yxatga olingani haqida xabar yuborish
            socket.emit("register_success", { message: "Haydovchi ro'yxatga olindi!" });
        });

        // 🔹 Foydalanuvchi uzilganda
        socket.on("disconnect", () => {
            console.log(`❌ Haydovchi uzildi: ${socket.id}`);
            DriverService.RemoveDriver(socket, io);
        });
    }
}

module.exports = UserController;
