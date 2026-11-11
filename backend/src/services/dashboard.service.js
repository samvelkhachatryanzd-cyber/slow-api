const { fn, col } = require('sequelize');
const { Product, Owner } = require('../models');
const { errorHandler } = require("../middleware/errorHandler");

const PAGE_SIZE = 50;

async function getDashboard(page) {
  const [products, total] = await Promise.all([
    Product.findAll({
      order: [['name', 'ASC'], ['id', 'ASC']],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    Product.count(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return { page, totalPages, updatedAt: new Date().toISOString(), products };
}

async function getOwner(id) {
  const owner = await Owner.findOne({ where: { id: id } });
  if (!owner) throw new Error(`Owner not found`);
  const productCount = await Product.findAll({
    attributes: [[fn('COUNT', col('id')), 'productCount']],
    where: { ownerId: owner.id },
    raw: true,
  });
  return { ...owner.dataValues, ...productCount[0] };
}

module.exports = { getDashboard, getOwner };
