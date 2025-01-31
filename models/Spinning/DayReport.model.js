const { Schema, model } = require("mongoose");

const DayReportSpinningPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    input_plan_id: {
      type: Schema.ObjectId,
      ref: "InputSpinningPlan",
      required: true,
    },
    order_number: { type: String, required: true },
    yarn_name: { type: String, required: true },
    yarn_type: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, default: "To'quvga yuborildi", required: true },
    state: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

module.exports = model("DayReportSpinningPlan", DayReportSpinningPlanSchema);
