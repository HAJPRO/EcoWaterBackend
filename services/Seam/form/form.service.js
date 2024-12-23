const AddToFormModel = require("../../../models/Seam/warehouse/AddToForm.model");
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
}

module.exports = new SeamInFormService();
