const FormWarehouseService = require("../../../services/Seam/form-warehouse/warehouse.service");
class FormWarehouseController {
  async AcceptAndCreate(req, res, next) {
    try {
      const data = await FormWarehouseService.AcceptAndCreate({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await FormWarehouseService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetOne(req, res, next) {
    try {
      const data = await FormWarehouseService.GetOne(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreateOutput(req, res, next) {
    try {
      const data = await FormWarehouseService.CreateOutput({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new FormWarehouseController();
