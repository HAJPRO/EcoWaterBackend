const SeamInCWarehouseService = require("../../../services/Seam/c-warehouse/c-warehouse.servise");
class SeamInCWarehouseController {
  async getAll(req, res, next) {
    try {
      const data = await SeamInCWarehouseService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async ConfirmAndCreateInProcess(req, res, next) {
    try {
      const data = await SeamInCWarehouseService.ConfirmAndCreateInProcess({
        data: req.body,
        user: req.user,
      });
      res.status(200).json({ msg: "Muvaffaqiyatli tasdiqlandi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async GetOneReport(req, res, next) {
    try {
      const data = await SeamInCWarehouseService.GetOneReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async AcceptReportItem(req, res, next) {
    try {
      const data = await SeamInCWarehouseService.AcceptReportItem(req.body);
      res.status(200).json({ msg: "Tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamInCWarehouseController();
