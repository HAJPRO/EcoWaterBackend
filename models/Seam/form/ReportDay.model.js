const { model, Schema } = require("mongoose");

const ReportDaySchema = new Schema(
  {
    part_number: { type: Schema.ObjectId },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "Tasdiqlanmagan",
    },

    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("ReportDay", ReportDaySchema);
