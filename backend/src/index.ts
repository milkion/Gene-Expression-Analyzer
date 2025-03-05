import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./GraphQL/types.js";
import { resolvers } from "./GraphQL/resolvers.js";

const PORT = 4000;

// Create and start the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// ✅ Start Apollo Server using `startStandaloneServer`
async function startServer() {
	const { url } = await startStandaloneServer(server, {
		listen: { port: PORT },
	});
	console.log(`🚀 Server ready at ${url}`);
}

startServer();