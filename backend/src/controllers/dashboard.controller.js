const service = require('../services/dashboard.service');

async function dashboard(req, res) {
  res.json(await service.getDashboard());
}

module.exports = { dashboard };
