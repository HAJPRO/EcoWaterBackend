const randomstring = require("randomstring");
const output_id = randomstring.generate({
  length: 7,
  charset: ["numeric"],
});
const QR = require("qrcode");
const BarCodeModel = require("../../../models/Barcode/BarCode.model");
const QRCodeModel = require("../../../models/Barcode/QRCode.model");
const WarehouseRawMaterialForSeamModel = require("../../../models/Seam/warehouse/r-warehouse.model");
// const OutputModel = require("../../../models/Seam/warehouse/output.model");

const XLSX = require("xlsx");
const path = require("path");
class DepSeamWarehouseService {
  async GetModel() {
    const model = {
      party_number: "",
      customer_name: "",
      material_name: "",
      artikul: "",
      color: "",
      quantity: "",
      unit: "",
      sort: "",
    };
    return model;
  }
  async Create(data) {
    if (data.output) {
      const item = await WarehouseRawMaterialForSeamModel.findById(
        data.model.id
      );
      const newData = item;
      if (newData.quantity - data.model.quantity < 0) {
        return { status: 404, msg: "Mahsulot yetarli emas" };
      } else {
        newData.quantity = newData.quantity - data.model.quantity;
        const OutputData = {
          id: output_id,
          to_where: data.model.to_where,
          quantity: data.model.quantity,
          unit: data.model.unit,
          created_date: data.model.created_date,
          state: true,
          status: data.model.to_where + " " + "yuborildi",
        };
        newData.output.push(OutputData);
        const update = await WarehouseRawMaterialForSeamModel.findByIdAndUpdate(
          data.model.id,
          newData,
          { new: true }
        );
        return { status: 200, msg: "Muvaffaqiyatli ko'chirildi", update };
      }
    }

    if (data.input) {
      const res = await WarehouseRawMaterialForSeamModel.create(data.model);
      return { status: 200, msg: "Muvaffaqiyatli ko'chirildi", res };
    }
  }

  async GetAll() {
    const res = await WarehouseRawMaterialForSeamModel.find();
    return res;
  }
  async GetOne(data) {
    const res = await WarehouseRawMaterialForSeamModel.findOne({
      _id: data.id,
    });
    return res;
  }

  async ResponsiblesModel() {
    const invoice = randomstring.generate({
      length: 8,
      charset: "numeric",
    });

    try {
      const responsibles = {
        invoice_number: invoice,
        from_where: "",
        to_where: "",
        sender: "",
        receiver: "",
        accountant: "",
        director: "",
      };
      const load = {
        id: "",
        name: "",
        type: "",
        color_code: "",
        raw_material_quantity: "",
        unit: "",
      };
      const leaders = [
        { name: "Sh.Shermuhammadov", id: 1, role: "Boss" },
        { name: "N.Boqiyev", id: 2, role: "Director" },
        { name: "K.Jumayev", id: 3, role: "Buhgalter" },
        { name: "N.Samanov", id: 4, role: "Zasklad" },
        { name: "G.Dilmurodov", id: 5, role: "Zasklad" },
      ];
      const sklads = [
        { name: "Siklad 1", id: 1, role: "Bo'yoq" },
        { name: "Siklad 2 ", id: 2, role: "To'quv" },
        { name: "Siklad 3", id: 3, role: "Yigiruv" },
        { name: "Siklad 4", id: 4, role: "Tikuv" },
        { name: "Siklad 5", id: 5, role: "Taminot" },
      ];
      const material_name = [
        { name: "Suprima", id: 1, role: "3/1" },
        { name: "Drap", id: 2, role: "3/7" },
        { name: "Nachos", id: 3, role: "10/3" },
      ];
      const material_type = [
        { name: "Yupqa", id: 1, role: "Mavsumiy" },
        { name: "Qalin", id: 2, role: "Mavsumiy" },
      ];
      const color_code = [
        { name: "Qizil", id: 1, role: "#212321" },
        { name: "Yashil", id: 2, role: "#258856" },
      ];
      const unit = [
        { name: "Tonna", id: 1, role: "T" },
        { name: "Kilogramm", id: 2, role: "Kg" },
        { name: "Gramm", id: 3, role: "Gr" },
        { name: "Metr", id: 4, role: "M" },
        { name: "Dona", id: 5, role: "D" },
        { name: "Pachka", id: 6, role: "P" },
      ];

      return {
        responsibles,
        load,
        leaders,
        sklads,
        unit,
        material_name,
        material_type,
        color_code,
      };
    } catch (error) {
      return error.message;
    }
  }

  async GenerateQRCode(item) {
    try {
      const qr_code_data = JSON.stringify(item.load);
      const qrCodeBuffer = await QR.toBuffer(qr_code_data, {
        color: "#36d887",
      });
      const NewQRCode = {
        qrCodeImage: qrCodeBuffer,
      };
      const qr_Code = await QRCodeModel.create(NewQRCode);
      if (qr_Code._id) {
        const newBarData = {
          invoice_number: item.responsibles.invoice_number,
          author: item.author,
          administration: item.responsibles,
          load: item.load,
          qrCode: qr_Code._id,
          completed: false,
        };
        await BarCodeModel.create(newBarData);
      }

      return qr_Code._id;
    } catch (error) {
      console.log(error.message);
    }
  }

  async getQRImage(item) {
    const data = await QRCodeModel.findById({ _id: item.id });
    if (data) {
      return data;
    } else return;
  }
}

module.exports = new DepSeamWarehouseService();
