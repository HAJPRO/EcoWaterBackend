const OrderManagmentService = require("../../../services/sale/orders/order.service");
class OrderManagmentController {
  async Create(req, res, next) {
    try {
      const data = await OrderManagmentService.Create({ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async OrderGetById(req, res, next) {
    try {
      const data = await OrderManagmentService.OrderGetById({ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async UpdateById(req, res, next) {
    try {
      const data = await OrderManagmentService.UpdateById({ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await OrderManagmentService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAllDrivers(req, res, next) {
    try {
      const data = await OrderManagmentService.GetAllDrivers(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async DeleteById(req, res, next) {
    try {
      const data = await OrderManagmentService.DeleteById({...req.body, author : req.user.id});
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  }
  async ExportExcelDownload(req, res, next) {
    try {
      const data = await OrderManagmentService.ExportExcelDownload(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  }



}

module.exports = new OrderManagmentController();
