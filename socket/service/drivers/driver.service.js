class DriverService {
    constructor() {
        this.drivers = new Map();
    }

    // Foydalanuvchini ro‘yxatga olish yoki yangilash
    registerDriver(data, socketId, io) {
        if (!data || !data.id) {
            console.log("❌ Xatolik: haydovchi ma'lumotlari noto‘g‘ri!");
            return;
        }

        this.addOrUpdateDriver(data, socketId);

        io.emit("drivers:online", this.getOnlineDrivers());
    }

    addOrUpdateDriver(driverData, socketId) {
        if (!driverData || !driverData.id) {
            console.log("❌ Xato: haydovchi ma'lumotlari noto‘g‘ri!");
            return;
        }

        const existingDriver = this.drivers.get(socketId);

        if (existingDriver) {
            this.drivers.set(socketId, {
                ...existingDriver,
                ...driverData,
                socketId,
            });
            console.log(`🔄 Haydovchi koordinatalari yangilandi: ${driverData.id}`);
        } else {
            this.drivers.set(socketId, {
                ...driverData,
                socketId,
            });
            console.log(`🆕 Yangi haydovchi qo‘shildi: ${driverData.id}`);
        }
    }

    removeDriver(socketId, io) {
        if (this.drivers.has(socketId)) {
            this.drivers.delete(socketId);
            console.log(`❌ Haydovchi tizimdan chiqdi: ${socketId}`);

            io.emit("drivers:online", this.getOnlineDrivers());
        }
    }

    getOnlineDrivers() {
        return Array.from(this.drivers.values());
    }
}

module.exports = new DriverService();
