const { model, Schema } = require("mongoose");

const PermissionSchema = new Schema(
  {
    permission_name: {
      type: String,
      required: true,
    },
    is_default: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("Permission", PermissionSchema);
