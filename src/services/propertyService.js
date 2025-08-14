const Property = require('../models/Property');

async function createProperty(data) {
  const prop = new Property(data);
  await prop.save();
  return prop;
}

async function getAllProperties() {
  return Property.find();
}

async function getPropertyById(id) {
  const prop = await Property.findById(id);
  if (!prop) throw new Error('Property not found');
  return prop;
}

async function updateProperty(id, data) {
  const prop = await Property.findByIdAndUpdate(id, data, { new: true });
  if (!prop) throw new Error('Property not found');
  return prop;
}

async function deleteProperty(id) {
  const prop = await Property.findByIdAndDelete(id);
  if (!prop) throw new Error('Property not found');
  return prop;
}

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};
