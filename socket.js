const { Server } = require("socket.io");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // Barcha manzillarga ruxsat berish
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("✅ Foydalanuvchi ulandi:", socket.id);

        socket.on("disconnect", () => {
            console.log("❌ Foydalanuvchi chiqdi:", socket.id);
        });
    });

    return io;
}

function getSocket() {
    if (!io) {
        throw new Error("❌ Socket.io hali ishga tushirilmagan!");
    }
    return io;
}
// ⚠️ ESKI HODISALAR TO‘PLANMASLIGI UCHUN `socket.off()` ISHLATISH

module.exports = { initSocket, getSocket };
