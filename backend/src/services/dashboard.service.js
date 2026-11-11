const { fn, col } = require('sequelize');
const { Product, Owner } = require('../models');
const { errorHandler } = require("../middleware/errorHandler");

const PAGE_SIZE = 50;

async function getDashboard(page) {
  const [products, total] = await Promise.all([
    Product.findAll({
      include: [{ model: Owner, as: 'owner' }],
      order: [['name', 'ASC'], ['id', 'ASC']],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    Product.count(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ownerIds = [...new Set(products.map((product) => product.ownerId))];
  const productCountByOwner = {};
  if (ownerIds.length > 0) {
    const countRows = await Product.findAll({
      attributes: ['ownerId', [fn('COUNT', col('id')), 'productCount']],
      where: { ownerId: ownerIds },
      group: ['ownerId'],
      raw: true,
    });
    for (const row of countRows) productCountByOwner[row.ownerId] = Number(row.productCount);
  }

  const rows = products.map((product) => {
    const owner = product.owner;
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      priceCents: product.priceCents,
      stock: product.stock,
      description: product.description,
      createdAt: product.createdAt,
      totalSold: product.totalSold,
      ownerId: product.ownerId,
      owner: {
        id: owner.id,
        name: owner.name,
        company: owner.company,
        email: owner.email,
        phone: owner.phone,
        city: owner.city,
        notes: owner.notes,
        createdAt: owner.createdAt,
        productCount: productCountByOwner[owner.id],
      },
    };
  });

  return { page, totalPages, updatedAt: new Date().toISOString(), products: rows };
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
