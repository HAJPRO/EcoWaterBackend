const { model, Schema } = require("mongoose");

const QRCodeModelSchema = new Schema(
    {
        qrCodeImage: Buffer
    },
    { timestamps: true }
);

module.exports = model("QRCodeModel", QRCodeModelSchema);
