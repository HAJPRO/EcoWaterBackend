const randomstring = require("randomstring");
const output_id = randomstring.generate({
  length: 7,
  charset: ["numeric"],
});
const mongoose = require("mongoose");
const QR = require("qrcode");
const BarCodeModel = require("../../../models/Barcode/BarCode.model");
const QRCodeModel = require("../../../models/Barcode/QRCode.model");
const WarehouseRawMaterialForSeamModel = require("../../../models/Seam/warehouse/r-warehouse.model");
const OutputModel = require("../../../models/Seam/warehouse/OutputSeamWarehouse.model");
const InputModel = require("../../../models/Seam/warehouse/InputSeamWarehouse.model");

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
    const output = data.data.output;
    const input = data.data.input;
    const model = data.data.model;
    const author = data.user.id;
    if (output) {
      const item = await WarehouseRawMaterialForSeamModel.findById(model.id);
      const newData = item;

      if (newData.quantity - model.quantity < 0 || model.quantity < 0) {
        return { status: 404, msg: "Mahsulot yetarli emas" };
      } else {
        const OutputData = {
          author,
          warehouse_id: model.id,
          to_where: model.to_where,
          quantity: model.quantity,
          unit: model.unit,
          status: model.to_where + " " + "yuborildi",
        };
        const output_res = await OutputModel.create(OutputData);
        if (output_res) {
          newData.quantity = newData.quantity - model.quantity;
          newData.output = output_res._id;
          const update =
            await WarehouseRawMaterialForSeamModel.findByIdAndUpdate(
              model.id,
              newData,
              { new: true }
            );
          return { status: 200, msg: "Muvaffaqiyatli ko'chirildi", update };
        }
      }
    }

    if (input) {
      const res = await WarehouseRawMaterialForSeamModel.create(model);
      return { status: 200, msg: "Muvaffaqiyatli ko'chirildi", res };
    }
  }

  async GetAll() {
    const res = await WarehouseRawMaterialForSeamModel.find();
    return res;
  }
  async GetOne(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const warehouse = await WarehouseRawMaterialForSeamModel.findOne({
      _id: data.id,
    });
    const output = await OutputModel.find({ warehouse_id: data.id });

    return { warehouse, output };
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
