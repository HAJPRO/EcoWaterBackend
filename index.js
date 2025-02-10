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
app.use(cors({ credentials: true, origin: "*" }));
// app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static("./public"));
app.use(fileUpload({}));
app.use(cookie({}));
app.use(errorMiddleware);
// HR BOT
//
// SEAM BOT
//
const PORT = process.env.PORT || 5000;
// Routes

app.use("/api/v1/admin", require("./routes/admin/admin.route.js"));
app.use("/api/v1/auth", require("./routes/auth.route.js"));


const START = async () => {
  try {
    await mongoose
      .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Connect DB"));
    app.listen(PORT, () => {
      console.log(`server has been started on port ${PORT}  `);
    });
  } catch (err) {
    console.log(`Error connect with DB ${err} `);
  }
};
START();
