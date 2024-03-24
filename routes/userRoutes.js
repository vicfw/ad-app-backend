const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");

const router = express.Router();

router.get("/web-me", authController.me);
router.post("/signup", authController.signup);
router.post("/mobile-signup", authController.mobileSignup);
router.post("/login", authController.login);
router.post("/mobile-login", authController.mobileLogin);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.post(
  "/forgotPasswordValidation",
  authController.forgotPasswordValidation
);
router.patch("/resetPassword", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", authController.protect, userController.getCurrentUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .delete(userController.deleteManyUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
