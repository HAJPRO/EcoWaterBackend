// models/Product.js
const mongoose = require("mongoose"); // 1-XATO TUZATILDI: Import qo'shildi
const { model, Schema } = mongoose;

const ProductSchema = new Schema(
  {
    // --- 1. Asosiy Ma'lumotlar ---
    name: {
      type: String,
      required: true,
      trim: true,
      index: true // Qidiruv tezligi uchun
    },
    code: {
      type: String,
      required: true,
      unique: true, // Shtrix-kod takrorlanmasligi shart
      trim: true,
      index: true
    },
    category: {
      type: String, 
      required: true,
      trim: true,
      index: true
    },
    image: {
      type: String,
      default: "" // Placeholder shart emas, frontend o'zi hal qiladi
    },
    description: {
      type: String,
      trim: true
    },

    // --- 2. O'lchov va Qadoq ---
    unit: {
      type: String,
      default: "dona", 
      enum: ["dona", "kg", "litr", "metr", "qop", "blok"]
    },
    
    // Blok/Upakovka logikasi
    hasMultiUnit: { type: Boolean, default: false },
    packSize: { type: Number, default: 1 }, 

    // --- 3. Narx Siyosati ---
    costPrice: { 
      type: Number, 
      default: 0,
      min: 0
    },
    salePrice: { 
      type: Number, 
      required: true, 
      min: 0
    },
    packSalePrice: { 
      type: Number, 
      default: 0,
      min: 0
    },
    totalStock: {
      type: Number,
      default: 0,
      index: true 
    },
    minStockAlert: {
      type: Number,
      default: 10
    },
margainPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    // --- 5. Tizim Ma'lumotlari ---
    author: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    status: {
      type: String,
      enum: ["active", "inactive"], 
      default: "active",
      index: true
    },
    state : {type:Boolean, default:true}
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);



module.exports = model("Product", ProductSchema);