const { Router } = require('express');
const dashboard = require('../controllers/dashboard.controller');

const router = Router();

router.get('/dashboard', dashboard.dashboard);

module.exports = router;
