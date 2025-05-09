const express = require('express');
const DriverController = require('../../controllers/drivers/driver.controller');
const DriverManagmentController = require('../../controllers/drivers/driver/driver.controller');


const router = express.Router();

router.post('/location', DriverController.getActiveDrivers);
router.post('/driver/all', DriverManagmentController.GetAll);

module.exports = router;