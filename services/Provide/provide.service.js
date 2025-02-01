const ProvideModel = require("../../models/Provide/provide.model");
const userModel = require("../../models/user.model");

// const fileService = require("./file.service");

class DepProvideService {
  async getAllLength() {
    // const process_length = await this.getAllInProcess().then((data) => {
    //   if (data) {
    //     return data.length;
    //   } else {
    //     return 0;
    //   }
    // });
    const paint_length = await this.getAllPaint().then((data) => data.length);
    const weaving_length = await this.getAllWeaving().then(
      (data) => data.length
    );
    const spinning_length = await this.getAllSpinning().then(
      (data) => data.length
    );

    return { weaving_length, paint_length, spinning_length };
  }
  async getAll(data) {
    const is_status = data.status;
    try {
      const all_length = await this.getAllLength();

      if (is_status == 1) {
        const items = await this.getAllPaint();
        return { items, all_length };
      }

      if (is_status == 2) {
        const items = await this.getAllWeaving();
        return { items, all_length };
      }
      if (is_status == 3) {
        const items = await this.getAllSpinning();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllPaint() {
    try {
      const allPaint = await ProvideModel.aggregate([
        {
          $match: {
            $or: [{ department: "Super Admin" }, { department: "Bo'yoq" }],
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
      const allWeaving = await ProvideModel.aggregate([
        {
          $match: {
            $or: [{ department: "Super Admin" }, { department: "To'quv" }],
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
      const allSpinning = await ProvideModel.aggregate([
        {
          $match: {
            $or: [{ department: "Super Admin" }, { department: "Yigiruv" }],
          },
        },
      ]);
      return allSpinning;
    } catch (error) {
      return error.message;
    }
  }

  // async delete(id) {
  //   const data = await SaleDepPaintCardModel.findByIdAndDelete(id);
  //   return data;
  // }

  // async edit(data, id) {
  //   if (!id) {
  //     console.log("Id not found");
  //   }

  //   const updatedData = await SaleDepPaintCardModel.findByIdAndUpdate(
  //     id,
  //     data,
  //     {
  //       new: true,
  //     }
  //   );
  //   return updatedData;
  // }
  async getOne(payload) {
    const departmentName =
      payload.data.department === 3
        ? "To'quv"
        : payload.data.department === 2
        ? "Bo'yoq"
        : payload.data.department === 4
        ? "Yigiruv"
        : "";

    const data = await ProvideModel.findOne({
      _id: payload.data.id,
      department: departmentName,
    });
    return data;
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
      const data = await ProvideModel.findByIdAndUpdate(
        id,
        { proccess_status, status: "Bekor qilindi" },
        { new: true }
      );
      return data;
    } catch (error) {
      return error.message;
    }
  }

  async Confirm(payload) {
    const proccess_status = {
      author: payload.user.username,
      department: payload.user.department,
      status: payload.data.delivered
        ? "Yetkazib berildi"
        : "Taminot tasdiqladi",
      date: new Date(),
    };
    const data = await ProvideModel.findByIdAndUpdate(
      payload.data.card_id,
      {
        status: payload.data.delivered ? `Yetkazib berildi` : `Jarayonda`,
        proccess_status: proccess_status,
      },
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
      const data = await ProvideModel.findByIdAndUpdate(
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
