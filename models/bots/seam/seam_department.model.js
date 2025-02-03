const { model, Schema } = require("mongoose");

const SeamDepartmentSchema = new Schema(
    {
        name: {
            require: true,
            type: String,
        },
        number: {
            require: true,
            type: String,
        },
        state: { type: Boolean, default: true }
    },
    { timestamps: true }
);
module.exports = model("SeamDepartment", SeamDepartmentSchema);
