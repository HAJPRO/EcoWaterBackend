const { Schema, model } = require("mongoose");

const SaleDepPaintCardSchema = new Schema(
  {
    departmen: { type: String, default: "Bo'yoq" },
    author: { type: Schema.ObjectId, ref: "User" },
    weaving_cloth_quantity: { type: Number },
    weaving_delivery_time: { type: Date, default: Date.now(), required: true },
    sale_order_id: { type: Schema.ObjectId, ref: "SaleCard" },
    in_process_id: { type: Schema.ObjectId, ref: "InProcessPaintModel" },
    provide_id: { type: Schema.ObjectId, ref: "DepProvideCard" },
    status_provide: { type: String, default: "Taminotga yuborildi" },
    status_weaving: { type: String, default: "To'quvga yuborildi" },
    status_inprocess: { type: String, default: "Jarayonda" },

    paint_process_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = model("DepPaintCard", SaleDepPaintCardSchema);
