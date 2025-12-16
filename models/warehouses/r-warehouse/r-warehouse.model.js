const mongoose = require("mongoose"); // <- BU QATORNI QO'SHING
const { model, Schema } = mongoose; // Endi Mongoose obyekti mavjud

const ReadyWarehouseSchema = new Schema(
  {
    // --- 1. Identifikatsiya va Bog'lanish ---
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true, // Mahsulot bo'yicha tezkor qidiruv
    },
    branch: { 
      type: Schema.Types.ObjectId, 
      ref: "Branch", // Agar filiallar bo'lsa (Masalan: Markaziy ombor, 2-do'kon)
      index: true,
    },
    partyNumber: {
      type: String,
      trim: true,
      index: true, // Partiya bo'yicha qidirish
      comment: "Partiya raqami (Invoice raqami yoki avto-generatsiya)"
    },

    // --- 2. Miqdor va O'lchov ---
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
      comment: "Kirib kelgan paytdagi miqdor (Tarix uchun)"
    },
    currentQuantity: {
      type: Number,
      min: 0,
      index: true, // Eng muhim indeks! Qoldiq borlarini ajratish uchun
      comment: "Ayni vaqtdagi qoldiq"
    },
    unit: {
      type: String,
      default: "dona",
      enum: ["dona", "kg", "litr", "metr", "qop", "blok", "m2", "m3"]
    },

    // --- 3. Moliya (Partiya narxlari) ---
    // Har bir partiya har xil narxda kelishi mumkin (FIFO/LIFO uchun muhim)
    costPrice: {
      type: Number,
      min: 0,
      comment: "Tan narx (Kelish narxi)"
    },
    salePrice: {
      type: Number,
      min: 0,
      comment: "Ushbu partiya uchun sotuv narxi (Agar o'zgarsa)"
    },
    currency: {
      type: String,
      default: "UZS",
      enum: ["UZS", "USD"]
    },
    exchangeRate: {
      type: Number,
      default: 1,
      comment: "Kirim qilingan vaqtdagi dollar kursi (Foydani aniq hisoblash uchun)"
    },

    // --- 4. Joylashuv va Logistika ---
    location: {
      type: String,
      trim: true,
      default: "General",
      comment: "Ombor ichidagi joylashuv: A-Zona, 3-Polka"
    },
    driver: {
      type: Schema.Types.ObjectId, // Bog'lanish turini belgilash
    ref: "Employee",             // 'Employee' nomli boshqa modelga bog'lash
    comment: "Mahsulot qaysi yetkazib beruvchidan kelganligi"
    },
    expireDate: {
      type: Date,
      index: true, // Yaroqlilik muddati tugayotganlarni topish uchun
    },

    // --- 5. Status va Audit ---
    status: {
      type: String,
      enum: ["active", "sold_out", "expired", "returned", "reserved"],
      default: "active",
      index: true
    },
    
    // Kim javobgar?
    responsiblePerson: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
   
  }
);



module.exports = mongoose.models.ReadyWarehouse
    ? mongoose.model('ReadyWarehouse') // Agar model mavjud bo'lsa, uni qaytaradi
    : model("ReadyWarehouse", ReadyWarehouseSchema); // Aks holda, uni yaratadi