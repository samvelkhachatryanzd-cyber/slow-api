require('dotenv').config({ quiet: true });
const { sequelize } = require('../src/models');

// Sets products.total_sold to the number of units found in sales.
// It writes absolute values, so it can be run again at any time to re-sync the column with sales.
async function main() {
  await sequelize.query(`
    UPDATE products p
    LEFT JOIN (
      SELECT product_id, SUM(quantity) AS units
      FROM sales
      GROUP BY product_id
    ) s ON s.product_id = p.id
    SET p.total_sold = COALESCE(s.units, 0)
  `);

  const [[{ products, units }]] = await sequelize.query(
    'SELECT COUNT(*) AS products, COALESCE(SUM(total_sold), 0) AS units FROM products'
  );
  console.log(`set total_sold for ${products} products (${units} units)`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
