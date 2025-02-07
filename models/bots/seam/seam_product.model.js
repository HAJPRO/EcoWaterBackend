const { model, Schema } = require("mongoose");

const SeamProductSchema = new Schema(
  {
    name: {
      require: true,
      type: String,
    },
    number: {
      require: true,
      type: String,
    },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = model("SeamProduct", SeamProductSchema);
