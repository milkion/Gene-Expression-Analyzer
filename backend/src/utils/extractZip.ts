import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ZipExtractor {
    constructor() {
        const projectRoot = path.resolve(__dirname, '../../..');
        const outputDir = path.join(projectRoot, 'public/dragdrop_files/unzipped');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    async extract(zipFilePath: string): Promise<void> {
        try {
            const zip = new AdmZip(zipFilePath);
            const projectRoot = path.resolve(__dirname, '../../..');
            const outputDir = path.join(projectRoot, 'public/dragdrop_files/unzipped');

            // Clear previous contents (optional but useful)
            fs.readdirSync(outputDir).forEach(file => {
                fs.rmSync(path.join(outputDir, file), { recursive: true, force: true });
            });

            // Manually extract each file (flattening folders)
            zip.getEntries().forEach(entry => {
                if (!entry.isDirectory) {
                    const fileName = path.basename(entry.entryName); // just the filename
                    const outputPath = path.join(outputDir, fileName);
                    fs.writeFileSync(outputPath, entry.getData());
                    console.log(`Extracted: ${fileName}`);
                }
            });

            console.log(`SUCCESS: Extracted ${zipFilePath} to ${outputDir} (flattened)`);
        } catch (err) {
            console.error(`FAILED: Error extracting ${zipFilePath}:`, err);
            throw err;
        }
    }
}
