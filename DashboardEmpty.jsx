// Dashboard — empty state. Shown when the user has no dossiers yet AND
// their company profile is not yet complete (the product gates dossier
// creation on a complete profile — see Figma /Page-1/Dashboard variant 1).
//
// Polished version: rather than a bare message + red button floating in
// whitespace, this is a centered illustrated card that explains *why*
// the user can't create a dossier yet, shows a checklist of what's
// missing, and offers a single clear primary CTA to finish the profile.

function DashboardEmpty({ onGoToProfile, onNav }) {
  // Fake checklist of what the product still needs from the company.
  // In the real product these come from the profile-completion API.
  const checklist = [
    { key: 'company',  label: 'Të dhënat e kompanisë',      done: true  },
    { key: 'penalty',  label: 'Dëshmia e penalitetit',      done: true  },
    { key: 'insurance',label: 'Sigurimet shoqërore',        done: false },
    { key: 'email',    label: 'Konfirmimi i email-it',      done: false },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checklist.length) * 100);

  return (
    <>
      <AppHeader active="dosjet" onNav={onNav} />
      <div className="t-page" style={{ padding: '20px 0px 64px' }}>
        <div className="t-page-head">
          <div>
            <h1 className="t-page-title">Dosjet e Mia</h1>
            <p className="t-page-sub">Menaxho dokumentet e tenderave dhe dosjet e projekteve.</p>
          </div>
          <button
            className="t-btn-disabled"
            disabled
            title="Plotësoni profilin për të krijuar dosje">
            <span className="material-icons">add</span>
            Krijo dosje
          </button>
        </div>

        <div className="t-empty-card">
          <div className="t-empty-illo" aria-hidden>
            {/* Hand-drawn folder + document illustration to give the empty state weight */}
            <svg viewBox="0 0 220 160" width="220" height="160">
              <defs>
                <linearGradient id="fld" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#FFB870"/>
                  <stop offset="1" stopColor="#FF8400"/>
                </linearGradient>
              </defs>
              {/* back folder */}
              <path d="M24 52 h72 l14 14 h78 a8 8 0 0 1 8 8 v56 a8 8 0 0 1 -8 8 h-164 a8 8 0 0 1 -8 -8 v-70 a8 8 0 0 1 8 -8z"
                    fill="url(#fld)" opacity="0.35"/>
              {/* paper 1 */}
              <rect x="54" y="42" width="112" height="80" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
              <rect x="64" y="56" width="60" height="6" rx="3" fill="#E2E8F0"/>
              <rect x="64" y="70" width="92" height="4" rx="2" fill="#F1F5F9"/>
              <rect x="64" y="80" width="80" height="4" rx="2" fill="#F1F5F9"/>
              <rect x="64" y="90" width="88" height="4" rx="2" fill="#F1F5F9"/>
              <rect x="64" y="100" width="48" height="4" rx="2" fill="#F1F5F9"/>
              {/* paper 2 (slightly rotated, in front) */}
              <g transform="rotate(-6 110 110)">
                <rect x="54" y="62" width="112" height="80" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
                <rect x="64" y="76" width="60" height="6" rx="3" fill="#FFE5D8"/>
                <rect x="64" y="90" width="92" height="4" rx="2" fill="#F1F5F9"/>
                <rect x="64" y="100" width="80" height="4" rx="2" fill="#F1F5F9"/>
              </g>
              {/* front folder tab */}
              <path d="M24 52 h72 l14 14 h-86z" fill="url(#fld)" opacity="0.9"/>
              {/* Orange lock badge */}
              <g transform="translate(168 30)">
                <circle r="20" fill="#FF8400"/>
                <path d="M-7 -2 v-4 a7 7 0 0 1 14 0 v4 M-8 -2 h16 v12 h-16z"
                      fill="none" stroke="#FFF" strokeWidth="2" strokeLinejoin="round"/>
                <circle cy="5" r="1.8" fill="#FFF"/>
              </g>
            </svg>
          </div>

          <div className="t-empty-body">
            <span className="t-empty-eyebrow">
              <span className="material-icons">lock</span>
              Profili nuk është i plotë
            </span>
            <h2 className="t-empty-title">Plotësoni profilin për të krijuar dosjen e parë</h2>
            <p className="t-empty-lede">
              Tenderat kërkon dokumentacionin bazë të kompanisë për të lejuar
              krijimin e dosjeve të tenderave. Kjo bëhet <b>vetëm një herë</b>.
            </p>

            <div className="t-empty-ctas">
              <button className="t-btn-primary" onClick={onGoToProfile}>
                <span className="material-icons">arrow_forward</span>
                Plotëso Profilin e Kompanisë
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
window.DashboardEmpty = DashboardEmpty;
