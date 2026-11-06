'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      product_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      quantity: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
      price_cents: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      sold_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales');
  },
};
