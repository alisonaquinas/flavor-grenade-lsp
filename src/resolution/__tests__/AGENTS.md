# src/resolution/**tests**/

For resolver changes, test both successful resolution and rejection paths. Do
not let tests normalize absolute paths into DocIds; that would hide production
invariant violations.
