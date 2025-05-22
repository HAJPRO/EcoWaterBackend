const ReadyWarehouseService = require("../../../services/warehouses/r-warehouse/warehouse.service");
class ReadyWarehouseController {
  async GetModel(req, res, next) {
    try {
      const data = await ReadyWarehouseService.GetModel();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async Create(req, res, next) {
    try {
      const data = await ReadyWarehouseService.Create({ ...req.body, author: req.user.id });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await ReadyWarehouseService.GetAll({ ...req.body, author: req.user.id });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetOne(req, res, next) {
    try {
      const data = await ReadyWarehouseService.GetOne({ ...req.body, author: req.user.id });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async OutputProduct(req, res, next) {
    try {
      const data = await ReadyWarehouseService.OutputProduct(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }




}

module.exports = new ReadyWarehouseController();
