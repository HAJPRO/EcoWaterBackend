const SeamInPackingService = require("../../../services/Seam/packing/packing.service");
class SeamInPackingController {
  async getAll(req, res, next) {
    try {
      const data = await SeamInPackingService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreaetInfoToForm(req, res, next) {
    try {
      const data = await SeamInPackingService.CreaetInfoToForm({
        data: req.body,
        user: req.user,
      });
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async ConfirmAndCreteProcess(req, res, next) {
    try {
      const data = await SeamInPackingService.ConfirmAndCreteProcess({
        data: req.body,
        user: req.user,
      });
      res.status(200).json({ msg: "Muvaffaqiyatli tasdiqlandi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async CreateDayReport(req, res, next) {
    try {
      const data = await SeamInPackingService.CreateDayReport(req.body);
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async GetOneReport(req, res, next) {
    try {
      const data = await SeamInPackingService.GetOneReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async AcceptReportItem(req, res, next) {
    try {
      const data = await SeamInPackingService.AcceptReportItem(req.body);
      res.status(200).json({ msg: "Tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamInPackingController();
