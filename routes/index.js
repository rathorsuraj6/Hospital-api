const router = require('express').Router();

router.use('/doctor',require('./doctors'));
router.use('/patient',require('./patients'));
router.use('/reports',require('./reports'));

module.exports = router;