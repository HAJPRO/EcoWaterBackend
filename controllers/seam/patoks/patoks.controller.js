const SeamInPatoksService = require("../../../services/Seam/patoks/patoks.service");
class SeamInPatoksController {
  async getAll(req, res, next) {
    try {
      const data = await SeamInPatoksService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreaetInfoToForm(req, res, next) {
    try {
      const data = await SeamInPatoksService.CreaetInfoToForm({
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
      const data = await SeamInPatoksService.ConfirmAndCreteProcess({
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
      const data = await SeamInPatoksService.CreateDayReport(req.body);
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async GetOneReport(req, res, next) {
    try {
      const data = await SeamInPatoksService.GetOneReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async AcceptReportItem(req, res, next) {
    try {
      const data = await SeamInPatoksService.AcceptReportItem(req.body);
      res.status(200).json({ msg: "Tasdiqlandi", data });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamInPatoksController();
