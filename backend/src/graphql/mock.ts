const AnalysisStatus = {
	FETCHING: "FETCHING",
	PARSING: "PARSING",
	ANALYZING: "ANALYZING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
};

const mockDataset = {
	id: 1,
	name: "Dataset 1",
	description: "A mock dataset in test",
	uploadedAt: new Date(),
	size: 1000,
};

const mockGenes = [
	{
		id: "ILMN_1812281",
		symbol: "ARG1",
		description: "Arginase 1",
		function: "Catalyzes the hydrolysis of arginine to ornithine and urea",
		pathway: "Arginine metabolism",
	},
	{
		id: "ILMN_1803819",
		symbol: "ICAM1",
		description: "Intercellular Adhesion Molecule 1",
		function: "Cell adhesion and inflammatory responses",
		pathway: "Cell adhesion",
	},
	{
		id: "ILMN_1790689",
		symbol: "CRISPL2",
		description: "Cysteine Rich Secretory Protein LCCL Domain Containing 2",
		function: "Protein coding gene",
		pathway: "Unknown",
	},
];

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
