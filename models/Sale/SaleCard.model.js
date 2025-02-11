const { Schema, model } = require("mongoose");

const SaleCardSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    order_quantity: { type: Number, required: true },
    artikul: { type: String, required: true },
    delivery_time: { type: Date, default: Date.now(), required: true },
    received_time: {
      type: Date,
    },
    sale_products: [
      {
        id: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        color: { type: String, required: true },
        width: { type: Number, required: true },
        color: { type: String, required: true },
        grammage: { type: Number, required: true },
        order_quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Sotuv" },
      }
    ],
    status: { type: String, default: "Tasdiqlanmagan" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
    paint_id: {
      type: Schema.ObjectId,
      ref: "DepPaintCard",
    },
    weaving_id: {
      type: Schema.ObjectId,
      ref: "DepWeavingCard",
    },
    spinning_id: {
      type: Schema.ObjectId,
      ref: "DepSpinningCard",
    },
    provide_id: {
      type: Schema.ObjectId,
      ref: "DepProviderCard",
    },
  },
  { timestamps: true }
);

module.exports = model("SaleCard", SaleCardSchema);
