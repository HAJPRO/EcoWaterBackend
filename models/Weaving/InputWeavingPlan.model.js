const { Schema, model } = require("mongoose");

const InputWeavingPlanSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    order_number: { type: String, required: true },
    weaving_quantity: { type: Number, required: true },
    spinning_quantity: { type: Number, required: true },
    artikul: { type: String, required: true },
    delivery_time_spinning: { type: Date, required: true },
    delivery_time_paint: { type: Date, required: true },
    paint_products: [
      {
        id: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        width: { type: Number, required: true },
        grammage: { type: Number, required: true },
        raw_material_quantity: { type: Number, required: true },
        yarn_length: { type: String, required: true },
        pus_fiene: { type: String, required: true },
        polister_type: { type: String, required: true },
        color_code: { type: String, required: true },
        color_type: { type: String, required: true },
        print: { type: String },
        description: { type: String },
        // unit: { type: String, required: true },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Bo'yoqdan keldi" },
      },
    ],
    spinning_products: [
      {
        id: { type: String, required: true },
        yarn_name: { type: String, required: true },
        yarn_type: { type: String, required: true },
        yarn_quantity: { type: String, required: true },
        likra_type: { type: String },
        melaks_type: { type: String },
        polister_type: { type: String },
        state: { type: Boolean, required: true, default: true },
        status: { type: String, required: true, default: "Yigiruvga yuborldi" },
      },
    ],

    status: { type: String, default: "Jarayonda" },
    provide_status: { type: String, default: "Taminotga yuborildi" },
    weaving_status: { type: String, default: "Yigiruvga yuborildi" },
    process_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("InputWeavingPlan", InputWeavingPlanSchema);
