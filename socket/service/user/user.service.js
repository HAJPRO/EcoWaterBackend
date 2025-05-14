// 📌 Foydalanuvchilarni boshqarish uchun xizmat
class UserService {
    constructor() {
        this.users = new Map(); // 📌 Foydalanuvchilarni saqlash uchun xarita (Map)
    }

    // 📌 Foydalanuvchini ro‘yxatga olish
    RegisterUser(data, socket, io) {

        if (!data || !data.id) {
            console.log("❌ Xatolik: foydalanuvchi ma'lumotlari noto‘g‘ri!");
            return;
        }

        // 🔹 Foydalanuvchini saqlash
        this.users.set(socket.id, { ...data, socketId: socket.id });
        console.log("🔹 Yangi foydalanuvchi qo‘shildi:");

        // 📢 **Barcha foydalanuvchilarga yangilangan ro‘yxatni yuborish**
        io.emit("OnlineUsers", this.GetOnlineUsers());
        // 📌 **Agar foydalanuvchida kutayotgan hujjatlar bo‘lsa, ularni jo‘natamiz**
    }

    // 📌 Foydalanuvchini tizimdan o‘chirish
    RemoveUser(socket, io) {
        if (this.users.has(socket.id)) {
            this.users.delete(socket.id);
            console.log(`❌ Foydalanuvchi tizimdan chiqdi: ${socket.id}`);

            // 📢 **Yangilangan foydalanuvchilar ro‘yxatini yuborish**
            io.emit("OnlineUsers", this.GetOnlineUsers());
        }
    }

    // 📌 Hozirda tizimga kirgan foydalanuvchilar ro‘yxatini olish
    GetOnlineUsers() {
        return Array.from(this.users.values());
    }
}

module.exports = new UserService();
