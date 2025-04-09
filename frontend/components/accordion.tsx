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
							Upload your gene expression data file (.txt.gz format) using the
							dropzone above
						</li>
						<li>Provide a name and optional description for your dataset</li>
						<li>Wait for the analysis to complete</li>
						<li>
							View your results in the detailed report, including:
							<ul className="list-disc ml-8 mt-3 space-y-2">
								<li>Statistical analysis of gene expression</li>
								<li>Interactive visualizations</li>
								<li>Links to external gene databases</li>
							</ul>
						</li>
					</ol>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="file-format" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					What file format is supported?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						BioGeneX accepts compressed text files (.txt.gz) containing
						normalized gene expression data. The file should be structured with:
					</p>
					<ul className="list-disc ml-8 space-y-2 text-lg text-gray-700">
						<li>Genes as rows</li>
						<li>Samples as columns</li>
						<li>Tab-separated values</li>
						<li>Maximum file size: 10MB</li>
					</ul>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="analysis-details" className="border-b-0">
				<AccordionTrigger className="hover:no-underline hover:rounded-xl px-4 py-4 text-xl font-medium">
					What analysis is performed?
				</AccordionTrigger>
				<AccordionContent className="px-4 py-2">
					<p className="text-lg leading-relaxed text-gray-700 mb-3">
						Our platform performs comprehensive differential expression analysis using 
                        <strong>Limma (Linear Models for Microarray and RNA-Seq Data)</strong>, a powerful statistical 
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
