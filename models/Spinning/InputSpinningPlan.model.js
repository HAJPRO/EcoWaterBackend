const { Schema, model } = require("mongoose");

const InputSpinningPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_quantity: { type: Number, required: true },

    weaving_products: [
      {
        id: { type: String, required: true },
        yarn_name: { type: String, required: true },
        yarn_type: { type: String, required: true },
        yarn_quantity: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "To'quvda" },
      },
    ],
    artikul: { type: String, required: true },
    delivery_time_weaving: { type: Date, required: true },
    status: { type: String, default: "Jarayonda" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("InputSpinningPlan", InputSpinningPlanSchema);
