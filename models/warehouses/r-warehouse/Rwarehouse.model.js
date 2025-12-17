const mongoose = require("mongoose"); 
const { model, Schema } = mongoose; 
const ReadyWarehouseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  branchId: { type : String, required: true },
  supplierId: { type : String, required: true },
  
  // Faktura bilan bog'liqlik
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'InputHistory' },
  partyNumber: { type: String, required: true }, // Faktura raqami
  
  // Miqdorlar
  initialQuantity: { type: Number, required: true }, // Kelgan miqdor (Masalan: 20 ta)
  currentQuantity: { type: Number, required: true }, // Qolgan miqdor (Sotilgan sari kamayadi)
  
  // Narxlar (Aynan shu partiyaning narxi)
  costPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  
  // FIFO uchun yaratilgan vaqti bo'yicha indeks
  status: { 
    type: String, 
    enum: ['active', 'sold_out'], 
    default: 'active',
    index: true 
  }
}, { timestamps: true });

// FIFO operatsiyalari uchun eng muhim indeks
ReadyWarehouseSchema.index({ product: 1, branch: 1, createdAt: 1 });

module.exports = mongoose.models.ReadyWarehouse
    ? mongoose.model('ReadyWarehouse') // Agar model mavjud bo'lsa, uni qaytaradi
    : model("ReadyWarehouse", ReadyWarehouseSchema); // Aks holda, uni yaratadi