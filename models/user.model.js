const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
    },
    department: { type: String },
    password: { type: String },
    role: { type: Number, default: 1 },
    isActivated: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = model("User", userSchema);
