require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

const app = express();

// ------------------ MIDDLWARES ------------------

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const isProd = process.env.NODE_ENV === "production";

// ✅ CORS sozlamalari
const allowedOrigins = ["https://ecowater.company-erp.uz"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || !isProd || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Ruxsat etilmagan domen"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
};

// ✅ CORS middleware - har doim tepada
app.use(cors(corsOptions));

// Static files (public papkasini statik qilish)
app.use(express.static(path.join(__dirname, "public")));

// File upload & cookies
app.use(fileUpload());
app.use(cookieParser());


// ------------------ ROUTES ------------------
// Bots (side-effect require)
require("./bots/drivers/bot.js");

// Helpers
app.use(
  "/api/v1/helpers",
  require("./routes/helpers/address/address.route.js")
);

// Dashboard
app.use(
  "/api/v1/dashboard/statistics/sale",
  require("./routes/dashboard/statistics/saleStatistic.route.js")
);

// Admin
app.use(
  "/api/v1/admin/permission",
  require("./routes/admin/permission.route.js")
);
app.use("/api/v1/admin/role", require("./routes/admin/role.route.js"));
app.use("/api/v1/admin/user", require("./routes/admin/users.route.js"));

app.use("/api/v1/auth", require("./routes/auth.route.js"));

// HR
app.use(
  "/api/v1/hr/employees",
  require("./routes/hr/employee/employee.route.js")
);

// Drivers
app.use("/api/v1/drivers", require("./routes/drivers/driver.route.js"));

// Customers
app.use(
  "/api/v1/customers",
  require("./routes/customers/c-managment/managment.route.js")
);

// Sale
app.use("/api/v1/sale", require("./routes/sale/orders/order.route.js"));
app.use(
  "/api/v1/sale/products",
  require("./routes/sale/products/product.route.js")
);
app.use(
  "/api/v1/sale/salepos",
  require("./routes/sale/salepos/salepos.route.js")
);

// Warehouses
app.use(
  "/api/v1/warehouses",
  require("./routes/warehouses/r-warehouse/warehouse.route.js")
);
app.use(
  "/api/v1/warehouses/input",
  require("./routes/warehouses/input/input.route.js")
);


// Error middleware SHOULD be after all routes
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 5000;

const START = async () => {
  try {
    await mongoose.connect(process.env.DB_URL,{ autoIndex: false }); // mongoose.connect hozirgi versiyalarda options talab qilmaydi
    console.log("DB ga ulanish muvaffaqiyatli");

    // Express serverni to'g'ridan-to'g'ri app.listen() orqali ishga tushirish
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishga tushdi`);
    });
  } catch (err) {
    console.error(`DB ga ulanishda xatolik: ${err}`);
    process.exit(1);
  }
};

// 🔥 O'ZGARGON JOY: START() faqat asosiy fayl bo'lsa ishlaydi
if (require.main === module) {
    START();
}
// mongoose.connection.on('open', async () => {
//   try {
//     const collection = mongoose.connection.db.collection('readywarehouses');
//     const indexes = await collection.indexes();
    
//     // partyNumber bilan bog'liq unikal indeksni qidiramiz
//     const targetIndex = indexes.find(idx => idx.key && idx.key.partyNumber);

//     if (targetIndex) {
//       console.log("Topilgan indeks nomi:", targetIndex.name);
//       await collection.dropIndex(targetIndex.name);
//       console.log(`SUCCESS: ${targetIndex.name} indeksi muvaffaqiyatli o'chirildi!`);
//     } else {
//       console.log("INFO: partyNumber uchun hech qanday indeks topilmadi.");
//     }
//   } catch (err) {
//     console.error("Xatolik yuz berdi:", err.message);
//   }
// });
// Boshqa fayllar import qilishi uchun Express app ob'ektini eksport qilamiz
module.exports = app;