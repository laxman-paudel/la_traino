const { Router } = require("express");
const templateController = require("../controllers/templateController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.use(protect, restrictTo("TRAINER"));

router.get("/", templateController.listTemplates);
router.get("/:id", templateController.getTemplate);
router.post("/", templateController.createTemplate);
router.put("/:id", templateController.updateTemplate);
router.post("/:id/duplicate", templateController.duplicateTemplate);
router.patch("/:id/archive", templateController.archiveTemplate);
router.patch("/:id/restore", templateController.restoreTemplate);
router.delete("/:id", templateController.deleteTemplate);
router.patch("/:id/favorite", templateController.toggleFavorite);
router.post("/:id/assign", templateController.assignTemplate);
router.post("/import-global/:globalId", templateController.importFromGlobal);

module.exports = router;
