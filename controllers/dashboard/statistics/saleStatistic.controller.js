const SaleStatisticsService = require("../../../services/dashboard/statistics/saleStatistic.service");

class SaleStatisticsController {
    async GetAllDayStatistics(req, res) {
        try {
            const statistics = await SaleStatisticsService.GetAllDayStatistics(); // <-- BU YERGA await QO‘SHILDI
            res.status(200).json({ success: true, statistics });
        } catch (error) {
            res.status(500).json({ success: false, message: "Ichki server xatosi" });
        }
    }
}

module.exports = new SaleStatisticsController();
