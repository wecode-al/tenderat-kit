// First Login — onboarding wizard shown after a user signs in for the first
// time. Email confirmation lives on the Register / Login screens, not here.

const FL_STEPS = [
  { key: 'paketa',    label: 'Paketa',                icon: 'workspace_premium' },
  { key: 'kompania',  label: 'Të dhënat e kompanisë', icon: 'business' },
  { key: 'penalitet', label: 'Dëshmia e penalitetit', icon: 'gavel' },
  { key: 'sigurime',  label: 'Sigurimet shoqërore',   icon: 'verified_user' },
];

// ---------- Shared chrome ----------
// Pre-auth header — uses the same .t-header chrome as the rest of the app
// (logo mark + wordmark, 64px tall, 1280px inner), with a single "sign out"
// affordance on the right instead of nav/notifications/user.
function FLHeader({ onExit }) {
  return (
    <header className="t-header">
      <div className="t-header-inner">
        <div className="t-header-left">
          <div className="t-logo">
            <span className="t-logo-mark" aria-hidden>T</span>
            <span className="t-logo-word">Tenderat</span>
          </div>
        </div>
        <div className="t-header-right">
          <button type="button" className="fl-exit" onClick={onExit}>
            <span className="material-icons">logout</span>
            <span>Dil nga llogaria</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function FLFooter() {
  return (
    <p className="fl-foot">
      Keni nevojë për ndihmë? <a href="#" className="t-link">Na kontaktoni</a>
    </p>
  );
}

// Left rail: step tracker + completed summary. Every step is clickable —
// users can jump forward to any already-completed step or skip back.
function FLRail({ current, done, summary, onJump }) {
  return (
    <aside className="fl-rail">
      <div className="fl-rail-top">
        <div className="fl-rail-eyebrow">Konfigurimi fillestar</div>
        <div className="fl-rail-title">Mirësevini në Tenderat</div>
        <div className="fl-rail-sub">
          Pak hapa dhe llogaria juaj do të jetë gati për të krijuar dosjen e parë.
        </div>
      </div>

      <ol className="fl-rail-list">
        {FL_STEPS.map((s, i) => {
          const state = done.has(i) ? 'done' : i === current ? 'active' : 'todo';
          return (
            <li key={s.key} className={'fl-rail-step fl-rail-' + state}>
              <button
                type="button"
                className="fl-rail-btn"
                onClick={() => onJump && onJump(i)}
                aria-current={state === 'active' ? 'step' : undefined}>
                <div className="fl-rail-node">
                  <span className="material-icons">
                    {state === 'done' ? 'check' : s.icon}
                  </span>
                </div>
                <div className="fl-rail-text">
                  <div className="fl-rail-label">{s.label}</div>
                  {summary[i] && state !== 'active' && (
                    <div className="fl-rail-hint">{summary[i]}</div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="fl-rail-help">
        <span className="material-icons">support_agent</span>
        <div>
          <div className="fl-rail-help-title">Keni pyetje?</div>
          <div className="fl-rail-help-sub">Na shkruani në <a href="#" className="t-link">ndihme@tenderat.al</a></div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Step 0: Paketa ----------
function FLPaketa({ picked, onPick, onNext }) {
  const plans = [
    {
      id: 'mujore',
      tag: 'Mujore',
      price: '20€',
      unit: '/muaj',
      blurb: 'Akses i plotë me pagesë mujore. Anulohet në çdo kohë.',
      features: ['Dosje të pakufizuara', 'Njoftime për afate', 'Dokumentacion i ruajtur'],
    },
    {
      id: 'vjetore',
      tag: 'Vjetore',
      price: '200€',
      unit: '/vit',
      blurb: 'Kurseni 40€ në vit. E rekomanduar për biznese aktive.',
      features: ['Gjithçka në Mujore', 'Mbështetje prioritare', '2 muaj falas'],
      badge: 'Më e zgjedhur',
    },
    {
      id: 'dosje',
      tag: 'Një dosje',
      price: '17€',
      unit: '/dosje',
      blurb: 'Pagesë për një dosje të vetme, pa abonim.',
      features: ['1 dosje e plotë', 'Dokumentacion i ruajtur', 'Pa afat skadimi'],
    },
  ];
  return (
    <div className="fl-step-body">
      <header className="fl-step-head">
        <h2>Zgjidhni paketën tuaj</h2>
        <p>Mund ta ndryshoni në çdo kohë nga cilësimet e llogarisë.</p>
      </header>
      <div className="fl-plans">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={'fl-plan' + (picked === p.id ? ' is-on' : '')}
            onClick={() => onPick(p.id)}>
            {p.badge && <span className="fl-plan-badge">{p.badge}</span>}
            <div className="fl-plan-tag">{p.tag}</div>
            <div className="fl-plan-price">
              <b>{p.price}</b>
              <span>{p.unit}</span>
            </div>
            <p className="fl-plan-blurb">{p.blurb}</p>
            <ul className="fl-plan-feats">
              {p.features.map((f) => (
                <li key={f}>
                  <span className="material-icons">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <span className={'fl-plan-radio' + (picked === p.id ? ' is-on' : '')} aria-hidden />
          </button>
        ))}
      </div>
      <div className="fl-actions fl-actions-right">
        <PrimaryButton onClick={onNext} disabled={!picked}>
          Vazhdo te të dhënat e kompanisë
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------- Step 1: Të dhënat e kompanisë ----------
function FLKompania({ data, setData, onNext, onBack }) {
  const set = (k) => (v) => setData({ ...data, [k]: v });
  const addOrtak = () => setData({
    ...data,
    partners: [...(data.partners || []), { name: '', share: '' }],
  });
  const updatePartner = (i, k, v) => {
    const next = [...(data.partners || [])];
    next[i] = { ...next[i], [k]: v };
    setData({ ...data, partners: next });
  };
  const removePartner = (i) => {
    const next = [...(data.partners || [])];
    next.splice(i, 1);
    setData({ ...data, partners: next });
  };

  return (
    <div className="fl-step-body">
      <header className="fl-step-head">
        <h2>Të dhënat e kompanisë</h2>
        <p>Këto të dhëna shfaqen në dosje dhe oferta. Mund t'i editoni më vonë.</p>
      </header>

      {/* Section: Identifikimi */}
      <section className="fl-section">
        <div className="fl-section-head">
          <h3>Identifikimi</h3>
          <span>Emri ligjor dhe NIPT-i i biznesit</span>
        </div>
        <div className="fl-grid-2">
          <Field label="Emri i kompanisë" value={data.emri || ''} onChange={set('emri')} placeholder="p.sh. Alb Construction SH.P.K." />
          <Field label="Forma ligjore" value={data.formaLigjore || ''} onChange={set('formaLigjore')} placeholder="SH.P.K." />
          <Field label="NIPT" value={data.nipt || ''} onChange={set('nipt')} placeholder="L01234567A" />
          <Field label="Viti i themelimit" value={data.viti || ''} onChange={set('viti')} placeholder="2015" />
        </div>
      </section>

      {/* Section: Vendndodhja */}
      <section className="fl-section">
        <div className="fl-section-head">
          <h3>Vendndodhja & Kontakti</h3>
          <span>Adresa zyrtare dhe mënyra e komunikimit</span>
        </div>
        <div className="fl-grid-2">
          <Field label="Shteti" value={data.shteti || ''} onChange={set('shteti')} placeholder="Shqipëri" />
          <Field label="Qyteti" value={data.qyteti || ''} onChange={set('qyteti')} placeholder="Tiranë" />
          <Field label="Adresa" value={data.adresa || ''} onChange={set('adresa')} placeholder="Rr. e Kavajës, Nr. 12" />
          <Field label="Telefon" value={data.tel || ''} onChange={set('tel')} placeholder="+355 4 220 1234" />
        </div>
      </section>

      {/* Section: Aktiviteti */}
      <section className="fl-section">
        <div className="fl-section-head">
          <h3>Aktiviteti</h3>
          <span>Fusha kryesore e veprimtarisë</span>
        </div>
        <label className="fl-label" htmlFor="fl-obiekt">Objekti i Veprimtarisë</label>
        <textarea
          id="fl-obiekt"
          className="fl-textarea"
          rows={4}
          placeholder="Shkruani fushat kryesore ku operon kompania — p.sh. ndërtim civil, furnizim materialesh, konsulencë…"
          value={data.obiekt || ''}
          onChange={(e) => set('obiekt')(e.target.value)}
        />
      </section>

      {/* Section: Ortakët */}
      <section className="fl-section">
        <div className="fl-section-head">
          <h3>Ortakët</h3>
          <span>Opsionale — shtoni një ortak për çdo person me pjesëmarrje në kapital</span>
        </div>
        {(data.partners || []).map((p, i) => (
          <div key={i} className="fl-partner">
            <div className="fl-partner-num">#{i + 1}</div>
            <div className="fl-partner-body">
              <Field label="Emër & mbiemër" value={p.name} onChange={(v) => updatePartner(i, 'name', v)} placeholder="p.sh. Andi Hoxha" />
              <Field label="Pjesëmarrja (%)" value={p.share} onChange={(v) => updatePartner(i, 'share', v)} placeholder="50" />
            </div>
            <button type="button" className="fl-partner-x" onClick={() => removePartner(i)} aria-label="Hiq ortakun">
              <span className="material-icons">close</span>
            </button>
          </div>
        ))}
        <button type="button" className="fl-add-row" onClick={addOrtak}>
          <span className="material-icons">add_circle_outline</span>
          Shto ortak
        </button>
      </section>

      <div className="fl-actions">
        <button type="button" className="fl-ghost" onClick={onBack}>
          <span className="material-icons">arrow_back</span> Mbrapa
        </button>
        <PrimaryButton onClick={onNext}>Vazhdo</PrimaryButton>
      </div>
    </div>
  );
}

// ---------- Upload step (steps 2 & 3) ----------
function FLUploadStep({
  title, subtitle, requirements, declare, declareText,
  file, setFile, onNext, onBack, onSkip,
}) {
  const [dragging, setDragging] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile({ name: f.name, size: Math.round(f.size / 1024) + 'kb', progress: 100 });
  };

  const pickFile = () => {
    // simulated picker
    setFile({ name: 'dokument.pdf', size: '240kb', progress: 100 });
  };

  return (
    <div className="fl-step-body">
      <header className="fl-step-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      <div
        className={'fl-drop' + (dragging ? ' is-drag' : '') + (file ? ' has-file' : '')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={file ? undefined : pickFile}>
        {!file ? (
          <>
            <span className="material-icons fl-drop-icon">upload_file</span>
            <div className="fl-drop-copy">
              <span className="fl-drop-link">Ngarko një dokument</span>
              {' '}ose tërhiq dhe lësho këtu
            </div>
            <div className="fl-drop-hint">PDF, JPG, PNG — deri në 10 MB</div>
          </>
        ) : (
          <div className="fl-file">
            <div className="fl-file-icon">
              <span className="material-icons">insert_drive_file</span>
            </div>
            <div className="fl-file-body">
              <div className="fl-file-row">
                <span className="fl-file-name">{file.name}</span>
                <button
                  type="button"
                  className="fl-file-x"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  aria-label="Fshi">
                  <span className="material-icons">delete</span>
                </button>
              </div>
              <div className="fl-file-meta">{file.size} • Ngarkuar me sukses</div>
              <div className="fl-file-bar"><div className="fl-file-bar-fill" style={{ width: (file.progress || 100) + '%' }} /></div>
            </div>
          </div>
        )}
      </div>

      {declare && (
        <label className="fl-declare">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>{declareText}</span>
        </label>
      )}

      <div className="fl-actions">
        <button type="button" className="fl-ghost" onClick={onBack}>
          <span className="material-icons">arrow_back</span> Mbrapa
        </button>
        <div className="fl-actions-right-group">
          {onSkip && (
            <button type="button" className="fl-ghost" onClick={onSkip}>
              Ngarko më vonë
            </button>
          )}
          <PrimaryButton onClick={onNext} disabled={!file || (declare && !agreed)}>
            Vazhdo
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ---------- Root ----------
function FirstLogin({ onDone }) {
  const [step, setStep] = React.useState(() => {
    try { return parseInt(localStorage.getItem('tenderat-first-step') || '0', 10) || 0; }
    catch { return 0; }
  });
  const goto = (n) => {
    setStep(n);
    try { localStorage.setItem('tenderat-first-step', String(n)); } catch {}
  };

  const [plan, setPlan] = React.useState('vjetore');
  const [company, setCompany] = React.useState({
    emri: '',
    formaLigjore: 'SH.P.K.',
    nipt: '',
    viti: '',
    shteti: 'Shqipëri',
    qyteti: 'Tiranë',
    adresa: '',
    tel: '',
    obiekt: '',
    partners: [],
  });
  const [penaltyFile, setPenaltyFile] = React.useState(null);
  const [insuranceFile, setInsuranceFile] = React.useState(null);

  // summary shown in the rail under completed steps
  const planLabel = { mujore: 'Mujore', vjetore: 'Vjetore', dosje: 'Një dosje' }[plan];
  const summary = [
    step > 0 && plan ? ('Paketa ' + planLabel) : null,
    step > 1 && (company.emri || company.nipt) ? (company.emri || company.nipt) : (step > 1 ? 'Kompania — ruajtur' : null),
    step > 2 ? (penaltyFile ? penaltyFile.name : 'U anashkalua') : null,
    step > 3 ? (insuranceFile ? insuranceFile.name : 'U anashkalua') : null,
  ];
  const finish = () => { try { localStorage.removeItem('tenderat-first-step'); } catch {}; onDone && onDone(); };
  const done = new Set();
  for (let i = 0; i < step; i++) done.add(i);

  let view;
  switch (step) {
    case 0:
      view = <FLPaketa picked={plan} onPick={setPlan} onNext={() => goto(1)} />;
      break;
    case 1:
      view = (
        <FLKompania
          data={company}
          setData={setCompany}
          onBack={() => goto(0)}
          onNext={() => goto(2)}
        />
      );
      break;
    case 2:
      view = (
        <FLUploadStep
          title="Dëshmia e penalitetit"
          subtitle="Ngarkoni dëshminë më të fundit të penalitetit të lëshuar nga Gjykata e Rrethit."
          requirements={[
            'Lëshuar jo më shumë se 3 muaj më parë',
            'Me vulën zyrtare të Gjykatës së Rrethit',
            'Në emër të përfaqësuesit ligjor të kompanisë',
          ]}
          file={penaltyFile}
          setFile={setPenaltyFile}
          onBack={() => goto(1)}
          onNext={() => goto(3)}
          onSkip={() => goto(3)}
        />
      );
      break;
    case 3:
      view = (
        <FLUploadStep
          declare
          declareText="Deklaroj se jam në rregull me pagesat e sigurimeve shoqërore dhe se të dhënat e ngarkuara janë të sakta."
          title="Sigurimet shoqërore"
          subtitle="Ngarkoni vërtetimin e pagesës së sigurimeve shoqërore për stafin e punësuar."
          requirements={[
            'Vërtetim nga Drejtoria Rajonale Tatimore',
            'Përfshin muajin aktual ose atë paraardhës',
            'Me nënshkrimin elektronik të institucionit',
          ]}
          file={insuranceFile}
          setFile={setInsuranceFile}
          onBack={() => goto(2)}
          onNext={finish}
          onSkip={finish}
        />
      );
      break;
    default:
      view = null;
  }

  return (
    <div className="fl-root">
      <AppHeader active={null} onNav={() => {}} />
      <div className="fl-wrap" style={{ padding: '20px 0px 80px' }}>
        <FLRail current={step} done={done} summary={summary} onJump={goto} />
        <main className="fl-main">
          {view}
        </main>
      </div>
    </div>
  );
}

window.FirstLogin = FirstLogin;
