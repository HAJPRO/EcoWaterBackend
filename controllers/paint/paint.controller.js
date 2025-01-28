const DepPaintService = require("../../services/Paint/paint.service.js");

class DepPaintController {
  async getModel(req, res, next) {
    try {
      const model = await DepPaintService.getModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const data = await DepPaintService.getAll({
        status: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetOneOrderReport(req, res, next) {
    try {
      const data = await DepPaintService.GetOneOrderReport({
        id: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async AcceptAndCreate(req, res, next) {
    try {
      const data = await DepPaintService.AcceptAndCreate({
        data: req.body,
        user: req.user,
      });
      res
        .status(201)
        .json({ status: 201, msg: "Muvaffaqiyatli qabul qilindi !" });
    } catch (error) {
      next(error);
    }
  }
  async GetOneFromSale(req, res, next) {
    try {
      const data = await DepPaintService.GetOneFromSale(req.body);
      res.status(201).json({ stats: 200, msg: "ok", data });
    } catch (error) {
      next(error);
    }
  }
  async CreateDayReport(req, res, next) {
    try {
      const data = await DepPaintService.CreateDayReport({
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
      const data = await DepPaintService.GetDayReport({
        data: req.body,
        user: req.user,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const data = await DepPaintService.delete(req.params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async edit(req, res, next) {
    try {
      const { body, params } = req;
      const data = await DepPaintService.edit(body, params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepPaintController();
