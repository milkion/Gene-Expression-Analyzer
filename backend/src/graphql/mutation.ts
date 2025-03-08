import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client/core/index.js";
import fetch from "cross-fetch";

const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost:4000/graphql", fetch }),
    cache: new InMemoryCache(),
});

const UPDATE_ANALYSIS_MUTATION = gql`
    mutation updateAnalysisWithResults($id: ID!, $results: AnalysisResultInput!) {
    updateAnalysisWithResults(id: $id, results: $results) {
      id
      result {
        results {
          gene {
            symbol
            description
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

export async function updateAnalysis(id, results) {
    try {

        console.log("Received data in updateAnalysis:", JSON.stringify(results, null, 2));

        const response = await client.mutate({
            mutation: UPDATE_ANALYSIS_MUTATION,
            variables: { id, results },
        });

        console.log("Mutation Response:", JSON.stringify(response, null, 2));
        return response.data.updateAnalysisWithResults;
    } catch (error) {
        console.error("GraphQL Errors:", error.graphQLErrors);
        console.error("Network Errors:", error.networkError);
        console.error("Full Error Object:", error);
    }
}
