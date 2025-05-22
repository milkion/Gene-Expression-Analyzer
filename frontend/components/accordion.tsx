"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full space-y-4">
			<AccordionItem value="what-is" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					What is BioGeneX?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700">
						BioGeneX is a powerful genomic analysis platform designed for
						researchers and medical professionals. It provides automated
						differential expression analysis for gene expression data, offering
						comprehensive statistical analysis and visualization tools to help
						understand genetic patterns and relationships.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="how-to-use" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					How do I use BioGeneX?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<ol className="list-decimal ml-6 space-y-3 text-lg text-gray-700">
						<li>
							Prepare your data files (<code className="bg-gray-100 px-1 rounded">expression_data.csv</code> and <code className="bg-gray-100 px-1 rounded">phenotype_data.csv</code>) following the format requirements
						</li>
						<li>Compress both files into a ZIP archive</li>
						<li>Upload your ZIP file using the dropzone above</li>
						<li>Provide a name and optional description for your dataset</li>
						<li>Wait for the analysis to complete (this may take a few minutes)</li>
						<li>
							View your results in the detailed report, including:
							<ul className="list-disc ml-8 mt-3 space-y-2">
								<li>Statistical analysis of differentially expressed genes</li>
								<li>Interactive volcano plot visualization</li>
								<li>Downloadable result tables</li>
								<li>Links to external gene databases</li>
							</ul>
						</li>
					</ol>
					<p className="text-lg italic mt-4 text-gray-600">
						Note: Reports with "ANALYZING" status are still being processed. Reports with "FAILED" status encountered an error during analysis and will show error details.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="file-format" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					What file format is supported?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						BioGeneX accepts ZIP files containing these <strong>exact filename</strong> CSV files:
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-lg mb-2">1. expression_data.csv</h3>
							<ul className="list-disc ml-6 space-y-2 text-lg text-gray-700">
								<li><strong>Filename must be exact:</strong> <code className="bg-gray-100 px-1 rounded">expression_data.csv</code></li>
								<li>First column: Probe/gene identifiers</li>
								<li>Remaining columns: Expression values for each sample</li>
								<li>Numeric values for expression measurements</li>
							</ul>
						</div>

						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-lg mb-2">2. phenotype_data.csv</h3>
							<ul className="list-disc ml-6 space-y-2 text-lg text-gray-700">
								<li><strong>Filename must be exact:</strong> <code className="bg-gray-100 px-1 rounded">phenotype_data.csv</code></li>
								<li>Must include a <code className="bg-gray-100 px-1 rounded">title</code> column</li>
								<li><strong>Important:</strong> At least some samples <em>must</em> have "control" in their title</li>
								<li>Samples with "control" in the title (case-insensitive) are treated as controls</li>
								<li>All other samples are treated as diseased/experimental</li>
							</ul>
						</div>
					</div>

					<div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-6">
						<p className="text-lg leading-relaxed text-amber-800">
							<strong>Note:</strong> The analysis will fail if the files are not named exactly as specified or if no control samples are identified.
						</p>
					</div>

					<p className="text-lg leading-relaxed text-gray-700 mt-4">
						Both files should be bundled in a ZIP archive (max size: 10MB) for upload.
					</p>
					<div className="mt-4">
						<a
							href="/SampleDataset/sample_dataset.zip"
							download
							className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
						>
							Download Sample Dataset
						</a>
					</div>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="analysis-details" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					What analysis is performed?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						Our platform performs comprehensive differential expression analysis using
						<strong> Limma (Linear Models for Microarray and RNA-Seq Data)</strong>, a powerful statistical
						package designed specifically for gene expression analysis.
					</p>
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						Limma employs sophisticated <strong>linear modeling techniques</strong> to identify <strong>differentially
							expressed genes</strong> between experimental conditions. The analysis calculates <strong>log fold
								changes</strong> to measure expression differences, performs rigorous <strong>statistical significance
									testing</strong>, and applies <strong>multiple testing correction</strong> to control <strong>false discovery rates</strong>.
						Our implementation also generates intuitive <strong>visualizations</strong> of expression patterns and
						provides an <strong>interactive interface</strong> for exploring results in depth.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="results" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					How do I interpret the results?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						Results are presented in an interactive table showing:
					</p>
					<ul className="list-disc ml-8 space-y-2 text-lg text-gray-700">
						<li>Log Fold Change (logFC): Measure of expression difference</li>
						<li>P-value: Statistical significance</li>
						<li>Adjusted p-value: Corrected for multiple testing</li>
						<li>Average Expression: Mean expression level</li>
						<li>Interactive visualizations for pattern analysis</li>
					</ul>
					<p className="text-lg leading-relaxed text-gray-700 mt-3">
						Click on any gene symbol to access additional information from
						external databases.
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
