const { model, Schema } = require("mongoose");

const ProcessBoxSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("ProcessBox", ProcessBoxSchema);
