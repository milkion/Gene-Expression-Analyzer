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
                    id: 100, // Generate unique ID
                    symbol: gene.symbol,
                    logFC: gene.logFC, // Add logFC from the input data
                    AveExpr: gene.AveExpr, // Add AveExpr from the input data
                    t: gene.t, // Add t from the input data
                    PValue: gene.PValue, // Add PValue from the input data
                    adjPValue: gene.adjPValue, // Add adjPValue from the input data
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
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus[AnalysisStatus["FETCHING"] = 0] = "FETCHING";
    AnalysisStatus[AnalysisStatus["PARSING"] = 1] = "PARSING";
    AnalysisStatus[AnalysisStatus["ANALYZING"] = 2] = "ANALYZING";
    AnalysisStatus[AnalysisStatus["COMPLETED"] = 3] = "COMPLETED";
    AnalysisStatus[AnalysisStatus["FAILED"] = 4] = "FAILED";
})(AnalysisStatus || (AnalysisStatus = {}));
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
