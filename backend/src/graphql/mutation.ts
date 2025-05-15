import {
	ApolloClient,
	InMemoryCache,
	gql,
	HttpLink,
} from "@apollo/client/core/index.js";
import fetch from "cross-fetch";

export const client = new ApolloClient({
	link: new HttpLink({ uri: "http://localhost:4000/graphql", fetch }),
	cache: new InMemoryCache(),
});

const UPDATE_ANALYSIS_MUTATION = gql`
	mutation updateAnalysisWithResults($id: ID!, $results: AnalysisResultInput!) {
		updateAnalysisWithResults(id: $id, results: $results) {
			id
			result {
				results {
					id
					gene {
						id
						symbol
					}
					logFC
					avgExpr
					tValue
					pValue
					adjustedPValue
					bStat
				}
			}
		}
	}
`;

const CREATE_ANALYSIS_MUTATION = gql`
	mutation CreateAnalysis($input: AnalysisInput!) {
		createAnalysis(input: $input) {
			id
			date
			status
			logThreshold
			pThreshold
			dataset {
				id
				name
				description
				uploadedAt
				size
			}
		}
	}
`;

export async function updateAnalysis(id, results) {
	try {
		console.log(
			"Received data in updateAnalysis:",
			JSON.stringify(results, null, 2)
		);

		const response = await client.mutate({
			mutation: UPDATE_ANALYSIS_MUTATION,
			variables: { id, results },
		});

		return response.data.updateAnalysisWithResults;
	} catch (error) {
		console.error("GraphQL Errors:", error.graphQLErrors);
		console.error("Network Errors:", error.networkError);
		console.error("Full Error Object:", error);
	}
}

export async function createAnalysis(input) {
	try {
		console.log(
			"Creating analysis with input:",
			JSON.stringify(input, null, 2)
		);

		const response = await client.mutate({
			mutation: CREATE_ANALYSIS_MUTATION,
			variables: { input },
		});

		return response.data.createAnalysis;
	} catch (error) {
		console.error("GraphQL Errors:", error.graphQLErrors);
		console.error("Network Errors:", error.networkError);
		console.error("Full Error Object:", error);
		throw error; // Re-throw the error for the caller to handle
	}
}
