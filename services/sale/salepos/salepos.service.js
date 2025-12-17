const mongoose = require("mongoose");
const SaleModel = require("../../../models/Sale/orders/sales.model"); 
const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/Rwarehouse.model");
const Product = require("../../../models/Sale/products/product.model"); 
const UserModel = require("../../../models/user.model"); 

const BotDriverService = require("../../../bots/drivers/services/driver.service");
// const { generateUniqueOrderNumber } = require("../../../utils/generateUniqueNumber"); 
class SaleposManagmentService {
async Create(payload) {
    const orderNumber = `S-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    const now = new Date();
    let totalSaleAmount = 0;
    const soldItemsReport = [];

    for (const item of payload.items) {
      const productId = item.product || item.productId;
      let quantityToDeduct = Number(item.quantity); // Sotilishi kerak bo'lgan jami miqdor

      // 1. Shu mahsulotning barcha faol partiyalarini eskidan yangiga qarab olamiz
      const batches = await ReadyWarehouse.find({
        product: productId,
        branchId: payload.branchId,
        currentQuantity: { $gt: 0 },
        status: 'active'
      }).sort({ createdAt: 1 });

      // 2. Partiyalarni ketma-ketlikda tekshirish
      for (const batch of batches) {
        if (quantityToDeduct <= 0) break; // Agar kerakli miqdor yig'ib bo'lingan bo'lsa, to'xtaymiz

        // Ushbu partiyada bor miqdor va bizga kerakli miqdorning kichigini olamiz
        const amountFromThisBatch = Math.min(batch.currentQuantity, quantityToDeduct);

        // Partiyadagi qoldiqni ayiramiz
        batch.currentQuantity -= amountFromThisBatch;
        
        // Agar partiya nolga tushsa, uni yopamiz
        if (batch.currentQuantity === 0) {
          batch.status = 'sold_out';
        }
        await batch.save();

        // Hisobot uchun: qaysi partiyadan qancha va qanday tan narxda olinganini yozamiz
        soldItemsReport.push({
          product: productId,
          quantity: amountFromThisBatch,
          salePrice: item.salePrice,
          costPrice: batch.costPrice, // Aynan shu partiyaning kelish narxi
          partyNumber: batch.partyNumber
        });

        // Jami kerakli miqdordan ayirib boramiz
        quantityToDeduct -= amountFromThisBatch;
      }

      // 3. Tekshiruv: Agar hamma partiyalarni ko'rib chiqib ham miqdor yetmasa
      if (quantityToDeduct > 0) {
        throw new Error(`Omborda yetarli mahsulot yo'q. Yana ${quantityToDeduct} ta yetishmayapti.`);
      }

      // 4. Product modelidagi umumiy summani (summary) yangilash
      await Product.findByIdAndUpdate(productId, {
        $inc: { totalStock: -Number(item.quantity) }
      });

      totalSaleAmount += Number(item.quantity) * Number(item.salePrice);
    }

    // 5. Sotuvni yakuniy saqlash
    const sale = await SaleModel.create({
        orderNumber: orderNumber,
      items: soldItemsReport,
      totalAmount: totalSaleAmount,
      branchId: payload.branchId,
      paymentType: payload.paymentType,
      customerId: payload.customerId || null,
      driverId: payload.driverId || null,
      date: now,
    });

    

    return { 
      success: true, 
      status: 201, 
      msg: "Sotuv muvaffaqiyatli yakunlandi!", 
      data: sale 
    };

  } catch (error) {
    console.error("Sale Error:", error);
    return { success: false, status: 400, msg: error.message };
  }
}
}

module.exports = new SaleposManagmentService();