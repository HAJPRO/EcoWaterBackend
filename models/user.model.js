const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
    },
    department: { type: String },
    password: { type: String },
    role: { type: Number, default: 0 },
    permissions: { type: Array, default: [] },
    actions: { type: Array, default: [] },
    isActivated: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = model("User", userSchema);
