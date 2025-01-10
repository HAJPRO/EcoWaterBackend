const { model, Schema } = require("mongoose");

const OutputSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    // warehouse_id: { type: Schema.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    transactionDateOutput: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("Output", OutputSchema);
