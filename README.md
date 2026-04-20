# Tenderat Web App — UI Kit

High-fidelity, **pixel-close recreation** of `app.tenderat.al` as a clickable HTML prototype.

This is not production code. It is a visual + interaction reference:
- Real layout values lifted from the Figma file (`TENDERAT.fig`, `/Page-1/`).
- Real copy in Albanian.
- Real Material Icons via CDN.
- Fake state — clicks flow between screens but nothing persists.

## Screens covered

1. **Login** — NIPT + password, split-screen with orange-tinted hero photo
2. **Dashboard (empty, profile-missing)** — red "complete your profile" nag
3. **Dashboard (dossier grid)** — "Dosjet e Mia" with dossier cards + Krijo Dosje CTA
4. **Dossier detail** — metadata header + document list + Shkarko / Ndrysho actions
5. **Company profile (Profili i kompanisë)** — left-rail tree navigation + document manager with Upload / Download / Delete toolbar

## Components

| File | What it is |
|---|---|
| `AppHeader.jsx` | White top bar: logo, nav chips, bell, avatar |
| `BrowserChrome.jsx` | The `app.tenderat.al` address-bar frame the Figma uses |
| `Button.jsx` | MUI-styled filled CTA (Roboto Medium 15 · 4px radius · elevation-1) + outline/uppercase variants |
| `Field.jsx` | Labelled input with a leading Material icon |
| `DossierCard.jsx` | 12px white card with icon tile + title + metadata |
| `DocumentRow.jsx` | 62px document row, warm border + kebab |
| `LoginScreen.jsx` | Full auth page |
| `DashboardEmpty.jsx` | Empty state with red profile nag |
| `DashboardGrid.jsx` | Dossier grid |
| `DossierDetail.jsx` | Single-dossier page |
| `CompanyProfile.jsx` | Left-rail + document manager |

Open `index.html` to see the kit.
