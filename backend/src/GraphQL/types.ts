export const typeDefs = `
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
		logFC: Float
		AveExpr: Float
		t: Float
		PValue: Float
		adjPValue: Float
		B: Float
		_row: String
	}

	type Dataset {
		id: ID!
		name: String
		description: String
		uploadedAt: String!
		size: Int!
	}

	input GeneExpressionInput {
		symbol: String!
		logFC: Float!
		AveExpr: Float!
		t: Float!
		PValue: Float!
		adjPValue: Float!
		B: Float!
		_row: String
	}

	type Mutation {
		insertGeneExpressions(data: [GeneExpressionInput]!): [Gene]  
	}

	enum AnalysisStatus {
		FETCHING
		PARSING
		ANALYZING
		COMPLETED
		FAILED
	}
`;
