# src/code-actions/**tests**/

Add regression tests beside the code action being changed. Assert returned
`CodeAction` shape and workspace edits directly; avoid snapshot-only coverage
for edits that modify user files.
