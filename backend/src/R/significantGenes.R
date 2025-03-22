# Ensure required packages are installed
# Define packages
required_packages <- c("dplyr", "tibble", "jsonlite", "httr", "readr")
bioc_packages <- c("GEOquery", "DESeq2", "limma", "illuminaHumanv4.db")

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

# Load libraries
library(GEOquery)
library(DESeq2)
library(limma)
library(illuminaHumanv4.db)
library(dplyr)
library(tibble)
library(jsonlite)
library(httr)
library(readr)
library(ggplot2)

# -------------------------------------------------------------------------

# Define directories
dataset_dir <- "backend/src/R/dataset"
output_dir <- "backend/src/R/public/uploaded"

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

# Read expression data
expression_file <- file.path(output_dir, "expression_data.csv")
if (!file.exists(expression_file)) {
  stop("Error: Expression data file not found at ", expression_file)
}
expressionData <- read_csv(expression_file)

# Read phenotype data
phenotype_file <- file.path(output_dir, "phenotype_data.csv")
if (!file.exists(phenotype_file)) {
  stop("Error: Phenotype data file not found at ", phenotype_file)
}
phenotypeData <- read_csv(phenotype_file)

# Print data to verify
print("Expression Data:")
print(head(expressionData))

print("Phenotype Data:")
print(head(phenotypeData))

print("---------------------------------------")

# Ensure probeID is a character vector
probeID <- as.character(expressionData[[1]])

# Convert tibble to a data frame
expressionData <- as.data.frame(expressionData)

# Ensure lengths match before setting row names
if (length(probeID) == nrow(expressionData)) {
  rownames(expressionData) <- probeID
  expressionData <- expressionData[, -1]
} else {
  stop("Length mismatch between probeID and rows of expressionData")
}

# Verify row names
cat("Row names after assignment:\n")
print(head(rownames(expressionData)))

expressionData[is.na(expressionData)] <- 0

# Data transformation verification (Log2 transformation check)
range(expressionData)

# Save histogram as PDF
hist_pdf_file <- file.path(output_dir, "expression_histogram.pdf")

pdf(hist_pdf_file, width = 8, height = 6)

expression_matrix <- as.matrix(expressionData)
storage.mode(expression_matrix) <- "numeric"

# Generate histogram
hist(as.vector(expression_matrix), breaks=100, main="Distribution of Expression Values")

dev.off()
cat("Histogram PDF saved to:", hist_pdf_file, "\n")

# Basic statistics
mean(expression_matrix)
median(expression_matrix)

# Limma calculation
condition <- ifelse(grepl("Stroke", phenotypeData$title), "Stroke", "Control")
condition <- factor(condition, levels = c("Control", "Stroke"))

table(condition)

design <- model.matrix(~condition)
fit <- lmFit(expressionData, design)
fit <- eBayes(fit)

# Ensure probe IDs are included in the results
results <- topTable(fit, coef = 2, number = Inf)

print(head(results))

# Map correct ILMN probe IDs
results$probeID <- rownames(expressionData)[as.numeric(rownames(results))]

# Verify output
head(results[, c("probeID", "logFC", "adj.P.Val")])

# Save volcano plot as PDF
pdf_file <- file.path(output_dir, "volcano_plot.pdf")

pdf(pdf_file, width = 8, height = 6)

volcano_plot <- ggplot(results, aes(x = logFC, y = -log10(adj.P.Val))) +
  geom_point(aes(color = adj.P.Val < 0.05 & abs(logFC) > 1), alpha = 0.6) +
  scale_color_manual(values = c("black", "red")) +
  labs(title = "Volcano Plot",
       x = "Log2 Fold Change",
       y = "-Log10 Adjusted P-value") +
  theme_minimal() +
  geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "blue") +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "blue")

print(volcano_plot) 
dev.off()
cat("Volcano plot PDF saved to:", pdf_file, "\n")

# Identify significant genes
pThreshold <- 0.05
logThreshold <- 1

significantGenes <- results[results$adj.P.Val < pThreshold & abs(results$logFC) > logThreshold, ]
significantGenes <- significantGenes[order(significantGenes$adj.P.Val), ]

paste("Number of significant genes:", nrow(significantGenes))

significantGenes$probeID <- rownames(significantGenes)
probeIDs <- significantGenes$probeID

print("Extracted Probe IDs for significant genes: ")
print(probeIDs)

# Convert Probe IDs to Gene Symbols
library(illuminaHumanv4.db)

geneSymbols <- mapIds(illuminaHumanv4.db, 
                      keys = probeIDs,
                      column = "SYMBOL",
                      keytype = "PROBEID",
                      multiVals = "first")

significantGenes$geneSymbol <- geneSymbols

# Reorder columns
significantGenes <- significantGenes[, c("geneSymbol", setdiff(names(significantGenes), "geneSymbol"))]

# Save results as CSV
output_csv <- file.path(output_dir, "significantGenes.csv")
write.csv(significantGenes, file = output_csv, row.names = TRUE)

# Format JSON output
library(jsonlite)

colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

json_output <- toJSON(list(
  message = "Success",
  significantGenes = significantGenes
), pretty = TRUE, auto_unbox = TRUE)

cat(json_output)

output_json <- file.path(output_dir, "significantGenes.json")
write(json_output, file = output_json)

cat("Significant genes data saved to:", output_csv, "and", output_json, "\n")
