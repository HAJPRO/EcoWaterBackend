const HelpersService = require("../../services/Helpers/helpers.service");
class HelpersController {
  async CreateOption(req, res, next) {
    try {
      const data = await HelpersService.CreateOption(req.body);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetOptionsByType(req, res, next) {
    try {
      const data = await HelpersService.GetOptionsByType(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new HelpersController();
