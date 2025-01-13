const HRAppealsService = require("../../../services/HR/Appeals/appeals.service");
class HRAppealsController {
  async GetAll(req, res, next) {
    try {
      const data = await HRAppealsService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async ReplyMessageCreate(req, res, next) {
    try {
      const data = await HRAppealsService.ReplyMessageCreate(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async Delete(req, res, next) {
    try {
      const data = await HRAppealsService.Delete(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new HRAppealsController();
