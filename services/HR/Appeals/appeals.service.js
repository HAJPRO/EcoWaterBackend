const mongoose = require("mongoose");
const HRAppeals = require("../../../models/HR/Appeals/appeal.js");
class HRAppealsService {
  async GetAll(is_status) {
    const status = is_status.status;
    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.AllReturnRespons();
        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllAppeals();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength() {}

  async AllAppeals() {
    const items = await HRAppeals.find();
    return items;
  }
}

module.exports = new HRAppealsService();
