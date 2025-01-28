const DepWeavingService = require("../../services/Weaving/weaving.service.js");

class DepWeavingController {
  async getModel(req, res, next) {
    try {
      const model = await DepWeavingService.getModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const all = await DepWeavingService.getAll({
        status: req.body,
        user: req.user,
      });
      res.status(200).json(all);
    } catch (error) {
      next(error);
    }
  }

  async AcceptAndCreate(req, res, next) {
    try {
      const data = await DepWeavingService.AcceptAndCreate({
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
      const data = await DepWeavingService.delete(req.params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async edit(req, res, next) {
    try {
      const { body, params } = req;
      const data = await DepWeavingService.edit(body, params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetOneFromPaint(req, res, next) {
    try {
      const data = await DepWeavingService.GetOneFromPaint(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepWeavingController();
