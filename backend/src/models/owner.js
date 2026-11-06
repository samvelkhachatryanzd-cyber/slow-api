module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define(
    'Owner',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      company: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      phone: { type: DataTypes.STRING(30), allowNull: false },
      city: { type: DataTypes.STRING(60), allowNull: false },
      notes: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: 'owners', underscored: true, updatedAt: false }
  );

  Owner.associate = (models) => {
    Owner.hasMany(models.Product, { foreignKey: 'ownerId', as: 'products' });
  };

  return Owner;
};
