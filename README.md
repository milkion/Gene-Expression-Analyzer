# GeneScope — Differential Gene Expression Analysis Platform

A full-stack web application for running differential gene expression analyses on GEO microarray datasets, built as the Final Year Project for **FIT3162** at Monash University.

Users upload (or fetch) a GEO Series dataset, configure log fold-change and p-value thresholds, and the platform runs a Bioconductor pipeline in R to produce a table of significant genes, a volcano plot, an expression histogram, and a downloadable PDF report. Each analysis is saved per-user, browseable in a forum, and explorable through an interactive results UI with Wikipedia gene metadata and a 3D visualisation.

## Features

- **Drag-and-drop dataset upload** for GEO Series matrix files (`.txt.gz`), with the bundled GSE16561 stroke dataset as a worked example
- **Differential expression pipeline in R** using `limma`, `DESeq2`, `GEOquery`, `illuminaHumanv4.db`, `org.Hs.eg.db`, and `biomaRt` for probe-to-gene annotation
- **Configurable thresholds** — set log fold-change and p-value cutoffs per analysis
- **Results dashboard** — sortable table of significant genes with logFC, average expression, t-statistic, p-value, adjusted p-value, and B-statistic
- **Auto-generated visualisations** — volcano plot and expression histogram exported as PDF
- **PDF report download** for each completed analysis
- **Wikipedia integration** — pulls gene background straight into the report view
- **Discussion forum** — post about analyses, comment, share results
- **User accounts** — JWT auth, bcrypt password hashing, persistent analysis history per user
- **3D visualisation** via `react-three-fiber` and `@react-three/drei`

## Tech Stack

| Layer | Stack |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Apollo Client, react-dropzone, react-three-fiber, NextAuth |
| **Backend** | Node.js, TypeScript, Apollo Server 4, Express, GraphQL, Multer (uploads), JWT, bcrypt |
| **Analysis Engine** | R + Bioconductor (`GEOquery`, `limma`, `DESeq2`, `illuminaHumanv4.db`, `org.Hs.eg.db`, `AnnotationDbi`, `biomaRt`, `ggplot2`, `ggrepel`) |
| **Database** | MongoDB (via Mongoose) |
| **Architecture** | GraphQL API (`/graphql`) + REST endpoints (`/api/upload`, `/api/process-analysis`, `/api/geneCache`); R scripts invoked from Node via a script runner |

## Repository Structure

```
├── backend/                          # Apollo + Express + R orchestration
│   ├── src/
│   │   ├── index.ts                  # Server entry — Apollo, REST, MongoDB, multer
│   │   ├── graphql/
│   │   │   ├── typeDefs.ts           # GraphQL schema (User, Analysis, Result, Gene, ForumPost…)
│   │   │   ├── resolvers.ts          # Query/mutation implementations
│   │   │   ├── mutation.ts
│   │   │   └── mock.ts               # Mock data for frontend dev
│   │   ├── api/
│   │   │   ├── processAnalysis.ts    # Kicks off the R pipeline
│   │   │   ├── receiveFile.ts        # Upload handling
│   │   │   └── geneCache.ts          # Cached gene metadata endpoint
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── Analysis.ts
│   │   │   ├── Dataset.ts
│   │   │   ├── Result.ts
│   │   │   ├── Gene.ts
│   │   │   ├── CachedGeneData.ts
│   │   │   ├── ForumPost.ts
│   │   │   ├── Comment.ts
│   │   │   ├── User.ts
│   │   │   └── middleware/authMiddleware.ts
│   │   ├── R/
│   │   │   ├── significantGenes.R    # Main DE analysis (configurable thresholds)
│   │   │   ├── GSE16561.R            # Worked example for the bundled dataset
│   │   │   ├── dataset/              # Sample GEO series matrix
│   │   │   └── public/uploaded/      # R-generated outputs (CSV, volcano PDF, histogram PDF)
│   │   └── utils/
│   │       ├── rScriptRunner.ts      # Node → R bridge
│   │       └── extractZip.ts         # Unzips uploaded archives
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx                  # Landing / upload
│   │   ├── login/, register/, profile/
│   │   ├── reports/                  # Analysis list + per-analysis report view
│   │   │   └── [id]/                 # Results table, Wikipedia panel, PDF download
│   │   ├── forum/                    # Forum index + post pages
│   │   ├── api/wikipedia/route.ts    # Server-side Wikipedia proxy
│   │   └── layout.tsx
│   ├── components/                   # Navbar, dropzone, accordions, search, auth guards
│   │   └── ui/                       # shadcn primitives
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── public/dragdrop_files/            # Shared drop zone for uploaded datasets
                                      # (the backend writes here via multer)
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.9.0 and **npm**
- **R** ≥ 4.x with permission to install Bioconductor packages (the scripts auto-install on first run, but this needs internet access and can take 10+ minutes the first time)
- **MongoDB** instance (local or Atlas) with a connection URI

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
MONGODB_URI=mongodb://localhost:27017/genescope
JWT_SECRET=replace-with-a-long-random-string
```

Then run:

```bash
npm start
```

This compiles TypeScript and launches the server. You should see:

```
Connected to MongoDB
SUCCESS: Server ready at http://localhost:4000/graphql
SUCCESS: API endpoints available at http://localhost:4000/api/*
```

The first analysis run will trigger R to install the Bioconductor packages listed in `significantGenes.R` — be patient.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The frontend expects the backend at `http://localhost:4000`.

## How It Works

1. **Upload** — User drops a GEO series matrix (`.txt.gz`) onto the home page. Multer stores it in `public/dragdrop_files/`.
2. **Create analysis** — `createAnalysis` GraphQL mutation persists an `Analysis` document in MongoDB with status `FETCHING`, plus the user's chosen `logThreshold` and `pThreshold`.
3. **Process** — `POST /api/process-analysis` invokes `rScriptRunner` which spawns `Rscript significantGenes.R`. The R script unzips the upload, runs limma differential expression, annotates probes with `illuminaHumanv4.db` / `org.Hs.eg.db`, filters by thresholds, and writes:
   - `expression_data.csv`, `expression_data_probeID.csv`, `phenotype_data.csv`
   - `volcano_plot.pdf`, `expression_histogram.pdf`
4. **Persist results** — `updateAnalysisWithResults` writes the gene-level results back to MongoDB and flips status to `COMPLETED`.
5. **Explore** — User views the report at `/reports/[id]`: sortable significant-gene table, embedded volcano plot, Wikipedia gene info per row, downloadable PDF.
6. **Discuss** — Users can post analyses to the forum, comment, and link discussions back to specific runs.

## GraphQL Schema (high level)

- **Queries**: `me`, `user(id)`, `getAnalyses`, `analysis(id)`, `checkAnalysesExist(ids)`, `forumPosts`, `forumPost(id)`
- **Mutations**: `createUser`, `login`, `createAnalysis`, `updateAnalysisWithResults`, `updateAnalysisStatus`, `deleteAnalysis`, `createForumPost`, `addComment`, `deleteForumPost`, `deleteComment`
- **Core types**: `User`, `Analysis` (with `AnalysisStatus`: FETCHING / PARSING / ANALYZING / COMPLETED / FAILED), `AnalysisResult`, `Result`, `Gene`, `Dataset`, `ForumPost`, `Comment`

Full schema in `backend/src/graphql/typeDefs.ts`.

## Authors

FIT3162 Final Year Project team — Monash University.

## License

Built for academic purposes as part of FIT3162 coursework. Bundled GEO data (GSE16561) belongs to its original authors and is subject to NCBI GEO terms.
