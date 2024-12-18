const { Schema, model } = require("mongoose");

const SaleDepSpinningCardSchema = new Schema(
    {
        departmen: { type: String, default: "Yigiruv" },
        author: { type: Schema.ObjectId, ref: "User" },
        sale_order_id: { type: Schema.ObjectId, ref: "SaleCard" },
        in_process_id: { type: Schema.ObjectId, ref: "InProcessSpinningModel" },
        provide_id: { type: Schema.ObjectId, ref: "DepProvideCard" },
        spinning_process_status: { type: Array },
        status_inprocess: { type: String, default: "Jarayonda" },
        in_process_id: { type: Schema.ObjectId, ref: "InProcessSpinningModel" },
        state: { type: Boolean, default: true },
        weaving_id: { type: Schema.ObjectId, ref: "DepWeavingCard" }
    },
    { timestamps: true }
);

module.exports = model("DepSpinningCard", SaleDepSpinningCardSchema);
