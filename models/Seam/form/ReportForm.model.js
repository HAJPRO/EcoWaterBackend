const { model, Schema } = require("mongoose");

const ReportSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    form_id: {
      type: Schema.ObjectId,
      ref: "Form",
      required: true,
    },
    to_where: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    status: { type: String, required: true, default: "" },
    transactionDateOutput: { type: Date, default: new Date() },
    state: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = model("OutputForm", OutputSchema);
