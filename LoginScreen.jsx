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

// ----- Unconfirmed-email banner + inline verify -----
function LoginUnconfirmed({ onVerify, onCancel }) {
  const [sent, setSent] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [err, setErr] = React.useState(false);

  const resend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    if (code === '000000') { setErr(true); return; }
    onVerify && onVerify();
  };

  return (
    <div className="lg-unconfirmed">
      <div className="lg-unconfirmed-head">
        <span className="material-icons">mark_email_unread</span>
        <div>
          <div className="lg-unconfirmed-title">Email-i juaj nuk është konfirmuar</div>
          <div className="lg-unconfirmed-sub">
            Ju kemi dërguar një kod 6-shifror. Konfirmoni për të vazhduar.
          </div>
        </div>
      </div>

      {open ? (
        <form className="lg-unconfirmed-form" onSubmit={submit}>
          <CodeInput value={code} onChange={(v) => { setCode(v); setErr(false); }} />
          {err && (
            <div className="rg-hint is-err">
              <span className="material-icons">error</span>
              Kodi nuk është i saktë.
            </div>
          )}
          <PrimaryButton type="submit" disabled={code.length !== 6}>
            Konfirmo
          </PrimaryButton>
          <div className="rg-confirm-foot">
            {sent ? (
              <span className="rg-resent">
                <span className="material-icons">check_circle</span>
                Kodi i ri u dërgua
              </span>
            ) : (
              <span>
                Nuk e morët?{' '}
                <button type="button" className="t-link" onClick={resend}>Dërgoje sërish</button>
              </span>
            )}
          </div>
          <button type="button" className="fp-back" onClick={onCancel}>
            <span className="material-icons">arrow_back</span>
            Kthehu
          </button>
        </form>
      ) : (
        <div className="lg-unconfirmed-actions">
          <PrimaryButton onClick={() => setOpen(true)}>Shkruaj kodin</PrimaryButton>
          <button type="button" className="t-link" onClick={resend}>
            {sent ? 'U dërgua!' : 'Dërgoje sërish'}
          </button>
        </div>
      )}
    </div>
  );
}

// Reuse the same 6-digit CodeInput as Register.jsx. It lives there — we
// duplicate a thin wrapper here since CDN-loaded Babel files don't share
// module scope. Keep behavior identical.
function CodeInput({ value, onChange, length = 6 }) {
  const refs = React.useRef([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');
  const set = (i, ch) => {
    const clean = ch.replace(/\D/g, '').slice(0, 1);
    const next = (value + '').padEnd(length, ' ').split('');
    next[i] = clean || ' ';
    onChange(next.join('').replace(/\s+$/, '').replace(/\s/g, ''));
    if (clean && i < length - 1) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1] && refs.current[i - 1].focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1].focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1].focus();
  };
  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    const idx = Math.min(text.length, length - 1);
    refs.current[idx] && refs.current[idx].focus();
  };
  return (
    <div className="rg-code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={'rg-code-cell' + (digits[i].trim() ? ' is-filled' : '')}
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          aria-label={'Shifra ' + (i + 1)}
        />
      ))}
    </div>
  );
}

// ----- The form itself -----
function LoginForm({ onSignIn, onForgot, compact }) {
  const [nipt, setNipt] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [unconfirmed, setUnconfirmed] = React.useState(false);

  if (unconfirmed) {
    return (
      <LoginUnconfirmed
        onCancel={() => setUnconfirmed(false)}
        onVerify={() => onSignIn && onSignIn()}
      />
    );
  }

  const submit = (e) => {
    e.preventDefault();
    // Mock rule: NIPT ending in "X" simulates an unconfirmed-email account.
    // Everything else signs in straight through.
    if (nipt.trim().toUpperCase().endsWith('X')) {
      setUnconfirmed(true);
      return;
    }
    onSignIn && onSignIn();
  };

  return (
    <form
      className={'lg-form' + (compact ? ' is-compact' : '')}
      onSubmit={submit}>
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
