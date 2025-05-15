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

# -------------------------------------------------------------------------
# INPUT DATA INTEGRITY AND FORMAT TESTING
# -------------------------------------------------------------------------
print("Starting white box testing...")

# Read expression data with explicit column types
expression_file <- file.path(retrieve_dir, "expression_data.csv")
if (!file.exists(expression_file)) {
  stop("Error: Expression data file not found at ", expression_file)
}
expressionData <- read_csv(expression_file, show_col_types = FALSE)

# Read phenotype data with explicit column types
phenotype_file <- file.path(retrieve_dir, "phenotype_data.csv")
if (!file.exists(phenotype_file)) {
  stop("Error: Phenotype data file not found at ", phenotype_file)
}
phenotypeData <- read_csv(phenotype_file, show_col_types = FALSE)

# Test: Check matrix dimensions
cat("TEST - Input Data Dimensions:\n")
cat("Expression data dimensions:", dim(expressionData)[1], "rows x", dim(expressionData)[2], "columns\n")
cat("Phenotype data dimensions:", dim(phenotypeData)[1], "rows x", dim(phenotypeData)[2], "columns\n")
cat("Sample size consistency check:", ifelse(ncol(expressionData)-1 == nrow(phenotypeData), "PASS", "FAIL"), "\n")

# Test: Verify data types
cat("TEST - Data Types:\n")
cat("Expression data column types:\n")
print(sapply(expressionData, class))
cat("Phenotype data column types:\n")
print(sapply(phenotypeData, class))

# Test: Check for missing values in input data
cat("TEST - Missing Values in Input Data:\n")
cat("Missing values in expression data:", sum(is.na(expressionData)), "\n")
cat("Missing values in phenotype data:", sum(is.na(phenotypeData)), "\n")

# Test: Validate column headers and row identifiers
cat("TEST - Column Headers and Row Identifiers:\n")
cat("Expression data column names:\n")
print(colnames(expressionData))
cat("Phenotype data column names:\n")
print(colnames(phenotypeData))

# Ensure probeID is a character vector and store it before converting
geneSymbols <- as.character(expressionData[[1]])

# -------------------------------------------------------------------------
# DATA PREPROCESSING TESTING
# -------------------------------------------------------------------------

# Test: Check for duplicate gene symbols
cat("TEST - Duplicate Gene Symbols:\n")
cat("Total gene symbols:", length(geneSymbols), "\n")
cat("Unique gene symbols:", length(unique(geneSymbols)), "\n")
cat("Number of duplicates:", length(geneSymbols) - length(unique(geneSymbols)), "\n")

# Convert tibble to a numeric matrix for analysis
expressionData <- as.matrix(expressionData[,-1])  # Remove the first column (probe IDs) and convert to matrix
mode(expressionData) <- "numeric"  # Ensure numeric type

# Test: Verify matrix conversion
cat("TEST - Matrix Conversion:\n")
cat("Is matrix:", is.matrix(expressionData), "\n")
cat("Is numeric:", is.numeric(expressionData), "\n")
cat("Matrix dimensions after conversion:", dim(expressionData)[1], "x", dim(expressionData)[2], "\n")

# Handle duplicate and NA gene symbols
uniqueGeneSymbols <- make.unique(ifelse(is.na(geneSymbols), "NA", geneSymbols))

# Test: Verify unique gene symbols
cat("TEST - Unique Gene Symbols:\n")
cat("Length of uniqueGeneSymbols:", length(uniqueGeneSymbols), "\n")
cat("Are all symbols unique now:", length(uniqueGeneSymbols) == length(unique(uniqueGeneSymbols)), "\n")

# Assign row names
rownames(expressionData) <- uniqueGeneSymbols

# Test: Verify row names assignment
cat("TEST - Row Names Assignment:\n")
cat("Number of row names:", length(rownames(expressionData)), "\n")
cat("First few row names:\n")
print(head(rownames(expressionData)))

# Replace NA with 0
na_count_before <- sum(is.na(expressionData))
expressionData[is.na(expressionData)] <- 0
na_count_after <- sum(is.na(expressionData))

# Test: Verify NA handling
cat("TEST - NA Handling:\n")
cat("NA values before replacement:", na_count_before, "\n")
cat("NA values after replacement:", na_count_after, "\n")

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

# Test: Verify condition factor
cat("TEST - Condition Factor:\n")
print(table(condition))
cat("Is factor:", is.factor(condition), "\n")
cat("Levels:", paste(levels(condition), collapse=", "), "\n")

design <- model.matrix(~condition)

# Test: Verify design matrix
cat("TEST - Design Matrix:\n")
cat("Design matrix dimensions:", dim(design)[1], "x", dim(design)[2], "\n")
print(head(design))

fit <- lmFit(expressionData, design)
fit <- eBayes(fit)

# Test: Verify eBayes fit
cat("TEST - eBayes Fit:\n")
cat("Fit object class:", class(fit), "\n")
cat("Number of genes in fit:", length(fit$genes), "\n")
cat("Number of coefficients:", length(fit$coefficients[1,]), "\n")

# Ensure probe IDs are included in the results
results <- topTable(fit, coef = 2, number = Inf)

# Test: Verify topTable results
cat("TEST - topTable Results:\n")
cat("Number of results:", nrow(results), "\n")
cat("Columns in results:", paste(colnames(results), collapse=", "), "\n")
cat("P-value range:", min(results$P.Value), "to", max(results$P.Value), "\n")
cat("Adjusted P-value range:", min(results$adj.P.Val), "to", max(results$adj.P.Val), "\n")
cat("logFC range:", min(results$logFC), "to", max(results$logFC), "\n")

print(head(results))

# Map correct gene symbols
results$geneSymbol <- rownames(results)

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

# Test: Verify significant genes filtering
cat("TEST - Significant Genes Filtering:\n")
cat("Number of significant genes:", nrow(significantGenes), "\n")
cat("Percentage of significant genes:", round(nrow(significantGenes)/nrow(results)*100, 2), "%\n")
cat("Min adjusted P-value in significant genes:", min(significantGenes$adj.P.Val), "\n")
cat("Min absolute logFC in significant genes:", min(abs(significantGenes$logFC)), "\n")

# Define the PNG output file
png_file <- file.path(output_dir, "volcano_plot.png")

# Open the PNG device
png(png_file, width = 800, height = 600)

# Subset results for significant genes with symbols
# Assume the rownames of results are gene symbols (already present from your expression matrix)
results$geneSymbol <- rownames(results)

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
cat("TEST - Ensembl BioMart Connection:\n")
tryCatch({
  ensembl <- useMart("ensembl", dataset = "hsapiens_gene_ensembl")
  cat("Successfully connected to Ensembl BioMart\n")
  cat("Mart object class:", class(ensembl), "\n")
}, error = function(e) {
  cat("ERROR connecting to Ensembl BioMart:", e$message, "\n")
})

cat("Starting UniProt mapping with biomaRt...\n")
mapping_start_time <- Sys.time()
tryCatch({
  mart_results <- getBM(
    attributes = c("hgnc_symbol", "uniprotswissprot", "uniprotsptrembl"),
    filters = "hgnc_symbol",
    values = geneSymbols,
    mart = ensembl
  )
  mapping_end_time <- Sys.time()
  cat("Finished UniProt mapping in", difftime(mapping_end_time, mapping_start_time, units="secs"), "seconds\n")
  
  # Test: Verify mapping results
  cat("TEST - UniProt Mapping Results:\n")
  cat("Number of genes submitted for mapping:", length(geneSymbols), "\n")
  cat("Number of genes with mapping results:", length(unique(mart_results$hgnc_symbol)), "\n")
  cat("Mapping success rate:", round(length(unique(mart_results$hgnc_symbol))/length(unique(geneSymbols))*100, 2), "%\n")
  cat("Number of SwissProt IDs found:", sum(!is.na(mart_results$uniprotswissprot) & mart_results$uniprotswissprot != ""), "\n")
  cat("Number of TrEMBL IDs found:", sum(!is.na(mart_results$uniprotsptrembl) & mart_results$uniprotsptrembl != ""), "\n")
}, error = function(e) {
  cat("ERROR in UniProt mapping:", e$message, "\n")
})

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

# Test: Verify UniProt ID assignment
cat("TEST - UniProt ID Assignment:\n")
cat("Number of significant genes:", nrow(significantGenes), "\n")
cat("Number of significant genes with UniProt IDs:", sum(!is.na(significantGenes$uniprotID)), "\n")
cat("Percentage of significant genes with UniProt IDs:", round(sum(!is.na(significantGenes$uniprotID))/nrow(significantGenes)*100, 2), "%\n")

# Save results as CSV
output_csv <- file.path(output_dir, "significantGenes.csv")
write.csv(significantGenes, file = output_csv, row.names = TRUE)

# Test: Verify CSV file creation
cat("TEST - CSV Output Generation:\n")
cat("CSV file exists:", file.exists(output_csv), "\n")
if(file.exists(output_csv)) {
  cat("CSV file size:", file.info(output_csv)$size, "bytes\n")
}

# Format JSON output
library(jsonlite)

colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

# Test: Verify column renaming
cat("TEST - Column Renaming:\n")
cat("Columns after renaming:", paste(colnames(significantGenes), collapse=", "), "\n")

json_output <- toJSON(list(
  message = "Success",
  significantGenes = significantGenes,
  volcanoPlotBase64 = volcano_plot_base64
), pretty = TRUE, auto_unbox = TRUE)

output_json <- file.path(output_dir, "significantGenes.json")
write(json_output, file = output_json)

# Test: Verify JSON file creation
cat("TEST - JSON Output Generation:\n")
cat("JSON file exists:", file.exists(output_json), "\n")
if(file.exists(output_json)) {
  cat("JSON file size:", file.info(output_json)$size, "bytes\n")
  # Verify JSON structure
  tryCatch({
    json_test <- fromJSON(output_json)
    cat("JSON structure validation: PASS\n")
    cat("JSON contains message field:", "message" %in% names(json_test), "\n")
    cat("JSON contains significantGenes field:", "significantGenes" %in% names(json_test), "\n")
    cat("JSON contains volcanoPlotBase64 field:", "volcanoPlotBase64" %in% names(json_test), "\n")
  }, error = function(e) {
    cat("JSON structure validation: FAIL -", e$message, "\n")
  })
}

# Test: Verify PNG file creation
cat("TEST - Volcano Plot PNG Generation:\n")
cat("PNG file exists:", file.exists(png_file), "\n")
if(file.exists(png_file)) {
  cat("PNG file size:", file.info(png_file)$size, "bytes\n")
}

cat("White box testing completed.\n")
