'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      owner_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      name: { type: Sequelize.STRING(120), allowNull: false },
      category: { type: Sequelize.STRING(40), allowNull: false },
      price_cents: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      stock: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
