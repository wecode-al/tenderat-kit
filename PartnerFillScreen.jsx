// Partner-fill landing — what the supporting company sees when they open the
// secure link generated from "Deklaro mbështetjen" (mode: 'link').
//
// Flow:
//   1. Gate — verify the partner's email with a 6-digit code.
//   2. Form — capacity lists (Staf / Makineri / Certifikime / Licenca), filled
//      by the partner themselves using the same AddIsoDrawer as the main app.
//   3. Done — confirmation that the data reached the requesting company.

function PFCodeInput({ value, onChange, length = 6 }) {
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
    <div className="pf-code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={'pf-code-cell' + (digits[i].trim() ? ' is-filled' : '')}
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

function PFSingleDoc({ title, hint, icon, file, onPick, onClear }) {
  return (
    <div className={'pf-single' + (file ? ' has-file' : '')}>
      <div className="pf-single-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="pf-single-body">
        <div className="pf-single-title">{title}</div>
        <div className="pf-single-hint">{hint}</div>
        {file ? (
          <div className="pf-single-file">
            <span className="material-icons">insert_drive_file</span>
            <div className="pf-single-file-meta">
              <strong>{file.name}</strong>
              {file.size && <span>{file.size}</span>}
            </div>
            <button type="button" className="pf-single-file-x" onClick={onClear} aria-label="Hiq">
              <span className="material-icons">close</span>
            </button>
          </div>
        ) : (
          <button type="button" className="pf-single-pick" onClick={onPick}>
            <span className="material-icons">upload_file</span>
            Ngarko dokumentin
          </button>
        )}
      </div>
    </div>
  );
}

function PartnerFillScreen({ invite, onDone }) {
  // Mock invite payload — what the backend would sign into the link.
  const inv = invite || {
    partnerCompany: 'Konstruksion Plus SH.P.K.',
    partnerEmail: 'info@konstruksionplus.al',
    requester: 'Albkons SH.P.K.',
    referenca: 'DKP-2026/412',
    objekti: 'Rikonstruksion i rrugës Durrës–Kavajë',
    token: 'abc12345',
  };

  const [stage, setStage] = React.useState('verify'); // 'verify' | 'form' | 'done'
  const [code, setCode] = React.useState('');
  const [codeErr, setCodeErr] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const [data, setData] = React.useState({
    staff: [],
    machinery: [],
    certificates: [],
    licenses: [],
    similarWorks: [],     // "Punë të ngjashme" — multiple entries (work kind)
    listpagesa: null,     // one doc — { name }
    xhiro: null,          // one doc — { name }
  });
  const [drawerKind, setDrawerKind] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);

  const resend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  const verify = (e) => {
    e && e.preventDefault();
    if (code.length !== 6) return;
    if (code === '000000') { setCodeErr(true); return; }
    setStage('form');
  };

  const KIND_TO_STORE = {
    staff: 'staff',
    machine: 'machinery',
    iso: 'certificates',
    license: 'licenses',
    work: 'similarWorks',
  };
  const STORE_TO_KIND = {
    staff: 'staff',
    machinery: 'machine',
    certificates: 'iso',
    licenses: 'license',
    similarWorks: 'work',
  };

  const handleDrawerSave = (entry) => {
    const key = KIND_TO_STORE[drawerKind];
    if (!key || !entry || !entry.name) return;
    setData((d) => {
      if (editIndex >= 0) {
        return { ...d, [key]: d[key].map((it, idx) => (idx === editIndex ? entry : it)) };
      }
      return { ...d, [key]: [...d[key], entry] };
    });
    setEditIndex(-1);
  };

  const removeAt = (key) => (i) =>
    setData((d) => ({ ...d, [key]: d[key].filter((_, idx) => idx !== i) }));

  const handleEdit = (storeKey, i) => {
    const kind = STORE_TO_KIND[storeKey];
    if (!kind) return;
    setEditIndex(i);
    setDrawerKind(kind);
  };

  const editInitial = (editIndex >= 0 && drawerKind)
    ? (data[KIND_TO_STORE[drawerKind]] || [])[editIndex]
    : null;

  const total =
    data.staff.length + data.machinery.length + data.certificates.length +
    data.licenses.length + data.similarWorks.length +
    (data.listpagesa ? 1 : 0) + (data.xhiro ? 1 : 0);

  // Mock-pick a "file" for the single-doc uploads (Lispagesa / Xhiro). This
  // mirrors the pattern used in FirstLogin — no real upload happens.
  const pickFile = (key, label) => {
    setData((d) => ({ ...d, [key]: { name: label + '.pdf', size: '240 KB' } }));
  };
  const clearFile = (key) => setData((d) => ({ ...d, [key]: null }));

  // On the verify stage we show a centered card (Confirm-email style). After
  // the partner unlocks, we switch to the wider wizard layout with the hero.
  if (stage === 'verify') {
    return (
      <div className="lg-root">
        <div className="lg-card-shell">
          <header className="lg-card-top">
            <div className="lg-hero-mark">
              <div className="lg-mark" style={{ width: 32, height: 32 }}>
                <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden>
                  <rect x="0" y="0" width="32" height="32" rx="7" fill="#FF8400" />
                  <path d="M7 11.5h18M16 11.5V24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              Tenderat
            </div>
            <div className="pf-header-right">
              <span className="material-icons">lock</span>
              Lidhje e sigurt
            </div>
          </header>
          <main className="lg-card-main">
            <div className="lg-card">
              <div className="lg-card-title">
                <div className="fp-icon">
                  <span className="material-icons">mark_email_read</span>
                </div>
                <h2>Konfirmo email-in</h2>
                <p>
                  Kompania <strong>{inv.requester}</strong> ju ka ftuar të deklaroni
                  kapacitetet tuaja për procedurën <em>{inv.objekti}</em>.
                  Për të hapur këtë link, shkruani kodin 6-shifror që ju dërguam te{' '}
                  <strong>{inv.partnerEmail}</strong>.
                </p>
              </div>

              <form className="lg-form" onSubmit={verify}>
                <PFCodeInput value={code} onChange={(v) => { setCode(v); setCodeErr(false); }} />
                {codeErr && (
                  <div className="rg-hint is-err" style={{ marginTop: 0 }}>
                    <span className="material-icons">error</span>
                    Kodi nuk është i saktë. Provoni sërish.
                  </div>
                )}
                <PrimaryButton type="submit" disabled={code.length !== 6}>
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
                      Nuk e morët?{' '}
                      <button type="button" className="t-link" onClick={resend}>Dërgoje sërish</button>
                    </span>
                  )}
                </div>
              </form>
            </div>
          </main>
          <footer className="lg-card-foot">
            © 2026 Tenderat.al
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-root">
      <header className="pf-header">
        <div className="pf-header-inner">
          <div className="pf-brand">
            <span className="pf-brand-mark" aria-hidden>T</span>
            <span className="pf-brand-word">Tenderat</span>
          </div>
          <div className="pf-header-right">
            <span className="material-icons">lock</span>
            Lidhje e sigurt
          </div>
        </div>
      </header>

      <main className="pf-wrap">
        <div className="pf-hero">
          <div className="pf-hero-badge">
            <span className="material-icons">handshake</span>
          </div>
          <div className="pf-hero-copy">
            <div className="pf-hero-eyebrow">Ftesë për mbështetje kapacitetesh</div>
            <h1>Plotësoni kapacitetet tuaja për këtë procedurë</h1>
            <p>
              Kompania <strong>{inv.requester}</strong> kërkon mbështetjen tuaj në kapacitete
              për procedurën <em>{inv.objekti}</em> (referenca <strong>{inv.referenca}</strong>).
              Plotësoni stafin, makineritë, certifikimet, licencat, punët e ngjashme dhe
              dokumentet financiare që vini në dispozicion.
            </p>
          </div>
        </div>

        {stage === 'form' && (
          <>
            <section className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-head-icon is-ok">
                  <span className="material-icons">verified</span>
                </div>
                <div>
                  <h2>Të dhënat e kompanisë suaj</h2>
                  <p>Kapacitetet që vini në dispozicion për këtë procedurë.</p>
                </div>
              </div>

              <div className="pf-readonly">
                <div><span>Kompania</span><strong>{inv.partnerCompany}</strong></div>
                <div><span>Email i konfirmuar</span><strong>{inv.partnerEmail}</strong></div>
              </div>

              <CapacityLists
                data={data}
                onOpen={(kind) => { setEditIndex(-1); setDrawerKind(kind); }}
                onRemove={(key) => removeAt(key)}
                onEdit={handleEdit}
                staffHint="Personat që do marrin pjesë në këtë procedurë."
                machineryHint="Mjetet që vini në dispozicion."
                extras={{
                  onPickDoc: (key, label) => pickFile(key, label),
                  onClearDoc: (key) => clearFile(key),
                }}
              />
            </section>

            <div className="pf-submit">
              <PrimaryButton disabled={total === 0} onClick={() => setStage('done')}>
                Dërgo te {inv.requester}
              </PrimaryButton>
            </div>

            {window.AddIsoDrawer && (
              <window.AddIsoDrawer
                open={!!drawerKind}
                kind={drawerKind || 'staff'}
                initial={editInitial}
                onClose={() => { setDrawerKind(null); setEditIndex(-1); }}
                onSave={handleDrawerSave}
              />
            )}
          </>
        )}

        {stage === 'done' && (
          <section className="pf-card pf-done">
            <div className="pf-done-mark">
              <span className="material-icons">task_alt</span>
            </div>
            <h2>Faleminderit!</h2>
            <p>
              Të dhënat u dërguan te <strong>{inv.requester}</strong>. Do të merrni një email
              konfirmimi me një kopje të deklarimit tuaj.
            </p>
            <PrimaryButton onClick={() => onDone && onDone()}>Mbyll</PrimaryButton>
          </section>
        )}
      </main>

      <footer className="pf-foot">
        © 2026 Tenderat.al
      </footer>
    </div>
  );
}

window.PartnerFillScreen = PartnerFillScreen;
