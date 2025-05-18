const express = require("express");
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookie = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { setupSocket } = require("./socket/socket.js")
app.use(cors({
  origin: '*'
  // origin: "https://ecowater.company-erp.uz",
  // credentials: true,
}));
// app.use(express.static(path.join(__dirname, "./public"))); /////
app.use(express.static("./public"));
app.use(fileUpload({}));
app.use(cookie({}));
app.use(errorMiddleware);

const http = require("http");
const server = http.createServer(app);
const io = setupSocket(server);
// Global o‘rniga app ichida saqlash
app.set("io", io);
const PORT = process.env.PORT || 5000;
// Routes
// 📌 BOTLAR
require("./bots/drivers/bot.js");

app.use("/api/v1/helpers", require("./routes/helpers/address/address.route.js"));
// Admin
app.use("/api/v1/admin/permission", require("./routes/admin/permission.route.js"));
app.use("/api/v1/admin/role", require("./routes/admin/role.route.js"));
app.use("/api/v1/auth", require("./routes/auth.route.js"));
// HR
app.use("/api/v1/hr/employees", require("./routes/hr/employee/employee.route.js"));
// Drivers
app.use("/api/v1/drivers", require("./routes/drivers/driver.route.js"));
// Customers
app.use("/api/v1/customers", require("./routes/customers/c-managment/managment.route.js"));
// Sale
app.use("/api/v1/sale", require("./routes/sale/orders/order.route.js"));
app.use("/api/v1/sale/products", require("./routes/sale/products/product.route.js"));

// Warehouses
app.use("/api/v1/warehouses", require("./routes/warehouses/r-warehouse/warehouse.route.js"));



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
    console.log(`DB ga ulanishda xatolik: ${err}`);
  }
};
START();




