const mongoose = require("mongoose");
const SeamUserModel = require("../../../models/bots/seam/seam_user.model");
const SeamWorkerDayReport = require("../../../models/bots/seam/SeamWorkerDayReport.model");
const { SendReply } = require("../../../bot/seam/helpers/start");
class SeamEmployeesService {
  async getAllLength(data) {
    const employees_length = await this.getAllEmployees(data).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const products_length = await this.getAllProducts().then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });

    return { employees_length, products_length };
  }
  async getAll(data) {
    const is_status = data.status;
    try {
      if (is_status === 1) {
        const all_length = await this.getAllLength(data);
        const items = await this.getAllEmployees(data);
        return { items, all_length };
      }
      if (is_status === 2) {
        const all_length = await this.getAllLength(data);
        const items = await this.getAllProducts();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllEmployees(data) {
    const limit = (data.limit)
    const skip = (+data.page - 1) * limit
    try {
      const allEmloyees = await SeamUserModel.find({ admin: false }).skip(skip).limit(limit);
      return allEmloyees;
    } catch (error) {
      return error.message;
    }
  }

  async getAllProducts() {
    try {
    } catch (error) {
      return error.message;
    }
  }
  async getOneEployeeReport(data) {
    const limit = (data.limit)
    const skip = (+data.page - 1) * limit
    const user = await SeamUserModel.findById(data.id);
    const reports = await SeamWorkerDayReport.find({ author: data.id }).skip(skip).limit(limit);
    const items = await SeamWorkerDayReport.find({ author: data.id });

    return { reports, employee: user.fullname, total: items.length };
  }
  async ConfirmReportAndSendReply(data) {
    const user = await SeamUserModel.findById(data.user_id);

    const update = await SeamWorkerDayReport.findByIdAndUpdate(
      data.report_id,
      {
        received_time: new Date(),
        status: `Qabul qilindi`,
      },
      { new: true }
    );

    if (await update.received_time) {

      await SendReply({ chatId: user.chatId, update });
    }

    return { msg: "Muvaffaqiyatli tasdiqlandi" };
  }
}

module.exports = new SeamEmployeesService();
