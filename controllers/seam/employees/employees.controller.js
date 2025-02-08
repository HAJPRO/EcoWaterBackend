const SeamEmployeesService = require("../../../services/Seam/employees/employees.service");
class SeamEmployeesController {
  async getAll(req, res, next) {
    try {
      const data = await SeamEmployeesService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async getOneEployeeReport(req, res, next) {
    try {
      const data = await SeamEmployeesService.getOneEployeeReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async ConfirmReportAndSendReply(req, res, next) {
    try {
      const data = await SeamEmployeesService.ConfirmReportAndSendReply(
        req.body
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamEmployeesController();
