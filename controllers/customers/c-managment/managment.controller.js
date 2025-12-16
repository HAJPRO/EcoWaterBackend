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
  async GetOrdersByCustomerId(req, res, next) {
    try {
      const data = await CustomerManagmentService.GetOrdersByCustomerId(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  }
  // async ExportExcelDownload(req, res, next) {
  //   try {
  //     const  { buffer, filename } = await CustomerManagmentService.ExportExcelDownload(req.body);
  //     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  //     res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  //     res.send(buffer); // diskka yozilmaydi
  //   } catch (error) {
  //     console.error("Excel export xatosi:", error.message);
  //     res.status(400).json({ message: error.message });
  //   }
  //   } catch (error) {
  //     next(error);
  //   }
  async ExportExcelDownload(req, res, next) {
    try {
      const { buffer, filename } = await CustomerManagmentService.ExportExcelDownload(req.body);
  
      const cleanFilename = encodeURIComponent(filename);
  
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${cleanFilename}`);
      res.send(buffer);
    } catch (error) {
      console.error("Excel export xatosi:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
  

  }




module.exports = new CustomerManagmentController();
