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
      const all = await DepWeavingService.getAll({ status: req.body, user: req.user });
      res.status(200).json(all);
    } catch (error) {
      next(error);
    }
  }
  async cencelReason(req, res, next) {
    try {
      const data = await DepWeavingService.cancelReason(req.body, req.user.id);
      res.status(200).json({ msg: "Muvaffaqiyatli yuborildi !", data });
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const data = await DepWeavingService.create(req.body, req.user.id);
      res.status(201).json({ msg: "Muvaffaqiyatli yuborildi !", data });
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

  async getOne(req, res, next) {
    try {
      const data = await DepWeavingService.getOne(req.params.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async getOneFromInProcess(req, res, next) {
    try {
      const data = await DepWeavingService.getOneFromInProcess(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async addDayReportInProcess(req, res, next) {
    try {
      const data = await DepWeavingService.addDayReportInProcess(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async getDayReportFromWeaving(req, res, next) {
    try {
      const data = await DepWeavingService.getDayReportFromWeaving(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepWeavingController();
