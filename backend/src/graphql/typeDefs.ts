// Schema - structure of the data
import { gql } from "apollo-server";

const typeDefs = gql`
	type Query {
		# Gets a list of analyses
		getAnalyses: [Analysis!]!

		# Gets a single analysis by ID
		analysis(id: ID!): Analysis!
	}

	type Mutation {
		# Creates a new analysis
		createAnalysis(datasetInput: DatasetInput): Analysis!

		# Deletes an analysis by ID
		deleteAnalysis(id: ID!): Boolean!
	}

	type User {
		id: ID!
		name: String!
		email: String!
		createdAt: String!
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
