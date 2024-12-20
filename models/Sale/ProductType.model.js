const { model, Schema } = require("mongoose");

const ProductTypeSchema = new Schema(
  {
    code: {
      type: Number,
    },
    name: { type: String },
  },
  { timestamps: true }
);
module.exports = model("ProductType", ProductTypeSchema);
