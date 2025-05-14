const { Server } = require("socket.io");
const UserController = require("./controller/user/user.controller");


function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        },
    });

    io.on("connection", (socket) => {
        console.log(`Foydalanuvchi ulandi: ${socket.id}`);

        // ✅ Argumentlarni to‘g‘ri tartibda yuborish //
        UserController.RegisterUser(socket, io);

        socket.on("disconnect", () => {
            console.log(`Foydalanuvchi chiqdi: ${socket.id}`);
        });
    });

    return io;
}

module.exports = { setupSocket };
