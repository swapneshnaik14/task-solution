const User = require('../model/user.model');

async function createUsersInBatch(batch) {
  const userPromises = batch.map(async ({ name, age, address, ...additionalFields }) => {
    const userData = {
      name: `${name.firstName} ${name.lastName}`,
      age,
      address,
      additional_info: additionalFields,
    };
    
    const existingUser = await User.findOne({
      where: { age, name: `${name.firstName} ${name.lastName}` },
    });

    if (!existingUser) {
      return User.create(userData);
    } else {
      console.log(`User already exists with name ${name.firstName} ${name.lastName} and age ${age}`);
      return null;
    }
  });

  await Promise.all(userPromises);
}

module.exports = { createUsersInBatch };
