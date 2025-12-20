// Salepos/POS operatsiyalarini boshqarish servisini import qilish
const SaleposManagmentService = require("../../../services/sale/salepos/salepos.service.js"); 
// Eslatma: Sizning misolingizda chaqirilgan fayl nomi 'salepos,service' emas, balki 'salepos.service' bo'lishi kerak.

class SaleposManagmentController {
    
    /**
     * Yangi Sotuvni yaratish/yakunlash (POS tranzaksiyasi)
     * Endpoint: POST /api/sale/salepos
     */
    async Create(req, res, next) {
        try {
            // Sotuvchi (Kassir) ID sini ma'lumotlarga qo'shish
            const data = await SaleposManagmentService.Create({ 
                author: req.user.id, 
                payload : req.body 
            });
            res.status(200).json(data);
        } catch (error) {
            // Xatolikni keyingi middleware'ga uzatish
            next(error);
        }
    }
async GetAll(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetAll({payload: req.body,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
async GetByCustomerId(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetByCustomerId({id:req.body.id,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
async GetByEmployeeId(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetByEmployeeId({id:req.body.id,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv/Order detallarini ID bo'yicha olish
     * Endpoint: GET /api/sale/salepos/:id
     */
    async GetSaleById(req, res, next) {
        try {
            // req.params.id da kelgan ID ni ishlatish maqsadga muvofiq
            const id = req.params.id || req.body.id; 
            const data = await SaleposManagmentService.GetSaleById({ id });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sotuv/Order holatini yangilash (Masalan, Haydovchi bog'lash)
     * Endpoint: PUT /api/sale/salepos/:id
     */
    async UpdateById(req, res, next) {
        try {
            const data = await SaleposManagmentService.UpdateSaleStatus({ 
                author: req.user.id, // Yangilashni amalga oshirgan shaxs
                orderId: req.params.id, // Agar ID URL dan kelsa
                ...req.body 
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Barcha Sotuv Cheklarini Ro'yxatini olish
     * Endpoint: GET /api/sale/salepos/list
     */
    

    /**
     * Haydovchilar Ro'yxatini olish (Agentlar ro'yxati)
     * Endpoint: GET /api/sale/salepos/drivers
     */
    async GetAllDrivers(req, res, next) {
        try {
            const data = await SaleposManagmentService.GetAllDrivers(req.query);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv Chekini o'chirish
     * Endpoint: DELETE /api/sale/salepos/:id
     */
    async DeleteById(req, res, next) {
        try {
            const data = await SaleposManagmentService.DeleteSale({
                id: req.params.id, // Agar ID URL dan kelsa
                author : req.user.id 
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv Ma'lumotlarini Excelga Export qilish
     * Endpoint: GET /api/sale/salepos/export
     */
    async ExportExcelDownload(req, res, next) {
        try {
            const data = await SaleposManagmentService.ExportExcelDownload(req.query);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SaleposManagmentController();