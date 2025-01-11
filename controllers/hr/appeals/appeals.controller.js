const HRAppealsService = require("../../../services/HR/Appeals/appeals.service");
class HRAppealsController {
  async GetAll(req, res, next) {
    console.log(req.body);

    try {
      const data = await HRAppealsService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new HRAppealsController();
