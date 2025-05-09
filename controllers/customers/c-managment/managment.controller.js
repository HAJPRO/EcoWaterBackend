const CustomerManagmentService = require("../../../services/customers/c-managment/managment.service");
class CustomerManagmentController {
  async Create(req, res, next) {
    try {
      const data = await CustomerManagmentService.Create(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await CustomerManagmentService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async DeleteById(req, res, next) {
    try {
      const data = await CustomerManagmentService.DeleteById(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
   
  }
  async GetById(req, res, next) {
    try {
      const data = await CustomerManagmentService.GetById(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
   
  }

 
 
}

module.exports = new CustomerManagmentController();
