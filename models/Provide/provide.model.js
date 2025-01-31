const { Schema, model } = require("mongoose");
const ProvideSchema = new Schema(
  {
    department: { type: String, required: true },
    username: { type: String, required: true },
    order_number: { type: String, required: true },
    artikul: { type: String, required: true },
    customer_name: { type: String, required: true },
    delivery_product_box: { type: Array, required: true, default: [] },
    author: { type: Schema.ObjectId, ref: "User" },
    status: { type: String, default: "Tasdiqlanmagan" },
    proccess_status: { type: Array },
    state: { type: Boolean, default: true },
    delivery_time_provide: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = model("Provide", ProvideSchema);
