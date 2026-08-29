const express = require("express");
const tourController = require("../controllers/tourController");

const router = express.Router();

// router.param('id', tourController.checkID)
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);

//check token loggedIn
// router
//   .route("/")
//   .get(authController.protect, tourController.getAllTours) // ✅ BOTH will run sequentially
//   .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
