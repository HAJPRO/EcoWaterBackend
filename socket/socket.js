const { Server } = require("socket.io");
const UserController = require("./controller/user/user.controller");
const DriverController = require("./controller/driver/driver.controller");

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log(`Foydalanuvchi ulandi: ${socket.id}`);

        // Frontenddan foydalanuvchi ro'yxatdan o'tish uchun ma'lumot kelganda
        socket.on("user:register", (userData) => {
            UserController.RegisterUser(userData, socket, io);
        });

        // Frontenddan haydovchi tizimga kirganda ma'lumot kelganda
        socket.on("driver:connected", (driverData) => {
            DriverController.driverConnected(driverData, socket, io);
        });

        // Haydovchi koordinatalarini yangilash
        socket.on("driver:location", (locationData) => {
            DriverController.updateLocation(locationData, socket, io);
        });

        // Foydalanuvchi uzilganda
        socket.on("disconnect", () => {
            // UserController.userDisconnected(socket, io);
            DriverController.driverDisconnected(socket, io);
            console.log(`Foydalanuvchi chiqdi: ${socket.id}`);
        });
    });

    return io;
}

module.exports = { setupSocket };
