const ExcelJS = require("exceljs");

/**
 * Buyurtmalar ro'yxatini professional Excel formatga o'tkazadi.
 * @param {Array} data - Buyurtmalar massivi
 */
async function ExportExcelCustomerOrders(data) {
  // 1. Validatsiya
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Eksport qilish uchun buyurtmalar topilmadi.");
  }

  // 2. Workbook va Meta-ma'lumotlar
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tizim Admini";
  workbook.lastModifiedBy = "Tizim";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Mijoz ma'lumotlarini olish
  const firstOrder = data[0];
  const customerName = firstOrder?.customerId?.fullname || "Noma'lum Mijoz";
  
  // Xavfsiz worksheet nomi (max 31 belgi va maxsus belgilarsiz)
  const safeSheetName = customerName.replace(/[\\/?*[\]]/g, "").substring(0, 30) || "Buyurtmalar";
  const worksheet = workbook.addWorksheet(safeSheetName);

  // 3. Ustunlarni sozlash (Kenglik va Format)
  worksheet.columns = [
    { key: "index", width: 6 },            // A: №
    { key: "orderNo", width: 18 },         // B: Buyurtma №
    { key: "status", width: 15 },          // C: Holati
    { key: "driver", width: 25 },          // D: Haydovchi
    { key: "orderDate", width: 20 },       // E: Buyurtma vaqti
    { key: "deliveryDate", width: 20 },    // F: Yetkazilgan vaqti
    { key: "productName", width: 30 },     // G: Mahsulot nomi
    { key: "quantity", width: 12 },        // H: Miqdor
    { key: "unit", width: 10 },            // I: Birlik
    { key: "price", width: 15 },           // J: Narx
    { key: "total", width: 18 },           // K: Summasi
  ];

  // 4. Sarlavha Qismi (Report Header)
  const { region = "", district = "", street = "" } = firstOrder?.customerId?.address || {};
  const addressString = [region, district, street].filter(Boolean).join(", ");

  // Katta Sarlavha
  worksheet.mergeCells("A1:K1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = `BUYURTMALAR TARIXI: ${customerName.toUpperCase()}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF2C3E50' } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECF0F1' } };
  worksheet.getRow(1).height = 35;

  // Manzil va Sana qatori
  worksheet.mergeCells("A2:K2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `Manzil: ${addressString} | Hujjat yaratildi: ${new Date().toLocaleString('uz-UZ')}`;
  subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF7F8C8D' } };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 20;

  // 5. Jadval Sarlavhalari (Table Headers)
  const headers = [
    "№", "Buyurtma №", "Holati", "Haydovchi", 
    "Buyurtma sanasi", "Yetkazish sanasi", 
    "Mahsulot", "Miqdor", "Birlik", "Narx", "Jami"
  ];
  
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 25;
  
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF34495E" } }; // Professional Dark Blue
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { bottom: { style: "medium", color: { argb: "FF2C3E50" } } };
  });

  // Panellarni muzlatish (Scroll qilganda header qotib turadi)
  worksheet.views = [{ state: 'frozen', ySplit: 3 }];

  // 6. Ma'lumotlarni to'ldirish
  let grandTotal = 0;
  let rowCounter = 1;

  // Stillar
  const borderStyle = { style: "thin", color: { argb: "FFBDC3C7" } };
  const currencyFmt = '#,##0 "so\'m"';
  const dateFmt = 'dd.mm.yyyy hh:mm';

  data.forEach((order, orderIndex) => {
    const products = Array.isArray(order.products) ? order.products : [];
    const validProducts = products.filter(p => p && typeof p === 'object');
    
    // Agar mahsulot bo'lmasa, bo'sh qator qo'shmaymiz (yoki bitta bo'sh qo'shish mumkin)
    if (validProducts.length === 0) return;

    let orderTotal = 0;

    validProducts.forEach((product, prodIndex) => {
      const isFirstRow = prodIndex === 0;
      
      const rowData = [
        isFirstRow ? rowCounter++ : "",                     // №
        isFirstRow ? order.orderNumber || "---" : "",       // Buyurtma №
        isFirstRow ? translateStatus(order.status) : "",    // Holati
        isFirstRow ? order.driverId?.fullname || "---" : "",// Haydovchi
        isFirstRow ? new Date(order.createdAt) : "",        // Sana
        isFirstRow ? (order.deliveryTime ? new Date(order.deliveryTime) : "") : "", // Yetkazish
        product.pro_name || product.title || "Nomsiz",      // Mahsulot
        Number(product.pro_quantity) || 0,                  // Miqdor
        product.pro_unit || "",                             // Birlik
        Number(product.pro_price) || 0,                     // Narx
        Number(product.pro_total_price) || 0                // Jami
      ];

      const row = worksheet.addRow(rowData);

      // Stillarni qo'llash
      row.getCell(1).alignment = { horizontal: "center" }; // №
      row.getCell(2).font = { bold: true };                // Order No
      
      // Sana formatlash
      if (isFirstRow) {
        row.getCell(5).numFmt = dateFmt;
        row.getCell(6).numFmt = dateFmt;
      }

      // Valyuta formatlash
      row.getCell(10).numFmt = currencyFmt; // Narx
      row.getCell(11).numFmt = currencyFmt; // Jami

      // Chegaralar (Har bir buyurtmani vizual ajratish)
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          left: borderStyle,
          right: borderStyle,
          bottom: (prodIndex === validProducts.length - 1) ? { style: "medium", color: { argb: "FF95A5A6" } } : borderStyle,
          top: (isFirstRow && orderIndex !== 0) ? { style: "medium", color: { argb: "FF95A5A6" } } : borderStyle
        };
        cell.alignment = { ...cell.alignment, vertical: 'middle' };
      });

      // Status ranglari
      if (isFirstRow && order.status) {
        const statusCell = row.getCell(3);
        applyStatusColor(statusCell, order.status);
      }

      orderTotal += (Number(product.pro_total_price) || 0);
    });

    grandTotal += orderTotal;
  });

  // 7. Yakuniy Summa Qatori (Footer)
  worksheet.addRow([]); // Bo'sh joy
  const footerRow = worksheet.addRow([
    "", "", "", "", "", "", "", "", "", 
    "UMUMIY SUMMA:", 
    grandTotal
  ]);

  footerRow.height = 30;
  
  // Footer stillari
  const labelCell = footerRow.getCell(10);
  labelCell.font = { bold: true, size: 12, color: { argb: "FF2C3E50" } };
  labelCell.alignment = { horizontal: "right", vertical: "middle" };

  const totalCell = footerRow.getCell(11);
  totalCell.numFmt = currencyFmt;
  totalCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  totalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF27AE60" } }; // Green
  totalCell.alignment = { horizontal: "center", vertical: "middle" };
  totalCell.border = { top: { style: "double" }, bottom: { style: "double" } };

  // 8. Buffer yaratish
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Fayl nomini tozalash
  const safeName = customerName.replace(/[^a-z0-9а-я ]/gi, '_').trim();
  const dateStr = new Date().toISOString().slice(0, 10);
  
  return {
    buffer,
    filename: `Buyurtmalar_${safeName}_${dateStr}.xlsx`,
  };
}

// --- Yordamchi Funksiyalar ---

function translateStatus(status) {
  // Statuslarni chiroyli formatda chiqarish (kerak bo'lsa)
  const map = {
    'new': 'Yangi',
    'delivered': 'Yetkazildi',
    'canceled': 'Bekor qilindi',
    'pending': 'Kutilmoqda'
  };
  return map[status?.toLowerCase()] || status;
}

function applyStatusColor(cell, status) {
  let color = 'FF34495E'; // Default
  const s = status.toLowerCase();
  
  if (s.includes('yetkaz') || s.includes('delivered')) color = 'FF27AE60'; // Yashil
  else if (s.includes('bekor') || s.includes('cancel')) color = 'FFC0392B'; // Qizil
  else if (s.includes('yangi') || s.includes('new')) color = 'FF2980B9'; // Ko'k
  else if (s.includes('jarayon') || s.includes('pending')) color = 'FFF39C12'; // Sariq

  cell.font = { color: { argb: color }, bold: true };
}

module.exports = { ExportExcelCustomerOrders };