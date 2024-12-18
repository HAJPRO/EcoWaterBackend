const SaleLegalCardModel = require("../../models/saleLegalCard.model");
const SaleDepPaintCardModel = require("../../models/saleDepPaintCard.model");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model");
const SaleDepProvideCardModel = require("../../models/saleDepProvideCard.model");
const userModel = require("../../models/user.model");

// const fileService = require("./file.service");

class DepProvideService {
  // async cancelReason(data, author) {
  //   try {
  //     const userData = await userModel.findById(author);
  //     const LegalDataById = await SaleDepPaintCardModel.findById(data.card_id);
  //     const newLegalData = LegalDataById;
  //     newLegalData.order_status = "To'quv bekor qildi";
  //     newLegalData.in_department_order = "Bo'yoq";
  //     newLegalData.isConfirm = "To'quv bekor qildi";
  //     newLegalData.process_status.push({
  //       department: userData.department,
  //       author: userData.username,
  //       is_confirm: { status: false, reason: data.reason },
  //       status: "To'quv bekor qilindi",
  //       sent_time: new Date(),
  //     });

  //     if (data.card_id) {
  //       const updateDataLegal = await SaleLegalCardModel.findByIdAndUpdate(
  //         data.card_id,
  //         newLegalData,
  //         { new: true }
  //       );
  //       return updateDataLegal
  //     }
  //   } catch (error) {
  //     return error.message
  //   }
  // }
  // async create(data, author) {
  //   const weaving_process_status = {
  //     author: author,
  //     is_confirm: { status: true, reason: "" },
  //     sent_time: new Date()
  //   }
  //   const newData = await SaleDepWeavingCardModel.create({ ...data.items, author, weaving_process_status });
  //   const userData = await userModel.findById(author);
  //   const LegalDataById = await SaleLegalCardModel.findById(data.card_id);
  //   const newLegalData = LegalDataById;
  //   newLegalData.order_status = "Yigiruvga yuborildi";
  //   newLegalData.isConfirm = "To'quv tasdiqladi";
  //   newLegalData.in_department_order = "Yigiruv";
  //   newLegalData.process_status.push({
  //     department: userData.department,
  //     author: userData.username,
  //     is_confim: { status: true, reason: "" },
  //     status: "Yigiruvga yuborildi",
  //     sent_time: new Date(),
  //   });
  //   if (data.card_id) {
  //     newLegalData.dep_weaving_data = data.card_id;
  //     const updateDataLegal = await SaleLegalCardModel.findByIdAndUpdate(
  //       data.card_id,
  //       newLegalData,
  //       { new: true }
  //     );
  //   }

  //   return newData;
  // }
  async getAllLength() {
    const process_length = await this.getAllInProcess().then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const paint_length = await this.getAllPaint().then((data) => data.length);
    const weaving_length = await this.getAllWeaving().then(
      (data) => data.length
    );
    const spinning_length = await this.getAllSpinning().then(
      (data) => data.length
    );

    return { process_length, weaving_length, paint_length, spinning_length };
  }
  async getAll(data) {
    const is_status = data.status;
    try {
      const all_length = await this.getAllLength();
      if (is_status === 1) {
        const items = await this.getAllInProcess();
        return { items, all_length };
      }
      if (is_status == 2) {
        const items = await this.getAllPaint();
        return { items, all_length };
      }

      if (is_status == 3) {
        const items = await this.getAllWeaving();
        return { items, all_length };
      }
      if (is_status == 4) {
        const items = await this.getAllSpinning();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess() {
    try {
      const allProcess = await SaleDepProvideCardModel.aggregate([
        {
          $match: {
            $or: [{ status: "Jarayonda" }, { status: "Yetkazib berildi" }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },

        {
          $project: {
            status: 1,
            delivery_product_box: 1,
            status: 1,
            author: {
              $cond: {
                if: { $isArray: "$author" },
                then: { $arrayElemAt: ["$author", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      return allProcess;
    } catch (error) {
      return error.message;
    }
  }
  async getAllPaint() {
    try {
      const allPaint = await SaleDepProvideCardModel.aggregate([
        {
          $match: {
            department: "Bo'yoq",
          },
        },
      ]);
      return allPaint;
    } catch (error) {
      return error.message;
    }
  }
  async getAllWeaving() {
    try {
      const allWeaving = await SaleDepProvideCardModel.aggregate([
        {
          $match: {
            department: "To'quv",
          },
        },
      ]);

      return allWeaving;
    } catch (error) {
      return error.message;
    }
  }

  async getAllSpinning() {
    try {
      const allSpinning = await SaleDepProvideCardModel.aggregate([
        {
          $match: {
            department: "Yigiruv",
          },
        },
      ]);
      return allSpinning;
    } catch (error) {
      return error.message;
    }
  }

  async delete(id) {
    const data = await SaleDepPaintCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    if (!id) {
      console.log("Id not found");
    }

    const updatedData = await SaleDepPaintCardModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
    return updatedData;
  }
  async getOne(payload) {
    const data = await SaleDepProvideCardModel.findOne({ _id: payload.id });

    return { box: data.delivery_product_box };
  }
  async cancelReason(data, author) {
    const id = data.card_id;
    const reason = data.reason;
    try {
      const userData = await userModel.findById({ _id: author });
      const proccess_status = {
        author: userData.username,
        confirm: false,
        reason,
        status: "Bekor qilindi",
        sent_time: new Date(),
      };
      const data = await SaleDepProvideCardModel.findByIdAndUpdate(
        id,
        { proccess_status, status: "Bekor qilindi" },
        { new: true }
      );
      return data;
    } catch (error) {
      return error.message;
    }
  }

  async Confirm(id) {
    const data = await SaleDepProvideCardModel.findByIdAndUpdate(
      id,
      { status: "Jarayonda" },
      { new: true }
    );

    return data;
  }
  async Delivered(data, author) {
    const id = data.card_id;
    const reason = data.reason;
    try {
      const userData = await userModel.findById({ _id: author });
      const proccess_status = {
        author: userData.username,
        confirm: true,
        reason,
        status: "Yetkazib berildi",
        sent_time: new Date(),
      };
      const data = await SaleDepProvideCardModel.findByIdAndUpdate(
        id,
        { proccess_status, status: "Yetkazib berildi" },
        { new: true }
      );
      return data;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new DepProvideService();
