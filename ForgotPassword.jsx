// Forgot password — two-step flow that matches the Login "Card" layout.
//   1. Request    — user enters NIPT (or email) and we send a reset link
//   2. Confirmation — "check your inbox" state with resend + back-to-login
//
// Reuses .lg-card-shell / .lg-card / .lg-form so it's visually identical to
// the login page; diverges only in copy, icon, and the back link.

function BrandMark({ size = 32 }) {
  return (
    <div className="lg-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <rect x="0" y="0" width="32" height="32" rx="7" fill="#FF8400" />
        <path d="M7 11.5h18M16 11.5V24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function FPLangSwitch({ value, onChange }) {
  return (
    <div className="lg-lang">
      {['AL', 'EN'].map((k) => (
        <button
          key={k}
          className={value === k ? 'is-on' : ''}
          onClick={() => onChange(k)}>
          {k}
        </button>
      ))}
    </div>
  );
}

// ----- Step 1: Request the reset -----
function FPRequest({ onSubmit, onBack }) {
  const [id, setId] = React.useState('');
  return (
    <form
      className="lg-form"
      onSubmit={(e) => { e.preventDefault(); if (id.trim()) onSubmit(id); }}>
      <Field
        label="NIPT ose email"
        icon="badge"
        placeholder="L01234567A ose emri@kompania.al"
        value={id}
        onChange={setId}
      />
      <PrimaryButton type="submit" disabled={!id.trim()}>
        Dërgo linkun e rivendosjes
      </PrimaryButton>
      <button type="button" className="fp-back" onClick={onBack}>
        <span className="material-icons">arrow_back</span>
        Kthehu te identifikimi
      </button>
    </form>
  );
}

// ----- Step 2: Sent confirmation -----
function FPSent({ identifier, onResend, onBack }) {
  const [resent, setResent] = React.useState(false);
  const doResend = () => {
    onResend && onResend();
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };
  // If user typed an email, show the masked version; otherwise show a generic line.
  const looksLikeEmail = /@/.test(identifier || '');
  const masked = looksLikeEmail
    ? identifier.replace(/^(.)(.*)(.@)/, (_, a, b, c) => a + '•'.repeat(Math.max(1, b.length)) + c)
    : null;

  return (
    <div className="fp-sent">
      <div className="fp-sent-row">
        <span className="material-icons">schedule</span>
        Emaili mund të marrë disa minuta.
      </div>
      <div className="fp-sent-row">
        <span className="material-icons">search</span>
        Kontrolloni edhe dosjen e Spam-it.
      </div>
      {looksLikeEmail && (
        <div className="fp-sent-row">
          <span className="material-icons">alternate_email</span>
          Dërguar te <strong>{masked}</strong>
        </div>
      )}

      <div className="fp-resend">
        {resent ? (
          <span className="fp-resend-ok">
            <span className="material-icons">check_circle</span>
            Emaili u ridërgua
          </span>
        ) : (
          <>
            <span>Nuk e gjeni emailin?</span>
            <button type="button" className="t-link fp-linkbtn" onClick={doResend}>
              Dërgoje sërish
            </button>
          </>
        )}
      </div>

      <PrimaryButton onClick={onBack}>Kthehu te identifikimi</PrimaryButton>
    </div>
  );
}

// ============ Root ============
function ForgotPassword({ onBackToLogin }) {
  const [lang, setLang] = React.useState('AL');
  const [step, setStep] = React.useState('request'); // 'request' | 'sent'
  const [identifier, setIdentifier] = React.useState('');

  const submit = (v) => {
    setIdentifier(v);
    setStep('sent');
  };

  return (
    <div className="lg-root">
      <div className="lg-card-shell">
        <header className="lg-card-top">
          <div className="lg-hero-mark">
            <BrandMark size={32} /> Tenderat
          </div>
          <FPLangSwitch value={lang} onChange={setLang} />
        </header>
        <main className="lg-card-main">
          <div className="lg-card">
            <div className="lg-card-title">
              <div className="fp-icon">
                <span className="material-icons">lock_reset</span>
              </div>
              {step === 'request' ? (
                <h2>Harruat fjalëkalimin?</h2>
              ) : (
                <>
                  <h2>Kontrolloni emailin tuaj</h2>
                  <p>
                    Nëse një llogari ekziston për <strong>{identifier}</strong>,
                    do të merrni një email me udhëzime për rivendosjen e
                    fjalëkalimit brenda pak minutash.
                  </p>
                </>
              )}
            </div>

            {step === 'request' ? (
              <FPRequest onSubmit={submit} onBack={onBackToLogin} />
            ) : (
              <FPSent
                identifier={identifier}
                onResend={() => {}}
                onBack={onBackToLogin}
              />
            )}
          </div>
        </main>
        <footer className="lg-card-foot">
          © 2026 Tenderat.al · Të gjitha të drejtat e rezervuara
        </footer>
      </div>
    </div>
  );
}

window.ForgotPassword = ForgotPassword;
