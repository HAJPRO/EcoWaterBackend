const SeamInFormService = require("../../../services/Seam/form/form.service");
class SeamInFormController {
  async getAll(req, res, next) {
    try {
      const data = await SeamInFormService.getAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async AcceptAndCreate(req, res, next) {
    try {
      const data = await SeamInFormService.AcceptAndCreate({
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
      const data = await SeamInFormService.CreateDayReport(req.body);
      res.status(200).json({ msg: "Muvaffaqiyatli qo'shildi ! ", data });
    } catch (error) {
      next(error);
    }
  }
  async GetOneReport(req, res, next) {
    try {
      const data = await SeamInFormService.GetOneReport(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new SeamInFormController();
