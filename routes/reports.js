const router = require('express').Router();
const reportsController = require('../controllers/reports_controller');

router.get('/:status', reportsController.reports);

module.exports = router;
