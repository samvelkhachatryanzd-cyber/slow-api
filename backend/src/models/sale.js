module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define(
    'Sale',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      quantity: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
      priceCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      soldAt: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: 'sales', underscored: true, timestamps: false }
  );

  Sale.associate = (models) => {
    Sale.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return Sale;
};
