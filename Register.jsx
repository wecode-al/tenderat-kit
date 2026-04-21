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

// 6-digit code input — one box per digit, auto-advance, backspace, paste.
function CodeInput({ value, onChange, length = 6 }) {
  const refs = React.useRef([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const set = (i, ch) => {
    const clean = ch.replace(/\D/g, '').slice(0, 1);
    const next = (value + '').padEnd(length, ' ').split('');
    next[i] = clean || ' ';
    const joined = next.join('').replace(/\s+$/, '').replace(/\s/g, '');
    onChange(joined);
    if (clean && i < length - 1) refs.current[i + 1] && refs.current[i + 1].focus();
  };

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
      refs.current[i - 1] && refs.current[i - 1].focus();
    }
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

function RegisterConfirm({ email, onDone, onBack }) {
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const filled = code.length === 6;

  const verify = () => {
    if (!filled) return;
    // Mock: any 6-digit code passes except '000000'.
    if (code === '000000') { setErr(true); return; }
    setErr(false);
    onDone && onDone();
  };

  const resend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="lg-card">
      <div className="lg-card-title">
        <div className="fp-icon">
          <span className="material-icons">mark_email_read</span>
        </div>
        <h2>Konfirmo email-in</h2>
        <p>
          Ju kemi dërguar një kod 6-shifror te <strong>{email}</strong>.
          Shkruajeni këtu për të aktivizuar llogarinë.
        </p>
      </div>

      <form
        className="lg-form"
        onSubmit={(e) => { e.preventDefault(); verify(); }}>
        <CodeInput value={code} onChange={(v) => { setCode(v); setErr(false); }} />
        {err && (
          <div className="rg-hint is-err" style={{ marginTop: 0 }}>
            <span className="material-icons">error</span>
            Kodi nuk është i saktë. Provoni sërish ose kërkoni një kod të ri.
          </div>
        )}

        <PrimaryButton type="submit" disabled={!filled}>
          Konfirmo dhe vazhdo
        </PrimaryButton>

        <div className="rg-confirm-foot">
          {sent ? (
            <span className="rg-resent">
              <span className="material-icons">check_circle</span>
              Kodi i ri u dërgua
            </span>
          ) : (
            <span>
              Nuk e gjeni emailin?{' '}
              <button type="button" className="t-link" onClick={resend}>Dërgoje sërish</button>
            </span>
          )}
        </div>

        <button type="button" className="fp-back" onClick={onBack}>
          <span className="material-icons">arrow_back</span>
          Ndrysho email-in
        </button>
      </form>
    </div>
  );
}

function Register({ onBackToLogin, onRegistered }) {
  const [lang, setLang] = React.useState('AL');
  const [nipt, setNipt] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [stage, setStage] = React.useState('form'); // 'form' | 'confirm'

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
          {stage === 'confirm' ? (
            <RegisterConfirm
              email={email}
              onBack={() => setStage('form')}
              onDone={() => onRegistered && onRegistered()}
            />
          ) : (
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
                if (canSubmit) setStage('confirm');
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
                placeholder="email@kompania.al"
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
          )}
        </main>
        <footer className="lg-card-foot">
          © 2026 Tenderat.al · Të gjitha të drejtat e rezervuara
        </footer>
      </div>
    </div>
  );
}

// Standalone email-confirmation screen — the same card shell as Register/Login,
// hosting the RegisterConfirm view. Used directly from the kit switcher.
function ConfirmEmail({ email = 'email@kompania.al', onDone, onBack }) {
  const [lang, setLang] = React.useState('AL');
  return (
    <div className="lg-root">
      <div className="lg-card-shell">
        <header className="lg-card-top">
          <div className="lg-hero-mark"><RGBrandMark size={32} /> Tenderat</div>
          <RGLangSwitch value={lang} onChange={setLang} />
        </header>
        <main className="lg-card-main">
          <RegisterConfirm
            email={email}
            onBack={onBack || (() => {})}
            onDone={onDone || (() => {})}
          />
        </main>
        <footer className="lg-card-foot">
          © 2026 Tenderat.al · Të gjitha të drejtat e rezervuara
        </footer>
      </div>
    </div>
  );
}

window.Register = Register;
window.ConfirmEmail = ConfirmEmail;
