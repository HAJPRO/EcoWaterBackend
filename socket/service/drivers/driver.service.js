class DriverService {
    constructor() {
        this.onlineDrivers = [];
    }

    addOrUpdateDriver(driver, socketId) {
        const index = this.onlineDrivers.findIndex(d => d.id === driver.id);

        if (index !== -1) {
            // Agar bor bo'lsa, faqat koordinatalarni yangilaymiz
            this.onlineDrivers[index].lat = driver.lat;
            this.onlineDrivers[index].lng = driver.lng;
            this.onlineDrivers[index].socketId = socketId; // socketId yangilansa ham bo'ladi
            console.log(`📍 Haydovchi (${driver.id}) koordinatasi yangilandi`);
        } else {
            // Yangi haydovchini qo'shamiz
            this.onlineDrivers.push({ ...driver, socketId });
            console.log(`🔹 Yangi haydovchi qo‘shildi: ${driver.id}`);
        }
    }

    removeDriverBySocketId(socketId) {
        this.onlineDrivers = this.onlineDrivers.filter(d => d.socketId !== socketId);
        console.log(`❌ Haydovchi chiqdi: SocketID=${socketId}`);
    }

    getAllDrivers() {
        return this.onlineDrivers;
    }
}

module.exports = new DriverService();
