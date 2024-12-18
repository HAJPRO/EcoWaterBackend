const { model, Schema } = require("mongoose");

const RoleSchema = new Schema(
  {
    role_name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Role", RoleSchema);
