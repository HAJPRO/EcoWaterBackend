const { Schema, model } = require("mongoose");

const InputPaintPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_qauntity: { type: Number, required: true },
    order_quantity: { type: Number, required: true },
    artikul: { type: String, required: true },
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
