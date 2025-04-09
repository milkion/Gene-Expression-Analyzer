import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

// Ensure upload directory exists
const projectRoot = path.resolve(__dirname, '../../..'); // Going up from dist/utils to the project root

// Resolve the dragdropDir relative to the project root
const uploadDir = path.join(projectRoot, 'public/dragdrop_files');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Upload directory created:", uploadDir);
}

// Configure multer to preserve the original filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Destination Path:", uploadDir); // Debug path
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const safeFilename = path.basename(file.originalname);
        console.log("Original Filename:", safeFilename); // Debug filename
        cb(null, safeFilename);
    },
});

const upload = multer({ storage });

// Upload route
app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file);
    res.json({
        message: "File uploaded successfully",
        file: req.file,
    });

    console.log(req.file.originalname, " CHECKING!")
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/api/*`));
