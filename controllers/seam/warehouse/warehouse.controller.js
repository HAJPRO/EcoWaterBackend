const DepSeamWarehouseService = require("../../../services/Seam/warehouse/warehouse.service.js");
// const userModel = require("../../models/user.model.js");
class DepSeamWarehouseController {
  async ResponsiblesModel(req, res, next) {
    try {
      const model = await DepSeamWarehouseService.ResponsiblesModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
  async GenerateQRCode(req, res, next) {
    try {
      const { load, responsibles } = req.body;
      const author = req.user.id;
      const id = await DepSeamWarehouseService.GenerateQRCode({
        load,
        responsibles,
        author,
      });
      res.status(201).json({ msg: "", id });
    } catch (error) {
      next(error);
    }
  }
  async getQRImage(req, res, next) {
    try {
      const data = await DepSeamWarehouseService.getQRImage(req.body);
      res.status(201).json({ msg: "", data });
    } catch (error) {
      next(error);
    }
  }

  async GetFormMode(req, res, next) {
    try {
      const data = await DepSeamWarehouseService.GetFormMode();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreaetToForm(req, res, next) {
    try {
      const data = await DepSeamWarehouseService.CreaetToForm(req.body);
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi !", data });
    } catch (error) {
      next(error);
    }
  }
  async GetAllForm(req, res, next) {
    try {
      const data = await DepSeamWarehouseService.GetAllForm();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new DepSeamWarehouseController();
