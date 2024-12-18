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
      const data = await DepSpinningService.getAll({ status: req.body, user: req.user });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async cencelReason(req, res, next) {
    try {
      const data = await DepSpinningService.cancelReason(req.body, req.user.id);
      res.status(200).json({ msg: "Muvaffaqiyatli yuborildi !", data });
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const data = await DepSpinningService.create(req.body, req.user.id);
      res.status(201).json({ msg: "Muvaffaqiyatli yuborildi !", data });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await DepSpinningService.delete(req.params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async edit(req, res, next) {
    try {
      const { body, params } = req;
      const data = await DepSpinningService.edit(body, params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const data = await DepSpinningService.getOne(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async getOneFromInProcess(req, res, next) {
    try {
      const data = await DepSpinningService.getOneFromInProcess(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async addDayReportInProcess(req, res, next) {
    try {
      const data = await DepSpinningService.addDayReportInProcess(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  // async getDayReportFromWeaving(req, res, next) {
  //   try {
  //     const data = await DepSpinningService.getDayReportFromWeaving(req.body);
  //     res.status(200).json(data);
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}

module.exports = new DepSpinningController();
