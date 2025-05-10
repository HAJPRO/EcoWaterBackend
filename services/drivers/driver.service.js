// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173", // 🔗 Vue 3 frontend URL
//         methods: ["GET", "POST"],
//     },
// });

// app.use(cors());

// // 📌 Onlayn haydovchilarni saqlash uchun obyekt
// let onlineDrivers = {};

// // 📌 Haydovchilarni avtomatik harakatlantirish
// setInterval(() => {
//     Object.keys(onlineDrivers).forEach((driverId) => {
//         let driver = onlineDrivers[driverId];

//         // 📌 Haydovchini biroz harakatlantiramiz
//         driver.location = [
//             driver.location[0] + (Math.random() - 0.005),
//             driver.location[1] + (Math.random() - 0.005),
//         ];
//     });

//     // 📌 Barcha online haydovchilarni frontendga yuborish
//     io.emit("drivers", Object.values(onlineDrivers));
// }, 3000);

// // 📌 WebSocket ulanishlari
// io.on("connection", (socket) => {
//     console.log(`✅ Yangi haydovchi ulandi: ${socket.id}`);

//     // 📌 Haydovchi tizimga kirishi bilan unga joylashuv tayinlash
//     socket.on("joinDriver", (driverData) => {
//         onlineDrivers[socket.id] = {
//             id: socket.id,
//             name: driverData.name || `Haydovchi ${socket.id}`,
//             location: driverData.location || [39.7748, 64.4256], // 📌 Default Buxoro
//         };

//         console.log("🚗 Yangi haydovchi qo‘shildi:", onlineDrivers[socket.id]);

//         // 📌 Yangi holatni barcha klientlarga yuborish
//         io.emit("drivers", Object.values(onlineDrivers));
//     });

//     // 📌 Haydovchi tizimdan chiqqanda o‘chirish
//     socket.on("disconnect", () => {
//         console.log(`❌ Haydovchi chiqdi: ${socket.id}`);
//         delete onlineDrivers[socket.id];

//         // 📌 Yangilangan haydovchilar ro‘yxatini yuborish
//         io.emit("drivers", Object.values(onlineDrivers));
//     });
// });

// server.listen(3000, () => {
//     console.log("🚀Socket server ishlayapti: http://localhost:3000");
// });
