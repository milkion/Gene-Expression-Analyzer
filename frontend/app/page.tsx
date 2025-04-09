"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { FileDropzone } from "@/components/dropzone";
import { QuickHistory } from "@/components/quick-history";
import { Button } from "@/components/ui/button";
import Protected from "@/components/Protected";
import { FAQAccordion } from "@/components/accordion";

export default function Home() {
	const scrollToDropzone = () => {
		const dropzoneElement = document.getElementById("file-dropzone");
		if (dropzoneElement) {
			dropzoneElement.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	};

	const scrollToInstructions = () => {
		const instructionsElement = document.getElementById("instructions");
		if (instructionsElement) {
			instructionsElement.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	return (
		<Protected>
			<div>
				<NavigationBar />

				{/* Hero Section */}
				<div className="px-20 py-32">
					<p className="text-gray-400 mb-4 animate-slide-up">
						Welcome to BioGeneX.
					</p>
					<h1 className="text-6xl font-normal leading-tight mb-4 max-w-4xl animate-slide-up delay-100">
						We analyze genomic data for breakthrough research and medical
						insights.
					</h1>

					{/* Optional subtitle or CTA */}
					<p className="text-lg text-gray-600 max-w-2xl mb-12 animate-slide-up delay-200">
						Upload your genomic data files below to begin analysis. Our platform
						provides comprehensive differential expression analysis and
						visualization tools.
					</p>

					{/* Buttons Container */}
					<div className="flex gap-4 animate-slide-up delay-300">
						<Button
							onClick={scrollToDropzone}
							className="text-lg px-8 py-6 bg-black hover:bg-gray-800 text-white rounded-full transition-colors"
						>
							Let's get started
						</Button>

						<Button
							onClick={scrollToInstructions}
							variant="outline"
							className="text-lg px-8 py-6 rounded-full text-gray-500 border-gray-300 hover:bg-gray-100 transition-colors"
						>
							Instructions
						</Button>
					</div>
				</div>

				{/* Add an ID to the dropzone container for scrolling */}
				<div id="file-dropzone">
					<FileDropzone />
				</div>
				<QuickHistory />

				{/* Instructions Section */}
				<div id="instructions" className="px-20 py-16">
					<h2 className="text-2xl font-medium mb-4">Instructions & FAQ</h2>
					<div className="bg-gray-50 rounded-3xl p-8">
						<FAQAccordion />
					</div>
				</div>
			</div>
		</Protected>
	);
}
