const { model, Schema } = require("mongoose");

const OptionsForSelectSchema = new Schema(
  {
    type: {
      type: String,
    },
    department: {
      required: true,
      type: String,
    },
    name: { required: true, type: String },
  },
  { timestamps: true }
);
module.exports = model("OptionsForSelect", OptionsForSelectSchema);
