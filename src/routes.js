const express = require('express');
const { signup, login, addCar, getRides, rentCar, updateRentHistory } = require('./controllers');
const { authenticateToken, authenticateAdmin } = require('./middleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/car/create', authenticateToken, authenticateAdmin, addCar);
router.get('/car/get-rides', getRides);
router.post('/car/rent', authenticateToken, rentCar);
router.post('/car/update-rent-history', authenticateToken, authenticateAdmin, updateRentHistory);

module.exports = router;
