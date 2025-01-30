const DepSpinningService = require("../../services/Spinning/spinning.service");
class DepSpinningController {
  async getModel(req, res, next) {
    try {
      const model = await DepSpinningService.getModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const data = await DepSpinningService.getAll({
        status: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async AcceptAndCreate(req, res, next) {
    try {
      const data = await DepSpinningService.AcceptAndCreate({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async CreateDayReport(req, res, next) {
    try {
      const data = await DepSpinningService.CreateDayReport({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetDayReport(req, res, next) {
    try {
      const data = await DepSpinningService.GetDayReport({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetOneFromWeaving(req, res, next) {
    try {
      const data = await DepSpinningService.GetOneFromWeaving(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepSpinningController();
