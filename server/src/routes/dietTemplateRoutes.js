const { Router } = require("express");
const dietTemplateController = require("../controllers/dietTemplateController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.use(protect, restrictTo("TRAINER"));

router.get("/", dietTemplateController.listTemplates);
router.get("/:id", dietTemplateController.getTemplate);
router.post("/", dietTemplateController.createTemplate);
router.put("/:id", dietTemplateController.updateTemplate);
router.post("/:id/duplicate", dietTemplateController.duplicateTemplate);
router.patch("/:id/archive", dietTemplateController.archiveTemplate);
router.patch("/:id/restore", dietTemplateController.restoreTemplate);
router.delete("/:id", dietTemplateController.deleteTemplate);
router.patch("/:id/favorite", dietTemplateController.toggleFavorite);
router.post("/:id/assign", dietTemplateController.assignTemplate);
router.post("/import-global/:globalId", dietTemplateController.importFromGlobal);

module.exports = router;
