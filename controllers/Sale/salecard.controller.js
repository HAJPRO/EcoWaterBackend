const SaleService = require("../../services/Sale/sale.service.js");
const XLSX = require("xlsx");
const path = require("path");
const saleCardModel = require("../../models/Sale/SaleCard.model.js");

class SaleController {
  async GetCardModel(req, res, next) {
    try {
      const model = await SaleService.GetCardModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
  async AllOrderProccessById(req, res, next) {
    try {
      const proccess = await SaleService.AllOrderProccessById(req.body);
      res.status(200).json(proccess);
    } catch (error) {
      next(error);
    }
  }
  async getAllLength(req, res, next) {
    try {
      const allLength = await SaleService.getAllLength(req.user.id);
      res.status(200).json(allLength);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const all = await SaleService.getAll({
        status: req.body,
        user: req.user,
      });
      res.status(200).json(all);
    } catch (error) {
      next(error);
    }
  }
  async getAllWeaving(req, res, next) {
    try {
      const allWeaving = await SaleService.getAllWeaving();
      res.status(200).json(allWeaving);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await SaleService.create({ data: req.body, user: req.user });

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
  async UpdateById(req, res, next) {
    try {
      const data = await SaleService.UpdateById({
        data: req.body,
        user: req.user,
      });

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await SaleService.delete(req.params.id);
      res.status(200).json({ msg: "Karta muvaffaqiyatli o'chirildi !", data });
    } catch (error) {
      next(error);
    }
  }
  async confirm(req, res, next) {
    try {
      const data = await SaleService.confirm({
        data: req.body,
        user: req.user,
      });
      res.status(200).json({ msg: "Sotuv tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }

  async edit(req, res, next) {
    try {
      const { body, params } = req;
      const data = await SaleService.edit(body, params.id);
      res.status(200).json({ msg: "Malumot muvaffaqiyatli yangilandi", data });
    } catch (error) {
      next(error);
    }
  }

  async GetOne(req, res, next) {
    try {
      const data = await SaleService.GetOne(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async export_excel(req, res, next) {
    try {
      // const ID = req.body.id;
      // const Data = await SaleService.export_excel(ID);
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
  async FinishParty(req, res, next) {
    try {
      const data = await SaleService.FinishParty({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SaleController();
