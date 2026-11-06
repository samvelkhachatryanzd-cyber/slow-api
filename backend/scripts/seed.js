require('dotenv').config({ quiet: true });
const { sequelize } = require('../src/models');

const PRODUCTS = Number(process.env.SEED_PRODUCTS) || 500;
const OWNERS = Math.max(10, Math.round(PRODUCTS / 10));
const START = Date.UTC(2024, 10, 1);
const END = Date.UTC(2026, 10, 1);
const BATCH = 5000;

const FIRST_NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Elena', 'Felix', 'Grace', 'Hugo', 'Iris', 'Jonas', 'Kate', 'Leo', 'Mia', 'Noah', 'Olga', 'Paul'];
const LAST_NAMES = ['Adams', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher', 'Garcia', 'Hill', 'Jones', 'King', 'Lewis', 'Miller', 'Nelson', 'Owen', 'Parker', 'Reed'];
const COMPANY_SUFFIXES = ['Trading', 'Goods', 'Supply', 'Studio', 'Workshop', 'Imports', 'Outlet', 'Market'];
const CITIES = ['Berlin', 'Vilnius', 'Riga', 'Warsaw', 'Prague', 'Vienna', 'Madrid', 'Lisbon', 'Dublin', 'Oslo', 'Milan', 'Lyon'];
const CATEGORIES = ['Electronics', 'Home', 'Garden', 'Kitchen', 'Office', 'Sports', 'Toys', 'Books', 'Beauty', 'Pets', 'Music', 'Outdoor'];
const ADJECTIVES = ['Compact', 'Deluxe', 'Classic', 'Eco', 'Smart', 'Pro', 'Mini', 'Ultra', 'Basic', 'Premium', 'Vintage', 'Modern'];
const NOUNS = ['Lamp', 'Bottle', 'Kit', 'Set', 'Case', 'Mat', 'Stand', 'Cable', 'Jar', 'Board', 'Bag', 'Tool'];
const DESCRIPTION = [
  'Made from durable materials that hold up to daily use.',
  'Designed in a clean, simple style that fits any room.',
  'Easy to set up in a few minutes without extra tools.',
  'Ships in recyclable packaging with a printed quick-start guide.',
  'Backed by a two-year warranty from the manufacturer.',
  'Light enough to carry around, sturdy enough to last for years.',
  'Available in several colours, each finished by hand.',
  'Tested by our team for safety and long-term reliability.',
  'Cleans easily with a damp cloth and mild soap.',
  'A popular choice for gifts, offices and first apartments.',
  'Every unit is checked twice before it leaves the warehouse.',
  'Compatible with most standard accessories on the market.',
];
const NOTES = [
  'Prefers to be contacted by email during office hours.',
  'Asked for a review of their shipping rates next quarter.',
  'Has been a reliable seller with very few returns.',
  'Requested access to the new bulk upload tool.',
  'Payouts go to a business account in the euro area.',
  'Occasionally late with restocking before holidays.',
  'Interested in joining the featured sellers programme.',
  'Support tickets are usually resolved within a day.',
];

let state = 7;
function random() {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => min + Math.floor(random() * (max - min + 1));
function sentences(list, min, max) {
  const pool = [...list];
  const count = between(min, max);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).join(' ');
}

async function insertAll(queryInterface, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    await queryInterface.bulkInsert(table, rows.slice(i, i + BATCH));
  }
}

async function main() {
  const [[{ n }]] = await sequelize.query('SELECT COUNT(*) AS n FROM owners');
  if (Number(n) > 0) {
    console.error(`owners already has ${n} rows. Run "npm run db:reset" to start over.`);
    process.exit(1);
  }

  const queryInterface = sequelize.getQueryInterface();

  const owners = [];
  for (let id = 1; id <= OWNERS; id++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    owners.push({
      id,
      name: `${first} ${last}`,
      company: `${last} ${pick(COMPANY_SUFFIXES)}`,
      email: `${first}.${last}.${id}@example.com`.toLowerCase(),
      phone: `+1 555 01${String(between(0, 99)).padStart(2, '0')}`,
      city: pick(CITIES),
      notes: sentences(NOTES, 3, 5),
      created_at: new Date(START + random() * (END - START) * 0.5),
    });
  }
  await insertAll(queryInterface, 'owners', owners);

  let salesCount = 0;
  for (let first = 1; first <= PRODUCTS; first += BATCH) {
    const products = [];
    const sales = [];
    for (let id = first; id < first + BATCH && id <= PRODUCTS; id++) {
      const createdAt = START + random() * (END - START) * 0.8;
      const priceCents = between(199, 19999);
      products.push({
        id,
        owner_id: between(1, OWNERS),
        name: `${pick(ADJECTIVES)} ${pick(NOUNS)} ${id}`,
        category: pick(CATEGORIES),
        price_cents: priceCents,
        stock: between(0, 500),
        description: sentences(DESCRIPTION, 5, 8),
        created_at: new Date(createdAt),
      });
      const count = between(0, 100);
      for (let s = 0; s < count; s++) {
        sales.push({
          product_id: id,
          quantity: between(1, 3),
          price_cents: priceCents,
          sold_at: new Date(createdAt + random() * (END - createdAt)),
        });
      }
    }
    await insertAll(queryInterface, 'products', products);
    await insertAll(queryInterface, 'sales', sales);
    salesCount += sales.length;
  }

  console.log(`inserted ${OWNERS} owners, ${PRODUCTS} products, ${salesCount} sales`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
