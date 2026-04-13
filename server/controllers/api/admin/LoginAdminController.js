import db from "../../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../../../utils/sendMail.js";
const { Sequelize, SuperAdmin,AdminRole } = db;
const Op = Sequelize.Op;

const refreshCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
};

// Cache to prevent race conditions when multiple requests try to refresh simultaneously
const refreshInProgress = new Map(); // key: refreshToken, value: Promise<result>

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(500).send({
        statusCode: 500,
        message: "Please Provide Email Address",
      });
    }

    if (!password) {
      return res.status(500).send({
        statusCode: 500,
        message: "Please Provide Password",
      });
    }
    
    const user = await SuperAdmin.findOne({ 
        where: { email, is_deleted: 0 },
        include:[
            {
                model:AdminRole,
                as:"admin_role",
                attributes:['id','name']
            }
        ] 
    });
    
    

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: 'Provided email address not found. Please enter correct email address',
      });
    }

    if (user.is_active == false) {
      return res.status(404).send({
        statusCode: 404,
        message:
          "Your Account is Inactive. Please Contact to Super Admin",
      });
    }

    const dbpass = user.password;
    const match = await bcrypt.compare(password, dbpass);
    if (match) {
      let role_id = user.role_id ? user.role_id : 0;
      const userData = { id: user.id, role_id: role_id,role_type:user.admin_role.name};

      const accessToken = jwt.sign(
        userData,
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      // 🔁 REFRESH TOKEN (long)
      const refreshToken = jwt.sign(
        userData,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      await user.update({ refresh_token: refreshToken });

      res.cookie("access_token", accessToken, {
        // httpOnly: true,
        // sameSite: "strict",
        // secure: process.env.NODE_ENV === "production",
        ...refreshCookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        // httpOnly: true,
        // sameSite: "strict",
        // secure: process.env.NODE_ENV === "production",
        ...refreshCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Login successful",
        token:accessToken,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_id: role_id,
          role_type:user.admin_role.name
        },
      });
    } else {
      return res.status(500).send({
        statusCode: 500,
        message: "Provided password not match. Please enter correct password",
      });
    }
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const superAdminID = req.user.id;
    // 2️⃣ Fetch from DB
    const get_admin_profile = await SuperAdmin.findOne({
      where: { id: superAdminID },
      attributes: ["id", "first_name", "last_name", "email", "mobile"],
      include:[
        {
            model:AdminRole,
            as:"admin_role",
            attributes:['id','name']
        }
      ]
    });

    if (!get_admin_profile) {
      return res.status(404).send({
        statusCode: 404,
        message: "Profile not found",
      });
    }
    const msg = get_admin_profile.admin_role.name+" Fetch Profile"

    return res.status(200).send({
      statusCode: 200,
      message: msg,
      data: get_admin_profile,
    });
  } catch (error) {
    console.log(error,'error')
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};


const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refresh_token || req.body.token;
        if (!token) {
            return res.status(401).json({ message: "Refresh token required" });
        }
 
        // 1️⃣ Verify refresh token signature
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
 
        // 2️⃣ Find user
        const user = await SuperAdmin.findOne({
            where: { id: decoded.id },
            include:[
                {
                    model:AdminRole,
                    as:"admin_role",
                    attributes:['id','name']
                }
            ]
        });
        if (!user || !user.refresh_token) {
            return res.status(403).json({ message: "Token revoked" });
        }
 
        // 3️⃣ Reuse detection
        if (user.refresh_token !== token) {
            await user.update({
                refresh_token: null
            });
 
            return res.status(403).json({
                message: "Refresh token reuse detected. Please login again.",
            });
        }
 
        // 4️⃣ Generate new tokens (ROTATION)
      let role_id = user.role_id ? user.role_id : 0;
      const userData = { id: user.id, role_id: role_id,role_type:user.admin_role.name};

      const newAccessToken = jwt.sign(
        userData,
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      // 🔁 REFRESH TOKEN (long)
      const newRefreshToken = jwt.sign(
        userData,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
 
        await user.update({
            refresh_token: newRefreshToken
        });
 
        // 5️⃣ Set cookie
        res.cookie("refresh_token", newRefreshToken, {
            ...refreshCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
 
        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
 
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { first_name, last_name, email, mobile } = req.body;

        if (!first_name) {
            return res.status(400).json({ statusCode: 400, message: "Please provide first name" });
        }

        if (!last_name) {
            return res.status(400).json({ statusCode: 400, message: "Please provide last name" });
        }

        if (!email) {
            return res.status(400).json({ statusCode: 400, message: "Please provide email address" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ statusCode: 400, message: "Please provide a valid email address" });
        }

        if (!mobile) {
            return res.status(400).json({ statusCode: 400, message: "Please provide mobile number" });
        }

        if (!/^\+\d{1,4}\d{7,14}$/.test(mobile)) {
            return res.status(400).json({ statusCode: 400, message: "Please provide a valid mobile number with country code (e.g. +91XXXXXXXXXX)" });
        }

        

        const admin = await SuperAdmin.findOne({ where: { id: adminId, is_deleted: 0 } });

        if (!admin) {
            return res.status(404).json({ statusCode: 404, message: "Admin not found" });
        }

        if (email && email !== admin.email) {
            const existingEmail = await SuperAdmin.findOne({ where: { email, is_deleted: 0, id: { [Op.ne]: adminId } } });
            if (existingEmail) {
                return res.status(400).json({ statusCode: 400, message: "Email already in use" });
            }
        }

        if (mobile && mobile !== admin.mobile) {
            const existingMobile = await SuperAdmin.findOne({ where: { mobile, is_deleted: 0, id: { [Op.ne]: adminId } } });
            if (existingMobile) {
                return res.status(400).json({ statusCode: 400, message: "Mobile number already in use" });
            }
        }

        await admin.update({
            first_name: first_name || admin.first_name,
            last_name: last_name || admin.last_name,
            email: email || admin.email,
            mobile: mobile || admin.mobile,
            updated_by: adminId,
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Profile updated successfully",
            data: {
                id: admin.id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                mobile: admin.mobile,
            },
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password) {
            return res.status(400).json({ statusCode: 400, message: "Please provide current password" });
        }

        if (!new_password) {
            return res.status(400).json({ statusCode: 400, message: "Please provide new password" });
        }

        if (!confirm_password) {
            return res.status(400).json({ statusCode: 400, message: "Please provide confirm password" });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ statusCode: 400, message: "New password and confirm password do not match" });
        }

        const admin = await SuperAdmin.findOne({ where: { id: adminId, is_deleted: 0 } });

        if (!admin) {
            return res.status(404).json({ statusCode: 404, message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(current_password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await admin.update({ password: hashedPassword, updated_by: adminId });

        return res.status(200).json({
            statusCode: 200,
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ statusCode: 400, message: "Please provide email address" });
        }

        const user = await SuperAdmin.findOne({ where: { email, is_deleted: 0 } });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "Email address not found" });
        }

        if (user.is_active == false) {
            return res.status(400).json({ statusCode: 400, message: "Your account is inactive. Please contact Super Admin" });
        }

        const OTP = Math.floor(100000 + Math.random() * 900000);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({ otp: OTP, otp_expires_at: otpExpiresAt });

        await sendMail(email, "Password Reset OTP", "forgot-password", {
            otp: OTP,
            name: user.first_name + " " + user.last_name,
        });

        return res.status(200).json({
            statusCode: 200,
            message: "OTP sent successfully to your email",
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email) {
            return res.status(400).json({ statusCode: 400, message: "Please provide email address" });
        }

        if (!otp) {
            return res.status(400).json({ statusCode: 400, message: "Please provide OTP" });
        }

        const user = await SuperAdmin.findOne({ where: { email, is_deleted: 0 } });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "Email address not found" });
        }

        if (!user.otp) {
            return res.status(400).json({ statusCode: 400, message: "No OTP request found. Please request a new OTP" });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            await user.update({ otp: null, otp_expires_at: null });
            return res.status(400).json({ statusCode: 400, message: "OTP has expired. Please request a new one" });
        }

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ statusCode: 400, message: "Invalid OTP" });
        }

        // Generate a short-lived reset token (5 minutes)
        const resetToken = jwt.sign(
            { id: user.id, purpose: "password_reset" },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "5m" }
        );

        // Store reset token in otp field and clear OTP
        await user.update({ otp: resetToken, otp_expires_at: new Date(Date.now() + 5 * 60 * 1000) });

        return res.status(200).json({
            statusCode: 200,
            message: "OTP verified successfully",
            reset_token: resetToken,
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { reset_token, new_password, confirm_password } = req.body;

        if (!reset_token) {
            return res.status(400).json({ statusCode: 400, message: "Reset token is required" });
        }

        if (!new_password) {
            return res.status(400).json({ statusCode: 400, message: "Please provide new password" });
        }

        if (!confirm_password) {
            return res.status(400).json({ statusCode: 400, message: "Please provide confirm password" });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ statusCode: 400, message: "New password and confirm password do not match" });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(reset_token, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            return res.status(401).json({
                statusCode: 401,
                message: err.name === "TokenExpiredError" ? "Reset token has expired. Please verify OTP again" : "Invalid reset token",
            });
        }

        if (decoded.purpose !== "password_reset") {
            return res.status(401).json({ statusCode: 401, message: "Invalid reset token" });
        }

        const user = await SuperAdmin.findOne({ where: { id: decoded.id, is_deleted: 0 } });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        // Check if reset token matches the one stored in DB (single use)
        if (user.otp !== reset_token) {
            return res.status(401).json({ statusCode: 401, message: "Reset token already used or invalid" });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await user.update({
            password: hashedPassword,
            refresh_token: null,
            otp: null,
            otp_expires_at: null,
        });

        // Clear cookies so old tokens can't be used
        res.clearCookie("access_token", { ...refreshCookieOptions });
        res.clearCookie("refresh_token", { ...refreshCookieOptions });

        return res.status(200).json({
            statusCode: 200,
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const verifyToken = async (req, res) => {
    try {
        let token = req.cookies?.access_token;
        let newAccessToken = null;

        // If access token is missing or expired, try refresh token
        if (!token) {
            const refreshTokenResult = await tryRefreshAccessToken(req, res);
            if (!refreshTokenResult) {
                return res.status(401).json({ statusCode: 401, message: "Access token not found. Please login again." });
            }
            token = refreshTokenResult.accessToken;
            newAccessToken = refreshTokenResult.accessToken;
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                // Access token expired, try refresh token
                const refreshTokenResult = await tryRefreshAccessToken(req, res);
                if (!refreshTokenResult) {
                    return res.status(401).json({ statusCode: 401, message: "Token has expired. Please login again." });
                }
                token = refreshTokenResult.accessToken;
                newAccessToken = refreshTokenResult.accessToken;
                decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            } else {
                return res.status(401).json({ statusCode: 401, message: "Invalid token" });
            }
        }

        const user = await SuperAdmin.findOne({
            where: { id: decoded.id, is_deleted: 0 },
            attributes: ["id", "first_name", "last_name", "email", "is_active"],
            include: [
                {
                    model: AdminRole,
                    as: "admin_role",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!user) {
            return res.status(401).json({ statusCode: 401, message: "User not found" });
        }

        if (user.is_active == false) {
            return res.status(401).json({ statusCode: 401, message: "Account is inactive" });
        }

        const response = {
            statusCode: 200,
            message: "Token is valid",
            data: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role_id: user.admin_role?.id,
                role_name: user.admin_role?.name,
            },
        };

        // Include new access token if it was refreshed
        if (newAccessToken) {
            response.token = newAccessToken;
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Helper: try to refresh using refresh_token cookie (with race condition protection)
const tryRefreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return null;

    // If a refresh is already in progress for this token, wait for it
    if (refreshInProgress.has(refreshToken)) {
        const result = await refreshInProgress.get(refreshToken);
        if (result) {
            res.cookie("access_token", result.accessToken, {
                ...refreshCookieOptions,
                maxAge: 15 * 60 * 1000,
            });
            res.cookie("refresh_token", result.newRefreshToken, {
                ...refreshCookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
        return result ? { accessToken: result.accessToken } : null;
    }

    // Start the refresh and store the promise so concurrent requests can wait
    const refreshPromise = (async () => {
        try {
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            } catch {
                return null;
            }

            const user = await SuperAdmin.findOne({
                where: { id: decoded.id },
                include: [{ model: AdminRole, as: "admin_role", attributes: ["id", "name"] }],
            });

            if (!user || user.refresh_token !== refreshToken) return null;

            const role_id = user.role_id ? user.role_id : 0;
            const userData = { id: user.id, role_id, role_type: user.admin_role.name };

            const newAccessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
            const newRefreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

            await user.update({ refresh_token: newRefreshToken });

            return { accessToken: newAccessToken, newRefreshToken };
        } catch {
            return null;
        }
    })();

    refreshInProgress.set(refreshToken, refreshPromise);

    const result = await refreshPromise;

    // Clean up after a short delay to handle closely-timed requests
    setTimeout(() => refreshInProgress.delete(refreshToken), 5000);

    if (result) {
        res.cookie("access_token", result.accessToken, {
            ...refreshCookieOptions,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refresh_token", result.newRefreshToken, {
            ...refreshCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { accessToken: result.accessToken };
    }

    return null;
};

const logout = async (req, res) => {
    try {
        const token = req.cookies?.refresh_token;
        
       
        if (!token) {
            return res.status(400).json({statusCode: 400,message: "No content"});
        }
 
        const user = await SuperAdmin.findOne({
            where: { refresh_token: token },
        });
 
        if (user) {
            await user.update({
                refresh_token: null,
                otp_expires_at: null,
            });
        }
 
        res.clearCookie("refresh_token", {
            ...refreshCookieOptions
        });

        res.clearCookie("access_token", {
            ...refreshCookieOptions
        });

        return res.status(200).json({statusCode: 200, message: "Logged out successfully" });
 
    } catch (error) {
        return res.status(500).json({statusCode: 500, message: error.message });
    }
};

export default{
    login,getProfile,updateProfile,updatePassword,forgotPassword,verifyOtp,changePassword,verifyToken,logout,refreshToken
}