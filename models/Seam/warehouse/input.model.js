const { model, Schema } = require("mongoose");

const InputSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    // warehouse_id: { type: Schema.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    transactionDateInput: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("Input", InputSchema);
