import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { ResponseData } from "./graphql/resolvers.js";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authenticateUser } from "./models/middleware/authMiddleware.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { processAnalysis } from "./api/processAnalysis.js";
import path from "path";
import multer, { Multer } from "multer";// Export runR for external use
export { runR } from "./utils/rScriptRunner.js";
import jwt from "jsonwebtoken";


dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "../public/dragdrop_files");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

// Initialize Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const PORT = 4000;

// Multer setup for file uploads
const upload: Multer = multer({ storage });

// Extend Express namespace for multer's file
declare global {
	namespace Express {
		interface Request {
			file?: {
				fieldname: string;
				originalname: string;
				encoding: string;
				mimetype: string;
				buffer: Buffer;
				size: number;
			}; // For upload.single()
		}
	}
}

async function startServer() {
	// Connect to MongoDB
	await mongoose.connect(MONGODB_URI);
	console.log("Connected to MongoDB");

	// Start Apollo Server
	await server.start();

	// Create Express app
	const app = express();

	// Apply middleware
	app.use(cors());
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ limit: '50mb', extended: true }));

	// GraphQL endpoint
	app.use('/graphql', expressMiddleware(server, {
		context: async ({ req }) => {
			const auth = req.headers.authorization || '';
			if (auth.startsWith('Bearer ')) {
				try {
					const token = auth.substring(7);
					const decoded = jwt.verify(token, process.env.JWT_SECRET);
					return { userId: decoded.userId };
				} catch (err) {
					console.log("Invalid token:", err);
				}
			}
			return {};
		},
	}));

	// API endpoint for analysis
	app.post('/api/process-analysis', processAnalysis);

	// API endpoint for file upload
	app.post('/api/upload', upload.single("file"), (req: Request, res: Response) => {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}
		console.log("Uploaded file:", req.file);
		res.json({ message: "File uploaded successfully", file: req.file });
	});

	// Start the server
	app.listen(PORT, () => {
		console.log(`SUCCESS: Server ready at http://localhost:${PORT}/graphql`);
		console.log(`SUCCESS: API endpoints available at http://localhost:${PORT}/api/*`);
	});
}

startServer().catch((error) => {
	console.error("Error starting server:", error);
});