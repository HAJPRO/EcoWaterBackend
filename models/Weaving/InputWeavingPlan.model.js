const { Schema, model } = require("mongoose");

const InputWeavingPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_quantity: { type: Number, required: true },
    spinning_quantity: { type: Number, required: true },
    artikul: { type: String, required: true },
    delivery_time_spinning: { type: Date, required: true },
    delivery_time_paint: { type: Date, required: true },
    status: { type: String, default: "Jarayonda" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
    paint_input_id: {
      type: Schema.ObjectId,
      ref: "InputPaintPlan",
    },
  },
  { timestamps: true }
);

module.exports = model("InputWeavingPlan", InputWeavingPlanSchema);
