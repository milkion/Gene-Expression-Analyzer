# Ensure required packages are installed
# Define packages
required_packages <- c("dplyr", "tibble", "jsonlite", "httr", "readr")
bioc_packages <- c("GEOquery", "DESeq2", "limma", "illuminaHumanv4.db", "org.Hs.eg.db", "AnnotationDbi", "biomaRt")

# Install BiocManager if not already installed
if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager", dependencies = TRUE)
}

# Install regular CRAN packages
for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg, dependencies = TRUE)
  }
}

# Install Bioconductor packages
for (pkg in bioc_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    BiocManager::install(pkg)
  }
}

if (!requireNamespace("ggrepel", quietly = TRUE)) {
  install.packages("ggrepel")
}


# Load libraries
library(GEOquery)
library(DESeq2)
library(limma)
library(illuminaHumanv4.db)
library(dplyr)
library(tibble)
library(jsonlite)
library(httr)
library(base64enc)
library(readr)
library(ggplot2)
library(org.Hs.eg.db)
library(AnnotationDbi)
library(biomaRt)
library(ggrepel)
# -------------------------------------------------------------------------

# Define directories
retrieve_dir <- "../public/dragdrop_files/unzipped"
output_dir <- "../backend/src/R/public/output"

if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)  # Ensure the output directory exists
}
# options(timeout = 600)

# # Find the first GSE file in the dataset directory
# file_list <- list.files(dataset_dir, pattern = "^GSE.*\\.txt\\.gz$", full.names = TRUE)

# # Check if any matching files are found
# if (length(file_list) == 0) {
#   stop("No matching GSE dataset found in ", dataset_dir)
# }

# gse_file <- file_list[1]  # Select the first file

# # Load the dataset
# gse <- getGEO(filename = gse_file, GSEMatrix = TRUE, AnnotGPL = TRUE)

# length(gse)

# Read expression data with explicit column types
expression_file <- file.path(retrieve_dir, "expression_data.csv")
if (!file.exists(expression_file)) {
  stop("Error: Expression data file not found at ", expression_file)
}
expressionData <- read_csv(expression_file, show_col_types = FALSE)

# Read phenotype data with explicit column types
phenotype_file <- file.path(retrieve_dir, "phenotype_data.csv")
if (!file.exists(phenotype_file)) {
  message("ERRMSG: Phenotype data file not found at ", phenotype_file)
  quit(status = 1)
}
phenotypeData <- read_csv(phenotype_file, show_col_types = FALSE)

# Print data to verify
print("Expression Data:")
print(head(expressionData))

print("Phenotype Data:")
print(head(phenotypeData))

print("---------------------------------------")

# Ensure probeID is a character vector and store it before converting
geneSymbols <- as.character(expressionData[[1]])

# Convert tibble to a numeric matrix for analysis
expressionData <- as.matrix(expressionData[,-1])  # Remove the first column (probe IDs) and convert to matrix
mode(expressionData) <- "numeric"  # Ensure numeric type

# Handle duplicate and NA gene symbols
uniqueGeneSymbols <- make.unique(ifelse(is.na(geneSymbols), "NA", geneSymbols))

# Assign row names
rownames(expressionData) <- uniqueGeneSymbols

geneSymbol_map <- setNames(geneSymbols, uniqueGeneSymbols)

# Verify row names
cat("Row names after assignment:\n")
print(head(rownames(expressionData)))

# Replace NA with 0
expressionData[is.na(expressionData)] <- 0

# Data transformation verification
print("Range of expression data:")
print(range(expressionData, na.rm = TRUE))

# Basic statistics
print("Mean of expression data:")
print(mean(expressionData, na.rm = TRUE))
print("Median of expression data:")
print(median(as.vector(expressionData), na.rm = TRUE))

# Limma calculation
condition <- ifelse(grepl("control", phenotypeData$title, ignore.case = TRUE), "Control", "Diseased")
condition <- factor(condition, levels = c("Control", "Diseased"))

table(condition)

design <- model.matrix(~condition)
fit <- lmFit(expressionData, design)
fit <- eBayes(fit)

# Ensure probe IDs are included in the results
results <- topTable(fit, coef = 2, number = Inf)

print(head(results))

# Map correct gene symbols
results$uniqueGeneSymbol <- rownames(results)
results$geneSymbol <- geneSymbol_map[rownames(results)]

# Verify output
head(results[, c("geneSymbol", "logFC", "adj.P.Val")])

#Significant Differential Expressed Genes
args <- commandArgs(trailingOnly = TRUE)

# Parse thresholds from arguments
logThreshold <- as.numeric(args[1])
pThreshold <- as.numeric(args[2])

cat("logThreshold:", logThreshold, "\n")
cat("pThreshold:", pThreshold, "\n")

significantGenes <- results[results$adj.P.Val < pThreshold & abs(results$logFC) > logThreshold, ]
significantGenes <- significantGenes[order(significantGenes$adj.P.Val), ]

# Define the PNG output file
png_file <- file.path(output_dir, "volcano_plot.png")

# Open the PNG device
png(png_file, width = 800, height = 600)

# Subset results for significant genes with symbols
# Assume the rownames of results are gene symbols (already present from your expression matrix)
# results$geneSymbol <- rownames(results)

# Subset significant results based on adjusted p-value and log fold change
sig_results <- subset(results, adj.P.Val < pThreshold & abs(logFC) > logThreshold)

# Plot
volcano_plot <- ggplot(results, aes(x = logFC, y = -log10(adj.P.Val))) +
  geom_point(aes(color = ifelse(adj.P.Val < pThreshold & abs(logFC) > logThreshold,
      "Significant", "Not Significant")),
    alpha = 0.6) +
  scale_color_manual(
    values = c("Not Significant" = "black", "Significant" = "red"),
    name = paste0("adj.P.Val < ", pThreshold, " & |logFC| > ", logThreshold)
  ) +
  geom_hline(yintercept = -log10(pThreshold), linetype = "dashed", color = "blue") +
  geom_vline(xintercept = c(-logThreshold, logThreshold), linetype = "dashed", color = "blue") +
  theme_minimal() +
  labs(title = "Volcano Plot",
    x = "Log2 Fold Change",
    y = "-Log10 Adjusted P-value") +
  geom_text_repel(data = sig_results,
    aes(label = geneSymbol),
    size = 3,
    max.overlaps = 20,
    box.padding = 0.3,
    point.padding = 0.2)

#Red dots - genes significantly differential expressed, fold change > 1
volcano_plot
print(volcano_plot)
dev.off()
cat("Volcano plot PNG saved to:", png_file, "\n")

# Encode the PNG file as a Base64 string
volcano_plot_base64 <- base64encode(png_file)

paste("Number of significant genes:", nrow(significantGenes))

# significantGenes$probeID <- rownames(significantGenes)
# probeIDs <- significantGenes$probeID

# print("Extracted Probe IDs for significant genes: ")
# print(probeIDs)

# Convert Probe IDs to Gene Symbols

# geneSymbols <- mapIds(illuminaHumanv4.db,
#                       keys = probeIDs,
#                       column = "SYMBOL",
#                       keytype = "PROBEID",
#                       multiVals = "first")

# significantGenes$geneSymbol <- geneSymbols

# Reorder columns
significantGenes <- significantGenes[, c("geneSymbol", setdiff(names(significantGenes), "geneSymbol"))]

# Map gene symbols to UniProt IDs using biomaRt
# Connect to Ensembl BioMart
ensembl <- useMart("ensembl", dataset = "hsapiens_gene_ensembl")

# Get the correct attribute names for UniProt IDs
# Uncomment to check available attributes
# attr <- listAttributes(ensembl)
# print(attr[grep("uniprot", attr$name, ignore.case=TRUE),])

cat("Starting UniProt mapping with biomaRt...\n")
mart_results <- getBM(
  attributes = c("hgnc_symbol", "uniprotswissprot", "uniprotsptrembl"),
  filters = "hgnc_symbol",
  values = geneSymbols,
  mart = ensembl
)
cat("Finished UniProt mapping.\n")

# Process the results to get a single UniProt ID per gene
# Prioritize SwissProt (reviewed) over TrEMBL (unreviewed) entries
mart_results$uniprot <- ifelse(
  !is.na(mart_results$uniprotswissprot) & mart_results$uniprotswissprot != "",
  mart_results$uniprotswissprot,
  mart_results$uniprotsptrembl
)

# Create a named vector for easier mapping
uniprot_map <- setNames(mart_results$uniprot, mart_results$hgnc_symbol)

# Add UniProt IDs to the data frame
significantGenes$uniprotID <- uniprot_map[significantGenes$geneSymbol]

# Save results as CSV
output_csv <- file.path(output_dir, "significantGenes.csv")
results <- results[, c("uniqueGeneSymbol", "geneSymbol", setdiff(names(results), c("uniqueGeneSymbol", "geneSymbol")))]
write.csv(significantGenes, file = output_csv, row.names = TRUE)

# Format JSON output
library(jsonlite)

colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

json_output <- toJSON(list(
  message = "Success",
  significantGenes = significantGenes,
  volcanoPlotBase64 = volcano_plot_base64
), pretty = TRUE, auto_unbox = TRUE)

cat(json_output)

output_json <- file.path(output_dir, "significantGenes.json")
write(json_output, file = output_json)

cat("Significant genes data saved to:", output_csv, "and", output_json, "\n")
