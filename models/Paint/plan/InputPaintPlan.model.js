const { Schema, model } = require("mongoose");

const InputPaintPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_quantity: { type: Number, required: true },
    sale_quantity: { type: Number, required: true },
    artikul: { type: String, required: true },
    sale_products: [
      {
        id: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        color: { type: String, required: true },
        width: { type: Number, required: true },
        grammage: { type: Number, required: true },
        order_quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Bo'yoqa yuborildi" },
      },
    ],
    weaving_products: [
      {
        id: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        width: { type: Number, required: true },
        grammage: { type: Number, required: true },
        order_quantity: { type: Number, required: true },
        // unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "To'quvga yuborildi" },
      },
    ],
    delivery_time_weaving: { type: Date, required: true },
    delivery_time_sale: { type: Date, required: true },
    status: { type: String, default: "Jarayonda" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
    sale_id: {
      type: Schema.ObjectId,
      ref: "SaleCard",
    },
  },
  { timestamps: true }
);

module.exports = model("InputPaintPlan", InputPaintPlanSchema);
