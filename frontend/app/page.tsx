"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { FileDropzone } from "@/components/dropzone";
import { QuickHistory } from "@/components/quick-history";
import { Button } from "@/components/ui/button";
import Protected from "@/components/Protected";
import { FAQAccordion } from "@/components/accordion";
import background from "@/public/background.jpg";

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

				{/* Fixed Background Image - positioned to start after navbar */}
				<div
					className="fixed top-[72px] left-0 right-0 bottom-0 bg-cover bg-center bg-no-repeat animate-pulse-slow"
					style={{ backgroundImage: `url(${background.src})`, zIndex: -1 }}
				/>

				{/* Content Container */}
				<div className="relative z-10">
					{/* Glassmorphism Card */}
					<div className="mx-20 mt-16 mb-8">
						<div className="backdrop-blur-md bg-white/50 p-12 rounded-3xl border border-white/40 shadow-xl">
							<p className="text-gray-700 mb-4 animate-slide-up">
								Welcome to BioGeneX.
							</p>
							<h1 className="text-6xl font-normal leading-tight mb-4 max-w-4xl animate-slide-up delay-100">
								We analyze genomic data for breakthrough research and medical
								insights.
							</h1>

							<p className="text-lg text-gray-800 max-w-2xl mb-12 animate-slide-up delay-200">
								Upload your genomic data files below to begin analysis. Our
								platform provides comprehensive differential expression analysis
								and visualization tools.
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
					</div>
				</div>

				{/* Add an ID to the dropzone container for scrolling */}
				<div id="file-dropzone">
					<FileDropzone />
				</div>
				<QuickHistory />

				{/* Instructions Section */}
				<div id="instructions" className="px-20 py-16">
					<div className="backdrop-blur-md bg-white/60 p-8 rounded-3xl border border-white/40 shadow-xl">
						<h2 className="text-2xl font-medium my-4 ml-4">
							Instructions & FAQ
						</h2>
						<FAQAccordion />
					</div>
				</div>
			</div>
		</Protected>
	);
}
