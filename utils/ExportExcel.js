const ExcelJS = require("exceljs");

async function ExportExcelCustomerOrders(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Buyurtmalar mavjud emas");
  }

  const workbook = new ExcelJS.Workbook();
  const firstOrder = data[0];
  const worksheet = workbook.addWorksheet(
    `${firstOrder?.customerId?.fullname || "Buyurtmalar"}`
  );

  const customerName = firstOrder?.customerId?.fullname || "Mijoz";
  const { region = "", district = "", street = "" } =
    firstOrder?.customerId?.address || {};
  const addressString = [region, district, street].filter(Boolean).join(", ");

  const headers = [
    "№",
    "Buyurtma №",
    "Holati",
    "Haydovchi",
    "Buyurtma vaqti",
    "Yetkazilgan vaqti",
    "Mahsulot nomi",
    "Miqdor",
    "Birlik",
    "Narx",
    "Summasi",
  ];

  const getColumnLetter = (colNum) => {
    let letter = "";
    while (colNum > 0) {
      let remainder = (colNum - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      colNum = Math.floor((colNum - 1) / 26);
    }
    return letter;
  };

  const lastColLetter = getColumnLetter(headers.length);
  const titleRange = `A1:${lastColLetter}1`;

  worksheet.addRow([
    `${customerName} (${addressString}) ning buyurtmalar ro'yxati`,
  ]);
  worksheet.mergeCells(titleRange);
  worksheet.getCell("A1").font = { bold: true, size: 16 };
  worksheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 30;

  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF16A34A" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  let grandTotal = 0;
  let rowNumber = 4;

  data.forEach((order) => {
    const driver = order.driverId || {};
    const products = Array.isArray(order.products) ? order.products : [];

    const validProducts = products.filter(
      (p) => typeof p === "object" && !Array.isArray(p) && p !== null
    );

    if (validProducts.length === 0) {
      worksheet.addRow([
        rowNumber++,
        order.orderNumber || "",
        order.status || "",
        driver.fullname || "",
        new Date(order.createdAt).toLocaleString(),
        new Date(order.deliveryTime).toLocaleString(),
        "",
        "",
        "",
        "",
        "",
      ]);
    } else {
      validProducts.forEach((product, index) => {
        worksheet.addRow([
          index === 0 ? rowNumber : "",
          index === 0 ? order.orderNumber || "" : "",
          index === 0 ? order.status || "" : "",
          index === 0 ? driver.fullname || "" : "",
          index === 0 ? new Date(order.createdAt).toLocaleString() : "",
          index === 0 ? new Date(order.deliveryTime).toLocaleString() : "",
          product.pro_name || product.title || "",
          product.pro_quantity || "",
          product.pro_unit || "",
          product.pro_price || "",
          product.pro_total_price || "",
        ]);
      });

      const total = validProducts.reduce(
        (sum, p) => sum + (p.pro_total_price || 0),
        0
      );

      grandTotal += total;

      const totalRow = worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "➡ Buyurtma summasi:",
        total,
      ]);
      totalRow.font = { bold: true };

      rowNumber++;
    }
  });

  const finalRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "🧾 Umumiy summa:",
    grandTotal,
  ]);
  finalRow.font = { bold: true };
  finalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFCC00" },
  };

  const colWidths = [6, 20, 15, 25, 25, 25, 30, 12, 12, 15, 18];
  colWidths.forEach((width, i) => {
    worksheet.getColumn(i + 1).width = width;
  });

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const safeCustomerName = encodeURIComponent(customerName.trim().replace(/\s+/g, "_"));
const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return {
    buffer,
    filename: `${safeCustomerName}_${date}.xlsx`,
  };
}

module.exports = { ExportExcelCustomerOrders };
