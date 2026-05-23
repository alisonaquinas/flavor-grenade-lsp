---
title: "R Markdown Smoketest"
output: html_document
params:
  dataset: airquality
---

# Results

Rows: `r nrow(airquality)`

```{r setup, include = FALSE, echo = TRUE}
knitr::opts_chunk$set(message = FALSE)
```
