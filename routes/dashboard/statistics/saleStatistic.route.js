const express = require('express');
const SaleStatisticsController = require('../../../controllers/dashboard/statistics/saleStatistic.controller');


const router = express.Router();

router.get('/all', SaleStatisticsController.GetSaleStatistics);

module.exports = router;