import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3800;

const app = express();
const server = http.createServer(app);


// ======================
// 🔥 GLOBAL CORS FIX
// ======================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // mobile apps / postman

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// IMPORTANT: handle preflight globally



// ======================
// MIDDLEWARE (after CORS)
// ======================

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server/views"));


// ======================
// BASE ROUTE
// ======================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the Backend",
    });
});


// ======================
// ROUTERS
// ======================
import routers from "./server/routes/routes.js";

const APIRouter = express.Router();

APIRouter.get("/", (req, res) => {
    res.json({ message: "api is working !!" });
});
app.use("/api/v1", APIRouter);
APIRouter.use("/admin",routers.superAdminRoute)






// ======================
// START SERVER
// ======================
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
