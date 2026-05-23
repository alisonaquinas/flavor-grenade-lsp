# src/lsp/handlers/**tests**/

When changing lifecycle or notification code, assert both the direct handler
result and the mutated service state. Keep dispatcher-facing request handlers
async.
