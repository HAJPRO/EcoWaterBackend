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

        // ✅ Agar foydalanuvchi allaqachon ro‘yxatda bo‘lsa, yana qo‘shilmaydi
        if (this.users.has(socket.id)) {
            console.log(`ℹ️ Foydalanuvchi allaqachon tizimda: ${data.id}`);
            return;
        }

        // 🆕 Yangi foydalanuvchini saqlash
        this.users.set(socket.id, { ...data, socketId: socket.id });
        console.log(`🆕 Yangi foydalanuvchi qo‘shildi: ${data.id}`);

        // 📢 Hamma foydalanuvchilarga ro‘yxatni yuboramiz
        io.emit("OnlineUsers", this.GetOnlineUsers());

        // 📌 ❗ Bu yerda kutayotgan hujjatlar bo‘lsa, yuborish qismi joylashadi
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
