const { model, Schema } = require("mongoose");

const MaterialNameSchema = new Schema(
  {
    department: {
      type: String,
    },
    name: { type: String },
  },
  { timestamps: true }
);
module.exports = model("MaterialName", MaterialNameSchema);
