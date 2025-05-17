// 📌 Foydalanuvchilarni boshqarish uchun xizmat
class DriverService {
    constructor() {
        this.drivers = new Map(); // 📌 Foydalanuvchilarni saqlash uchun xarita (Map)
    }

    // 📌 Foydalanuvchini ro‘yxatga olish
    RegisterDriver(data, socket, io) {

        if (!data || !data.id) {
            console.log("❌ Xatolik: foydalanuvchi ma'lumotlari noto‘g‘ri!");
            return;
        }

        // 🔹 Foydalanuvchini saqlash
        this.drivers.set(socket.id, { ...data, socketId: socket.id });
        console.log("🔹 Yangi haydovchi qo‘shildi:");

        // 📢 **Barcha foydalanuvchilarga yangilangan ro‘yxatni yuborish**
        io.emit("OnlineDrivers", this.GetOnlineDrivers());
        // 📌 **Agar foydalanuvchida kutayotgan hujjatlar bo‘lsa, ularni jo‘natamiz**
    }
    addOrUpdateDriver(driverData, socketId) {
        if (!driverData || !driverData.id) {
            console.log("❌ Xato: haydovchi ma'lumotlari noto‘g‘ri!");
            return;
        }

        const existingDriver = this.drivers.get(socketId);

        if (existingDriver) {
            // 🔁 Mavjud haydovchining koordinatalarini yangilash
            this.drivers.set(socketId, {
                ...existingDriver,
                ...driverData,
                socketId,
            });
            console.log(`🔄 Haydovchi koordinatalari yangilandi: ${driverData.id}`);
        } else {
            // 🆕 Yangi haydovchini ro‘yxatga olish
            this.drivers.set(socketId, {
                ...driverData,
                socketId,
            });
            console.log(`🆕 Yangi haydovchi qo‘shildi: ${driverData.id}`);
        }
    }
    // 📌 Foydalanuvchini tizimdan o‘chirish
    RemoveDriver(socket, io) {
        if (this.drivers.has(socket.id)) {
            this.drivers.delete(socket.id);
            console.log(`❌ Haydovchi tizimdan chiqdi: ${socket.id}`);

            // 📢 **Yangilangan foydalanuvchilar ro‘yxatini yuborish**
            io.emit("OnlineDrivers", this.GetOnlineDrivers());
        }
    }

    // 📌 Hozirda tizimga kirgan foydalanuvchilar ro‘yxatini olish
    GetOnlineDrivers() {
        return Array.from(this.drivers.values());
    }
}

module.exports = new DriverService();
