import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { ResponseData } from "./graphql/resolvers.js";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authenticateUser } from "./models/middleware/authMiddleware.js";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { processAnalysis } from "./api/processAnalysis.js";
// Export the runR function so it can be used in other files
export { runR } from "./utils/rScriptRunner.js";
import jwt from "jsonwebtoken";


dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

// Initialize Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const PORT = 4000;

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
	app.use(express.json());
	
	// Set up GraphQL endpoint
	app.use('/graphql', expressMiddleware(server, {
		context: async ({ req }) => {
			// Get the token from the Authorization header
			const auth = req.headers.authorization || '';
			
			if (auth.startsWith('Bearer ')) {
				try {
					const token = auth.substring(7);
					const decoded = jwt.verify(token, process.env.JWT_SECRET);
					return { userId: decoded.userId };
				} catch (err) {
					// Invalid token
					console.log("Invalid token:", err);
				}
			}
			
			// Return empty context if no valid auth
			return {};
		},
	}));
	
	// Set up API endpoints
	app.post('/api/process-analysis', processAnalysis);
	
	// Start the server
	app.listen(PORT, () => {
		console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
		console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
	});
}

startServer().catch((error) => {
	console.error("Error starting server:", error);
});



