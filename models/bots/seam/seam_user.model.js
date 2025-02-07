const { model, Schema } = require("mongoose");

const SeamAuthSchema = new Schema(
  {
    chatId: {
      require: true,
      type: String,
    },
    username: {
      require: true,
      type: String,
    },
    first_name: {
      require: true,
      type: String,
    },
    fullname: { type: String },
    department: { type: String },
    phone_number: { type: String },
    code: { type: String },
    role: { type: Number, default: 0 },
    admin: { type: Boolean, default: false },
    permissions: { type: Array, default: [] },
    action: { type: String, default: "request_fullname" },
    isActivated: { type: Boolean, default: false },
    status: { type: String, default: "Aktiv xodim" },
  },
  { timestamps: true }
);
module.exports = model("SeamUser", SeamAuthSchema);
