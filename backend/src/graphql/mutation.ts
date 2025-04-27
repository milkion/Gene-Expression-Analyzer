import {
	ApolloClient,
	InMemoryCache,
	gql,
	HttpLink,
} from "@apollo/client/core/index.js";
import fetch from "cross-fetch";
import { setContext } from "@apollo/client/link/context/index.js";

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
	mutation CreateAnalysis($datasetInput: DatasetInput) {
		createAnalysis(datasetInput: $datasetInput) {
			id
			date
			status
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

// Helper to create an Apollo client with a token
function getClient(token) {
	const httpLink = new HttpLink({
		uri: "http://localhost:4000/graphql",
		fetch,
	});
	const authLink = setContext((_, { headers }) => ({
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	}));
	return new ApolloClient({
		link: authLink.concat(httpLink),
		cache: new InMemoryCache(),
	});
}

export async function updateAnalysis(id, results, token) {
	try {
		console.log(
			"Received data in updateAnalysis:",
			JSON.stringify(results, null, 2)
		);

		const client = getClient(token);

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

export async function createAnalysis(datasetInput) {
	try {
		// Get the token from localStorage
		const token = localStorage.getItem("token");
		
		console.log("Token in createAnalysis:", localStorage.getItem("token"));
		
		// Use the authenticated client
		const client = getClient(token);
		
		const response = await client.mutate({
			mutation: CREATE_ANALYSIS_MUTATION,
			variables: { datasetInput },
		});
		
		return response.data.createAnalysis;
	} catch (error) {
		console.error("GraphQL Errors:", error.graphQLErrors);
		console.error("Network Errors:", error.networkError);
		console.error("Full Error Object:", error);
		throw error; // Re-throw to handle in the component
	}
}
