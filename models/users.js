import bcrypt from 'bcrypt-nodejs';
import { saltFactor } from '../settings';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    phoneNum: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  }, {
    classMethods: {
      generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
      },
    },
  }, {
    hooks: {
      beforeUpdate: async (user) => {
        const salt = await bcrypt.genSaltSync(10, 'a');
        user.password = bcrypt.hashSync(user.password, salt);
      },
    },

  });

  User.beforeCreate(async (user, options) => {
    if (user.password) {
      const salt = await bcrypt.genSaltSync(10, 'a');
      user.password = bcrypt.hashSync(user.password, salt);
    }
  });

  User.prototype.validPassword = function(password) {
    console.log('password', password, 'this.password', this.password);
    return bcrypt.compareSync(password, this.password);
  };
  return User;
};