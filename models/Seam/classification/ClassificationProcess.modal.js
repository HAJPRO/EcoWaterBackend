const { model, Schema } = require("mongoose");
const ClassificationProcessSchema = new Schema(
    {
        form_id: { type: Schema.ObjectId, ref: "addtoforms" },
        item: {
            type: Object,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "Jarayonda",
        },

        state: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = model("ClassificationProcess", ClassificationProcessSchema);
