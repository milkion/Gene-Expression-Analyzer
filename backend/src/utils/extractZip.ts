import { EventEmitter } from 'events';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

export class ZipQueue extends EventEmitter {
    private queue: string[] = [];
    private isProcessing: boolean = false;
    private outputDir = '../public/dragdrop_files/unzipped';

    // Add ZIP file to the queue
    enqueue(zipFilePath: string): void {
        this.queue.push(zipFilePath);
        this.processQueue()
    }

    // Process ZIP files in order
    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const zipFilePath = this.queue.shift() as string;
            console.log(`Processing: ${zipFilePath}`);
            try {
                await this.extractZip(zipFilePath);
            } catch (err) {
                console.error(`ERROR: Error processing ${zipFilePath}:`, err);
            }
        }

        this.isProcessing = false;
        console.log("SUCCESS: All ZIP files processed!");

        // Emit an event when done
        this.emit('COMPLETE');
    }

    // Extract contents of a ZIP file
    private async extractZip(zipFilePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const zip = new AdmZip(zipFilePath);

                if (!fs.existsSync(this.outputDir)) {
                    fs.mkdirSync(this.outputDir, { recursive: true });
                }

                zip.extractAllTo(this.outputDir, true);
                console.log(`SUCCESS: Extracted: ${zipFilePath} to ${this.outputDir}`);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    // Custom event listener for when extraction is complete
    onComplete(callback: () => void) {
        this.on('COMPLETE', callback);
    }
}
