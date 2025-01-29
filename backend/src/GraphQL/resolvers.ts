import { mockDataset, mockGenes } from "./mock.js";
// Tell Apollo server how we should fetch data associated with each type
export const resolvers = {
    Query: {
        analyses: () => analyses,
    },
    Mutation: {
        insertGeneExpressions: (parent, { data }) => {
            const gene_received = data.map(gene => {
                const newGene = {
                    id: 100,  // Generate unique ID
                    symbol: gene.symbol,
                    logFC: gene.logFC,  // Add logFC from the input data
                    AveExpr: gene.AveExpr,  // Add AveExpr from the input data
                    t: gene.t,  // Add t from the input data
                    PValue: gene.PValue,  // Add PValue from the input data
                    adjPValue: gene.adjPValue,  // Add adjPValue from the input data
                    B: gene.B,
                    _row: gene._row
                };
                return newGene;
            });

            console.log("Received gene expressions:", gene_received);

            return gene_received;
        }
    }
};


enum AnalysisStatus {
    FETCHING,
    PARSING,
    ANALYZING,
    COMPLETED,
    FAILED,
}


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

