import fs from 'fs';
import csv from "csv-parser";

const readCSVFile = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = '/Users/rin/Desktop/R-code/significantGenes.csv';
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
};

const formatGeneData = (csvData) => {
    return csvData.map((row, index) => ({
        id: index + 1,
        symbol: row.symbol,
        logFC: parseFloat(row.logFC),
        AveExpr: parseFloat(row.AveExpr),
        t: parseFloat(row.t),
        PValue: parseFloat(row.PValue),
        adjPValue: parseFloat(row.adjPValue),
        B: parseFloat(row.B),
    }));
};

export const resolvers = {
    Query: {
        genes: async () => {
            console.log("📂 Fetching genes from CSV...");
            const rawData = await readCSVFile();
            return formatGeneData(rawData);
        },
    },
};

