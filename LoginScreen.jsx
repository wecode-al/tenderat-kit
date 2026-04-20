// Login — centered card variant.
//
// Upgrades:
//   - Proper brand mark (orange T square) alongside the wordmark
//   - Segmented language switch (EN / AL)

// ----- Brand mark -----
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

// ----- Segmented language -----
function LangSwitch({ value, onChange }) {
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

// ----- The form itself -----
function LoginForm({ onSignIn, onForgot, compact }) {
  const [nipt, setNipt] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  return (
    <form
      className={'lg-form' + (compact ? ' is-compact' : '')}
      onSubmit={(e) => { e.preventDefault(); onSignIn && onSignIn(); }}>
      <Field
        label="NIPT"
        icon="business"
        placeholder="L01234567A"
        value={nipt}
        onChange={setNipt}
      />
      <Field
        label="Fjalëkalimi"
        icon="lock"
        type={showPw ? 'text' : 'password'}
        placeholder="••••••••"
        value={pw}
        onChange={setPw}
        trailingIcon={showPw ? 'visibility_off' : 'visibility'}
      />
      <div className="lg-row">
        <label className="t-check">
          <input type="checkbox" defaultChecked />
          Qëndro i identifikuar
        </label>
        <a href="#" className="t-link" onClick={(e) => { e.preventDefault(); onForgot && onForgot(); }}>Harruat fjalëkalimin?</a>
      </div>
      <PrimaryButton type="submit">Identifikohu</PrimaryButton>
    </form>
  );
}

// ============ Card layout ============
function LoginCard({ onSignIn, onForgot, onRegister, lang, setLang }) {
  return (
    <div className="lg-card-shell">
      <header className="lg-card-top">
        <div className="lg-hero-mark"><BrandMark size={32} /> Tenderat</div>
        <LangSwitch value={lang} onChange={setLang} />
      </header>
      <main className="lg-card-main">
        <div className="lg-card">
          <div className="lg-card-title">
            <BrandMark size={48} />
            <h2>Hyni në llogarinë tuaj</h2>
          </div>
          <LoginForm onSignIn={onSignIn} onForgot={onForgot} />
          <p className="lg-foot">Nuk keni llogari? <a href="#" className="t-link" onClick={(e) => { e.preventDefault(); onRegister && onRegister(); }}>Regjistrohuni këtu</a></p>
        </div>
      </main>
      <footer className="lg-card-foot">© 2026 Tenderat.al · Të gjitha të drejtat e rezervuara</footer>
    </div>
  );
}

// ============ Root ============
function LoginScreen({ onSignIn, onForgot, onRegister }) {
  const [lang, setLang] = React.useState('AL');
  return (
    <div className="lg-root">
      <LoginCard onSignIn={onSignIn} onForgot={onForgot} onRegister={onRegister} lang={lang} setLang={setLang} />
    </div>
  );
}
window.LoginScreen = LoginScreen;
