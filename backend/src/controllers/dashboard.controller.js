const service = require('../services/dashboard.service');

function parsePage(value) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

async function dashboard(req, res) {
  res.json(await service.getDashboard(parsePage(req.query.page)));
}

module.exports = { dashboard };
