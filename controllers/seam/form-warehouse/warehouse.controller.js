const FormWarehouseService = require("../../../services/Seam/form-warehouse/warehouse.service");
class FormWarehouseController {
  async Create(req, res, next) {
    try {
      const data = await FormWarehouseService.Create(req.body);
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
}
module.exports = new FormWarehouseController();
