// Krijo Dosje të re — polished "New dossier" wizard.
// Source: /Page-1/Krijo-Dosje-te-re/ (4 screens in the Figma compressed to
// 3 logical steps):
//   1. Të dhënat e dosjes           — headline form
//   2. Dokumentacioni i përgjithshëm — pick which required docs apply
//   3. Rishiko & Krijo              — summary + confirm (stub)
//
// Polish over the raw Figma: proper 3-step stepper, real labels on the 4
// previously-unnamed fields, sectioned form, Back/Anulo/Draft buttons,
// and a real interactive document-picker for step 2 instead of the static
// list + grey placeholder the Figma shows.

// ---------- Primitives ----------
function TextInput({ label, placeholder, value, onChange, required, helper, trailing }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label className="k-field">
      <span className="k-field-label">
        {label}{required && <span className="k-required">*</span>}
      </span>
      <div className={'k-field-input' + (focus ? ' is-focus' : '')}>
        <input
          type="text"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        {trailing && <span className="material-icons k-field-trail">{trailing}</span>}
      </div>
      {helper && <span className="k-field-helper">{helper}</span>}
    </label>
  );
}

function SelectInput({ label, placeholder, value, onChange, required, options }) {
  return (
    <label className="k-field">
      <span className="k-field-label">
        {label}{required && <span className="k-required">*</span>}
      </span>
      <div className="k-field-input k-select">
        <select
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}>
          <option value="" disabled>{placeholder}</option>
          {(options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className="material-icons k-field-trail">expand_more</span>
      </div>
    </label>
  );
}

function TextArea({ label, placeholder, value, onChange, rows = 3, required }) {
  return (
    <label className="k-field">
      <span className="k-field-label">
        {label}{required && <span className="k-required">*</span>}
      </span>
      <div className="k-field-input k-field-textarea">
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function MoneyInput({ label, placeholder, value, onChange, required, currency = 'ALL' }) {
  return (
    <label className="k-field">
      <span className="k-field-label">
        {label}{required && <span className="k-required">*</span>}
      </span>
      <div className="k-field-input k-money">
        <input
          type="text"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
        <span className="k-money-unit">{currency}</span>
      </div>
    </label>
  );
}

// ---------- Stepper ----------
const K_STEPS = [
  { key: 'data',        label: 'Të dhënat e dosjes', icon: 'edit_note' },
  { key: 'ligjor',      label: 'Dok. Ligjor',        icon: 'gavel' },
  { key: 'financiar',   label: 'Dok. Financiar',     icon: 'account_balance' },
  { key: 'teknik',      label: 'Dok. Teknik',        icon: 'engineering' },
  { key: 'preventivi',  label: 'Preventivi',         icon: 'calculate' },
  { key: 'metodologjia',label: 'Metodologjia',       icon: 'menu_book' },
  { key: 'review',      label: 'Rishiko & Krijo',    icon: 'check_circle' },
];

function KrijoStepper({ step = 0, onJump }) {
  const total = K_STEPS.length;
  const current = K_STEPS[step] || K_STEPS[0];
  // Progress fill runs from step 0 to the centre of the active tick.
  const progress = total > 1 ? (step / (total - 1)) * 100 : 0;
  return (
    <div className="k-stepper-bar" role="navigation" aria-label="Hapat">
      <div className="k-stepper-meta">
        <span className="k-stepper-idx">Hapi {step + 1} nga {total}</span>
        <span className="k-stepper-label">{current.label}</span>
      </div>
      <div className="k-stepper-track">
        <div className="k-stepper-fill" style={{ width: `${progress}%` }} aria-hidden />
        {K_STEPS.map((s, i) => {
          const done = i < step;
          const on = i === step;
          const left = total > 1 ? (i / (total - 1)) * 100 : 0;
          return (
            <button
              type="button"
              key={s.key}
              className={
                'k-stepper-tick'
                + (done ? ' is-done' : '')
                + (on ? ' is-on' : '')
              }
              style={{ left: `${left}%` }}
              aria-label={`Hapi ${i + 1} — ${s.label}`}
              aria-current={on ? 'step' : undefined}
              onClick={() => onJump && onJump(i)}>
              <span className="k-stepper-tick-dot" aria-hidden />
              <span className="k-stepper-tick-label">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Section ----------
function Section({ title, desc, children }) {
  return (
    <section className="k-section">
      <header className="k-section-head">
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </header>
      <div className="k-section-body">
        {children}
      </div>
    </section>
  );
}

// ---------- Deklaro mbështetjen (support capacity declaration) ----------
function formatDate(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function MiniList({ title, icon, hint, items, onOpen, onRemove, renderItem, addLabel = 'Shto' }) {
  return (
    <div className="k-sup-list">
      <div className="k-sup-list-head">
        <span className="material-icons">{icon}</span>
        <div>
          <h4>{title}</h4>
          {hint && <p>{hint}</p>}
        </div>
        <span className="k-sup-count">{items.length}</span>
      </div>
      {items.length > 0 && (
        <ul className="k-sup-items">
          {items.map((it, i) => (
            <li key={i} className="k-sup-item">
              <span className="k-sup-item-main">
                {renderItem(it)}
              </span>
              <button className="k-sup-item-x" onClick={() => onRemove(i)} aria-label="Hiq">
                <span className="material-icons">close</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="k-sup-add-cta"
        onClick={onOpen}>
        <span className="material-icons">add</span>
        {addLabel}
      </button>
    </div>
  );
}

// Flat 4-up grid of the four capacity mini-lists (Staf / Makineri /
// Certifikime / Licenca). Reused between DeklaroMbeshtetjen (support mode)
// and Bashkimi (consortium mode).
function CapacityLists({ data, onOpen, onRemove, staffHint, machineryHint }) {
  return (
    <div className="k-sup-lists">
      <MiniList
        title="Staf"
        icon="groups"
        hint={staffHint || 'Personat që do marrin pjesë.'}
        items={data.staff}
        onOpen={() => onOpen('staff')}
        onRemove={onRemove('staff')}
        addLabel="Shto staf"
        renderItem={(it) => (
          <>
            <span className="k-sup-item-name">{it.name}</span>
            {it.role && <span className="k-sup-item-meta">{it.role}</span>}
            {Array.isArray(it.qualifications) && it.qualifications.length > 0 && (
              <span className="k-sup-item-tag">{it.qualifications.length} kualifikime</span>
            )}
            {it.docs && Object.keys(it.docs).length > 0 && (
              <span className="k-sup-item-tag is-doc">
                <span className="material-icons">description</span>
                {Object.keys(it.docs).length}
              </span>
            )}
          </>
        )}
      />
      <MiniList
        title="Makineri"
        icon="construction"
        hint={machineryHint || 'Mjetet që do përdoren.'}
        items={data.machinery}
        onOpen={() => onOpen('machine')}
        onRemove={onRemove('machinery')}
        addLabel="Shto makinerie"
        renderItem={(it) => (
          <>
            <span className="k-sup-item-name">{it.name}</span>
            {it.plate && <span className="k-sup-item-meta">{it.plate}</span>}
            {it.type && <span className="k-sup-item-meta">{it.type}</span>}
            {it.status && (
              <span className={'k-sup-item-tag' + (it.status === 'rent' ? ' is-rent' : ' is-owned')}>
                {it.status === 'rent' ? 'Me qera' : 'Në pronësi'}
              </span>
            )}
          </>
        )}
      />
      <MiniList
        title="Certifikime"
        icon="verified"
        hint="ISO 9001 / 14001 / 45001 e të tjera."
        items={data.certificates}
        onOpen={() => onOpen('iso')}
        onRemove={onRemove('certificates')}
        addLabel="Shto certifikim"
        renderItem={(it) => (
          <>
            <span className="k-sup-item-name">{it.name}</span>
            {it.expires && <span className="k-sup-item-meta">Skadon {formatDate(it.expires)}</span>}
            {it.file && (
              <span className="k-sup-item-tag is-doc">
                <span className="material-icons">description</span>
                {it.file.name}
              </span>
            )}
          </>
        )}
      />
      <MiniList
        title="Licenca"
        icon="workspace_premium"
        hint="Licencat profesionale në fuqi."
        items={data.licenses}
        onOpen={() => onOpen('license')}
        onRemove={onRemove('licenses')}
        addLabel="Shto licencë"
        renderItem={(it) => (
          <>
            <span className="k-sup-item-name">{it.name}</span>
            {it.issuer && <span className="k-sup-item-meta">{it.issuer}</span>}
            {it.expires && <span className="k-sup-item-meta">Skadon {formatDate(it.expires)}</span>}
            {it.file && (
              <span className="k-sup-item-tag is-doc">
                <span className="material-icons">description</span>
                {it.file.name}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
}

function DeklaroMbeshtetjen({ form, setSupport }) {
  const s = form.support;
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [drawerKind, setDrawerKind] = React.useState(null);
  const myCompany = 'Albkons SH.P.K.'; // placeholder — logged-in company name

  const push = (k) => (item) => setSupport(k)([...(s[k] || []), item]);
  const removeAt = (k) => (i) => setSupport(k)(s[k].filter((_, idx) => idx !== i));

  // Map drawer kind → store key so the same drawer populates different lists.
  const KIND_TO_STORE = {
    staff: 'staff',
    machine: 'machinery',
    iso: 'certificates',
    license: 'licenses',
  };

  function handleDrawerSave(data) {
    const storeKey = KIND_TO_STORE[drawerKind];
    if (!storeKey || !data) return;
    // Require at least a name — empty entries are discarded silently.
    if (!data.name) return;
    push(storeKey)(data);
  }

  const emailBody = `Të nderuar ${s.emri || '[emri i kompanisë]'},\n\n`
    + `Në kuadër të procedurës së prokurimit "${form.objekti || '[objekti]'}" (referenca ${form.referenca || '[referenca]'}),\n`
    + `shoqëria jonë ${myCompany} po përgatit dosjen e pjesëmarrjes duke u mbështetur në kapacitetet tuaja.\n\n`
    + `Ju lutem të na dërgoni të dhënat e mëposhtme:\n`
    + `• Stafi që do marrë pjesë (emër, pozicion, kualifikime)\n`
    + `• Makineritë që do përdoren (emër, targa, nr. shasie)\n`
    + `• Certifikimet e vlefshme (ISO 9001 / 14001 / 45001, etj.)\n`
    + `• Licencat profesionale\n\n`
    + `Faleminderit,\n${myCompany}`;

  return (
    <Section
      title="Deklaro mbështetjen"
      desc={`Shoqëria mbështetëse dhe kapacitetet që do marrin pjesë në këtë procedurë krahas ${myCompany}.`}>
      <div className="k-sup-status">
        <span className="material-icons">handshake</span>
        <span>
          <strong>Statusi:</strong> Deklaro mbështetje në kapacitete me shoqërinë <em>{s.emri || '—'}</em>
        </span>
      </div>

      <div className="k-grid-2">
        <TextInput label="Emri i shoqërisë mbështetëse" placeholder="P.sh. Konstruksion Plus SH.P.K." required value={s.emri} onChange={setSupport('emri')} />
        <TextInput label="NIPT" placeholder="K12345678L" required value={s.nipt} onChange={setSupport('nipt')} />
        <TextInput label="Adresa" placeholder="Rr. e Durrësit 45, Tiranë" value={s.adresa} onChange={setSupport('adresa')} />
        <TextInput label="Email kontakti" placeholder="info@kompania.al" value={s.email} onChange={setSupport('email')} trailing="mail" />
      </div>

      <div className="k-sup-email-row">
        <div>
          <h5>Kërko të dhëna nga shoqëria mbështetëse</h5>
          <p>Gjenero një email paraprak për stafin, makineritë, certifikimet dhe licencat që do përdoren.</p>
        </div>
        <button type="button" className="k-sup-email-btn" onClick={() => setEmailOpen(true)}>
          <span className="material-icons">send</span>
          Gjenero email kërkese
        </button>
      </div>

      <CapacityLists
        data={s}
        onOpen={(kind) => setDrawerKind(kind)}
        onRemove={(storeKey) => removeAt(storeKey)}
        staffHint="Personat e kompanisë mbështetëse që do marrin pjesë."
        machineryHint="Mjetet e kompanisë mbështetëse."
      />

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!drawerKind}
          kind={drawerKind || 'staff'}
          onClose={() => setDrawerKind(null)}
          onSave={handleDrawerSave}
        />
      )}

      {emailOpen && (
        <div className="k-sup-email-modal" role="dialog" aria-modal="true">
          <div className="k-sup-email-scrim" onClick={() => setEmailOpen(false)} />
          <div className="k-sup-email-card">
            <header>
              <h3>Email kërkese për të dhëna</h3>
              <button className="k-sup-email-close" onClick={() => setEmailOpen(false)} aria-label="Mbyll">
                <span className="material-icons">close</span>
              </button>
            </header>
            <div className="k-sup-email-body">
              <label className="k-field">
                <span className="k-field-label">Për</span>
                <div className="k-field-input"><input type="text" readOnly value={s.email || '(email i pa-plotësuar)'} /></div>
              </label>
              <label className="k-field">
                <span className="k-field-label">Subjekti</span>
                <div className="k-field-input"><input type="text" defaultValue={`Kërkesë për të dhëna — ${form.referenca || 'dosje e re'}`} /></div>
              </label>
              <label className="k-field">
                <span className="k-field-label">Mesazhi</span>
                <div className="k-field-input k-field-textarea">
                  <textarea rows={10} defaultValue={emailBody} />
                </div>
              </label>
            </div>
            <footer>
              <button className="k-link" onClick={() => setEmailOpen(false)}>Anulo</button>
              <button
                className="k-sup-email-send"
                onClick={() => { setSupport('emailStatus')('sent'); setEmailOpen(false); }}>
                <span className="material-icons">send</span>
                Dërgo email
              </button>
            </footer>
          </div>
        </div>
      )}

      {s.emailStatus === 'sent' && (
        <div className="k-sup-email-sent">
          <span className="material-icons">mark_email_read</span>
          Email-i i kërkesës u dërgua te <strong>{s.email}</strong>.
        </div>
      )}
    </Section>
  );
}

// ---------- Bashkim operatorësh ekonomikë (consortium) ----------
function Bashkimi({ form, setConsortium }) {
  const c = form.consortium;
  const [drawerKind, setDrawerKind] = React.useState(null);

  const setPartners = (next) => setConsortium('partners')(next);
  const updatePartner = (id, patch) =>
    setPartners(c.partners.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePartner = (id) =>
    setPartners(c.partners.filter((p) => p.id !== id));
  const addPartner = () =>
    setPartners([
      ...c.partners,
      { id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6), name: '', nipt: '', percent: '' },
    ]);

  // Running total — empty fields count as 0 so the user sees progress as they type.
  const total = c.partners.reduce((sum, p) => {
    const n = parseFloat(p.percent);
    return sum + (isFinite(n) ? n : 0);
  }, 0);
  const totalRounded = Math.round(total * 100) / 100;
  const allPartnersNamed = c.partners.every((p) => p.name.trim().length > 0);
  const partnersReady = totalRounded === 100 && allPartnersNamed && c.partners.length >= 2;

  const push = (k) => (item) => setConsortium(k)([...(c[k] || []), item]);
  const removeAt = (k) => (i) => setConsortium(k)(c[k].filter((_, idx) => idx !== i));

  const KIND_TO_STORE = {
    staff: 'staff',
    machine: 'machinery',
    iso: 'certificates',
    license: 'licenses',
  };
  function handleDrawerSave(data) {
    const storeKey = KIND_TO_STORE[drawerKind];
    if (!storeKey || !data || !data.name) return;
    push(storeKey)(data);
  }

  return (
    <Section
      title="Bashkimi i operatorëve"
      desc="Cakto shoqëritë pjesëmarrëse dhe përqindjen e ofruar nga secila. Totali duhet të jetë 100%.">
      <div className="k-sup-status">
        <span className="material-icons">groups</span>
        <span>
          <strong>Statusi:</strong> Bashkim prej {c.partners.length} operatorësh — plotëso përqindjet
          për secilin.
        </span>
      </div>

      <div className="k-cons-table">
        <div className="k-cons-head">
          <div>Shoqëria</div>
          <div>NIPT</div>
          <div className="k-cons-col-pct">Përqindja</div>
          <div aria-hidden />
        </div>
        {c.partners.map((p, i) => (
          <div key={p.id} className={'k-cons-row' + (p.isSelf ? ' is-self' : '')}>
            <div className="k-cons-cell">
              {p.isSelf ? (
                <div className="k-cons-self">
                  <span className="k-cons-self-badge">Kompania ime</span>
                  <span className="k-cons-self-name">{p.name}</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="P.sh. Konstruksion Plus SH.P.K."
                  value={p.name}
                  onChange={(e) => updatePartner(p.id, { name: e.target.value })}
                />
              )}
            </div>
            <div className="k-cons-cell">
              <input
                type="text"
                placeholder="K12345678L"
                value={p.nipt}
                disabled={p.isSelf}
                onChange={(e) => updatePartner(p.id, { nipt: e.target.value })}
              />
            </div>
            <div className="k-cons-cell k-cons-col-pct">
              <div className="k-cons-pct">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0"
                  value={p.percent}
                  onChange={(e) => updatePartner(p.id, { percent: e.target.value })}
                />
                <span>%</span>
              </div>
            </div>
            <div className="k-cons-cell k-cons-cell-x">
              {!p.isSelf && (
                <button
                  type="button"
                  className="k-cons-row-x"
                  onClick={() => removePartner(p.id)}
                  aria-label="Hiq partnerin">
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="k-cons-footer">
          <button type="button" className="k-cons-add" onClick={addPartner}>
            <span className="material-icons">add</span>
            Shto partner
          </button>
          <div
            className={
              'k-cons-total ' +
              (totalRounded === 100 ? 'is-ok' : totalRounded > 100 ? 'is-over' : 'is-under')
            }>
            <span className="material-icons">
              {totalRounded === 100 ? 'check_circle' : totalRounded > 100 ? 'error' : 'pie_chart'}
            </span>
            Totali {totalRounded}% / 100%
          </div>
        </div>
      </div>

      {!partnersReady && (
        <p className="k-cons-hint">
          Pasi totali të jetë 100% dhe çdo partner të ketë emër, do mund të shtoni staf, makineri,
          certifikime dhe licenca të përbashkëta.
        </p>
      )}

      {partnersReady && (
        <CapacityLists
          data={c}
          onOpen={(kind) => setDrawerKind(kind)}
          onRemove={(storeKey) => removeAt(storeKey)}
          staffHint="Stafi i përbashkët që do marrë pjesë në këtë bashkim."
          machineryHint="Mjetet që vihen në dispozicion nga bashkimi."
        />
      )}

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!drawerKind}
          kind={drawerKind || 'staff'}
          onClose={() => setDrawerKind(null)}
          onSave={handleDrawerSave}
        />
      )}
    </Section>
  );
}

// ---------- Step 1 content ----------
function KrijoStep1({ form, set, setSupport, setConsortium }) {
  const needsSupport = form.lloji === 'Mbështetje në kapacitetet e të tjerëve';
  const needsConsortium = form.lloji === 'Bashkim operatorësh ekonomikë';
  return (
    <div className="k-card">
      <Section
        title="Të dhënat kryesore"
        desc="Identifiko tenderin: objektin, autoritetin dhe referencën zyrtare.">
        <div className="k-grid-2">
          <TextInput
            label="Objekti i procedurës"
            placeholder="P.sh. Ndërtimi i rrugës nacionale nr. 4"
            required
            value={form.objekti}
            onChange={set('objekti')}
          />
          <TextInput
            label="Autoriteti kontraktor"
            placeholder="Shkruaj autoritetin"
            required
            value={form.autoriteti}
            onChange={set('autoriteti')}
            trailing="search"
          />
          <MoneyInput
            label="Fondi limit"
            placeholder="0.00"
            required
            value={form.fondi}
            onChange={set('fondi')}
          />
          <TextInput
            label="Referenca"
            placeholder="REF-2026-XXXX"
            required
            value={form.referenca}
            onChange={set('referenca')}
          />
        </div>
      </Section>

      <div className="k-section-sep" />

      <Section
        title="Klasifikimi i procedurës"
        desc="Tipologjia e prokurimit dhe forma e pjesëmarrjes.">
        <div className="k-grid-2">
          <SelectInput
            label="Procedura"
            required
            placeholder="Zgjidh procedurën"
            value={form.procedura}
            onChange={set('procedura')}
            options={[
              'Procedurë e hapur',
              'Procedurë e hapur e thjeshtuar',
              'Procedurë e hapur mbi kufirin e lartë monetar',
              'Procedurë e kufizuar',
              'Negocim pa shpallje paraprake',
            ]}
          />
          <SelectInput
            label="Lloji i kontratës"
            required
            placeholder="Zgjidh llojin"
            value={form.kontrata}
            onChange={set('kontrata')}
            options={['Punë', 'Shërbim', 'Mallra']}
          />
          <SelectInput
            label="Lloji i dosjes së pjesëmarrjes"
            required
            placeholder="Zgjidh formën"
            value={form.lloji}
            onChange={set('lloji')}
            options={[
              'Pjesëmarrje e vetme',
              'Mbështetje në kapacitetet e të tjerëve',
              'Bashkim operatorësh ekonomikë',
            ]}
          />
          <TextInput
            label="Grafiku i autoritetit"
            placeholder="P.sh. 20/01/2026 – 30/06/2026"
            value={form.grafiku}
            onChange={set('grafiku')}
          />
        </div>
      </Section>

      <div className="k-section-sep" />

      <Section
        title="Afatet dhe garancia"
        desc="Mbylljen e procedurës e llogarisim automatikisht në kohën lokale.">
        <div className="k-grid-2">
          <TextInput
            label="Nr. reference i autoritetit"
            placeholder="AK-2026-XXX"
            value={form.nrReference}
            onChange={set('nrReference')}
          />
          <MoneyInput
            label="Garancia e objektit"
            placeholder="0.00"
            value={form.garancia}
            onChange={set('garancia')}
          />
          <TextInput
            label="Data e mbylljes së procedurës"
            placeholder="DD/MM/VVVV"
            value={form.dataMbylljes}
            onChange={set('dataMbylljes')}
            trailing="calendar_today"
            required
          />
          <TextInput
            label="Ora e mbylljes së procedurës"
            placeholder="HH:MM"
            value={form.oraMbylljes}
            onChange={set('oraMbylljes')}
            trailing="schedule"
            required
          />
        </div>
      </Section>

      {needsSupport && (
        <>
          <div className="k-section-sep" />
          <DeklaroMbeshtetjen form={form} set={set} setSupport={setSupport} />
        </>
      )}

      {needsConsortium && (
        <>
          <div className="k-section-sep" />
          <Bashkimi form={form} setConsortium={setConsortium} />
        </>
      )}
    </div>
  );
}

// ---------- Step 2 content: Dokumentacioni i përgjithshëm ----------
// Source: /Page-1/Krijo-Dosje-te-re/ frame 2. The Figma shows a flat list
// of 15 declarations and a grey preview panel. We make it interactive:
// the list is a checkbox-picker and the right panel previews the selected
// document as a mini PDF-like card.
const DOKUMENTACIONI_LIST = [
  { id: 'vete-deklarim', name: 'Formulari i vete-deklarimit', required: true, category: 'ligjor' },
  { id: 'konflikt', name: 'Deklarata mbi Konfliktin e Interesit', required: true, category: 'ligjor' },
  { id: 'punesim',  name: 'Deklarata për zbatimin e dispozitave ligjore në marrëdhëniet e punës', required: true, category: 'ligjor' },
  { id: 'kriteret', name: 'Deklarata për përmbushjen e kritereve të përgjithshme të kualifikimit', required: true, category: 'ligjor' },
  { id: 'pavarur',  name: 'Deklarata për Dorëzimin e Ofertave të Pavarura', required: true, category: 'ligjor' },
  { id: 'licenca',  name: 'Licencat profesionale', required: false, category: 'ligjor' },
  { id: 'xhiro',    name: 'Xhiro Vjetore', required: true, category: 'financiar' },
  { id: 'pasqyra',  name: 'Pasqyra Financiare', required: true, category: 'financiar' },
  { id: 'bilanci',  name: 'Bilanci', required: true, category: 'financiar' },
  { id: 'specifika',name: 'Deklaratë në përmbushje me specifikimet teknike', required: true, category: 'teknik' },
  { id: 'grafiku',  name: 'Deklaratë për grafikun e punimeve / shërbimeve / furnizimit', required: true, category: 'teknik' },
  { id: 'manuali-cmimeve', name: 'Manuali i çmimeve të ndërtimit (2026)', required: true, category: 'preventivi', system: true, year: 2026 },
  { id: 'preventivi-bosh', name: 'Preventivi bosh — pa çmime', required: true, category: 'preventivi', needsUpload: true },
  { id: 'metodologjia', name: 'Metodologjia',  required: true, category: 'metodologjia' },
];

const DOKUMENTACIONI_CATEGORIES = [
  { id: 'ligjor',       title: 'Ligjor',       icon: 'gavel',           desc: 'Deklarata dhe licenca që vërtetojnë pajtueshmërinë ligjore.' },
  { id: 'financiar',    title: 'Financiar',    icon: 'account_balance', desc: 'Oferta, çmime dhe dokumente që dëshmojnë kapacitetin financiar.' },
  { id: 'teknik',       title: 'Teknik',       icon: 'engineering',     desc: 'Deklarata për specifikimet teknike dhe grafikun e realizimit të kontratës.' },
  { id: 'preventivi',   title: 'Preventivi',   icon: 'calculate',       desc: 'Preventivi i punimeve / shërbimeve me çmime njësie dhe totale.' },
  { id: 'metodologjia', title: 'Metodologjia', icon: 'menu_book',       desc: 'Metodologjia e realizimit: mënyra, afatet dhe organizimi i punës.' },
];

// ---------- Formulari i vete-deklarimit ----------
// Right-pane interactive form shown when the "vete-deklarim" doc is previewed.
// Lets the user pick staf / makineri / katalog entries from the company profile
// or create new ones inline (with a "Ruaj tek profili i kompanisë" toggle).
function VdCard({ selected, onToggle, icon, title, subtitle, tags, children }) {
  return (
    <div className={'k-vd-item' + (selected ? ' is-on' : '')}>
      <label className="k-vd-check">
        <input type="checkbox" checked={!!selected} onChange={onToggle} />
        <span className="k-vd-check-box" aria-hidden>
          <span className="material-icons">check</span>
        </span>
      </label>
      <div className="k-vd-item-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="k-vd-item-main">
        <div className="k-vd-item-title">{title}</div>
        {subtitle && <div className="k-vd-item-sub">{subtitle}</div>}
        {tags && tags.length > 0 && (
          <div className="k-vd-item-tags">
            {tags.map((t, i) => (
              <span key={i} className={'k-vd-tag' + (t.tone ? ' is-' + t.tone : '')}>{t.label}</span>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function QualifPicker({ options, value, onChange }) {
  const toggle = (q) => {
    const next = new Set(value);
    if (next.has(q)) next.delete(q);
    else next.add(q);
    onChange(Array.from(next));
  };
  return (
    <div className="k-vd-qualif-row">
      {options.map((q) => {
        const on = value.includes(q);
        return (
          <button
            type="button"
            key={q}
            className={'k-vd-qualif' + (on ? ' is-on' : '')}
            onClick={(e) => { e.preventDefault(); toggle(q); }}>
            {on && <span className="material-icons">check</span>}
            {q}
          </button>
        );
      })}
    </div>
  );
}


function VeteDeklarimForm({ form, setForm }) {
  const vd = form.veteDeklarim;
  const [drawerKind, setDrawerKind] = React.useState(null); // 'staff' | 'machine' | 'catalog' | null
  const [saveToProfile, setSaveToProfile] = React.useState(true);

  // Read profile data each render so inline-added items that opted to persist
  // show up in the picker on subsequent renders.
  const profileStaff = (typeof window !== 'undefined' && window.STAFF_DATA) || {};
  const profileMachines = (typeof window !== 'undefined' && window.MACHINE_DATA) || {};
  const profileTree = (typeof window !== 'undefined' && window.PROFILE_TREE) || [];
  const catalogFolder =
    profileTree.find((n) => n.id === 'tek')?.children?.find((n) => n.id === 'kat') || { children: [] };
  const profileCatalogs = (catalogFolder.children || []).filter((c) => !c.add);

  const setVd = (patch) => setForm((f) => ({ ...f, veteDeklarim: { ...f.veteDeklarim, ...patch } }));

  // Selection helpers — the array stores { id, ... } items. For staff we also
  // carry qualifications[]; for others, just the id.
  const isSelected = (kind, id) => vd[kind].some((r) => r.id === id);
  const toggleSelect = (kind, id, extras = {}) => {
    const cur = vd[kind];
    if (cur.some((r) => r.id === id)) {
      setVd({ [kind]: cur.filter((r) => r.id !== id) });
    } else {
      setVd({ [kind]: [...cur, { id, ...extras }] });
    }
  };
  const updateSelection = (kind, id, patch) => {
    setVd({ [kind]: vd[kind].map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  };

  // Qualifications that the given staff member carries (profile first, else inline).
  const qualifsForStaff = (id) => {
    if (profileStaff[id]) return profileStaff[id].qualifications || [];
    const inline = vd.inline.staff[id];
    return (inline && inline.qualifications) || [];
  };
  const labelForStaff = (id) => {
    if (profileStaff[id]) return { name: profileStaff[id].name, position: profileStaff[id].position };
    const inline = vd.inline.staff[id];
    return inline ? { name: inline.name, position: inline.position } : { name: id, position: '' };
  };
  const labelForMachine = (id) => {
    if (profileMachines[id]) return profileMachines[id];
    return vd.inline.machinery[id] || { name: id };
  };
  const labelForCatalog = (id) => {
    const p = profileCatalogs.find((c) => c.id === id);
    if (p) return { name: p.title, note: p.uploaded ? 'Ngarkuar ' + p.uploaded : '' };
    return vd.inline.catalogs[id] || { name: id };
  };

  // Drawer create → pushes into veteDeklarim.inline.<kind> and (optionally) into
  // the company-profile singletons, then selects the entry for inclusion.
  // `drawerKind` is 'staff' | 'machine' | 'catalog'; storeKey is the plural used
  // inside veteDeklarim state ('staff' | 'machinery' | 'catalogs').
  const handleDrawerSave = (drawerK, storeKey, data) => {
    const clientId = 'vd-' + storeKey + '-' + Date.now().toString(36);
    const ownership = data.status === 'rent' ? 'Me qera' : (data.status === 'owned' ? 'Në pronësi' : data.ownership || 'Në pronësi');
    // What gets echoed in the local inline store so the picker keeps showing it.
    const inlinePayload = drawerK === 'staff'
      ? { name: data.name, position: data.role || '', qualifications: data.qualifications || [] }
      : drawerK === 'machine'
        ? { name: data.name, type: data.type || '', plate: data.plate || '', vin: data.vin || '', ownership }
        : { name: data.name, note: (data.file && data.file.name) || '' };

    const nextInline = { ...vd.inline, [storeKey]: { ...vd.inline[storeKey], [clientId]: inlinePayload } };
    const selEntry = storeKey === 'staff'
      ? { id: clientId, qualifications: data.qualifications || [] }
      : { id: clientId };
    setVd({ inline: nextInline, [storeKey]: [...vd[storeKey], selEntry] });

    if (data.saveToProfile) {
      if (drawerK === 'staff' && typeof window.addStaffToProfile === 'function') {
        window.addStaffToProfile(clientId, {
          name: data.name,
          position: data.role || '',
          avatarBg: '#374151',
          contractStart: data.contractStart || 'Sot',
          contractEnd: data.contractEnd || '-',
          contractStatus: 'ok',
          qualifications: data.qualifications || [],
          status: 'ok',
          docs: Object.entries(data.docs || {}).map(([k, v]) => ({ key: k, label: k, file: v.name, uploaded: 'Sot', status: 'ok' })),
        });
        window.addStaffTreeRow && window.addStaffTreeRow(clientId, data.name);
      } else if (drawerK === 'machine' && typeof window.addMachineToProfile === 'function') {
        window.addMachineToProfile(clientId, {
          name: data.name,
          type: data.type || '',
          plate: data.plate || '',
          vin: data.vin || '',
          ownership,
          status: 'ok',
          docs: Object.entries(data.docs || {}).map(([k, v]) => ({ key: k, label: k, file: v.name, uploaded: 'Sot', status: 'ok' })),
        });
        window.addMachineTreeRow && window.addMachineTreeRow(clientId, data.name + (data.plate ? ' · ' + data.plate : ''));
      } else if (drawerK === 'catalog' && typeof window.addCatalogToProfile === 'function') {
        window.addCatalogToProfile(clientId, { title: data.name, uploaded: 'Sot' });
      }
    }
  };

  const staffList = Object.entries(profileStaff);
  const machineList = Object.entries(profileMachines);
  // Inline-only staff (those not persisted to profile): still show in the picker
  // so the user can toggle them off again if needed.
  const inlineOnlyStaff = Object.keys(vd.inline.staff).filter((id) => !profileStaff[id]);
  const inlineOnlyMachine = Object.keys(vd.inline.machinery).filter((id) => !profileMachines[id]);
  const inlineOnlyCatalog = Object.keys(vd.inline.catalogs).filter((id) => !profileCatalogs.some((c) => c.id === id));

  return (
    <div className="k-vd-shell">
      <header className="k-vd-header">
        <div className="k-vd-header-icon">
          <span className="material-icons">fact_check</span>
        </div>
        <div>
          <h3>Formulari i vete-deklarimit</h3>
          <p>
            Deklaro se cilin staf, makineri dhe katalog / autorizim do përdorësh nga profili i
            kompanisë për këtë procedurë. Mund të shtosh edhe njësi të reja direkt nga këtu.
          </p>
        </div>
      </header>

      {/* Staf */}
      <section className="k-vd-group">
        <div className="k-vd-group-head">
          <span className="material-icons">groups</span>
          <h4>Staf</h4>
          <span className="k-vd-group-count">{vd.staff.length} zgjedhur</span>
        </div>
        <div className="k-vd-items">
          {staffList.map(([id, s]) => {
            const sel = isSelected('staff', id);
            const entry = vd.staff.find((r) => r.id === id);
            const chosen = entry?.qualifications || [];
            return (
              <VdCard
                key={id}
                selected={sel}
                onToggle={() => toggleSelect('staff', id, { qualifications: [] })}
                icon="person"
                title={s.name}
                subtitle={s.position}
                tags={[{ label: (s.qualifications || []).length + ' kualifikime', tone: 'neutral' }]}>
                {sel && (s.qualifications || []).length > 0 && (
                  <div className="k-vd-qualif-wrap">
                    <div className="k-vd-qualif-label">Zgjidh kualifikimet për këtë deklaratë:</div>
                    <QualifPicker
                      options={s.qualifications}
                      value={chosen}
                      onChange={(next) => updateSelection('staff', id, { qualifications: next })}
                    />
                  </div>
                )}
              </VdCard>
            );
          })}
          {inlineOnlyStaff.map((id) => {
            const sel = isSelected('staff', id);
            const s = vd.inline.staff[id];
            const entry = vd.staff.find((r) => r.id === id);
            const chosen = entry?.qualifications || [];
            return (
              <VdCard
                key={id}
                selected={sel}
                onToggle={() => toggleSelect('staff', id, { qualifications: [] })}
                icon="person_add"
                title={s.name}
                subtitle={(s.position || '—') + ' · I shtuar vetëm për këtë dosje'}
                tags={[{ label: 'Vetëm në dosje', tone: 'ghost' }]}>
                {sel && (s.qualifications || []).length > 0 && (
                  <div className="k-vd-qualif-wrap">
                    <div className="k-vd-qualif-label">Zgjidh kualifikimet për këtë deklaratë:</div>
                    <QualifPicker
                      options={s.qualifications}
                      value={chosen}
                      onChange={(next) => updateSelection('staff', id, { qualifications: next })}
                    />
                  </div>
                )}
              </VdCard>
            );
          })}
        </div>
        <button type="button" className="k-vd-add" onClick={() => { setSaveToProfile(true); setDrawerKind('staff'); }}>
          <span className="material-icons">add</span>
          Shto staf
        </button>
      </section>

      {/* Makineri */}
      <section className="k-vd-group">
        <div className="k-vd-group-head">
          <span className="material-icons">construction</span>
          <h4>Makineri</h4>
          <span className="k-vd-group-count">{vd.machinery.length} zgjedhur</span>
        </div>
        <div className="k-vd-items">
          {machineList.map(([id, m]) => {
            const sel = isSelected('machinery', id);
            return (
              <VdCard
                key={id}
                selected={sel}
                onToggle={() => toggleSelect('machinery', id)}
                icon="local_shipping"
                title={m.name + (m.plate ? ' · ' + m.plate : '')}
                subtitle={[m.type, m.vin].filter(Boolean).join(' · ')}
                tags={[{ label: m.ownership, tone: m.ownership === 'Me qera' ? 'rent' : 'owned' }]}
              />
            );
          })}
          {inlineOnlyMachine.map((id) => {
            const sel = isSelected('machinery', id);
            const m = vd.inline.machinery[id];
            return (
              <VdCard
                key={id}
                selected={sel}
                onToggle={() => toggleSelect('machinery', id)}
                icon="local_shipping"
                title={m.name + (m.plate ? ' · ' + m.plate : '')}
                subtitle={[m.type, m.vin].filter(Boolean).join(' · ') || 'I shtuar vetëm për këtë dosje'}
                tags={[
                  { label: m.ownership || 'Në pronësi', tone: m.ownership === 'Me qera' ? 'rent' : 'owned' },
                  { label: 'Vetëm në dosje', tone: 'ghost' },
                ]}
              />
            );
          })}
        </div>
        <button type="button" className="k-vd-add" onClick={() => { setSaveToProfile(true); setDrawerKind('machine'); }}>
          <span className="material-icons">add</span>
          Shto makinerie
        </button>
      </section>

      {/* Katalog / Autorizim */}
      <section className="k-vd-group">
        <div className="k-vd-group-head">
          <span className="material-icons">menu_book</span>
          <h4>Katalog / Autorizim</h4>
          <span className="k-vd-group-count">{vd.catalogs.length} zgjedhur</span>
        </div>
        <div className="k-vd-items">
          {profileCatalogs.map((c) => {
            const sel = isSelected('catalogs', c.id);
            return (
              <VdCard
                key={c.id}
                selected={sel}
                onToggle={() => toggleSelect('catalogs', c.id)}
                icon="description"
                title={c.title}
                subtitle={c.uploaded ? 'Ngarkuar ' + c.uploaded : ''}
              />
            );
          })}
          {inlineOnlyCatalog.map((id) => {
            const sel = isSelected('catalogs', id);
            const c = vd.inline.catalogs[id];
            return (
              <VdCard
                key={id}
                selected={sel}
                onToggle={() => toggleSelect('catalogs', id)}
                icon="description"
                title={c.name}
                subtitle={c.note || 'I shtuar vetëm për këtë dosje'}
                tags={[{ label: 'Vetëm në dosje', tone: 'ghost' }]}
              />
            );
          })}
        </div>
        <button type="button" className="k-vd-add" onClick={() => { setSaveToProfile(true); setDrawerKind('catalog'); }}>
          <span className="material-icons">add</span>
          Shto katalog / autorizim
        </button>
      </section>

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!drawerKind}
          kind={drawerKind || 'staff'}
          onClose={() => setDrawerKind(null)}
          saveToProfileToggle={{
            value: saveToProfile,
            onChange: setSaveToProfile,
            label: 'Ruaj tek profili i kompanisë',
          }}
          onSave={(data) => {
            const DRAWER_TO_STORE = { staff: 'staff', machine: 'machinery', catalog: 'catalogs' };
            const storeKey = DRAWER_TO_STORE[drawerKind];
            if (!storeKey || !data || !data.name) return;
            handleDrawerSave(drawerKind, storeKey, data);
          }}
        />
      )}
    </div>
  );
}

// ---------- Preventivi: sistem-supplied manual + user upload ----------
function ManualiCmimeveViewer({ year }) {
  // Mock "categories" pulled from a theoretical construction-price manual —
  // enough to make the viewer feel substantive without real data.
  const sections = [
    { id: 'a', title: 'A. Punime ndërtimi të përgjithshme', count: 142, updated: '14 Janar 2026' },
    { id: 'b', title: 'B. Punime hidro-sanitare', count: 68, updated: '09 Shkurt 2026' },
    { id: 'c', title: 'C. Punime elektrike', count: 54, updated: '02 Shkurt 2026' },
    { id: 'd', title: 'D. Punime termike dhe ventilim', count: 41, updated: '22 Janar 2026' },
    { id: 'e', title: 'E. Punime rrugore dhe asfaltim', count: 87, updated: '18 Dhjet 2025' },
    { id: 'f', title: 'F. Punime special. metalike', count: 33, updated: '05 Janar 2026' },
  ];
  return (
    <div className="k-man">
      <header className="k-man-head">
        <div className="k-man-head-icon">
          <span className="material-icons">menu_book</span>
        </div>
        <div>
          <div className="k-man-eyebrow">Sistem · Burim zyrtar</div>
          <h3>Manuali i çmimeve të ndërtimit</h3>
          <p>
            Lista zyrtare e çmimeve të njësisë e përditësuar për vitin <b>{year}</b>.
            Ky manual ngarkohet automatikisht në dosje për referencë krahasimi me preventivin tuaj.
          </p>
        </div>
        <div className="k-man-year">
          <span className="k-man-year-label">Viti</span>
          <span className="k-man-year-value">{year}</span>
        </div>
      </header>
      <div className="k-man-sections">
        {sections.map((s) => (
          <div key={s.id} className="k-man-section">
            <div className="k-man-section-main">
              <span className="k-man-section-title">{s.title}</span>
              <span className="k-man-section-meta">{s.count} zëra · Përditësuar {s.updated}</span>
            </div>
            <button type="button" className="k-man-section-open" title="Shiko zërat">
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        ))}
      </div>
      <footer className="k-man-foot">
        <span className="material-icons">verified</span>
        <span>I ngarkuar automatikisht nga sistemi. Nuk kërkon veprim nga ju.</span>
      </footer>
    </div>
  );
}

function PreventiviUpload({ form, setForm }) {
  const file = form.preventivi?.file || null;
  const inputRef = React.useRef(null);
  const setFile = (f) => setForm((prev) => ({ ...prev, preventivi: { ...(prev.preventivi || {}), file: f } }));

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // We store just a lightweight descriptor — the prototype doesn't upload.
    setFile({ name: f.name, size: f.size });
    e.target.value = '';
  };

  return (
    <div className="k-prev">
      <header className="k-prev-head">
        <div className="k-prev-head-icon">
          <span className="material-icons">upload_file</span>
        </div>
        <div>
          <div className="k-prev-eyebrow">Ngarkim nga ju</div>
          <h3>Preventivi bosh — pa çmime</h3>
          <p>
            Ngarko preventivin bosh të autoritetit kontraktor (pa çmime njësie). Sistemi e kombinon
            me manualin zyrtar për t'ju ndihmuar të plotësoni ofertën.
          </p>
        </div>
      </header>

      {!file ? (
        <button
          type="button"
          className="k-prev-drop"
          onClick={() => inputRef.current && inputRef.current.click()}>
          <span className="material-icons">cloud_upload</span>
          <div>
            <div className="k-prev-drop-title">Ngarko preventivin bosh</div>
            <div className="k-prev-drop-hint">Excel (.xlsx / .xls) ose PDF · deri 20 MB</div>
          </div>
          <span className="k-prev-drop-cta">Zgjidh skedarin</span>
        </button>
      ) : (
        <div className="k-prev-file">
          <div className="k-prev-file-icon">
            <span className="material-icons">description</span>
          </div>
          <div className="k-prev-file-main">
            <div className="k-prev-file-name">{file.name}</div>
            <div className="k-prev-file-meta">
              {file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB · ` : ''}I ngarkuar sapo
            </div>
          </div>
          <div className="k-prev-file-actions">
            <button
              type="button"
              className="k-prev-file-btn"
              onClick={() => inputRef.current && inputRef.current.click()}>
              <span className="material-icons">autorenew</span>
              Zëvendëso
            </button>
            <button
              type="button"
              className="k-prev-file-btn is-danger"
              onClick={() => setFile(null)}>
              <span className="material-icons">delete</span>
              Hiq
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.pdf"
        style={{ display: 'none' }}
        onChange={onPick}
      />

      <ul className="k-prev-tips">
        <li><span className="material-icons">check_circle</span> Mos fshij kolonat e sasisë dhe të njësisë.</li>
        <li><span className="material-icons">check_circle</span> Ruaj të njëjtin rend të zërave si në dokumentin origjinal.</li>
        <li><span className="material-icons">check_circle</span> Sistemi do t'ju propozojë çmime nga manuali zyrtar pas ngarkimit.</li>
      </ul>
    </div>
  );
}

function KrijoStep2({ selected, setSelected, preview, setPreview, form, setForm, category }) {
  // Each step now scopes to a single category; the full list is what lives
  // in `DOKUMENTACIONI_LIST` but the step only shows docs whose `.category`
  // matches. Selection state stays global so the final review step sees
  // everything picked across steps.
  const docsInScope = category
    ? DOKUMENTACIONI_LIST.filter((d) => d.category === category)
    : DOKUMENTACIONI_LIST;
  const categoriesInScope = category
    ? DOKUMENTACIONI_CATEGORIES.filter((c) => c.id === category)
    : DOKUMENTACIONI_CATEGORIES;

  const toggle = (id) => {
    setSelected(selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id]);
  };
  // If the preview is for a doc outside this step's scope, fall back to the
  // first doc of the current scope so the right pane stays meaningful.
  let current = DOKUMENTACIONI_LIST.find((d) => d.id === preview);
  if (!current || (category && current.category !== category)) {
    current = docsInScope[0] || DOKUMENTACIONI_LIST[0];
  }
  // Keep the stored preview in sync when the step scope kicks the fallback in.
  React.useEffect(() => {
    if (category && current && preview !== current.id) setPreview(current.id);
  }, [category]);

  // Ensure system-owned docs are always part of the selection so the review step
  // counts them. Users can't uncheck them from the UI anyway.
  React.useEffect(() => {
    const systemIds = docsInScope.filter((d) => d.system).map((d) => d.id);
    const missing = systemIds.filter((id) => !selected.includes(id));
    if (missing.length > 0) setSelected([...selected, ...missing]);
  }, [category]);
  const isSelected = (id) => selected.includes(id);

  const total = docsInScope.length;
  const selectedInScope = docsInScope.filter((d) => isSelected(d.id)).length;
  const allSelected = selectedInScope === total && total > 0;

  // Toggle affects only the docs in scope for this step.
  const toggleAll = () => {
    const inScopeIds = docsInScope.map((d) => d.id);
    if (allSelected) {
      setSelected(selected.filter((id) => !inScopeIds.includes(id)));
    } else {
      const merged = new Set(selected);
      inScopeIds.forEach((id) => merged.add(id));
      setSelected(Array.from(merged));
    }
  };

  return (
    <div className="k-doc-shell">
      <aside className="k-doc-list">
        <div className="k-doc-list-head">
          <div>
            <h3>Dokumentet</h3>
            <p>{selectedInScope} / {total} zgjedhur</p>
          </div>
          <button className="k-doc-bulk" onClick={toggleAll}>
            {allSelected ? 'Hiqi të gjitha' : 'Zgjidh të gjitha'}
          </button>
        </div>
        <div className="k-doc-cats">
          {categoriesInScope.map((cat) => {
            const docsInCat = docsInScope.filter((d) => d.category === cat.id);
            if (docsInCat.length === 0) return null;
            const selectedInCat = docsInCat.filter((d) => isSelected(d.id)).length;
            return (
              <div key={cat.id} className={'k-doc-cat is-' + cat.id}>
                <div className="k-doc-cat-head">
                  <span className="k-doc-cat-icon material-icons">{cat.icon}</span>
                  <div className="k-doc-cat-meta">
                    <h4>{cat.title}</h4>
                    <p>{cat.desc}</p>
                  </div>
                  <span className="k-doc-cat-count">{selectedInCat}/{docsInCat.length}</span>
                </div>
                <ul className="k-doc-rows">
                  {docsInCat.map((d) => (
                    <li
                      key={d.id}
                      className={
                        'k-doc-row'
                        + (isSelected(d.id) ? ' is-on' : '')
                        + (preview === d.id ? ' is-previewing' : '')
                        + (d.system ? ' is-system' : '')
                      }>
                      <label className={'k-doc-check' + (d.system ? ' is-locked' : '')}>
                        <input
                          type="checkbox"
                          checked={d.system ? true : isSelected(d.id)}
                          disabled={!!d.system}
                          onChange={() => !d.system && toggle(d.id)}
                        />
                        <span className="k-doc-check-box" aria-hidden>
                          <span className="material-icons">{d.system ? 'lock' : 'check'}</span>
                        </span>
                      </label>
                      <button
                        type="button"
                        className="k-doc-open"
                        onClick={() => setPreview(d.id)}>
                        <span className="k-doc-name">{d.name}</span>
                        {d.system && <span className="k-doc-tag is-system">Sistem</span>}
                        {d.needsUpload && <span className="k-doc-tag is-upload">Ngarkim</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="k-doc-preview">
        <div className="k-doc-preview-head">
          <span className="k-doc-preview-eyebrow">Pamja paraprake</span>
          <h3>{current.name}</h3>
          <div className="k-doc-preview-actions">
            <button className="k-doc-preview-btn" title="Shkarko">
              <span className="material-icons">download</span>
            </button>
            <button className="k-doc-preview-btn" title="Printo">
              <span className="material-icons">print</span>
            </button>
          </div>
        </div>
        <div className={'k-doc-preview-body' + (current.id === 'vete-deklarim' ? ' is-vd' : '') + ((current.id === 'manuali-cmimeve' || current.id === 'preventivi-bosh') ? ' is-prev' : '')}>
          {current.id === 'vete-deklarim' ? (
            <VeteDeklarimForm form={form} setForm={setForm} />
          ) : current.id === 'manuali-cmimeve' ? (
            <ManualiCmimeveViewer year={current.year || 2026} />
          ) : current.id === 'preventivi-bosh' ? (
            <PreventiviUpload form={form} setForm={setForm} />
          ) : (
            <div className="k-doc-paper">
              <div className="k-doc-paper-stamp">
                <b>FORMULARI PËRMBLEDHËS I VETDEKLARIMIT</b>
                <span>Ref. {current.id.toUpperCase()} · 2026</span>
              </div>
              <h4>{current.name}</h4>
              <p className="k-doc-paper-line">
                Unë, i nënshkruari <b>Andi Hoxha</b>, përfaqësues i shoqërisë
                <b> Kompania Ime SH.P.K.</b> me NIPT <b>L01234567A</b>, deklaroj
                në përgjegjësinë time të plotë sa më poshtë:
              </p>
              <ol className="k-doc-paper-ol">
                <li>Se të dhënat e paraqitura në këtë dosje janë të vërteta dhe të plota.</li>
                <li>Se jam në dijeni të dispozitave ligjore në fuqi që rregullojnë këtë procedurë prokurimi.</li>
                <li>Se pranoj që çdo mospërputhje e të dhënave të deklaruara përbën shkak për skualifikim.</li>
                <li>Se kjo deklaratë shtrin efektet e saj deri në përfundim të kontratës.</li>
              </ol>
              <div className="k-doc-paper-sign">
                <div>
                  <span>Data</span>
                  <b>20/01/2026</b>
                </div>
                <div>
                  <span>Firma & vula</span>
                  <div className="k-doc-paper-stamp-box" aria-hidden>K.I.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------- Step 3: Rishiko (stub) ----------
function KrijoStep3({ form, selectedDocs }) {
  return (
    <div className="k-card">
      <Section title="Rishiko dosjen" desc="Kontrollo të dhënat para se të krijosh dosjen.">
        <div className="k-review">
          <div className="k-review-col">
            <h4>Të dhënat kryesore</h4>
            <dl>
              <dt>Objekti</dt><dd>{form.objekti || '—'}</dd>
              <dt>Autoriteti</dt><dd>{form.autoriteti || '—'}</dd>
              <dt>Referenca</dt><dd>{form.referenca || '—'}</dd>
              <dt>Fondi limit</dt><dd>{form.fondi ? form.fondi + ' ALL' : '—'}</dd>
            </dl>
          </div>
          <div className="k-review-col">
            <h4>Afatet</h4>
            <dl>
              <dt>Data e mbylljes</dt><dd>{form.dataMbylljes || '—'}</dd>
              <dt>Ora</dt><dd>{form.oraMbylljes || '—'}</dd>
              <dt>Procedura</dt><dd>{form.procedura || '—'}</dd>
              <dt>Lloji</dt><dd>{form.kontrata || '—'}</dd>
            </dl>
          </div>
          <div className="k-review-col k-review-col-full">
            <h4>Dokumentet e përfshira ({selectedDocs.length})</h4>
            <ul className="k-review-docs">
              {selectedDocs.length === 0 && <li className="is-empty">Asnjë dokument i zgjedhur</li>}
              {selectedDocs.map((id) => {
                const d = DOKUMENTACIONI_LIST.find((x) => x.id === id);
                return d ? <li key={id}><span className="material-icons">description</span>{d.name}</li> : null;
              })}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ---------- Main screen ----------
function KrijoDosjeNew({ onBack, onNav, onNext, onCancel }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    objekti: '', autoriteti: '', fondi: '', referenca: '',
    procedura: '', kontrata: '', lloji: '', grafiku: '',
    nrReference: '', dataMbylljes: '', oraMbylljes: '', garancia: '',
    support: {
      emri: '', nipt: '', adresa: '', email: '',
      staff: [],       // [{ name, role }]
      machinery: [],   // [{ name, plate }]
      certificates: [],// [{ name, issuer }]
      licenses: [],    // [{ name, issuer }]
      emailStatus: null, // null | 'sent'
    },
    consortium: {
      partners: [
        // First partner is always the logged-in company — locked name/NIPT, editable %.
        { id: 'self', name: 'Albkons SH.P.K.', nipt: 'L01234567A', percent: '', isSelf: true },
      ],
      staff: [],
      machinery: [],
      certificates: [],
      licenses: [],
    },
    veteDeklarim: {
      // Ids of entries included in the self-declaration, keyed by resource kind.
      // Inline-created items live under `inline.<kind>[id]` and their id is also in the array.
      staff: [],      // [{ id, qualifications: [] }]
      machinery: [],  // [{ id }]
      catalogs: [],   // [{ id }]
      inline: { staff: {}, machinery: {}, catalogs: {} },
    },
    preventivi: {
      // User-uploaded blank preventiv (no prices). File metadata only — the mock
      // doesn't actually upload a file.
      file: null, // { name, size }
    },
  });
  const [selectedDocs, setSelectedDocs] = React.useState([
    'vete-deklarim', 'konflikt', 'kriteret', 'pavarur', 'xhiro',
  ]);
  const [previewDoc, setPreviewDoc] = React.useState('vete-deklarim');
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setSupport = (k) => (v) => setForm((f) => ({ ...f, support: { ...f.support, [k]: v } }));
  const setConsortium = (k) => (v) => setForm((f) => ({ ...f, consortium: { ...f.consortium, [k]: v } }));

  const LAST_STEP = 6;
  const goNext = () => {
    if (step < LAST_STEP) setStep(step + 1);
    else onNext && onNext();
  };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else onBack && onBack();
  };

  const titles = [
    { h1: 'Dosje e re',                sub: 'Hap një dosje të re dhe fillo të menaxhosh dokumentet e tenderave dhe projekteve.' },
    { h1: 'Dokumentacioni Ligjor',     sub: 'Zgjidh dokumentet ligjore që do përfshihen në dosje. Mund t\'i parashikosh në të djathtë.' },
    { h1: 'Dokumentacioni Financiar',  sub: 'Zgjidh dokumentet financiare që dëshmojnë kapacitetin e kompanisë.' },
    { h1: 'Dokumentacioni Teknik',     sub: 'Zgjidh dokumentet teknike që lidhen me realizimin e objektit të kontratës.' },
    { h1: 'Preventivi',                sub: 'Ngarko preventivin me çmime njësie dhe vlera totale për zërat e kontratës.' },
    { h1: 'Metodologjia',              sub: 'Përshkrimi i metodologjisë së realizimit — mënyra, afatet dhe organizimi.' },
    { h1: 'Rishiko & Krijo',           sub: 'Kontrollo të dhënat e dosjes para se të konfirmosh krijimin.' },
  ];
  const t = titles[step];

  // Map step index → which document category this step scopes to.
  const STEP_CATEGORY = { 1: 'ligjor', 2: 'financiar', 3: 'teknik', 4: 'preventivi', 5: 'metodologjia' };

  return (
    <>
      <AppHeader active="dosjet" onNav={onNav} />
      <div className="k-page" style={{ padding: '20px 0px 120px' }}>
        <div className="k-heading">
          <button className="t-back" onClick={onBack}>
            <span className="material-icons">arrow_back</span> Dosjet e Mia
          </button>
          <div className="k-heading-row">
            <div>
              <h1 className="t-page-title">{t.h1}</h1>
              <p className="t-page-sub">{t.sub}</p>
            </div>
          </div>
        </div>

        <KrijoStepper step={step} onJump={setStep} />

        {step === 0 && <KrijoStep1 form={form} set={set} setSupport={setSupport} setConsortium={setConsortium} />}
        {STEP_CATEGORY[step] && (
          <KrijoStep2
            key={STEP_CATEGORY[step]}
            category={STEP_CATEGORY[step]}
            selected={selectedDocs}
            setSelected={setSelectedDocs}
            preview={previewDoc}
            setPreview={setPreviewDoc}
            form={form}
            setForm={setForm}
          />
        )}
        {step === LAST_STEP && <KrijoStep3 form={form} selectedDocs={selectedDocs} />}

        <div className="k-footer">
          <button className="k-link" onClick={onCancel}>Anulo</button>
          <div className="k-footer-right">
            {step > 0 && (
              <button className="k-link" onClick={goBack}>
                <span className="material-icons">arrow_back</span> Mbrapa
              </button>
            )}
            <OutlineButton onClick={onCancel}>Ruaj si draft</OutlineButton>
            <MuiButton icon={step === LAST_STEP ? 'check' : 'arrow_forward'} onClick={goNext}>
              {step === LAST_STEP ? 'Krijo dosjen' : 'Hapi tjetër'}
            </MuiButton>
          </div>
        </div>
      </div>
    </>
  );
}
window.KrijoDosjeNew = KrijoDosjeNew;
