import { useRef, useEffect, useState } from "react";
const html2pdf = (await import("html2pdf.js")).default;

export function useDownloadPDF(analysisId: string) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleDownloadPDF = async () => {
        if (reportRef.current) {
            const opt = {
                margin: [20, 20, 20, 20], // top, left, bottom, right in pt
                filename: `report-${analysisId}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                },
                jsPDF: {
                    unit: 'pt',
                    format: 'a3',
                    orientation: 'landscape',
                },
            };

            await html2pdf().set(opt).from(reportRef.current).save();
        }
    };

    return { reportRef, handleDownloadPDF };
}
