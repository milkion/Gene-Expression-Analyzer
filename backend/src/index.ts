import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

// Initialize Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const PORT = 4000;

mongoose
	.connect(MONGODB_URI)
	.then(async () => {
		console.log("Connected to MongoDB");
		const { url } = await startStandaloneServer(server, {
			listen: { port: PORT },
		});
		console.log(`🚀 Server ready at ${url}`);
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});
