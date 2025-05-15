import React from "react";

interface AnalysisInformationProps {
	analysis: {
		id: string;
		status: string;
		logThreshold?: number;
		pThreshold?: number;
		dataset: {
			name: string;
			description: string | null;
		};
		createdAt: string;
		updatedAt: string;
	};
}

export const AnalysisInformation: React.FC<AnalysisInformationProps> = ({
	analysis,
}) => {
	return (
		<div className="mt-6">
			<h2 className="font-medium m-4">Analysis Information</h2>

			<div className="bg-gray-100 rounded-2xl p-6 my-6">
				<div className="grid grid-cols-2 gap-6">
					<div>
						<div className="grid grid-cols-[150px_1fr] gap-y-4 font-medium">
							<div>DATASET NAME:</div>
							<div>{analysis.dataset.name}</div>
							<div>ANALYSIS ID:</div>
							<div>{analysis.id}</div>
							<div>KEYWORDS:</div>
							<div>{analysis.dataset.description || "-"}</div>
							<div>LOG VALUE:</div>
							<div>{analysis.logThreshold || 1}</div>
						</div>
					</div>

					<div>
						<div className="grid grid-cols-[150px_1fr] gap-y-4 font-medium">
							<div>CREATED AT:</div>
							<div>
								{new Date(parseInt(analysis.createdAt)).toLocaleString()}
							</div>
							<div>UPDATED AT:</div>
							<div>
								{new Date(parseInt(analysis.updatedAt)).toLocaleString()}
							</div>
							<div>RESULTS:</div>
							<div>{analysis.status}</div>
							<div>P-VALUE:</div>
							<div>{analysis.pThreshold || 0.05}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
