# Dependency audit — Phase 02 (2026-11-04)

`npm audit` reports 16 moderate advisories. They all come from **one** advisory:
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). `minimatch` < 11.0.1 has a potential denial of service via globparts amplification.

| Question                          | Finding                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production dependencies affected? | **No.** `npm audit --omit=dev` reports 0 vulnerabilities.                                                                                                                                        |
| Direct dependencies flagged       | `eslint`, `eslint-config-next` (both dev-only). They are flagged because of their transitive `minimatch`.                                                                                        |
| Transitive path                   | `minimatch@3.1.5` (used by `@eslint/eslintrc`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`) and `minimatch@10.2.6` (used by `@typescript-eslint/typescript-estree`). |
| Patched versions available        | Only `minimatch` ≥ 11.0.1. There are no 3.x or 10.x backports.                                                                                                                                   |
| npm's suggested fix               | `eslint@4` / `eslint-config-next@0.2.4`. These are major **downgrades** that would break linting. Rejected.                                                                                      |
| ESLint 10                         | Still depends on `minimatch` ^10, so it does not clear the advisory. Not adopted.                                                                                                                |
| `overrides` to 11.x               | Unsafe for the v3 consumers, which call `require("minimatch")` as a function and would break. Not applied.                                                                                       |

**Decision:** accept for now. The vulnerable code only runs in the developer's linter, against glob patterns from our own config, so there is no attacker-controlled input. Re-run `npm audit` whenever ESLint or `eslint-config-next` is updated, and remove this entry once their plugins move to `minimatch` ≥ 11.
