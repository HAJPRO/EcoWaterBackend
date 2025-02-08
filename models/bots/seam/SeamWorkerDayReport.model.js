const { model, Schema } = require("mongoose");

const SeamWorkerDayReportSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "SeamUser", required: true },
    chatId: {
      require: true,
      type: String,
    },
    party_number: {
      type: String,
    },
    artikul: {
      type: String,
    },
    product: {
      type: String,
    },
    work: {
      type: String,
    },
    quantity: {
      type: String,
    },
    received_time: {
      type: Date,
    },
    status: { type: String, default: "Tasdiqlanmagan" },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = model("SeamWorkerDayReport", SeamWorkerDayReportSchema);
