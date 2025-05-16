const { model, Schema } = require("mongoose");

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Masalan: 'admin', 'manager'
    },
    description: {
      type: String,
    },
    permissions: [{
      type: Schema.Types.ObjectId, ref: "Permission"
    }],
  }, {
  timestamps: true,
}
);

module.exports = model("Role", RoleSchema);
