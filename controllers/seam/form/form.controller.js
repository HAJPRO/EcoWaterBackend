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
}
module.exports = new SeamInFormController();
