const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/contacts");
const { isValidId, authenticate } = require("../../middlewares");

router.get("/", authenticate, ctrl.getAll);

router.get("/:id", authenticate, isValidId, ctrl.getContactById);

router.post("/", authenticate, ctrl.addContact);

router.put("/:id", authenticate, isValidId, ctrl.updateContact);

router.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  ctrl.updateStatusContact
);

router.delete("/:id", authenticate, isValidId, ctrl.deleteContact);

module.exports = router;
