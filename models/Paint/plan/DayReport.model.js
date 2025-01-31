const { Schema, model } = require("mongoose");

const DayReportPaintPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    input_plan_id: {
      type: Schema.ObjectId,
      ref: "InputweavingPlan",
      required: true,
    },
    order_number: { type: String, required: true },
    material_name: { type: String, required: true },
    material_type: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, default: "Sotuvga yuborildi", required: true },
    state: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

module.exports = model("DayReportPaintPlan", DayReportPaintPlanSchema);
