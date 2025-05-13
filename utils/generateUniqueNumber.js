const ReadyWarehouse = require("../models/warehouses/r-warehouse/r-warehouse.model"); // modelga yo‘l to‘g‘rilang
const Order = require("../models/Sale/orders/order.model"); // modelga yo‘l to‘g‘rilang


async function generateUniquePartyNumber() {
  const year = new Date().getFullYear(); // Masalan, 2025
  const prefix = `PART-${year}-`;

  let newNumber = 1;
  let isUnique = false;
  let partyNumber;

  // Unikal raqamni topish uchun sikl
  while (!isUnique) {
    partyNumber = `${prefix}${newNumber}`;

    // Agar raqam mavjud bo‘lsa, yangi raqamni oshiramiz
    const existingParty = await ReadyWarehouse.findOne({ partyNumber });

    if (!existingParty) {
      isUnique = true; // Raqam unikal bo‘lsa sikldan chiqamiz
    } else {
      newNumber++; // Yangi raqam generatsiya qilamiz
    }
  }

  return partyNumber;
}
async function generateUniqueOrderNumber() {
  const year = new Date().getFullYear(); // Masalan, 2025
  const prefix = `ORDER-${year}-`;

  let newNumber = 1;
  let isUnique = false;
  let orderNumber;

  // Unikal raqamni topish uchun sikl
  while (!isUnique) {
    orderNumber = `${prefix}${newNumber}`;

    // Agar raqam mavjud bo‘lsa, yangi raqamni oshiramiz
    const existingOrder = await Order.findOne({ orderNumber });

    if (!existingOrder) {
      isUnique = true; // Raqam unikal bo‘lsa sikldan chiqamiz
    } else {
      newNumber++; // Yangi raqam generatsiya qilamiz
    }
  }

  return orderNumber;
}

module.exports = { generateUniquePartyNumber, generateUniqueOrderNumber };
