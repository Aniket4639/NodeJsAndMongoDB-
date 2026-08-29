const express = require('express');
const authController = require ("../controllers/authController")
// const userController = require('../controllers/userController'); // Holds your CRUD functions like deleteUser

const router = express.Router();

// -------------------------------------------------------------
// 🔓 PUBLIC ROUTES (No login required)
// -------------------------------------------------------------
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// -------------------------------------------------------------
// 🔒 PROTECTED ROUTES (User MUST be logged in)
// -------------------------------------------------------------
// This updates the logged-in user's password using 'req.user.id'
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);


// -------------------------------------------------------------
// 👮 ADMINISTRATIVE ROUTES (Logged in AND must be an Admin)
// -------------------------------------------------------------
// This deletes a user account entirely from the database
// router.delete('/delete-user', authController.protect, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
