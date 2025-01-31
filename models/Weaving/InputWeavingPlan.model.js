const { Schema, model } = require("mongoose");

const InputWeavingPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_quantity: { type: Number, required: true },
    spinning_quantity: { type: Number, required: true },
    paint_products: [
      {
        id: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        width: { type: Number, required: true },
        grammage: { type: Number, required: true },
        order_quantity: { type: Number, required: true },
        // unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Bo'yoqqa yuborildi" },
      },
    ],
    spinning_products: [
      {
        id: { type: String, required: true },
        yarn_name: { type: String, required: true },
        yarn_type: { type: String, required: true },
        yarn_quantity: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Yigiruvga yuborldi" },
      },
    ],
    artikul: { type: String, required: true },
    delivery_time_spinning: { type: Date, required: true },
    delivery_time_paint: { type: Date, required: true },
    status: { type: String, default: "Jarayonda" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("InputWeavingPlan", InputWeavingPlanSchema);
