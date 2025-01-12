const { Schema, model } = require("mongoose");

const HRAppealsSchema = new Schema(
  {
    message: { type: String, required: true },
    res_date: { type: Date },
    status: { type: String, required: true, default: "Ananim murojaat" },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("HRAppeals", HRAppealsSchema);
