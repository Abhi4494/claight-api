import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const superAdminRoute = express.Router();
import LoginAdminController from '../../../controllers/api/admin/LoginAdminController.js';
import adminAuth from "../../../middlewares/SuperAdminAuth.js";

superAdminRoute.post("/login", LoginAdminController.login);
superAdminRoute.get("/profile",adminAuth, LoginAdminController.getProfile);
superAdminRoute.post("/refresh", adminAuth, LoginAdminController.refreshToken);
superAdminRoute.post("/update-profile", adminAuth, LoginAdminController.updateProfile);
superAdminRoute.post("/update-password", adminAuth, LoginAdminController.updatePassword);
superAdminRoute.post("/forgot-password", LoginAdminController.forgotPassword);
superAdminRoute.post("/verify-otp", LoginAdminController.verifyOtp);
superAdminRoute.post("/change-password", LoginAdminController.changePassword);
superAdminRoute.get("/verify-token", LoginAdminController.verifyToken);
superAdminRoute.post("/logout", adminAuth, LoginAdminController.logout);



export default superAdminRoute;
