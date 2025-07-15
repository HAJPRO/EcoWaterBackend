const express = require('express');
const SaleStatisticsController = require('../../../controllers/dashboard/statistics/saleStatistic.controller');


const router = express.Router();

router.post('/all', SaleStatisticsController.GetAllDayStatistics);

module.exports = router;