const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { multiUpload } = require("../utils/multerS3");
const propertyByUserController = require("../controllers/propertyByUserController");

// Create a property by user (with file upload support)
router.post("/create/:userId", auth, multiUpload, propertyByUserController.createPropertyByUserId);

// Get selected fields of properties by user (for listing)
router.get("/:userId", auth, propertyByUserController.getPropertiesByUserId);
// Get selected fields of properties by user (for single property)

// ✅ Get full property details by user (for admin or detail page)

 router.get("/full/:userId",auth, propertyByUserController.getMyPropertyFullDetails);
// Update property by user

router.put("/:userId/:propertyId", auth, multiUpload, propertyByUserController.updatePropertyByUserId);

// Delete property by user
router.delete("/:userId/:propertyId", auth, propertyByUserController.deletePropertyByUserId);

module.exports = router;
