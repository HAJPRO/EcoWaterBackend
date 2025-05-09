const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/r-warehouse.model");
const generateUniquePartyNumber = require("../../../utils/generateUniquePartyNumber");

class ReadyWarehouseService {
  // Modelni yaratish
  async GetModel() {
    const partyNumber = await generateUniquePartyNumber();  // Unikal partiya raqamini olish
    const model = {
      partyNumber: partyNumber, // Partiya raqami
      supplier: "", // Yetkazib beruvchi (firma yoki shaxs nomi)
      manufacturer: "", // Ishlab chiqaruvchi korxona yoki brend nomi
      senderEmployee: "", // Mahsulotni jo‘natgan xodim (ism yoki ID)
      receivedBy: "", // Mahsulotni qabul qilgan xodim
      receivedDate: new Date(), // Qabul qilingan sana (hozirgi vaqt)
      author: "", // Ushbu partiyani tizimga qo‘shgan foydalanuvchi
      notes: "", // Izohlar (ixtiyoriy maydon)
      totalAmount : "",
      products: [
       
      ]
    };

    return { msg: "Model taqdim qilindi!", model };
  }

  // Yangi ReadyWarehouse yaratish
  async Create(data) {
    try {
     await  ReadyWarehouse.create(data)
      return { msg: "Mahsulot muvaffaqiyatli qo'shildi!" };
    } catch (error) {
      return { msg: `Xatolik yuz berdi: ${error.message}` };
    }
  }

  // Barcha ReadyWarehouse uzunligini olish
  async getAllLength() {
    try {
      const all = await ReadyWarehouse.find();
      return { allLength: all.length };
    } catch (error) {
      return { msg: `Xatolik yuz berdi: ${error.message}`, allLength: 0 };
    }
  }

  // Barcha ReadyWarehouse olish
  async GetAll(data) {
    try {
      const warehouses = await ReadyWarehouse.find().lean();
      return { warehouses };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }
}

module.exports = new ReadyWarehouseService();
