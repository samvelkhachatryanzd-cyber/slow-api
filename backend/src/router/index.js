const { Router } = require('express');
const { dashboard, owner } = require('../controllers/dashboard.controller');

const router = Router();

router.get('/dashboard', dashboard);
router.get('/product/:id/owner', owner);

module.exports = router;
