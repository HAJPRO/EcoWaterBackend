const { model, Schema } = require("mongoose");

const ProcessBoxSchema = new Schema(
  {
    box: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = model("ProcessBox", ProcessBoxSchema);
