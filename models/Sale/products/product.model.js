// models/Product.js

const { model, Schema } = require("mongoose");
const ProductSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" }, // Mahsulotni kim yaratganini ko‘rsatadi
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    pro_name: {
      type: String,
      required: true,
      trim: true,
    },
    pro_category: {
      type: String,
      required: true, // Kategoriya
      trim: true,
    },

    pro_quality: {
      type: String, // Sifat darajasi
      trim: true,
    },
    products: [
      {
        id : {type: String },
        cost_price: {
          type: Number, // Tannarxi (so'mda)
          min: 0,
        },
        buying_price: {
          type: Number, // Sotuv narxi (so'mda)
          min: 0,
        },
        packingType: {
          type: String, // Qadoqlash turi
          trim: true,
        },
      },
    ],

    sale_type: {
      type: String, // Sotuv turi
      trim: true,
    },
    pro_image_url: {
      type: String, // Rasm URL (yoki bir nechta URL bo‘lsa, massiv qilish mumkin)
      default: "",
    },
    productionStarteddAt: {
      type: Date, // Ishlab chiqarish sanasi
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"], // Mahsulot holati
      default: "Active",
    },
    state: {
      type: Boolean, // Mahsulot holati
      default: true,
    },
  },
  {
    timestamps: true, // createdAt va updatedAt avtomatik qo‘shiladi
  }
);

module.exports = model("Product", ProductSchema);
