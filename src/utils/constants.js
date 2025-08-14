const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  AGENT: 'agent'
};

const PROPERTY_STATUS = {
  PENDING: 'pending',
  SOLD: 'sold',
  ACTIVE: 'active'
};

// These fields should NOT be visible/exported by agent or employee
const ADMIN_ONLY_FIELDS = [
  'pricing',
  'registryDocument',
  'soldPrice'
];

module.exports = {
  ROLES,
  PROPERTY_STATUS,
  ADMIN_ONLY_FIELDS
};
