const { model, Schema } = require("mongoose");

const ProductNameSchema = new Schema(
  {
    code: {
      type: Number,
    },
    name: { type: String },
  },
  { timestamps: true }
);
module.exports = model("ProductName", ProductNameSchema);
