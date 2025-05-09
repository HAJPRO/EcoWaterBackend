const ProductManagmentService = require("../../../services/sale/products/product.service.js");
class ProductManagmentController {
  async Create(req, res, next) {
    try {
      const data = await ProductManagmentService.Create({author:req.user.id, ...req.body});
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetAll(req, res, next) {
    try {
      const data = await ProductManagmentService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetOne(req, res, next) {
    try {
      const data = await ProductManagmentService.GetOne(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async DeleteById(req, res, next) {
    try {
      const data = await ProductManagmentService.DeleteById(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  
  

 
 
}

module.exports = new ProductManagmentController();
