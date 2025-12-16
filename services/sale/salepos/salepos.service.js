const mongoose = require("mongoose");
// Eslatma: Buyurtma modelini endi SaleOrder deb chaqiramiz
const SaleModel = require("../../../models/Sale/orders/sales.model"); 
const ReadyWarehouse = require("../../../models/Warehouses/r-warehouse/r-warehouse.model");
const UserModel = require("../../../models/user.model");

const BotDriverService = require("../../../bots/drivers/services/driver.service");
const {
  generateUniqueOrderNumber,
} = require("../../../utils/generateUniqueNumber");

class OrderManagmentService {
    
    /**
     * Yangi Sotuvni yaratish/yakunlash (POS Tranzaksiyasi)
     * 1. Partiyaviy zaxirani aniqlash va kamaytirish.
     * 2. SaleOrder modelini partiya ma'lumotlari bilan to'ldirish.
     * 3. Driverga xabar yuborish.
     * @param {Object} data - Buyurtma ma'lumotlari (items[], driverId, customerId, author, branch, etc.)
     */
    async Create(data) {
        const orderNumber = await generateUniqueOrderNumber(); 
        const initialDriverId = data.driverId || null; 
        const session = await mongoose.startSession(); // Atomar operatsiya uchun sessionni boshlash
        
        const status = initialDriverId 
            ? "Haydovchiga yuborilmoqda" 
            : data.status || "Yakunlangan"; 
        
        const itemsWithLots = [];
        const bulkOps = [];
        
        try {
            session.startTransaction(); // Tranzaksiyani boshlash

            // ========================================================
            // 1. PARTIYAVIY ZAXIRANI ANIQLASH VA BULK OPS TAYYORLASH
            // ========================================================
            
            for (const item of data.items) {
                let remainingQty = item.quantity;
                const lotsSoldForThisItem = [];

                // 💡 Zaxiralarni Partiya raqami va FIFO/LIFO mantiqiga ko'ra olish (Partiya modeli vaqt bo'yicha saralangan)
                const availableLots = await ReadyWarehouse.find({
                    product: item.productId,
                    currentQuantity: { $gt: 0 },
                    // Faqat aktiv filialdan olish kerak: branch: data.branch
                    status: 'active' 
                }).sort({ createdAt: 1 }) // FIFO: Eng eski lot birinchi sotiladi
                  .session(session) // Sessionni ulash
                  .exec();
                
                if (availableLots.length === 0) {
                    throw new Error(`${item.productName} uchun zaxira topilmadi (Partiya xatosi).`);
                }
                
                for (const lot of availableLots) {
                    if (remainingQty <= 0) break;

                    const qtyToSell = Math.min(remainingQty, lot.currentQuantity);
                    
                    // a) Sotilgan lot ma'lumotini to'plash (SaleOrder uchun)
                    lotsSoldForThisItem.push({
                        readyWarehouseLot: lot._id,
                        soldQuantity: qtyToSell,
                        costPriceAtSale: lot.costPrice,
                    });

                    // b) Omborni yangilash uchun bulkWrite operatsiyasini tayyorlash
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: lot._id },
                            update: { $inc: { currentQuantity: -qtyToSell } },
                            // Zaxira nolga tushsa statusni o'zgartirish (optimallash)
                            // update: { $inc: { currentQuantity: -qtyToSell }, $set: { status: lot.currentQuantity === qtyToSell ? 'sold_out' : 'active' } }
                        }
                    });
                    
                    remainingQty -= qtyToSell;
                }

                if (remainingQty > 0) {
                    // Bu holat frontend tekshiruvidan o'tmaganini bildiradi, lekin safety uchun muhim
                    throw new Error(`${item.productName} uchun zaxira yetarli emas! ${remainingQty} dona yetishmayapti.`);
                }
                
                // Asosiy sotuv ro'yxati (SaleOrder.items uchun)
                itemsWithLots.push({
                    ...item,
                    lotsSold: lotsSoldForThisItem,
                });
            }

            // ========================================================
            // 2. PARTIYALARNI VAQTINCHALIK ZAXIRASINI YANGILASH
            // ========================================================
            
            if (bulkOps.length > 0) {
                await ReadyWarehouse.bulkWrite(bulkOps, { session });
            }
            
            // ========================================================
            // 3. YANING SALEORDER YARATISH
            // ========================================================

            const savedOrder = await SaleModel.create([{
                ...data,
                items: itemsWithLots, // Partiyaviy ma'lumotlar qo'shilgan
                driverId: initialDriverId, 
                status: status,
                driverSentToTime: initialDriverId ? new Date() : null, 
                orderNumber,
            }], { session });
            
            await session.commitTransaction(); // Barcha o'zgarishlarni bazaga saqlash

            // 4. Bot orqali xabar yuborish (Non-blocking)
            if (initialDriverId) {
                const populatedOrder = await SaleModel.findById(savedOrder[0]._id)
                    .populate("driverId", "chatId") 
                    .populate("customerId");

                BotDriverService.SentOrder(populatedOrder); 
            }
            
            return { 
                msg: initialDriverId ? "Buyurtma saqlandi va haydovchiga yuborildi!" : "Sotuv muvaffaqiyatli yakunlandi!", 
                order: savedOrder[0]
            };
            
        } catch (error) {
            // Xatolik yuz bersa, tranzaksiyani bekor qilish (Rollback)
            await session.abortTransaction(); 
            throw new Error("Sotuvni yakunlashda xatolik: " + error.message);
        } finally {
            session.endSession();
        }
    }

    // ... Boshqa metodlar (UpdateById, GetById, GetAll) o'zgarishsiz qoldi,
    // faqat Order o'rniga SaleOrder modelini ishlatish kerak.
}

module.exports = new OrderManagmentService();