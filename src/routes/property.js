const express = require("express");
const { body } = require("express-validator");
const propertyController = require("../controllers/propertyController");
const exportController = require("../controllers/exportPdfController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");
const { multiUpload } = require("../utils/multerS3");
const router = express.Router();

// ✅ Validation
const propertyValidation = [
  body("gatNumber").notEmpty().withMessage("Gat number is required"),
  body("satbara").notEmpty().withMessage("Satbara is required"),
  body("ferfar").notEmpty().withMessage("Ferfar is required"),
  body("zone").notEmpty().withMessage("Zone is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("agentName").notEmpty().withMessage("Agent name is required"),
  body("agentMobile")
    .isMobilePhone("en-IN")
    .withMessage("Valid agent mobile is required"),
  body("length").optional().isNumeric().withMessage("Length must be a number"),
  body("breadth")
    .optional()
    .isNumeric()
    .withMessage("Breadth must be a number"),
  body("areaValue")
    .optional()
    .isNumeric()
    .withMessage("Area value must be a number"),
  body("pricing").optional().isNumeric().withMessage("Pricing must be numeric"),
  body("qualityOfLand")
    .optional()
    .isString()
    .withMessage("Quality of land must be text"),
  body("waterSource")
    .optional()
    .isString()
    .withMessage("Water source must be text"),
  body("details").optional().isString().withMessage("Details must be text"),
  body("paymentCondition")
    .optional()
    .isString()
    .withMessage("Payment condition must be text"),
];

// ✅ CREATE
router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.AGENT, ROLES.EMPLOYEE]),
  propertyValidation,
  multiUpload,
  propertyController.createProperty
);

// ✅ EXPORT PDF (Must be above ID route)
router.post("/export-pdf", auth, exportController.exportPropertiesPdf);
router.get("/filter/location", auth, propertyController.getByLocation);
router.get("/filter/status", auth, propertyController.getByStatus);
router.get("/filter/date", auth, propertyController.getByDate);
router.get("/filter/search", auth, propertyController.getFilteredProperties);
// ✅ GET ALL
router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.AGENT]),
  propertyController.getProperties
);
// routes/property.js

// ✅ GET ONE
router.get("/:id", auth,  roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.AGENT]), propertyController.getPropertyById);

// ✅ UPDATE
router.put(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.AGENT, ROLES.EMPLOYEE]),
  multiUpload,
  propertyController.updateProperty
);

// ✅ DELETE
router.delete(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.AGENT,ROLES.EMPLOYEE]),
  propertyController.deleteProperty
);


module.exports = router;
