# Ensure required packages are installed
required_packages <- c("BiocManager", "GEOquery", "DESeq2", "limma", 
                       "illuminaHumanv4.db", "dplyr", "tibble", "jsonlite", "httr")
for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg, dependencies = TRUE)
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

# -------------------------------------------------------------------------

# Define the output directory
output_dir <- "public/plots"
if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)  # Ensure the directory exists
}

options(timeout = 600)
# gse <- getGEO(filename = "src/R/dataset/GSE16561_series_matrix.txt.gz", GSEMatrix = TRUE, AnnotGPL = TRUE)

# Find the first GSE file in the directory
file_list <- list.files("src/R/dataset/", pattern = "^GSE.*\\.txt\\.gz$", full.names = TRUE)

# Check if any matching files are found
if (length(file_list) == 0) {
    stop("No matching GSE dataset found in src/R/dataset/")
} 
gse_file <- file_list[1]  # Select the first file
  
# Load the dataset
gse <- getGEO(filename = gse_file, GSEMatrix = TRUE, AnnotGPL = TRUE)
  
length(gse)

expressionData <- exprs(gse)
expressionData

phenotypeData <- pData(gse[1])
phenotypeData


# #DATA EXPLORATION
dim(expressionData)
dim(phenotypeData)
colnames(phenotypeData)

#NA values replaced with 0
expressionData[is.na(expressionData)] <- 0


# Verification of data transformation, most likely Log2 transformation
# Ranges between 6 to -6, majority between -1 and 1
range(expressionData)


# Histogram PDF file
hist_pdf_file <- file.path(output_dir, "expression_histogram.pdf")

# Open PDF device for histogram
pdf(hist_pdf_file, width = 8, height = 6)

# Generate histogram
hist(as.vector(expressionData), breaks=100, main="Distribution of Expression Values")

# Close the PDF device
dev.off()

# Notify the user
cat("Histogram PDF saved to:", hist_pdf_file, "\n")


mean(expressionData)
median(expressionData)


# Limma calculation
# Assuming 'title' column contains condition information
condition <- ifelse(grepl("Stroke", phenotypeData$title), "Stroke", "Control")
condition <- factor(condition, levels = c("Control", "Stroke"))

table(condition)

design <- model.matrix(~condition)
fit <- lmFit(expressionData, design)
fit <- eBayes(fit)
results <- topTable(fit, coef = 2, number=Inf)

print(head(results))


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

# output_dir <- getwd()

# output_file <- file.path(output_dir, "significantGenes-probeID.csv")
# write.csv(significantGenes, file = output_file, row.names = TRUE)


#Converting Probe IDs to Genes Symbols
BiocManager::install("illuminaHumanv4.db")
library(illuminaHumanv4.db)

#Mapping between probe Ids and gene symbols
probeIDs <- rownames(significantGenes)
geneSymbols <- mapIds(illuminaHumanv4.db, 
                      keys = probeIDs,
                      column = "SYMBOL",
                      keytype = "PROBEID",
                      multiVals = "first")

# Add gene symbols to the significantGenes dataframe
significantGenes$geneSymbol <- geneSymbols

# Reorder columns to put geneSymbol first
significantGenes <- significantGenes[, c("geneSymbol", setdiff(names(significantGenes), "geneSymbol"))]

# output_file <- file.path(output_dir, "significantGenes.csv")
# write.csv(significantGenes, file = output_file, row.names = TRUE)

### FORMATTING ###

library(dplyr)
library(tibble)
significantGenes

# Rename columns and remove rownames
colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

print(significantGenes)

# output_file <- file.path(output_dir, "significantGenes.csv")
# write.csv(significantGenes, file = output_file, row.names = TRUE)

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
