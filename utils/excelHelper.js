const ExcelJS = require("exceljs");
const moment = require("moment");

/**
 * Professional darajadagi Universal Excel eksport funksiyasi
 */
async function ExportToExcelUniversal(data, columns, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Eksport qilish uchun ma'lumot topilmadi.");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || "Hisobot", {
        views: [{ showGridLines: false }] // Toza ko'rinish uchun katak chiziqlarini yashiramiz
    });

    // Professional ranglar sxemasi
    const THEME = {
        titleBg: "FF4F46E5",    // Indigo 600
        headerBg: "FF1E293B",   // Slate 800
        zebraRow: "FFF8FAFC",   // Slate 50 (Zebra stripes)
        border: "FFCBD5E1",     // Slate 300
        textMain: "FF1E293B",   // Slate 800
        textMuted: "FF64748B",  // Slate 500
        white: "FFFFFFFF"
    };

    const STYLES = {
        borderThin: {
            top: { style: "thin", color: { argb: THEME.border } },
            left: { style: "thin", color: { argb: THEME.border } },
            bottom: { style: "thin", color: { argb: THEME.border } },
            right: { style: "thin", color: { argb: THEME.border } },
        },
        centerAlign: { vertical: "middle", horizontal: "center", wrapText: true },
        leftAlign: { vertical: "middle", horizontal: "left", wrapText: true, indent: 1 },
        rightAlign: { vertical: "middle", horizontal: "right", wrapText: true, indent: 1 }
    };

    const colCount = columns.length;
    const lastColLetter = String.fromCharCode(64 + colCount);

    // 1. USTUNLARNI SOZLASH
    worksheet.columns = columns.map(col => ({
        key: col.key,
        width: col.width || 20
    }));

    // 2. ASOSIY SARLAVHA (TITLE)
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const titleRow = worksheet.getCell("A1");
    titleRow.value = options.title?.toUpperCase() || "HISOBOT";
    titleRow.font = { bold: true, size: 16, color: { argb: THEME.white }, name: "Segoe UI" };
    titleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.titleBg } };
    titleRow.alignment = STYLES.centerAlign;
    worksheet.getRow(1).height = 45;

    // 3. METADATA (Sana va Jami soni)
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const metaRow = worksheet.getCell("A2");
    metaRow.value = `Shakllantirilgan sana: ${moment().format("DD.MM.YYYY HH:mm")}  |  Jami yozuvlar: ${data.length} ta`;
    metaRow.font = { size: 10, color: { argb: THEME.textMuted }, italic: true };
    metaRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }; // Slate 100
    metaRow.alignment = STYLES.centerAlign;
    worksheet.getRow(2).height = 25;

    // 4. HEADER QISMI
    const headerRow = worksheet.getRow(3);
    headerRow.height = 32;
    const headerValues = columns.map(col => col.header.toUpperCase());
    headerRow.values = headerValues;

    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: THEME.white }, size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.headerBg } };
        cell.alignment = STYLES.centerAlign;
        cell.border = STYLES.borderThin;
    });

    // 5. MA'LUMOTLARNI TO'LDIRISH
    data.forEach((item, index) => {
        const rowData = {};
        columns.forEach(col => {
            if (col.key.includes('.')) {
                rowData[col.key] = col.key.split('.').reduce((o, i) => (o ? o[i] : (col.default || '—')), item);
            } else if (col.key === 'index') {
                rowData[col.key] = index + 1;
            } else {
                rowData[col.key] = item[col.key] !== undefined ? item[col.key] : (col.default || '—');
            }
        });

        const row = worksheet.addRow(rowData);
        row.height = 28;

        // Zebra stripes va Alignment
        const isZebra = index % 2 === 1;
        
        row.eachCell((cell, colNumber) => {
            const colDef = columns[colNumber - 1];
            cell.border = STYLES.borderThin;
            cell.font = { size: 10, color: { argb: THEME.textMain } };

            if (isZebra) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.zebraRow } };
            }

            // Ma'lumot turiga qarab formatlash
            if (colDef.type === 'currency') {
                cell.numFmt = '#,##0 "so\'m"';
                cell.alignment = STYLES.rightAlign;
                cell.font = { bold: true, size: 10, color: { argb: "FF4338CA" } }; // Indigo 700 raqamlar uchun
            } else if (colDef.type === 'date') {
                cell.value = moment(cell.value).isValid() ? moment(cell.value).toDate() : cell.value;
                cell.numFmt = 'DD.MM.YYYY';
                cell.alignment = STYLES.centerAlign;
            } else if (typeof cell.value === 'number') {
                cell.alignment = STYLES.rightAlign;
            } else {
                cell.alignment = STYLES.leftAlign;
            }
        });
    });

    // 6. AVTO-FILTR VA KO'RINISHNI QOTIRISH
    worksheet.autoFilter = { from: 'A3', to: `${lastColLetter}3` };
    worksheet.views = [{ 
        state: 'frozen', 
        xSplit: 0, 
        ySplit: 3, 
        activePane: 'bottomRight',
        showGridLines: false 
    }];

    // 7. FAYLNI GENERATSIYA QILISH
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `${options.filename || 'Hisobot'}_${moment().format("YYYYMMDD_HHmm")}.xlsx`;

    return { buffer, filename };
}
/**
 * Express response orqali Excel faylni yuborish uchun universal helper
 */
const sendExcelResponse = (res, { buffer, filename }) => {
    const cleanFilename = encodeURIComponent(filename);

    // Headerlarni o'rnatish
    res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${cleanFilename}`,
        "Content-Length": buffer.length,
        // Keshni tozalash (ba'zi brauzerlar uchun muhim)
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    // Bufferni yuborish
    return res.status(200).send(buffer);
};


module.exports = { ExportToExcelUniversal,sendExcelResponse };