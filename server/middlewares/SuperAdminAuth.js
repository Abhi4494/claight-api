import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "../models/index.js";


dotenv.config();

const { SuperAdmin,AdminRole } = db;

const adminAuth = async (req, res, next) => {
  try {

    const authHeader = req.header("Authorization");
    let token = req.cookies?.access_token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim();
    }

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "Access token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // check user
    const existUser = await SuperAdmin.findByPk(decoded.id, {
      attributes: ["id", "first_name", "last_name", "email", "mobile"],
      include:[
        {model:AdminRole,as:"admin_role",attributes:['id','name']}
      ]
    });

    if (!existUser) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid token: user not found",
      });
    }

    req.user = existUser;

    next();

  } catch (err) {
    
    return res.status(401).json({
      statusCode: 401,
      message:
        err.name === "JsonWebTokenError"
          ? "Invalid token"
          : err.message || "Authentication failed",
    });

  }
};

export default adminAuth;