// Schema - structure of the data
import { gql } from "apollo-server";

const typeDefs = gql`
	type Query {
		# Gets the current user
		me: User!

		# Gets user by ID
		user(id: ID!): User!

		# Gets a list of analyses
		getAnalyses: [Analysis!]!

		# Gets a single analysis by ID
		analysis(id: ID!): Analysis!
	}

	type Mutation {
		# Creates a new user
		createUser(userInput: UserInput): AuthPayload!

		# Creates a new analysis
		createAnalysis(datasetInput: DatasetInput): Analysis!

		# Update an analysis with results
		updateAnalysisWithResults(id: ID!, results: AnalysisResultInput): Analysis!

		# Deletes an analysis by ID
		deleteAnalysis(id: ID!): Boolean!

		# Logs in a user and returns a token
		login(email: String!, password: String!): AuthPayload!

	}

	type User {
		id: ID!
		name: String!
		email: String!
		createdAt: String!
		# Password is NOT included in API responses for security reasons
	}


	"""
	AuthPayload - the response from a login request.
	Includes a token for authentication.
	"""
	type AuthPayload {
		token: String!
		user: User!
	}

	"""
	Analysis - created when we want to start processing a dataset.
	Since results are not generated immediately, we will make result
	null, and have type analysisResult handle that.
	"""
	type Analysis {
		id: ID!
		date: String!
		status: AnalysisStatus!
		dataset: Dataset!
		result: AnalysisResult
	}

	"""
	AnalysisResult - the result of an analysis, which is generated
	after the analysis is completed through mutation.
	"""
	type AnalysisResult {
		results: [Result!]!
		visualization: String
	}

	"""
	Result - the result of an analysis (one row of data in the table generated)
	"""
	type Result {
		id: ID!
		gene: Gene!
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



	"""
	Dataset - the GEO dataset that we want to process, either through
	self import or searched (through API)
	"""
	type Dataset {
		id: ID!
		name: String
		description: String
		uploadedAt: String!
		size: Int!
	}

	"""
	DatasetInput - the input for creating a new dataset, used in
	createAnalysis mutation.
	"""
	input DatasetInput {
		name: String!
		description: String
	}

	input AnalysisResultInput {
		results: [ResultInput!]!
		visualization: String
	}

	input ResultInput {
		gene: GeneInput!
		logFC: Float!
		avgExpr: Float!
		tValue: Float!
		pValue: Float!
		adjustedPValue: Float!
		bStat: Float!
	}

	input GeneInput {
		symbol: String!
		description: String
	}
	

	input UserInput {
		name: String!
		email: String!
		password: String!
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
export { typeDefs };
