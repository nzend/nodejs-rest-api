const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/contacts");
const { isValidId } = require("../../middlewares");


router.get("/", ctrl.getAll);

router.get("/:id", isValidId, ctrl.getContactById);

router.post("/", ctrl.addContact);

router.put("/:id", isValidId, ctrl.updateContact);

router.patch("/:id/favorite", isValidId, ctrl.updateStatusContact);

router.delete("/:id", isValidId, ctrl.deleteContact);

module.exports = router;
