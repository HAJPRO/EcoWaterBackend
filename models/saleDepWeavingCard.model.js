const { Schema, model } = require("mongoose");

const SaleDepWeavingCardSchema = new Schema(
  {
    departmen: { type: String, default: "To'quv" },
    author: { type: Schema.ObjectId, ref: "User" },
    spinning_yarn_wrap_quantity: { type: Number },
    spinning_delivery_time: { type: Date, default: Date.now(), required: true },
    sale_order_id: { type: Schema.ObjectId, ref: "SaleCard" },
    paint_id: { type: Schema.ObjectId, ref: "DepPaintCard" },
    in_process_id: { type: Schema.ObjectId, ref: "InProcessWeavingModel" },
    provide_id: { type: Schema.ObjectId, ref: "DepProvideCard" },
    status_provide: { type: String, default: "Taminotga yuborildi" },
    status_spinning: { type: String, default: "Yigiruvga yuborildi" },
    status_inprocess: { type: String, default: "Jarayonda" },
    weaving_process_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("DepWeavingCard", SaleDepWeavingCardSchema);
