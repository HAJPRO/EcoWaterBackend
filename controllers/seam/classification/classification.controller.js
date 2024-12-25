const SeamInClassificationService = require("../../../services/Seam/classification/classification.service");
class SeamInClassificationController {
  async getAll(req, res, next) {
    try {
      const data = await SeamInClassificationService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreaetInfoToForm(req, res, next) {
    try {
      const data = await SeamInClassificationService.CreaetInfoToForm({
        data: req.body,
        user: req.user,
      });
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async CreateDayReport(req, res, next) {
    try {
      const data = await SeamInClassificationService.CreateDayReport(req.body);
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async GetOneReport(req, res, next) {
    try {
      const data = await SeamInClassificationService.GetOneReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async AcceptReportItem(req, res, next) {
    try {
      const data = await SeamInClassificationService.AcceptReportItem(req.body);
      res.status(200).json({ msg: "Tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamInClassificationController();
