const { Schema, model } = require("mongoose");

const SaleCardSchema = new Schema(
    {
        author: { type: Schema.ObjectId, ref: "User", required: true },
        customer_name: { type: String, required: true },
        order_number: { type: String, required: true },
        delivery_time: { type: Date, default: Date.now(), required: true },
        status: { type: String, default: "Tasdiqlanmagan" },
        process_status: { type: Array },
        state: { type: Boolean, default: true },
        paint_id: {
            type: Schema.ObjectId,
            ref: "DepPaintCard",
        },
        weaving_id: {
            type: Schema.ObjectId,
            ref: "DepWeavingCard",
        },
        spinning_id: {
            type: Schema.ObjectId,
            ref: "DepSpinningCard",
        },
        provide_id: {
            type: Schema.ObjectId,
            ref: "DepProviderCard",
        },
    },
    { timestamps: true }
);

module.exports = model("SaleCard", SaleCardSchema);
