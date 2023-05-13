const router = require('express').Router();
const doctorsController = require('../controllers/doctors_controller');

router.post('/register', doctorsController.register);
router.post('/login', doctorsController.login);

// router.get('/', function(req,res){
//     console.log("yayyyy");
// });

module.exports = router;
