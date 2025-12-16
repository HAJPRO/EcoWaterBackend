const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SaleOrderSchema = new Schema(
  {
    // --- 1. IDENTIFIKATSIYA VA UMUMIY MA'LUMOT ---
    orderNumber: { type: String, required: true, unique: true, index: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    // --- 2. SAVAT DETALLARI ---
   items: { type: [Schema.Types.Mixed], default: [] },
    // --- 3. MOLIYAVIY XULOSA ---
    subTotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.12 }, 
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // Grand Total

    // --- 4. TO'LOV VA QARZ ---
    paymentType: { type: String, required: true, enum: ["naqd", "karta", "click", "qarz", "aralash"] },
    paidAmount: { type: Number, default: 0 },
    debtAmount: { type: Number, default: 0 },

    // --- 5. LOGISTIKA VA MIJOZ BOG'LANISHI ---
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", index: true, comment: "Yetkazib beruvchi haydovchi" },
    deliveryDate: { type: Date, comment: "Buyurtma mijozga yetkazilgan sana" }, 
    
    // --- 6. STATUS VA AUDIT ---
    status: { type: String, enum: ["Yakunlangan", "Qoralama", "Bekor qilingan", "Qisman to'langan", "Yetkazilmoqda"], default: "Yakunlangan", index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, comment: "Tranzaksiyani amalga oshirgan kassir/xodim" },
  },
  {
    timestamps: true, // createdAt (Sotuv vaqti), updatedAt
  
  }
);
module.exports = model("Sales", SaleOrderSchema);