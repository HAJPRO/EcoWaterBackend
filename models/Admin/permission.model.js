const { model, Schema } = require("mongoose");

const PermissionSchema = new Schema(
  {
    permission_name: {
      type: String,
      required: true,
    },
    actions: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model("Permission", PermissionSchema);
