const { fn, col, literal } = require('sequelize');
const { Product, Sale, Owner } = require('../models');

const PAGE_SIZE = 50;

async function getDashboard(page) {
  const [products, total] = await Promise.all([
    Product.findAll({
      include: [{ model: Owner, as: 'owner' }],
      order: [['id', 'ASC']],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    Product.count(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const salesRows = await Sale.findAll({
    attributes: ['productId', [fn('SUM', col('quantity')), 'units'], [fn('SUM', literal('quantity * price_cents')), 'revenueCents']],
    group: ['productId'],
    raw: true,
  });
  const salesByProduct = {};
  for (const row of salesRows) salesByProduct[row.productId] = row;

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
    const sales = salesByProduct[product.id];
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      priceCents: product.priceCents,
      stock: product.stock,
      description: product.description,
      createdAt: product.createdAt,
      sales: {
        units: Number(sales ? sales.units : 0),
        revenueCents: Number(sales ? sales.revenueCents : 0),
      },
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

module.exports = { getDashboard };
