const SaleLegalService = require("../services/saleLegal.service.js");
const XLSX = require("xlsx");
const path = require("path");
const saleLegalCardModel = require("../models/saleLegalCard.model.js");

class saleLegalController {
  async getModel(req, res, next) {
    try {
      const model = await SaleLegalService.getModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
  async AllOrderProccessById(req, res, next) {
    try {
      const proccess = await SaleLegalService.AllOrderProccessById(req.params.id);
      res.status(200).json(proccess);

    } catch (error) {
      next(error);
    }
  }
  async getAllLength(req, res, next) {
    try {
      const allLength = await SaleLegalService.getAllLength(req.user.id);
      res.status(200).json(allLength);

    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const all = await SaleLegalService.getAll(req.body, req.user);
      res.status(200).json(all);

    } catch (error) {
      next(error);
    }
  }
  async getAllWeaving(req, res, next) {
    try {
      const allWeaving = await SaleLegalService.getAllWeaving();
      res.status(200).json(allWeaving);
    } catch (error) {
      next(error);
    }
  }


  async create(req, res, next) {
    try {
      const data = await SaleLegalService.create(req.body, req.user.id);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await SaleLegalService.delete(req.params.id);
      res.status(200).json({ msg: "Karta muvaffaqiyatli o'chirildi !", data });
    } catch (error) {
      next(error);
    }
  }
  async confirm(req, res, next) {
    try {
      const data = await SaleLegalService.confirm(req.body.id);
      res.status(200).json({ msg: "Sotuv tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }

  async edit(req, res, next) {
    try {
      const { body, params } = req;
      const data = await SaleLegalService.edit(body, params.id);
      res.status(200).json({ msg: "Malumot muvaffaqiyatli yangilandi", data });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const data = await SaleLegalService.getOne(req.params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async export_excel(req, res, next) {
    try {
      // const ID = req.body.id;
      // const Data = await SaleLegalService.export_excel(ID);
      const data = await saleLegalCardModel.find();

      // const heading = [["name", "age"]];
      let wb = XLSX.utils.book_new(); //new workbook
      let ws = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(data)));
      XLSX.utils.sheet_add_aoa(ws, heading);
      const down = path.join(
        __dirname,
        `../public/${Math.floor(Math.random() * 100000)}.xlsx`
      );
      XLSX.utils.book_append_sheet(wb, ws, "sheet1");
      // const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
      XLSX.writeFile(wb, down);
      res.attachment(down);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new saleLegalController();
