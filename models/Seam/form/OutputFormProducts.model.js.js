const { model, Schema } = require("mongoose");

const OutputFormProductsSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    output: { type: Schema.ObjectId, ref: "OutputForm", required: true },
    form_id: {
      type: Schema.ObjectId,
      ref: "Form",
      required: true,
    },

    model_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true, default: new Date() },
    state: { type: Boolean, required: true, default: true },
    status: { type: String, required: true, default: "Tasnifa yuborildi" },
  },
  { timestamps: true }
);
module.exports = model("OutputFormProducts", OutputFormProductsSchema);
