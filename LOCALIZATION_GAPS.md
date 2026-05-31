# Localization Gaps

Languages audited:

- English
- Hindi
- Marathi
- Tamil

## Confirmed Coverage

- English has 230 translation keys.
- Hindi has 230 translation keys.

## Confirmed Gaps

- Marathi defines only 38 overrides and falls back to English for the remaining keys.
- Tamil defines only 38 overrides and falls back to English for the remaining keys.
- Several Marathi and Tamil override strings appear mojibake-encoded in `frontend/src/lib/i18n.ts`.
- Some UI strings remain hardcoded in components and are not routed through `t(...)`, including dashboard section labels, About page stack labels, command palette placeholder text, RTI modal placeholders, and some complaint form placeholders.

## Required Follow-up

- Replace mojibake Marathi and Tamil values with valid UTF-8 strings.
- Add full Marathi and Tamil translations for every English key.
- Move remaining hardcoded UI strings into the translation dictionary.
- Add an automated localization check that fails when non-English locales fall back to English unintentionally.
