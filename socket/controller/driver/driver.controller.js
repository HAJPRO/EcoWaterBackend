const DriverService = require("../../../socket/service/drivers/driver.service");

class DriverController {
    // Haydovchi tizimga kirdi
    static driverConnected(driver, socket, io) {
        if (!driver || !driver.id) {
            console.error("Driver ma'lumotlari noto‘g‘ri");
            return;
        }
        DriverService.addOrUpdateDriver(driver, socket.id);
        io.emit("drivers:online", DriverService.getAllDrivers());
    }

    // Haydovchi koordinatalarini yangilash
    static updateLocation(data, socket, io) {
        if (!data || !data.id) return;
        // socket.id uzatish, shunda xizmat socketId-ni yangilaydi (agar kerak bo‘lsa)
        DriverService.addOrUpdateDriver(data, socket.id);
        io.emit("drivers:online", DriverService.getAllDrivers());
    }

    // Haydovchi tizimdan chiqdi
    static driverDisconnected(socket, io) {
        DriverService.removeDriverBySocketId(socket.id);
        io.emit("drivers:online", DriverService.getAllDrivers());
    }
}

module.exports = DriverController;
