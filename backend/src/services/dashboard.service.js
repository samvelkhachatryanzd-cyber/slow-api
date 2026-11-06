const { fn, col, literal } = require('sequelize');
const { Product, Sale } = require('../models');

async function getDashboard() {
  const products = await Product.findAll({ order: [['name', 'ASC'], ['id', 'ASC']] });

  const salesRows = await Sale.findAll({
    attributes: ['productId', [fn('SUM', col('quantity')), 'units'], [fn('SUM', literal('quantity * price_cents')), 'revenueCents']],
    group: ['productId'],
    raw: true,
  });
  const salesByProduct = {};
  for (const row of salesRows) salesByProduct[row.productId] = row;

  const productCountByOwner = {};
  const rows = [];
  for (const product of products) {
    const owner = await product.getOwner();
    if (productCountByOwner[owner.id] === undefined) {
      productCountByOwner[owner.id] = products.filter((p) => p.ownerId === owner.id).length;
    }
    const sales = salesByProduct[product.id];

    rows.push({
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
    });
  }

  return { updatedAt: new Date().toISOString(), products: rows };
}

module.exports = { getDashboard };
