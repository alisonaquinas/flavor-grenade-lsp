# completion/

Completion providers for OFM-specific trigger characters.

The completion system is built around a `CompletionRouter` that inspects the
cursor context and delegates to the matching provider. Each provider handles
one OFM construct and returns a list of `CompletionItem` objects.

## Files

| File                             | Role                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `completion-router.ts`           | Routes `textDocument/completion` to the right provider based on cursor context                            |
| `context-analyzer.ts`            | Analyzes the text before the cursor to identify the active trigger (wiki-link, embed, tag, callout, etc.) |
| `callout-completion-provider.ts` | Completes `> [!TYPE]` callout keywords                                                                    |
| `embed-completion-provider.ts`   | Completes `![[target]]` embed targets                                                                     |
| `heading-completion-provider.ts` | Completes `[[file#heading]]` heading fragments                                                            |
| `tag-completion-provider.ts`     | Completes `#tag` tokens using `TagRegistry`                                                               |
| `completion.module.ts`           | NestJS module                                                                                             |

Wiki-link and block-reference completions live in `src/resolution/`:
`wiki-link-completion-provider.ts` and `block-ref-completion-provider.ts`.

## Trigger Characters

| Character | Trigger                       | Provider                                   |
| --------- | ----------------------------- | ------------------------------------------ |
| `[`       | `[[` wiki-link start          | `WikiLinkCompletionProvider` (resolution/) |
| `!`       | `![[` embed start             | `EmbedCompletionProvider`                  |
| `#`       | standalone `#`                | `TagCompletionProvider`                    |
| `^`       | `[[file#^` block-ref fragment | `BlockRefCompletionProvider` (resolution/) |
| `>`       | callout blockquote            | `CalloutCompletionProvider`                |
| any       | `[[file#` heading fragment    | `HeadingCompletionProvider`                |
