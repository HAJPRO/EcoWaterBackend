const { model, Schema } = require("mongoose");

const MaterialTypesSchema = new Schema(
  {
    department: {
      type: Number,
    },
    name: { type: String },
  },
  { timestamps: true }
);
module.exports = model("MaterialTypes", MaterialTypesSchema);
