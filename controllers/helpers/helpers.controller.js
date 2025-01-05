const HelpersService = require("../../services/Helpers/helpers.service");
class HelpersController {
  async CreateMaterialName(req, res, next) {
    try {
      const data = await HelpersService.CreateMaterialName(req.body);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAllMaterialNames(req, res, next) {
    try {
      const data = await HelpersService.GetAllMaterialNames(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new HelpersController();
