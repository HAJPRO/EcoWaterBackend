const { model, Schema } = require("mongoose");

const SaleCardProductsSchema = new Schema(
    {
        author: { type: Schema.ObjectId, ref: "User", required: true },
        sale_id: { type: Schema.ObjectId, ref: "SaleCard", required: true },
        id: { type: String, required: true },
        product_name: { type: String, required: true },
        product_type: { type: String, required: true },
        color: { type: String, required: true },
        width: { type: Number, required: true },
        grammage: { type: Number, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Sotuvda" },
    },
    { timestamps: true }
);
module.exports = model("SaleCardProducts", SaleCardProductsSchema);
