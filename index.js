// server.js (yoki index.js)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

const app = express();

// env flag

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const isProd = process.env.NODE_ENV === "production";


app.use(
  cors({
    origin: isProd ? "https://ecowater.company-erp.uz" : "*",
    credentials: isProd, // prod -> true, dev -> false
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



// Static files
app.use(express.static(path.join(__dirname, "public")));

// File upload & cookies
app.use(fileUpload());
app.use(cookieParser());

// HTTP server + socket setup
const http = require("http");
const server = http.createServer(app);

// Require socket module robustly (handles both module.exports = fn and exports.setupSocket = fn)
const socketModule = require("./socket/socket.js");
const setupSocket = socketModule.setupSocket || socketModule;

// Create socket (passthrough options if your socket module supports them)
const io = setupSocket(server, {
  
});

// make io available inside express handlers
app.set("io", io);

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

// Warehouses
app.use(
  "/api/v1/warehouses",
  require("./routes/warehouses/r-warehouse/warehouse.route.js")
);

// Error middleware SHOULD be after all routes
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 5000;

const START = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB ga ulanish muvaffaqiyatli");

    server.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishga tushdi`);
    });
  } catch (err) {
    console.error(`DB ga ulanishda xatolik: ${err}`);
    process.exit(1); // agar xato bo'lsa processni tugatish mumkin
  }
};

START();
