const EdoService = require("../../../socket/service/edo/edo.service");

class EdoController {
    async SendDocument(io, file) {
        try {
            await EdoService.SendDocument(io, file);
        } catch (error) {
            console.error("❌ Socket controllerda xatolik:", error.message);
        }

    }

}

module.exports = new EdoController();
