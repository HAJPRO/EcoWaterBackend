const DepSeamWarehouseService = require("../../../services/Seam/warehouse/warehouse.service.js");
// const userModel = require("../../models/user.model.js");
class DepSeamWarehouseController {
  async ResponsiblesModel(req, res, next) {
    try {
      const model = await DepSeamWarehouseService.ResponsiblesModel();
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
  async GenerateQRCode(req, res, next) {
    try {
      const { load, responsibles } = req.body;
      const author = req.user.id;
      const id = await DepSeamWarehouseService.GenerateQRCode({
        load,
        responsibles,
        author,
      });
      res.status(201).json({ msg: "", id });
    } catch (error) {
      next(error);
    }
  }
  async getQRImage(req, res, next) {
    try {
      const data = await DepSeamWarehouseService.getQRImage(req.body);
      res.status(201).json({ msg: "", data });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new DepSeamWarehouseController();

// async create(req, res, next) {
//     try {
//         const userData = await userModel.findById(req.user.id);
//         const proccess_status =
//         {
//             department: userData.department,
//             author: userData.username,
//             status: "Yigiruvga yuborildi",
//             sent_time: new Date(),
//             confirm: [{ author: userData.author, reason: "", isConfirm: true }],
//         }

//         const data = await DepProvideService.create(
//             req.body.items,
//             req.user.id,
//             proccess_status
//         );
//         const LegalDataById = await SaleLegalCardModel.findById(req.body.id);
//         const newLegalData = LegalDataById;
//         newLegalData.order_status = "Yigiruvga yuborildi";
//         newLegalData.process_status.push({
//             department: userData.department,
//             author: userData.email,
//             status: "Yigiruvga yuborildi",
//             sent_time: new Date(),
//         });
//         if (data._id) {
//             newLegalData.dep_provider_data = data._id;
//             const updateDataLegal = await SaleLegalCardModel.findByIdAndUpdate(
//                 req.body.id,
//                 newLegalData,
//                 { new: true }
//             );
//         }

//         res.status(201).json(data);
//     } catch (error) {
//         next(error);
//     }
// }

// async getAll(req, res, next) {
//     try {
//         const all = await DepProvideService.getAll(req.body.status);
//         res.status(200).json(all);
//     } catch (error) {
//         next(error);
//     }
// }
// async getAllLength(req, res, next) {
//     try {
//         const all = await DepProvideService.getAllLength();
//         res.status(200).json(all);
//     } catch (error) {
//         next(error);
//     }
// }

// async delete(req, res, next) {
//     try {
//         const data = await DepPaintService.delete(req.params.id);
//         res.status(200).json(data);
//     } catch (error) {
//         next(error);
//     }
// }

// async edit(req, res, next) {
//     try {
//         const { body, params } = req;
//         const data = await DepPaintService.edit(body, params.id);
//         res.status(200).json(data);
//     } catch (error) {
//         next(error);
//     }
// }

// async getOne(req, res, next) {
//     try {
//         const data = await DepPaintService.getOne(req.params.id);
//         res.status(200).json(data);
//     } catch (error) {
//         next(error);
//     }
// }
// }

// module.exports = new DepSeamWarehouseService();
