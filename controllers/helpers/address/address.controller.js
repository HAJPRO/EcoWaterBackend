const AddressService = require("../../../services/helpers/address/address.service");
class AddressController {
  async Regions(req, res, next) {
    try {
      const data = await AddressService.Regions(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async Districts(req, res, next) {
    try {
      const data = await AddressService.Districts(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async Neighborhoods(req, res, next) {
    try {
      const data = await AddressService.Neighborhoods(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
 
}

module.exports = new AddressController();
