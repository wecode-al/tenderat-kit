// Register — create an account with NIPT + password + confirm.
// Matches the Login "Card" layout (.lg-card-shell / .lg-card / .lg-form).

function RGBrandMark({ size = 32 }) {
  return (
    <div className="lg-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <rect x="0" y="0" width="32" height="32" rx="7" fill="#FF8400" />
        <path d="M7 11.5h18M16 11.5V24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function RGLangSwitch({ value, onChange }) {
  return (
    <div className="lg-lang">
      {['AL', 'EN'].map((k) => (
        <button key={k} className={value === k ? 'is-on' : ''} onClick={() => onChange(k)}>{k}</button>
      ))}
    </div>
  );
}

// Simple password strength meter (0-4).
function scorePw(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function Register({ onBackToLogin, onRegistered }) {
  const [lang, setLang] = React.useState('AL');
  const [nipt, setNipt] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [agree, setAgree] = React.useState(false);

  const score = scorePw(pw);
  const strengthLabel = ['Shumë i dobët', 'I dobët', 'Mesatar', 'I mirë', 'I fortë'][score];
  const matches = pw.length > 0 && pw === pw2;
  const mismatch = pw2.length > 0 && pw !== pw2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailBad = email.length > 0 && !emailOk;
  const canSubmit =
    nipt.trim().length >= 6 && emailOk && pw.length >= 8 && matches && agree;

  return (
    <div className="lg-root">
      <div className="lg-card-shell">
        <header className="lg-card-top">
          <div className="lg-hero-mark"><RGBrandMark size={32} /> Tenderat</div>
          <RGLangSwitch value={lang} onChange={setLang} />
        </header>
        <main className="lg-card-main">
          <div className="lg-card">
            <div className="lg-card-title">
              <div className="fp-icon">
                <span className="material-icons">person_add</span>
              </div>
              <h2>Krijoni llogarinë tuaj</h2>
            </div>

            <form
              className="lg-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) onRegistered && onRegistered();
              }}>
              <Field
                label="NIPT"
                icon="business"
                placeholder="L01234567A"
                value={nipt}
                onChange={setNipt}
              />
              <Field
                label="Email"
                icon="alternate_email"
                type="email"
                placeholder="emri@kompania.al"
                value={email}
                onChange={setEmail}
                trailingIcon={emailOk ? 'check_circle' : (emailBad ? 'error' : undefined)}
              />
              {emailBad && (
                <div className="rg-hint is-err">
                  <span className="material-icons">error</span>
                  Ju lutem shkruani një email të vlefshëm.
                </div>
              )}
              <div className="rg-pw">
                <Field
                  label="Fjalëkalimi"
                  icon="lock"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Të paktën 8 karaktere"
                  value={pw}
                  onChange={setPw}
                  trailingIcon={showPw ? 'visibility_off' : 'visibility'}
                />
                {pw.length > 0 && (
                  <div className={'rg-strength is-s' + score}>
                    <div className="rg-strength-bars" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={i < score ? 'is-on' : ''} />
                      ))}
                    </div>
                    <span className="rg-strength-label">{strengthLabel}</span>
                  </div>
                )}
              </div>
              <Field
                label="Konfirmo fjalëkalimin"
                icon="lock"
                type={showPw ? 'text' : 'password'}
                placeholder="Shkruaj përsëri fjalëkalimin"
                value={pw2}
                onChange={setPw2}
                trailingIcon={matches ? 'check_circle' : (mismatch ? 'error' : undefined)}
              />
              {mismatch && (
                <div className="rg-hint is-err">
                  <span className="material-icons">error</span>
                  Fjalëkalimet nuk përputhen.
                </div>
              )}

              <label className="rg-agree">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  Pranoj <a href="#" className="t-link">Kushtet e Përdorimit</a>
                  {' '}dhe <a href="#" className="t-link">Politikën e Privatësisë</a>.
                </span>
              </label>

              <PrimaryButton type="submit" disabled={!canSubmit}>
                Krijo llogarinë
              </PrimaryButton>

              <button type="button" className="fp-back" onClick={onBackToLogin}>
                <span className="material-icons">arrow_back</span>
                Kthehu te identifikimi
              </button>
            </form>
          </div>
        </main>
        <footer className="lg-card-foot">
          © 2026 Tenderat.al · Të gjitha të drejtat e rezervuara
        </footer>
      </div>
    </div>
  );
}

window.Register = Register;
