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


gse <- getGEO("GSE16561", GSEMatrix = TRUE, AnnotGPL = TRUE)

length(gse)

expressionData <- exprs(gse[[1]])
expressionData

phenotypeData <- pData(gse[[1]])
phenotypeData


#DATA EXPLORATION
dim(expressionData)
dim(phenotypeData)
colnames(phenotypeData)

#NA values replaced with 0
expressionData[is.na(expressionData)] <- 0


# Verification of data transformation, most likely Log2 transformation
# Ranges between 6 to -6, majority between -1 and 1
range(expressionData)
hist(as.vector(expressionData), breaks=100, main="Distribution of Expression Values")
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

#Significant Differential Expressed Genes
pThreshold <- 0.05
logThreshold <- 1

significantGenes<- results[results$adj.P.Val < pThreshold & abs(results$logFC) > logThreshold, ]
significantGenes <- significantGenes[order(significantGenes$adj.P.Val), ]

paste("Number of significant genes:", nrow(significantGenes))
write.csv(significantGenes, file="significantGenes-probeID.csv", row.names = TRUE)


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
write.csv(significantGenes, file="significantGenes.csv", row.names = TRUE)

# GraphQL mutation
mutation <- '
mutation insertGeneExpressions($data: [GeneExpressionInput]!) {
  insertGeneExpressions(data: $data) {
    id
    symbol
    logFC
    AveExpr
    t
    PValue
    adjPValue
    B
    _row
  }
}
'

### FORMATTING ###

library(dplyr)
library(tibble)
significantGenes

# Rename columns and remove rownames
colnames(significantGenes)[colnames(significantGenes) == "geneSymbol"] <- "symbol"
colnames(significantGenes)[colnames(significantGenes) == "P.Value"] <- "PValue"
colnames(significantGenes)[colnames(significantGenes) == "adj.P.Val"] <- "adjPValue"

print(significantGenes)
write.csv(significantGenes, file = "significantGenes.csv", row.names = TRUE)
library(jsonlite)
variables <- list(data = significantGenes)
json_payload <- toJSON(list(query = mutation, variables = variables), auto_unbox = TRUE)

# Print the payload for verification
cat("JSON Payload:\n", json_payload, "\n")
#######


# Send to GraphQL endpoint
url <- "http://localhost:4000"
response <- POST(
  url,
  add_headers(`Content-Type` = "application/json"),
  body = json_payload,
  encode = "json"
)

# Check the response
response_content <- content(response, "text", encoding = "UTF-8")
cat("Response Content:\n", response_content, "\n")

