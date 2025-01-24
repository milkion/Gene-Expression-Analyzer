import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// Schema - structure of the data
const typeDefs = `
	type Query {
		analyses: [Analysis!]!
	}

	type User {
		id: ID!
		name: String!
		email: String!
		createdAt: String!
	}

	type Analysis {
		id: ID!
		date: String!
		status: AnalysisStatus!
		dataset: Dataset!
		results: [Result!]!
		visualization: String
	}

	type Result {
		gene: Gene!
		analysis: Analysis!
		logFC: Float!
		avgExpr: Float!
		tValue: Float!
		pValue: Float!
		adjustedPValue: Float!
		bStat: Float!
	}

	type Gene {
		id: ID!
		symbol: String!
		description: String
		function: String
		pathway: String
	}

	type Dataset {
		id: ID!
		name: String
		description: String
		uploadedAt: String!
		size: Int!
	}

	enum AnalysisStatus {
		FETCHING
		PARSING
		ANALYZING
		COMPLETED
		FAILED
	}
`;

// Mock data generation (for frontend development)

enum AnalysisStatus {
	FETCHING,
	PARSING,
	ANALYZING,
	COMPLETED,
	FAILED,
}

const mockDataset = {
	id: 1,
	name: "Dataset 1",
	description: "A mock dataset in test",
	uploadedAt: new Date(),
	size: 1000,
};

const mockGenes = [
	{
		id: "ILMN_1812281",
		symbol: "ARG1",
		description: "Arginase 1",
		function: "Catalyzes the hydrolysis of arginine to ornithine and urea",
		pathway: "Arginine metabolism",
	},
	{
		id: "ILMN_1803819",
		symbol: "ICAM1",
		description: "Intercellular Adhesion Molecule 1",
		function: "Cell adhesion and inflammatory responses",
		pathway: "Cell adhesion",
	},
	{
		id: "ILMN_1790689",
		symbol: "CRISPL2",
		description: "Cysteine Rich Secretory Protein LCCL Domain Containing 2",
		function: "Protein coding gene",
		pathway: "Unknown",
	},
];

const analyses = [
	{
		id: 1,
		date: new Date(),
		status: AnalysisStatus.FETCHING,
		dataset: mockDataset,
		results: mockGenes,
		visualization: "./visualization.png",
	},
];

// Tell Apollo server how we should fetch data associated with each type
const resolvers = {
	Query: {
		analyses: () => analyses,
	},
};

// Initialize Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);
