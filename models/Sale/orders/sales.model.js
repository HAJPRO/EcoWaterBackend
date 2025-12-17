const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SaleHistorySchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true }, // Majburiy va unikal
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: {type:String},
    salePrice: {type:String}, // Sotilgan narxi
    costPrice: {type:String}, // Kelgan narxi (Foyda uchun)
    partyNumber:{type:String},
    unit : { type: String, default: "dona" }
  }],
  totalAmount: {type:String}, // Jami summa
  paymentType: { type: String, default: 'cash' },
  branchId: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
},{ timestamps: true });

module.exports = model("Sales", SaleHistorySchema);