'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('owners', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      company: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(254), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(30), allowNull: false },
      city: { type: Sequelize.STRING(60), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('owners');
  },
};
