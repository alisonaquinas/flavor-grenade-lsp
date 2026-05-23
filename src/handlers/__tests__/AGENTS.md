# src/handlers/**tests**/

For handler changes, add focused tests for the affected LSP request and include
edge positions at token boundaries. Do not introduce a second document cache in
tests; build state through existing vault and parser helpers.
