const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const ReadyWarehouseSchema = new Schema({
  partyNumber: { type: String, required: true, unique: true },        // Partiya raqami (masalan: PART-2025-0001)
  supplier: { type: String },                                         // Yetkazib beruvchi (firma yoki shaxs nomi)
  manufacturer: { type: String },                                     // Ishlab chiqaruvchi korxona yoki brend nomi
  senderEmployee: { type: String },                                   // Mahsulotni jo‘natgan xodim (ism yoki ID)
  receivedBy: { type: String },                                       // Mahsulotni qabul qilgan xodim
  receivedDate: { type: Date, default: Date.now },                    // Qabul qilingan sana (default — hozirgi vaqt)
  author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Ushbu partiyani tizimga qo‘shgan foydalanuvchi
  notes: { type: String },                                            // Izohlar (ixtiyoriy maydon)
  totalAmount: { type: Number },
  totalOutputPrice: { type: Number },                                       // Jami narx = quantity * costPrice
  totalRemainderPrice: { type: Number },
  products: [                                                            // Partiyadagi mahsulotlar ro‘yxati
    {
      id: { type: String },
      product: { type: String },  // Mahsulot ID (Product modeliga havola)
      category: { type: String },                                     // Mahsulot kategoriyasi (masalan: ichimlik, un, kiyim)
      quantity: { type: Number, required: true },                     // Mahsulot miqdori
      packagingType: { type: String },                                // Qadoqlash turi (masalan: quti, butilka, xalta)
      unit: { type: String },
      costPrice: { type: Number },                                    // Asl tan narxi (real xarajat)
      blockCostPrice: { type: Number },                                    // Asl tan narxi (real xarajat)
      salePrice: { type: Number },                                    // Rejalashtirilgan sotiladigan narx
      totalPrice: { type: Number },                                   // Jami narx = quantity * costPrice
      manufactureDate: { type: Date },                                // Ishlab chiqarilgan sana
      expireDate: { type: Date },
      status: { type: String },                                   // Amal qilish muddati (yaroqlilik)
    }
  ],
  output: [{
    id: { type: String },
    product: { type: String },  // Mahsulot ID (Product modeliga havola)
    category: { type: String },                                     // Mahsulot kategoriyasi (masalan: ichimlik, un, kiyim)
    quantity: { type: Number, required: true },                     // Mahsulot miqdori
    packagingType: { type: String },                                // Qadoqlash turi (masalan: quti, butilka, xalta)
    unit: { type: String },
    costPrice: { type: Number },
    blockCostPrice: { type: Number },                                     // Asl tan narxi (real xarajat)
    salePrice: { type: Number },                                    // Rejalashtirilgan sotiladigan narx
    totalPrice: { type: Number },
    outputRecipient: { type: String },
    outputResponsible: { type: String },
    manufactureDate: { type: Date },                                // Ishlab chiqarilgan sana
    expireDate: { type: Date },                                     // Amal qilish muddati (yaroqlilik)
    outputDate: { type: Date },
    status: { type: String },                                   // Amal qilish muddati (yaroqlilik)
    // Amal qilish muddati (yaroqlilik)
  }],
  status: { type: String, default: "Skladda mavjud" },                       // Partiya holati (masalan: active, inactive)
  state: { type: Boolean, default: true },                                   // Partiya holati (masalan: active, inactive)

}, { timestamps: true });                                             // createdAt va updatedAt maydonlarini avtomatik qo‘shadi

module.exports = model("ReadyWarehouse", ReadyWarehouseSchema);       // Modelni eksport qilamiz
