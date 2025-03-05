export const typeDefs = `
	type Query {
        genes: [Gene]
	}

	type Mutation {
		uploadFile: Boolean!
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
        logFC: Float!
        AveExpr: Float!
        t: Float!
        PValue: Float!
        adjPValue: Float!
        B: Float!
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
