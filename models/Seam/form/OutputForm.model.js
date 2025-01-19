const { model, Schema } = require("mongoose");

const OutputFormSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    form_id: {
      type: Schema.ObjectId,
      ref: "Form",
      required: true,
    },
    pastal_quantity: { type: Number, required: true },
    head_pack: { type: Number, required: true },
    waste_quantity: { type: Number, required: true },
    fact_gramage: { type: Number, required: true },
    status: { type: String, required: true, default: "Tasnifa yuborildi" },

    transactionDateOutput: { type: Date, default: new Date() },
    state: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = model("OutputForm", OutputFormSchema);
