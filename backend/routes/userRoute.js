import express from "express"
import { changePassword, forgotPassword, loginUser, logoutUser, registerUser, verification, verifyOTP } from "../controllers/userController.js"
import { isAuthenticated } from "../middleware/userAuthenticated.js"
import { userSchema, validateUser } from "../validators/userValidate.js"

const router = express.Router()


router.post('/register',validateUser(userSchema), registerUser)
router.post('/verify', verification)
router.post('/login', loginUser)
router.post('/logout',isAuthenticated, logoutUser)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp/:email', verifyOTP)
router.post('/change-password/:email', changePassword)

// GET current logged-in user
router.get("/", isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  res.json({ success: true, user: req.user });
});


export default router