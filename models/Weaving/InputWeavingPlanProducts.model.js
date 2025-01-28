const { model, Schema } = require("mongoose");

const InputWeavingPlanProductsSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    input_plan_id: {
      type: Schema.ObjectId,
      ref: "InputWeavingPlan",
      required: true,
    },
    id: { type: String, required: true },
    yarn_name: { type: String, required: true },
    yarn_type: { type: String, required: true },
    yarn_quantity: { type: String, required: true },
    state: { type: Boolean, required: true, default: true },
    status: { type: String, required: true, default: "Bo'yoqda" },
  },
  { timestamps: true }
);
module.exports = model(
  "InputWeavingPlanProducts",
  InputWeavingPlanProductsSchema
);
