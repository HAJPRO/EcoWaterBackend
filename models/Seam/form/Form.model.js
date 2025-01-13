const { model, Schema } = require("mongoose");

const FormSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    // head_pack: {
    //   type: Number,
    //   required: true,
    // },
    // pastal_quantity: {
    //   type: Number,
    //   required: true,
    // },
    // waste_quantity: {
    //   type: Number,
    //   required: true,
    // },
    // fact_gramage: {
    //   type: Number,
    //   required: true,
    // },
    party_number: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    artikul: {
      type: String,
      required: true,
    },
    material_name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    sort: {
      type: String,
      required: true,
    },
    in_where: {
      type: String,
      required: true,
      default: "Bichuvda",
    },
    processing: {
      type: String,
      required: true,
      default: "Bichimda",
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

module.exports = model("Form", FormSchema);
