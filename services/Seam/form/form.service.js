const AddToFormModel = require("../../../models/Seam/warehouse/AddToForm.model");
const AddParamsToFormSchema = require("../../../models/Seam/form/AddParamsToForm.model");
class SeamInFormService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();
        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromWarehouse();
        return { items, all_length };
      }
      if (status === 3) {
        const items = await this.AllSentToClassification();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    try {
    } catch (error) {
      return error.message;
    }
  }

  async AllSentFromWarehouse() {
    try {
      const items = await AddToFormModel.find();
      return items;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToClassification() {
    try {
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength() {
    // const process_length = await this.getAllInProcess().then(
    //   (data) => data.length
    // );
    // const warehouse_length = await this.AllSentFromWarehouse().then(
    //   () => data.length
    // );
    // const classification_length = await this.AllSentToClassification().then(
    //   (data) => data.length
    // );
    // return { process_length, warehouse_length, classification_length };
  }
  async CreaetInfoToForm(payload) {
    const author = payload.user.id;
    const warehouse_id = payload.data.id;
    const pastal_quantity = payload.data.data.pastal_quantity;
    const waste_quantity = payload.data.data.waste_quantity;
    const fact_gramage = payload.data.data.fact_gramage;

    const model = {
      author,
      warehouse_id,
      pastal_quantity,
      waste_quantity,
      fact_gramage,
    };
    console.log(model);

    const res = await AddParamsToFormSchema.create(model);
    return res;
  }
}

module.exports = new SeamInFormService();
