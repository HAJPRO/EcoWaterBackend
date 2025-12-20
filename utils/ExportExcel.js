const ExcelJS = require("exceljs");
const moment = require("moment");

/**
 * Haydovchi buyurtmalarini professional guruhlangan holda eksport qilish
 */
async function ExportExcelCustomerOrders(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Eksport qilish uchun buyurtmalar topilmadi.");
  }

  const workbook = new ExcelJS.Workbook();
  const firstOrder = data[0];
  const driverName = firstOrder?.driverId?.fullname || "Haydovchi";
  const worksheet = workbook.addWorksheet("Logistika Hisoboti");

  // 1. USTUNLARNI SOZLASH
  worksheet.columns = [
    { key: "index", width: 8 },        // №
    { key: "orderNo", width: 25 },     // Buyurtma №
    { key: "status", width: 18 },      // Holati
    { key: "customer", width: 30 },    // Mijoz
    { key: "date", width: 15 },        // Sana
    { key: "accepted", width: 12 },    // Qabul
    { key: "arrived", width: 12 },     // Yetkazdi
    { key: "itemName", width: 35 },    // Mahsulot
    { key: "qty", width: 12 },         // Soni
    { key: "price", width: 18 },       // Narx
    { key: "total", width: 20 },       // Jami
  ];

  // 2. DIZAYN (STILLAR)
  const colors = {
    headerBg: "FF1E293B",    // Slate 800
    titleBg: "FF4F46E5",     // Indigo 600
    border: "FFCBD5E1",      // Slate 300
    success: "FF10B981",     // Emerald 500
    danger: "FFEF4444",      // Rose 500
    white: "FFFFFFFF"
  };

  const centerAlignment = { vertical: "middle", horizontal: "center", wrapText: true };
  const leftAlignment = { vertical: "middle", horizontal: "left", wrapText: true };
  const thinBorder = {
    top: { style: "thin", color: { argb: colors.border } },
    left: { style: "thin", color: { argb: colors.border } },
    bottom: { style: "thin", color: { argb: colors.border } },
    right: { style: "thin", color: { argb: colors.border } },
  };

  // 3. SARLAVHA QISMI
  worksheet.mergeCells("A1:K1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = `HAYDOVCHI: ${driverName.toUpperCase()} — YETKAZIB BERISH TAHLILI`;
  titleRow.font = { bold: true, size: 16, color: { argb: colors.white }, name: "Arial" };
  titleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.titleBg } };
  titleRow.alignment = centerAlignment;
  worksheet.getRow(1).height = 45;

  // Metadata qatori
  worksheet.mergeCells("A2:K2");
  const metaCell = worksheet.getCell("A2");
  metaCell.value = `Hisobot shakllantirildi: ${moment().format("DD.MM.YYYY HH:mm")} | Jami buyurtmalar: ${data.length} ta`;
  metaCell.font = { italic: true, size: 10, color: { argb: "FF64748B" } };
  metaCell.alignment = centerAlignment;

  // 4. JADVAL HEADERLARI
  const headerRow = worksheet.getRow(3);
  headerRow.values = ["№", "BUYURTMA №", "HOLATI", "MIJOZ F.I.O", "SANA", "QABUL", "YETKAZDI", "MAHSULOT NOMI", "SONI", "NARX", "JAMI"];
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: colors.white }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerBg } };
    cell.alignment = centerAlignment;
    cell.border = thinBorder;
  });

  // 5. MA'LUMOTLARNI TO'LDIRISH VA GRUPPALASH
  let counter = 1;
  let grandTotal = 0;
  const currencyFmt = '#,##0 "so\'m"';

  data.forEach((order) => {
    const items = order.items || [];
    const startRow = worksheet.lastRow.number + 1;

    items.forEach((item, index) => {
      const row = worksheet.addRow([
        counter,
        order.orderNumber,
        order.status.toUpperCase(),
        order.customerId?.fullname || "—",
        moment(order.date).format("DD.MM.YYYY"),
        order.driverAcceptedTime ? moment(order.driverAcceptedTime).format("HH:mm") : "—",
        order.driverArrivedTime ? moment(order.driverArrivedTime).format("HH:mm") : "—",
        item.name || "Noma'lum",
        Number(item.quantity) || 0,
        Number(item.salePrice) || 0,
        Number(item.quantity * item.salePrice) || 0
      ]);

      // Kataklarni formatlash
      row.eachCell((cell) => {
        cell.alignment = centerAlignment;
        cell.border = thinBorder;
      });

      row.getCell(8).alignment = leftAlignment; // Mahsulot nomi chapdan
      row.getCell(10).numFmt = currencyFmt;
      row.getCell(11).numFmt = currencyFmt;

      // Status rangi
      const sCell = row.getCell(3);
      const isSuccess = order.status === 'Yetkazib berildi';
      sCell.font = { color: { argb: isSuccess ? colors.success : colors.danger }, bold: true, size: 9 };
    });

    const endRow = worksheet.lastRow.number;

    // BIR XIL MA'LUMOTLARNI MERGE (GURUHLASH) QILISH
    if (items.length > 1) {
      ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
        worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
      });
    }

    grandTotal += Number(order.totalAmount || 0);
    counter++;
  });

  // 6. XULOSA (FOOTER)
  worksheet.addRow([]); // Bo'sh qator
  const footerRow = worksheet.addRow(["", "", "", "", "", "", "", "", "", "UMUMIY SUMMA:", grandTotal]);
  footerRow.height = 35;
  
  const labelCell = footerRow.getCell(10);
  labelCell.font = { bold: true, size: 12 };
  labelCell.alignment = { horizontal: "right", vertical: "middle" };

  const totalCell = footerRow.getCell(11);
  totalCell.font = { bold: true, size: 14, color: { argb: colors.white } };
  totalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.success } };
  totalCell.alignment = centerAlignment;
  totalCell.numFmt = currencyFmt;
  totalCell.border = thinBorder;

  // 7. YAKUNIY SOZLAMALAR
  worksheet.views = [{ state: 'frozen', ySplit: 3 }]; // Sarlavhani qotirib qo'yish

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Hisobot_${driverName.replace(/\s+/g, '_')}_${moment().format("YYYYMMDD")}.xlsx`;

  return { buffer, filename };
}

module.exports = { ExportExcelCustomerOrders };