const router = require('express').Router();
const paientsController = require('../controllers/patients_controller');
const passport = require('passport');

router.post('/register', passport.authenticate('jwt',{session: false}), paientsController.register);
router.post('/:id/create_report', passport.authenticate('jwt',{session: false}), paientsController.createReport);
router.get('/:id/all_reports', passport.authenticate('jwt',{session: false}), paientsController.allReports);

module.exports = router;



