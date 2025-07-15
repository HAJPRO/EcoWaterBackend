const DriverService = require("../../../socket/service/drivers/driver.service");

class DriverController {
    // 🔌 Haydovchi tizimga ulandi
    static driverConnected(driver, socket, io) {
        if (!driver || !driver.id) {
            console.error("❌ Xato: haydovchi ma'lumotlari yo‘q yoki noto‘g‘ri!");
            return;
        }

        // Ro‘yxatga olish yoki yangilash
        DriverService.registerDriver(driver, socket.id, io);
    }

    // 📍 Haydovchi joylashuvini yangiladi
    static updateLocation(data, socket, io) {
        if (!data || !data.id) {
            console.warn("⚠️ Koordinata yangilanishi uchun haydovchi ID kerak");
            return;
        }

        DriverService.addOrUpdateDriver(data, socket.id);
        io.emit("drivers:online", DriverService.getOnlineDrivers());
    }

    // 🔌 Haydovchi tizimdan chiqdi
    static driverDisconnected(socket, io) {
        DriverService.removeDriver(socket.id, io);
    }
}

module.exports = DriverController;
