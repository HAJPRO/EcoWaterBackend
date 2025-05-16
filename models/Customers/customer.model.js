const { model, Schema } = require("mongoose");
const CustomerSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  category: { type: String, required: true },
  artikul: {
    type: String,
    trim: true,
    required: true,
  },
  position: {
    type: String,
    enum: ["Tilla", "Kumush", "Bronza"],
    trim: true,
  },
  registeredAt: { type: Date, default: new Date(), required: true },
  imageUrl: { type: String },
  discription: { type: String },
  inn: { type: String },

  passportNumber: {
    type: String,
    unique: true,
  },
  phoneNumber: {
    type: String,

    trim: true,
  },
  email: { type: String },
  telegram: { type: String },
  address: {
    region: { type: String, required: true },
    district: { type: String, required: true },
    neighborhood: { type: String, required: true },
    street: { type: String, required: true },
    house: { type: String, required: true },
  },
  location: {
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
  },

  status: {
    type: String,
    enum: ["Aktiv", "offline", "band", "kutmoqda"],
    default: "Aktiv",
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  ratings: {
    type: [Number],
    default: [],
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  completedOrders: {
    type: Number,
    default: 0,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = model("Customer", CustomerSchema);
