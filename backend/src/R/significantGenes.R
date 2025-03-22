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
# -------------------------------------------------------------------------

# Define the output directory
output_dir <- "public/plots"
if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)  # Ensure the directory exists
}

options(timeout = 600)
# gse <- getGEO(filename = "src/R/dataset/GSE16561_series_matrix.txt.gz", GSEMatrix = TRUE, AnnotGPL = TRUE)

# Find the first GSE file in the directory
file_list <- list.files("dataset/", pattern = "^GSE.*\\.txt\\.gz$", full.names = TRUE)

# Check if any matching files are found
if (length(file_list) == 0) {
    stop("No matching GSE dataset found in src/R/dataset/")
} 
gse_file <- file_list[1]  # Select the first file
  
# Load the dataset
gse <- getGEO(filename = gse_file, GSEMatrix = TRUE, AnnotGPL = TRUE)
  
length(gse)

# Read expression data from CSV
expression_file <- file.path(output_dir, "expression_data.csv")
if (!file.exists(expression_file)) {
  stop("Error: Expression data file not found at ", expression_file)
}
expressionData <- read_csv(expression_file)

# Read phenotype data from CSV
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
# str(expressionData)
# summary(expressionData)
# sapply(phenotypeData, class)

# # Define file paths
# expression_file <- file.path(output_dir, "expression_data.csv")
# phenotype_file <- file.path(output_dir, "phenotype_data.csv")

# # Save expression data
# write.csv(expressionData, expression_file, row.names = TRUE)

# # Save phenotype data
# write.csv(phenotypeData, phenotype_file, row.names = TRUE)

# # Print message
# cat("Files saved:\n", expression_file, "\n", phenotype_file, "\n")



# #DATA EXPLORATION
dim(expressionData)
dim(phenotypeData)
colnames(phenotypeData)


print("----------------------------")

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

# Verify the row names
cat("Row names after assignment:\n")
print(head(rownames(expressionData)))

expressionData[is.na(expressionData)] <- 0


# Verification of data transformation, most likely Log2 transformation
# Ranges between 6 to -6, majority between -1 and 1
range(expressionData)

hist_pdf_file <- file.path(output_dir, "expression_histogram.pdf")

# Open PDF device for histogram
pdf(hist_pdf_file, width = 8, height = 6)

expression_matrix <- as.matrix(expressionData)

print(expressionData)
storage.mode(expression_matrix) <- "numeric"

# Generate histogram
hist(as.vector(expression_matrix), breaks=100, main="Distribution of Expression Values")

# Close the PDF device
dev.off()

# Notify the user
cat("Histogram PDF saved to:", hist_pdf_file, "\n")


mean(expression_matrix)
median(expression_matrix)

rownames(expressionData)
# Limma calculation
# Assuming 'title' column contains condition information
condition <- ifelse(grepl("Stroke", phenotypeData$title), "Stroke", "Control")
condition <- factor(condition, levels = c("Control", "Stroke"))

table(condition)

design <- model.matrix(~condition)
fit <- lmFit(expressionData, design)
fit <- eBayes(fit)

# Ensure probe IDs are included in the results
results <- topTable(fit, coef = 2, number = Inf)

print(head(results))
# Map correct ILMN probe IDs using the original expressionData row names
results$probeID <- rownames(expressionData)[as.numeric(rownames(results))]

# Verify output
head(results[, c("probeID", "logFC", "adj.P.Val")])

library(ggplot2)



# Define the PDF output file
pdf_file <- file.path(output_dir, "volcano_plot.pdf")

# Open the PDF device
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

#Red dots - genes significantly differential expressed, fold change > 1
volcano_plot
print(volcano_plot) 
dev.off()


#Significant Differential Expressed Genes
pThreshold <- 0.05
logThreshold <- 1

significantGenes<- results[results$adj.P.Val < pThreshold & abs(results$logFC) > logThreshold, ]
significantGenes <- significantGenes[order(significantGenes$adj.P.Val), ]

paste("Number of significant genes:", nrow(significantGenes))

output_dir <- getwd()

print(significantGenes)
output_file <- file.path(output_dir, "significantGenes-probeID.csv")
write.csv(significantGenes, file = output_file, row.names = TRUE)
significantGenes$probeID <- rownames(significantGenes)
probeIDs <- significantGenes$probeID

print("EXTRACTED PROBE IDS FOR EXTRACTED SIGNIFICANT GENES: ")
print(probeIDs)  # Check the structure of probeIDs


#Converting Probe IDs to Genes Symbols
BiocManager::install("illuminaHumanv4.db", force = TRUE)
library(illuminaHumanv4.db)

# #Mapping between probe Ids and gene symbols
geneSymbols <- mapIds(illuminaHumanv4.db, 
                      keys = probeIDs,
                      column = "SYMBOL",
                      keytype = "PROBEID",
                      multiVals = "first")

# Add gene symbols to the significantGenes dataframe
significantGenes$geneSymbol <- geneSymbols

# Reorder columns to put geneSymbol first
significantGenes <- significantGenes[, c("geneSymbol", setdiff(names(significantGenes), "geneSymbol"))]

output_file <- file.path(output_dir, "significantGenes.csv")
write.csv(significantGenes, file = output_file, row.names = TRUE)

## FORMATTING ###

library(dplyr)
library(tibble)
significantGenes

# Rename columns and remove rownames
colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

print(significantGenes)

output_file <- file.path(output_dir, "significantGenes.csv")
write.csv(significantGenes, file = output_file, row.names = TRUE)

library(jsonlite)

options(scipen = 999)  # Prevent scientific notation

result <- list(
  message = "Success",
  significantGenes = significantGenes
)

json_output <- toJSON(result, pretty = TRUE, auto_unbox = TRUE)
cat(json_output)

output_file <- file.path("public", "significantGenes.json")
write(json_output, file = output_file)


# library(jsonlite)

# # Create a clean list of significant genes
# result <- list(
#   message = "Success",
#   significantGenes = significantGenes
# )

# # Print JSON output (no extra print statements)
# cat(toJSON(result, auto_unbox = TRUE))
