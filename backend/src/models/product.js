module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      name: { type: DataTypes.STRING(120), allowNull: false },
      category: { type: DataTypes.STRING(40), allowNull: false },
      priceCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: 'products', underscored: true, updatedAt: false }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Owner, { foreignKey: 'ownerId', as: 'owner' });
    Product.hasMany(models.Sale, { foreignKey: 'productId', as: 'sales' });
  };

  return Product;
};
