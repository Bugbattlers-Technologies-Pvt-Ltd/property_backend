// const router = require('express').Router();
// const auth = require('../middleware/auth');
// const roleAuth = require('../middleware/roleAuth');
// const { ROLES } = require('../utils/constants');
// const ac = require('../controllers/agentController');

// router
//   .post('/', auth, roleAuth([ROLES.ADMIN,ROLES.EMPLOYEE]), ac.createAgent)
//   .get('/', auth, ac.getAllAgents); // <-- use correct exported function name

// module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { ROLES } = require('../utils/constants');
const ac = require('../controllers/agentController');
const s3Upload = require('../middleware/s3Upload'); // ✅ import multer middleware

router
  .post('/', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), s3Upload.single('photo'), ac.createAgent)
  .get('/', auth, ac.getAllAgents); // <-- use correct exported function name

module.exports = router;
