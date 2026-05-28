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
  { key: 'data',         label: 'Të dhënat e dosjes', icon: 'edit_note' },
  { key: 'ligjor',       label: 'Dok. Ligjor',        icon: 'gavel' },
  { key: 'financiar',    label: 'Dok. Financiar',     icon: 'account_balance' },
  { key: 'teknik',       label: 'Dok. Teknik',        icon: 'engineering' },
  { key: 'preventivi',   label: 'Preventivi',         icon: 'calculate' },
  { key: 'deklarimet',   label: 'Deklarimet',         icon: 'fact_check' },
  { key: 'metodologjia', label: 'Metodologjia',       icon: 'menu_book' },
  { key: 'review',       label: 'Rishiko & Krijo',    icon: 'check_circle' },
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

// Given an array of { periudha: 'Muaj YYYY' }, return the next month label,
// walking backwards from the most recent filled month. Defaults to the
// month before `today` when the list is empty.
const MONTHS_SQ = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
];
function buildNextPeriod(items = []) {
  const now = new Date();
  let mi = now.getMonth() - 1;
  let yr = now.getFullYear();
  if (mi < 0) { mi = 11; yr -= 1; }
  if (items.length > 0) {
    // Parse the last-added month and step back one.
    const last = items[items.length - 1]?.periudha || '';
    const match = last.match(/^(\S+)\s+(\d{4})$/);
    if (match) {
      const idx = MONTHS_SQ.indexOf(match[1]);
      if (idx >= 0) {
        mi = idx - 1;
        yr = parseInt(match[2], 10);
        if (mi < 0) { mi = 11; yr -= 1; }
      }
    }
  }
  return `${MONTHS_SQ[mi]} ${yr}`;
}

function MiniList({ title, icon, hint, items, onOpen, onRemove, onEdit, renderItem, addLabel = 'Shto' }) {
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
              <div className="k-sup-item-actions">
                {onEdit && (
                  <button
                    type="button"
                    className="k-sup-item-edit"
                    onClick={() => onEdit(i)}
                    aria-label="Ndrysho">
                    <span className="material-icons">edit</span>
                  </button>
                )}
                <button
                  type="button"
                  className="k-sup-item-x"
                  onClick={() => onRemove(i)}
                  aria-label="Hiq">
                  <span className="material-icons">close</span>
                </button>
              </div>
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
// Multi-doc card — Listëpagesa can span one or many months, each with its
// own period label and uploaded file. Calls `onAdd()` which is expected to
// open the AddIsoDrawer with kind='payroll'; the caller wires the save path.
function CapMultiDoc({ title, hint, icon, items = [], onAdd, onRemove }) {
  const hasItems = items.length > 0;
  return (
    <div className={'k-sup-single k-sup-multi' + (hasItems ? ' has-file' : '')}>
      <div className="k-sup-single-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="k-sup-single-body">
        <div className="k-sup-single-head">
          <div>
            <div className="k-sup-single-title">{title}</div>
            <div className="k-sup-single-hint">{hint}</div>
          </div>
          {hasItems && (
            <span className="k-sup-multi-count">
              {items.length} {items.length === 1 ? 'muaj' : 'muaj'}
            </span>
          )}
        </div>
        {hasItems && (
          <ul className="k-sup-multi-list">
            {items.map((it, i) => (
              <li key={i} className="k-sup-multi-item">
                <span className="material-icons">insert_drive_file</span>
                <div className="k-sup-multi-item-meta">
                  <strong>{it.periudha || '—'}</strong>
                  <span>{it.name}{it.size ? ' · ' + it.size : ''}</span>
                </div>
                <button type="button" className="k-sup-single-file-x"
                        onClick={() => onRemove && onRemove(i)} aria-label="Hiq">
                  <span className="material-icons">close</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="k-sup-single-pick" onClick={onAdd}>
          <span className="material-icons">add</span>
          {hasItems ? 'Shto një muaj tjetër' : 'Ngarko listëpagesën'}
        </button>
      </div>
    </div>
  );
}

// Small single-doc card used inside the extended CapacityLists extras (Xhiro vjetore)
// and on PartnerFillScreen. Mock upload only — sets a filename.
function CapSingleDoc({ title, hint, icon, file, onPick, onClear }) {
  return (
    <div className={'k-sup-single' + (file ? ' has-file' : '')}>
      <div className="k-sup-single-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="k-sup-single-body">
        <div className="k-sup-single-title">{title}</div>
        <div className="k-sup-single-hint">{hint}</div>
        {file ? (
          <div className="k-sup-single-file">
            <span className="material-icons">insert_drive_file</span>
            <div className="k-sup-single-file-meta">
              <strong>{file.name}</strong>
              {file.size && <span>{file.size}</span>}
            </div>
            <button type="button" className="k-sup-single-file-x" onClick={onClear} aria-label="Hiq">
              <span className="material-icons">close</span>
            </button>
          </div>
        ) : (
          <button type="button" className="k-sup-single-pick" onClick={onPick}>
            <span className="material-icons">upload_file</span>
            Ngarko dokumentin
          </button>
        )}
      </div>
    </div>
  );
}

function CapacityLists({ data, onOpen, onRemove, onEdit, staffHint, machineryHint, extras }) {
  return (
    <div className="k-sup-lists">
      <MiniList
        title="Staf"
        icon="groups"
        hint={staffHint || 'Personat që do marrin pjesë.'}
        items={data.staff}
        onOpen={() => onOpen('staff')}
        onRemove={onRemove('staff')}
        onEdit={onEdit && ((i) => onEdit('staff', i))}
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
        onEdit={onEdit && ((i) => onEdit('machinery', i))}
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
        onEdit={onEdit && ((i) => onEdit('certificates', i))}
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
        onEdit={onEdit && ((i) => onEdit('licenses', i))}
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

      {extras && (
        <>
          <MiniList
            title="Punë të ngjashme"
            icon="engineering"
            hint="Kontratat e ngjashme të realizuara."
            items={data.similarWorks || []}
            onOpen={() => onOpen('work')}
            onRemove={onRemove('similarWorks')}
            onEdit={onEdit && ((i) => onEdit('similarWorks', i))}
            addLabel="Shto punë të ngjashme"
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
          <CapMultiDoc
            title="Listëpagesa"
            hint="Listëpagesat e stafit — një muaj ose më shumë sipas kërkesës."
            icon="receipt_long"
            items={Array.isArray(data.listpagesa) ? data.listpagesa : []}
            onAdd={() => extras.onAddMulti && extras.onAddMulti('listpagesa', 'Listepagesa')}
            onRemove={(i) => extras.onRemoveMulti && extras.onRemoveMulti('listpagesa', i)}
          />
          <CapSingleDoc
            title="Xhiro vjetore"
            hint="Vërtetim i xhiros vjetore nga bilanci."
            icon="trending_up"
            file={data.xhiro || null}
            onPick={() => extras.onPickDoc && extras.onPickDoc('xhiro', 'Xhiro_vjetore')}
            onClear={() => extras.onClearDoc && extras.onClearDoc('xhiro')}
          />
          <CapSingleDoc
            title="Dokument tjetër"
            hint="Ngarko një dokument shtesë që mbështet ofertën."
            icon="attach_file"
            file={data.docExtra || null}
            onPick={() => extras.onPickDoc && extras.onPickDoc('docExtra', 'Dokument_shtese')}
            onClear={() => extras.onClearDoc && extras.onClearDoc('docExtra')}
          />
        </>
      )}
    </div>
  );
}

// Small 6-digit code input — mirrors the Login/Register CodeInput but scoped to
// this component so the Krijo flow doesn't depend on login/register JS having
// loaded first.
function KSupCodeInput({ value, onChange, length = 6 }) {
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
    <div className="k-sup-code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={'k-sup-code-cell' + (digits[i].trim() ? ' is-filled' : '')}
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

function DeklaroMbeshtetjen({ form, setSupport }) {
  const s = form.support;
  const [drawerKind, setDrawerKind] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  const myCompany = 'Albkons SH.P.K.'; // placeholder — logged-in company name

  const push = (k) => (item) => setSupport(k)([...(s[k] || []), item]);
  const removeAt = (k) => (i) => setSupport(k)(s[k].filter((_, idx) => idx !== i));
  const replaceAt = (k) => (i, item) => setSupport(k)(s[k].map((it, idx) => (idx === i ? item : it)));

  const KIND_TO_STORE = {
    staff: 'staff',
    machine: 'machinery',
    iso: 'certificates',
    license: 'licenses',
    work: 'similarWorks',
    payroll: 'listpagesa',
  };
  const STORE_TO_KIND = {
    staff: 'staff',
    machinery: 'machine',
    certificates: 'iso',
    licenses: 'license',
    similarWorks: 'work',
    listpagesa: 'payroll',
  };

  function handleDrawerSave(data) {
    const storeKey = KIND_TO_STORE[drawerKind];
    if (!storeKey || !data) return;
    if (!data.name) return;
    if (storeKey === 'listpagesa') {
      const current = Array.isArray(s[storeKey]) ? s[storeKey] : [];
      if (editIndex >= 0) {
        setSupport(storeKey)(current.map((it, idx) => (idx === editIndex ? data : it)));
      } else {
        setSupport(storeKey)([...current, data]);
      }
    } else if (editIndex >= 0) {
      replaceAt(storeKey)(editIndex, data);
    } else {
      push(storeKey)(data);
    }
    setEditIndex(-1);
  }

  const handleEdit = (storeKey, i) => {
    const kind = STORE_TO_KIND[storeKey];
    if (!kind) return;
    setEditIndex(i);
    setDrawerKind(kind);
  };

  const editInitial = (editIndex >= 0 && drawerKind)
    ? (s[KIND_TO_STORE[drawerKind]] || [])[editIndex]
    : null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email || '');

  const genLink = () => {
    const token = Math.random().toString(36).slice(2, 10);
    const url = `https://tenderat.al/partner/${token}`;
    setSupport('shareLink')(url);
    setSupport('linkSent')(true);
  };

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
        <TextInput
          label="Email kontakti"
          placeholder="info@kompania.al"
          value={s.email}
          onChange={setSupport('email')}
          trailing="mail"
          required
          helper="Linku i ftesës do t'i dërgohet këtij email-i dhe vetëm ai që e merr do të ketë kodin për ta hapur."
        />
      </div>

      {/* Two-option picker: either the user fills the partner's data directly,
          or the partner fills it themselves via a generated link. */}
      <div className="k-sup-mode">
        <h5>Si do t'i plotësoni kapacitetet e kompanisë mbështetëse?</h5>
        <div className="k-sup-mode-opts">
          <button
            type="button"
            className={'k-sup-mode-opt' + (s.mode === 'direct' ? ' is-on' : '')}
            onClick={() => setSupport('mode')('direct')}>
            <span className="k-sup-mode-icon">
              <span className="material-icons">edit_note</span>
            </span>
            <span className="k-sup-mode-body">
              <strong>Plotësoj vetë të dhënat</strong>
              <span>Unë shkruaj stafin, makineritë dhe dokumentet e kompanisë mbështetëse.</span>
            </span>
            <span className="k-sup-mode-radio" aria-hidden />
          </button>
          <button
            type="button"
            className={'k-sup-mode-opt' + (s.mode === 'link' ? ' is-on' : '')}
            onClick={() => setSupport('mode')('link')}>
            <span className="k-sup-mode-icon">
              <span className="material-icons">link</span>
            </span>
            <span className="k-sup-mode-body">
              <strong>Gjenero link për kompaninë</strong>
              <span>Kompania mbështetëse i fut vetë të dhënat nëpërmjet një linku të sigurt.</span>
            </span>
            <span className="k-sup-mode-radio" aria-hidden />
          </button>
        </div>
      </div>

      {s.mode === 'direct' ? (
        <>
          <CapacityLists
            data={s}
            onOpen={(kind) => { setEditIndex(-1); setDrawerKind(kind); }}
            onRemove={(storeKey) => removeAt(storeKey)}
            onEdit={handleEdit}
            staffHint="Personat e kompanisë mbështetëse që do marrin pjesë."
            machineryHint="Mjetet e kompanisë mbështetëse."
            extras={{
              onPickDoc: (key, label) => setSupport(key)({ name: label + '.pdf', size: '240 KB' }),
              onClearDoc: (key) => setSupport(key)(null),
              onAddMulti: (key) => {
                if (key === 'listpagesa') { setEditIndex(-1); setDrawerKind('payroll'); }
              },
              onRemoveMulti: (key, idx) => {
                const current = Array.isArray(s[key]) ? s[key] : [];
                setSupport(key)(current.filter((_, i) => i !== idx));
              },
            }}
          />
        </>
      ) : (
        <div className="k-sup-link-panel">
          <div className="k-sup-link-copy">
            <h5>Linku për kompaninë mbështetëse</h5>
            <p>
              Linku i sigurt do t'i dërgohet në email-in <strong>{s.email || '—'}</strong>.
              Kur kompania <em>{s.emri || 'mbështetëse'}</em> ta hapë, duhet të vendosë
              një kod 6-shifror që i dërgohet po te ky email — kështu vetëm personi që ka
              akses te ky email mund të plotësojë të dhënat.
            </p>
          </div>

          {s.linkSent && s.shareLink ? (
            <div className="k-sup-link-card">
              <div className="k-sup-link-head">
                <span className="material-icons">mark_email_read</span>
                <div>
                  <strong>Linku u dërgua te {s.email}</strong>
                  <span>Pret të plotësohet nga kompania mbështetëse.</span>
                </div>
                <span className="k-sup-link-pill">Në pritje</span>
              </div>
              <div className="k-sup-link-url">
                <span className="material-icons">link</span>
                <input readOnly value={s.shareLink} />
                <button
                  type="button"
                  className="k-sup-link-copybtn"
                  onClick={() => { try { navigator.clipboard.writeText(s.shareLink); } catch {} }}>
                  <span className="material-icons">content_copy</span>
                  Kopjo
                </button>
              </div>
            </div>
          ) : (
            <>
              {!emailOk && (
                <div className="k-sup-verify-err">
                  <span className="material-icons">error</span>
                  Plotësoni email-in për 1 partner para se të dërgoni linkun.
                </div>
              )}
              <button
                type="button"
                className="k-sup-email-btn"
                disabled={!emailOk || !s.emri || !s.nipt}
                title={!emailOk ? 'Shkruani një email të vlefshëm' : (!s.emri || !s.nipt ? 'Plotësoni emrin dhe NIPT-in e kompanisë' : undefined)}
                onClick={genLink}>
                <span className="material-icons">send</span>
                Gjenero dhe dërgo linkun
              </button>
            </>
          )}
        </div>
      )}

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!drawerKind}
          kind={drawerKind || 'staff'}
          initial={editInitial}
          onClose={() => { setDrawerKind(null); setEditIndex(-1); }}
          onSave={handleDrawerSave}
        />
      )}

    </Section>
  );
}

// ---------- Bashkim operatorësh ekonomikë (consortium) ----------
function Bashkimi({ form, setConsortium }) {
  const c = form.consortium;
  const [drawerKind, setDrawerKind] = React.useState(null);
  const [drawerPartnerId, setDrawerPartnerId] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  const [openPartnerId, setOpenPartnerId] = React.useState(
    (c.partners.find((p) => !p.isSelf) || {}).id || null
  );

  // Keep the accordion aligned with the non-self partner list: default to the
  // first one when it's empty or points at a removed partner.
  React.useEffect(() => {
    const nonSelf = c.partners.filter((p) => !p.isSelf);
    if (nonSelf.length === 0) {
      if (openPartnerId !== null) setOpenPartnerId(null);
      return;
    }
    if (!openPartnerId || !nonSelf.some((p) => p.id === openPartnerId)) {
      setOpenPartnerId(nonSelf[0].id);
    }
  }, [c.partners, openPartnerId]);

  const setPartners = (next) => setConsortium('partners')(next);
  const updatePartner = (id, patch) =>
    setPartners(c.partners.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePartner = (id) =>
    setPartners(c.partners.filter((p) => p.id !== id));
  const addPartner = () =>
    setPartners([
      ...c.partners,
      {
        id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
        name: '', nipt: '', percent: '', email: '',
        linkSent: false, shareLink: '',
        capacities: {
          staff: [], machinery: [], certificates: [], licenses: [],
          similarWorks: [], listpagesa: [], xhiro: null, docExtra: null,
        },
      },
    ]);

  const setPartnerCapacity = (id, kind, next) =>
    setPartners(c.partners.map((p) => (p.id === id
      ? { ...p, capacities: { ...(p.capacities || {}), [kind]: next } }
      : p)));

  const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

  // Running total — empty fields count as 0 so the user sees progress as they type.
  const total = c.partners.reduce((sum, p) => {
    const n = parseFloat(p.percent);
    return sum + (isFinite(n) ? n : 0);
  }, 0);
  const totalRounded = Math.round(total * 100) / 100;
  const allPartnersNamed = c.partners.every((p) => p.name.trim().length > 0);
  const partnersReady = totalRounded === 100 && allPartnersNamed && c.partners.length >= 2;

  const KIND_TO_STORE = {
    staff: 'staff',
    machine: 'machinery',
    iso: 'certificates',
    license: 'licenses',
    work: 'similarWorks',
    payroll: 'listpagesa',
  };
  const STORE_TO_KIND = {
    staff: 'staff',
    machinery: 'machine',
    certificates: 'iso',
    licenses: 'license',
    similarWorks: 'work',
    listpagesa: 'payroll',
  };
  function handleDrawerSave(data) {
    const storeKey = KIND_TO_STORE[drawerKind];
    if (!storeKey || !data || !data.name || !drawerPartnerId) return;
    const partner = c.partners.find((p) => p.id === drawerPartnerId);
    if (!partner) return;
    const list = (partner.capacities && partner.capacities[storeKey]) || [];
    if (editIndex >= 0) {
      setPartnerCapacity(drawerPartnerId, storeKey, list.map((it, idx) => (idx === editIndex ? data : it)));
    } else {
      setPartnerCapacity(drawerPartnerId, storeKey, [...list, data]);
    }
    setEditIndex(-1);
  }

  const activePartner = drawerPartnerId ? c.partners.find((p) => p.id === drawerPartnerId) : null;
  const editInitial = (editIndex >= 0 && drawerKind && activePartner)
    ? ((activePartner.capacities || {})[KIND_TO_STORE[drawerKind]] || [])[editIndex]
    : null;

  // Link mode — bulk send
  const nonSelfPartners = c.partners.filter((p) => !p.isSelf);
  const missingEmails = nonSelfPartners.filter((p) => !emailValid(p.email));

  const sendAllLinks = () => {
    const next = c.partners.map((p) => {
      if (p.isSelf) return p;
      const token = Math.random().toString(36).slice(2, 10);
      return { ...p, linkSent: true, shareLink: `https://tenderat.al/partner/${token}` };
    });
    setPartners(next);
    setConsortium('linkSentAll')(true);
  };

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
          <div>Email</div>
          <div className="k-cons-col-pct">Përqindja</div>
          <div aria-hidden />
        </div>
        {c.partners.map((p) => (
          <div key={p.id} className={'k-cons-row' + (p.isSelf ? ' is-self' : '')}>
            <div className="k-cons-main">
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
              <div className="k-cons-cell k-cons-cell-email">
                {p.isSelf ? (
                  <span className="k-cons-cell-email-self">—</span>
                ) : (
                  <div className="k-cons-cell-email-input">
                    <span className="material-icons">alternate_email</span>
                    <input
                      type="email"
                      aria-label="Email kontakti"
                      placeholder="Email kontakti"
                      value={p.email || ''}
                      readOnly={c.linkSentAll && p.linkSent}
                      onChange={(e) => updatePartner(p.id, { email: e.target.value })}
                    />
                  </div>
                )}
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
          Pasi totali të jetë 100% dhe çdo partner të ketë emër, do mund të plotësoni kapacitetet
          (staf, makineri, certifikime, licenca) për secilin partner.
        </p>
      )}

      {partnersReady && (
        <div className="k-sup-mode k-cons-mode">
          <h5>Si do t'i plotësoni kapacitetet e secilit partner?</h5>
          <div className="k-sup-mode-opts">
            <button
              type="button"
              className={'k-sup-mode-opt' + (c.mode === 'manual' ? ' is-on' : '')}
              onClick={() => setConsortium('mode')('manual')}>
              <span className="k-sup-mode-icon"><span className="material-icons">edit_note</span></span>
              <span className="k-sup-mode-body">
                <strong>Plotësoj vetë të dhënat për secilin partner</strong>
                <span>Unë shtoj stafin, makineritë, certifikimet dhe licencat për çdo kompani.</span>
              </span>
              <span className="k-sup-mode-radio" aria-hidden />
            </button>
            <button
              type="button"
              className={'k-sup-mode-opt' + (c.mode === 'link' ? ' is-on' : '')}
              onClick={() => setConsortium('mode')('link')}>
              <span className="k-sup-mode-icon"><span className="material-icons">link</span></span>
              <span className="k-sup-mode-body">
                <strong>Gjenero link për çdo partner</strong>
                <span>Çdo partner plotëson vetë të dhënat e veta nëpërmjet një linku të sigurt.</span>
              </span>
              <span className="k-sup-mode-radio" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {partnersReady && c.mode === 'manual' && (
        <div className="k-cons-per-partner-list">
          {c.partners.filter((p) => !p.isSelf).map((p) => {
            const isOpen = openPartnerId === p.id;
            const caps = p.capacities || { staff: [], machinery: [], certificates: [], licenses: [] };
            return (
              <section key={p.id} className={'k-cons-per-partner' + (p.isSelf ? ' is-self' : '')}>
                <button
                  type="button"
                  className="k-cons-per-partner-head"
                  aria-expanded={isOpen}
                  onClick={() => setOpenPartnerId(isOpen ? null : p.id)}>
                  <div className="k-cons-per-partner-title">
                    {p.isSelf && <span className="k-cons-self-badge">Kompania ime</span>}
                    <strong>{p.name || '—'}</strong>
                    <span className="k-cons-per-partner-pct">{p.percent || 0}%</span>
                  </div>
                  <span className="material-icons">{isOpen ? 'expand_less' : 'expand_more'}</span>
                </button>
                {isOpen && (
                  <div className="k-cons-per-partner-body">
                    <CapacityLists
                      data={caps}
                      onOpen={(kind) => { setEditIndex(-1); setDrawerPartnerId(p.id); setDrawerKind(kind); }}
                      onRemove={(storeKey) => (i) =>
                        setPartnerCapacity(p.id, storeKey, caps[storeKey].filter((_, idx) => idx !== i))
                      }
                      onEdit={(storeKey, i) => {
                        setDrawerPartnerId(p.id);
                        setEditIndex(i);
                        setDrawerKind(STORE_TO_KIND[storeKey]);
                      }}
                      staffHint={`Stafi që vë në dispozicion ${p.name || 'kjo shoqëri'}.`}
                      machineryHint={`Mjetet që vë në dispozicion ${p.name || 'kjo shoqëri'}.`}
                      extras={{
                        onPickDoc: (key, label) =>
                          setPartnerCapacity(p.id, key, { name: label + '.pdf', size: '240 KB' }),
                        onClearDoc: (key) => setPartnerCapacity(p.id, key, null),
                        onAddMulti: (key) => {
                          if (key === 'listpagesa') {
                            setEditIndex(-1);
                            setDrawerPartnerId(p.id);
                            setDrawerKind('payroll');
                          }
                        },
                        onRemoveMulti: (key, idx) => {
                          const current = Array.isArray(caps[key]) ? caps[key] : [];
                          setPartnerCapacity(p.id, key, current.filter((_, i) => i !== idx));
                        },
                      }}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {partnersReady && c.mode === 'link' && (
        <div className="k-sup-link-panel">
          <div className="k-sup-link-copy">
            <h5>Linku për partnerët e bashkimit</h5>
            <p>
              Çdo partner do të marrë në email një link të sigurt. Për ta hapur, partneri duhet
              të vendosë një kod 6-shifror që i dërgohet po te ky email — kështu vetëm personi
              që ka akses te email-i mund të plotësojë të dhënat.
            </p>
          </div>

          {!c.linkSentAll ? (
            <>
              {missingEmails.length > 0 && (
                <div className="k-sup-verify-err">
                  <span className="material-icons">error</span>
                  Plotësoni email-in për {missingEmails.length}{' '}
                  {missingEmails.length === 1 ? 'partner' : 'partnerë'} para se të dërgoni linkun.
                </div>
              )}
              <button
                type="button"
                className="k-sup-email-btn"
                disabled={missingEmails.length > 0 || nonSelfPartners.length === 0}
                onClick={sendAllLinks}>
                <span className="material-icons">send</span>
                Dërgo linkun te të gjithë partnerët
              </button>
            </>
          ) : (
            <>
              <div className="k-cons-link-summary">
                <span className="material-icons">mark_email_read</span>
                Linku u dërgua te {nonSelfPartners.length}{' '}
                {nonSelfPartners.length === 1 ? 'partner' : 'partnerë'}.
              </div>
              {nonSelfPartners.map((p) => (
                <div key={p.id} className="k-sup-link-card">
                  <div className="k-sup-link-head">
                    <span className="material-icons">mark_email_read</span>
                    <div>
                      <strong>{p.name || '—'}</strong>
                      <span>Linku u dërgua te {p.email}</span>
                    </div>
                    <span className="k-sup-link-pill">Në pritje</span>
                  </div>
                  <div className="k-sup-link-url">
                    <span className="material-icons">link</span>
                    <input readOnly value={p.shareLink} />
                    <button
                      type="button"
                      className="k-sup-link-copybtn"
                      onClick={() => { try { navigator.clipboard.writeText(p.shareLink); } catch {} }}>
                      <span className="material-icons">content_copy</span>
                      Kopjo
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!drawerKind}
          kind={drawerKind || 'staff'}
          initial={editInitial}
          onClose={() => { setDrawerKind(null); setDrawerPartnerId(null); setEditIndex(-1); }}
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
  { id: 'listpagesa', name: 'Listëpagesa', required: true, category: 'financiar', multi: true },
  { id: 'specifika',name: 'Deklaratë në përmbushje me specifikimet teknike', required: true, category: 'teknik' },
  { id: 'grafiku',  name: 'Deklaratë për grafikun e punimeve / shërbimeve / furnizimit', required: true, category: 'teknik' },
  { id: 'preventivi-bosh', name: 'Preventivi bosh — pa çmime', required: true, category: 'preventivi', needsUpload: true },
  { id: 'manuali-cmimeve', name: 'Manuali i çmimeve të ndërtimit (2023)', required: true, category: 'preventivi', system: true, year: 2023, validFor: 2026 },
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
function VdCard({ selected, onToggle, icon, title, subtitle, tags, children, action }) {
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
      {action && (
        <button
          type="button"
          className="k-vd-item-action"
          aria-label={action.label || 'Shiko dokumentin'}
          title={action.label || 'Shiko dokumentin'}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); action.onClick && action.onClick(); }}>
          <span className="material-icons">{action.icon || 'visibility'}</span>
          <span className="k-vd-item-action-label">{action.label || 'Shiko dokumentin'}</span>
        </button>
      )}
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


// Map each document id from DOKUMENTACIONI_LIST to a location in PROFILE_TREE
// plus the drawer kind used to add a new instance. `path: [rootId, mode, id]`
// where mode is 'direct' (single leaf in the root's children) or 'folder'
// (a sub-folder whose children are selectable).
const DOC_PROFILE_MAP = {
  // Legal
  konflikt:  { path: ['ligj','direct','konflikt'],  drawerKind: 'doc-generic', icon: 'gavel',             rowIcon: 'gavel',             groupLabel: 'Deklarata mbi Konfliktin e Interesit', addLabel: 'Shto deklaratë të re' },
  punesim:   { path: ['ligj','direct','punesim'],   drawerKind: 'doc-generic', icon: 'work',              rowIcon: 'work',              groupLabel: 'Deklarata për dispozitat e punës',     addLabel: 'Shto deklaratë të re' },
  kriteret:  { path: ['ligj','direct','kriteret'],  drawerKind: 'doc-generic', icon: 'rule',              rowIcon: 'rule',              groupLabel: 'Deklarata për kriteret',                addLabel: 'Shto deklaratë të re' },
  pavarur:   { path: ['ligj','direct','pavarur'],   drawerKind: 'doc-generic', icon: 'verified_user',     rowIcon: 'verified_user',     groupLabel: 'Deklarata për ofertat e pavarura',      addLabel: 'Shto deklaratë të re' },
  licenca:   { path: ['ligj','direct','l5'],        drawerKind: 'license',     icon: 'workspace_premium', rowIcon: 'workspace_premium', groupLabel: 'Licencat profesionale',                 addLabel: 'Shto licencë' },
  // Financial
  xhiro:      { path: ['fin','direct','f1'],         drawerKind: 'doc-generic', icon: 'trending_up',      rowIcon: 'trending_up',      groupLabel: 'Vërtetim i xhiros vjetore',             addLabel: 'Shto vërtetim xhiroje' },
  pasqyra:    { path: ['fin','direct','f2'],         drawerKind: 'doc-generic', icon: 'assessment',       rowIcon: 'assessment',       groupLabel: 'Pasqyrat financiare',                    addLabel: 'Shto pasqyrë financiare' },
  bilanci:    { path: ['fin','direct','f3'],         drawerKind: 'doc-generic', icon: 'account_balance',  rowIcon: 'account_balance',  groupLabel: 'Bilanci',                                addLabel: 'Shto bilanc' },
  listpagesa: { path: ['fin','folder','listpg'],     drawerKind: 'payroll',     icon: 'receipt_long',     rowIcon: 'receipt_long',     groupLabel: 'Listëpagesat mujore',                    addLabel: 'Shto listëpagesë' },
  // Technical
  specifika:  { path: ['tek','direct','specifika'],  drawerKind: 'doc-generic', icon: 'settings',         rowIcon: 'settings',         groupLabel: 'Deklarata për specifikimet teknike',     addLabel: 'Shto deklaratë të re' },
  grafiku:    { path: ['tek','direct','grafiku'],    drawerKind: 'doc-generic', icon: 'timeline',         rowIcon: 'timeline',         groupLabel: 'Deklarata për grafikun e punimeve',      addLabel: 'Shto deklaratë të re' },
};

// Pull the selectable items for a doc from PROFILE_TREE.
function readProfileItems(mapping) {
  const tree = window.PROFILE_TREE;
  if (!tree || !mapping) return [];
  const [rootId, mode, id] = mapping.path;
  const root = tree.find((n) => n.id === rootId);
  if (!root || !root.children) return [];
  if (mode === 'direct') {
    const leaf = root.children.find((c) => c.id === id);
    return leaf ? [leaf] : [];
  }
  // folder mode
  const folder = root.children.find((c) => c.id === id);
  if (!folder || !folder.children) return [];
  return folder.children.filter((c) => !c.add);
}

function DocSelector({ docId, doc, form, setForm, parentSelected, setParentSelected }) {
  const mapping = DOC_PROFILE_MAP[docId];
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [saveToProfile, setSaveToProfile] = React.useState(true);
  // force a re-read when PROFILE_TREE mutates (the mutator sets this stamp)
  const [bump, setBump] = React.useState(0);

  if (!mapping) return null;

  const items = readProfileItems(mapping);
  const selectedIds = (form.docSelections && form.docSelections[docId]) || [];
  const selected = new Set(selectedIds);

  const setDocSelections = (nextArr) => {
    setForm((f) => ({
      ...f,
      docSelections: { ...(f.docSelections || {}), [docId]: nextArr },
    }));
    // Keep the left-list checkbox in sync: if at least one row is picked here,
    // the parent doc should be checked; if none, uncheck it.
    if (setParentSelected && Array.isArray(parentSelected)) {
      const hasAny = nextArr.length > 0;
      const isOn = parentSelected.includes(docId);
      if (hasAny && !isOn) setParentSelected([...parentSelected, docId]);
      else if (!hasAny && isOn) setParentSelected(parentSelected.filter((x) => x !== docId));
    }
  };

  const toggle = (id) => {
    if (selected.has(id)) setDocSelections(selectedIds.filter((x) => x !== id));
    else setDocSelections([...selectedIds, id]);
  };

  const onDrawerSave = (entry) => {
    if (!entry || !entry.name) { setDrawerOpen(false); return; }
    const clientId = 'doc-' + docId + '-' + Date.now().toString(36);
    if (saveToProfile !== false && typeof window.addDocToProfile === 'function') {
      window.addDocToProfile(mapping.path, { ...entry, clientId });
    }
    // Auto-select the freshly added row. For 'direct' mode the id keeps
    // matching the mapping's leaf id; for 'folder' mode the new row uses
    // clientId.
    const newId = mapping.path[1] === 'direct' ? mapping.path[2] : clientId;
    const nextArr = Array.from(new Set([...selectedIds, newId]));
    setDocSelections(nextArr);
    setBump((n) => n + 1);
    setDrawerOpen(false);
  };

  const buildSubtitle = (it) => {
    const parts = [];
    if (it.uploaded) parts.push('Ngarkuar ' + it.uploaded);
    if (it.expires)  parts.push('Skadon ' + it.expires);
    return parts.join(' · ');
  };
  const buildTags = (it) => {
    if (!it.status) return [];
    const toneFor = { ok: 'owned', warn: 'rent', missing: 'ghost' };
    const labelFor = { ok: 'Në rregull', warn: 'Duke skaduar', missing: 'Mungon' };
    return [{ label: labelFor[it.status] || 'Në rregull', tone: toneFor[it.status] || 'neutral' }];
  };

  return (
    <div className="k-vd-shell">
      <header className="k-vd-header">
        <span className="material-icons">{mapping.icon}</span>
        <div>
          <h3>{doc?.name || mapping.groupLabel}</h3>
          <p>
            Zgjidh dokumentin ekzistues nga profili i kompanisë ose shto një të ri direkt për këtë dosje.
          </p>
        </div>
      </header>

      <section className="k-vd-group">
        <div className="k-vd-group-head">
          <span className="material-icons">{mapping.rowIcon}</span>
          <h4>{mapping.groupLabel}</h4>
          <span className="k-vd-group-count">{selected.size} zgjedhur</span>
        </div>

        {items.length === 0 ? (
          <div className="k-ds-empty">
            <span className="material-icons">folder_open</span>
            <p>Ende s'ka asnjë dokument të këtij lloji në profilin e kompanisë. Klikoni "{mapping.addLabel}" për të shtuar.</p>
          </div>
        ) : (
          <div className="k-vd-items" data-bump={bump}>
            {items.map((it) => (
              <VdCard
                key={it.id}
                selected={selected.has(it.id)}
                onToggle={() => toggle(it.id)}
                icon={mapping.rowIcon}
                title={it.title}
                subtitle={buildSubtitle(it)}
                tags={buildTags(it)}
                action={{ icon: 'visibility', label: 'Shiko dokumentin', onClick: () => {} }}
              />
            ))}
          </div>
        )}

        <button type="button" className="k-vd-add" onClick={() => setDrawerOpen(true)}>
          <span className="material-icons">add</span>
          {mapping.addLabel}
        </button>
      </section>

      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={drawerOpen}
          kind={mapping.drawerKind}
          onClose={() => setDrawerOpen(false)}
          onSave={onDrawerSave}
          saveToProfileToggle={{
            value: saveToProfile,
            onChange: setSaveToProfile,
            label: 'Ruaj tek profili i kompanisë',
          }}
        />
      )}
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
// Real data lives in `manuali-cmimeve-data.json` (exported from the official
// 2023 construction manual — ~2,247 rows across 4 manuals). The viewer loads
// it once on mount and lets the user drill from Manual → Kategoria → Zëra.

const MANUAL_LABELS = {
  'Manual 1': { title: 'Manuali 1 — Prodhimi i materialeve të ndërtimit', icon: 'foundation' },
  'Manual 2': { title: 'Manuali 2 — Punime ndërtimi dhe instalime', icon: 'home_work' },
  'Manual 3': { title: 'Manuali 3 — Punime infrastrukturë dhe rrugore', icon: 'alt_route' },
  'Manual 4': { title: 'Manuali 4 — Gaz, naftësjellës dhe analiza teknike', icon: 'local_gas_station' },
};

function formatCurrency(n) {
  if (n === null || n === undefined || n === '' || isNaN(n)) return '—';
  const num = Number(n);
  return num.toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Paletë e qëndrueshme ngjyrash për partnerët e bashkimit (sipas indeksit).
const PARTNER_COLORS = ['#E8772E', '#2563EB', '#0F9D58', '#9333EA', '#DB2777', '#0891B2'];
function partnerColor(idx) {
  return PARTNER_COLORS[((idx % PARTNER_COLORS.length) + PARTNER_COLORS.length) % PARTNER_COLORS.length];
}
// Emër i shkurtër partneri për badge (heq formën ligjore SH.P.K. etj.).
function partnerShortName(p) {
  const n = (p && p.name) || (p && p.isSelf ? 'Kompania ime' : 'Partneri');
  return String(n).replace(/\s*(sh\.?p\.?k\.?|sh\.?a\.?|ltd\.?)\s*$/i, '').trim() || n;
}

// Shared loader for the construction manual — cached in module scope so the
// Preventivi editor and the Manual viewer don't double-fetch.
let __manualDataCache = null;
let __manualDataPromise = null;
function useManualData() {
  const [data, setData]     = React.useState(__manualDataCache);
  const [error, setError]   = React.useState(null);
  React.useEffect(() => {
    if (__manualDataCache) { setData(__manualDataCache); return; }
    if (!__manualDataPromise) {
      __manualDataPromise = fetch('manuali-cmimeve-data.json')
        .then((r) => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
        .then((rows) => { __manualDataCache = rows; return rows; });
    }
    let cancelled = false;
    __manualDataPromise
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);
  return { data, error };
}

// Flatten the preventivi-sample JSON ({rows: [...]}) into a linear stream of
// section headers + data rows the editor can render directly.
function flattenPreventivi(sample) {
  if (!sample || !Array.isArray(sample.rows)) return [];
  const out = [];
  let sectionId = null;
  for (const r of sample.rows) {
    if (r.sectionNr != null) {
      sectionId = 's' + r.sectionNr;
      out.push({ type: 'section', id: sectionId, nr: r.sectionNr, title: r.sectionTitle });
    } else if (r.kodi != null) {
      out.push({
        type: 'row',
        id: (sectionId || 's0') + '-r' + r.nr,
        sectionId,
        nr: r.nr,
        kodi: r.kodi,
        emertimi: r.emertimi,
        njesia: r.njesia,
        sasia: r.sasia,
        cmimi: null,
        vlefta: null,
        match: null,
        source: null,
        candidates: [],
      });
    }
  }
  return out;
}

// Best-effort auto-match preventivi rows to the official manual, keyed by kodi.
// Falls back to stripping the trailing letter suffix (e.g. '3.89/a' → '3.89').
function findCandidates(kodi, data) {
  if (!kodi) return [];
  const parts = String(kodi).split('/')[0].split('.');
  const prefix = parts.slice(0, 2).join('.');
  if (!prefix) return [];
  const out = [];
  for (const m of data) {
    if (!m.kodi) continue;
    if (String(m.kodi).startsWith(prefix)) {
      out.push(m);
      if (out.length >= 5) break;
    }
  }
  return out;
}

function matchRowToManual(row, byCode, allData) {
  if (row.type !== 'row') return row;
  const hit = byCode.get(String(row.kodi));
  if (hit) {
    return { ...row, cmimi: hit.totali, vlefta: +(hit.totali * row.sasia).toFixed(2),
             match: 'auto', source: hit, candidates: [] };
  }
  const base = String(row.kodi).replace(/[a-zA-Z]+$/, '');
  const hit2 = base !== row.kodi ? byCode.get(base) : null;
  if (hit2) {
    return { ...row, cmimi: hit2.totali, vlefta: +(hit2.totali * row.sasia).toFixed(2),
             match: 'auto', source: hit2, candidates: [] };
  }
  return { ...row, cmimi: null, vlefta: null, match: 'none', source: null,
           candidates: findCandidates(row.kodi, allData) };
}

function autoMatchAll(rows, manualData) {
  if (!manualData) return rows;
  const byCode = new Map(manualData.map((m) => [String(m.kodi), m]));
  return rows.map((r) => {
    // Preserve manual overrides — don't re-auto rows the user touched.
    if (r.match === 'manual' || r.match === 'chosen') return r;
    return matchRowToManual(r, byCode, manualData);
  });
}

function ManualSearchResults({ data, manualFilter, query, onOpenCategory }) {
  const q = query.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (!data || !q) return { items: [], categories: [], truncated: false };
    const scope = manualFilter ? data.filter((r) => r.manuali === manualFilter) : data;

    // Item matches (by code or name)
    const matched = [];
    const MAX = 200;
    for (const r of scope) {
      if (matched.length >= MAX) break;
      if ((r.kodi || '').toLowerCase().includes(q) ||
          (r.emertimi || '').toLowerCase().includes(q)) {
        matched.push(r);
      }
    }

    // Category matches (name contains query) — group distinct {manuali, kategoria}
    const catMap = new Map();
    for (const r of scope) {
      if ((r.kategoria || '').toLowerCase().includes(q)) {
        const key = r.manuali + '|' + r.kategoria;
        if (!catMap.has(key)) {
          catMap.set(key, { manuali: r.manuali, kategoria: r.kategoria, count: 0 });
        }
        catMap.get(key).count += 1;
      }
    }
    const categories = Array.from(catMap.values()).sort((a, b) => b.count - a.count);

    // Count total item matches (not just capped)
    let totalMatched = 0;
    for (const r of scope) {
      if ((r.kodi || '').toLowerCase().includes(q) ||
          (r.emertimi || '').toLowerCase().includes(q)) totalMatched += 1;
    }

    return { items: matched, categories, truncated: totalMatched > MAX, totalMatched };
  }, [data, manualFilter, q]);

  return (
    <div className="k-man-results">
      {results.categories.length > 0 && (
        <div className="k-man-results-block">
          <div className="k-man-results-head">
            Kategori ({results.categories.length})
          </div>
          <div className="k-man-cats">
            {results.categories.map((c) => (
              <button key={c.manuali + '|' + c.kategoria} type="button"
                      className="k-man-cat"
                      onClick={() => onOpenCategory(c.manuali, c.kategoria)}>
                <span className="k-man-cat-title">{c.kategoria}</span>
                <span className="k-man-cat-mmeta">{MANUAL_LABELS[c.manuali]?.title || c.manuali}</span>
                <span className="k-man-cat-count">{c.count}</span>
                <span className="material-icons k-man-cat-caret">chevron_right</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="k-man-results-block">
        <div className="k-man-results-head">
          Zëra ({results.totalMatched || 0})
          {results.truncated && (
            <span className="k-man-results-note">
              · shfaqen 200 të parët — ngushto kërkimin për më shumë saktësi
            </span>
          )}
        </div>
        {results.items.length === 0 && results.categories.length === 0 ? (
          <div className="k-man-empty">
            <span className="material-icons">search_off</span>
            <div>
              <strong>Asnjë rezultat për "{query}"</strong>
              <p>Provo një fjalë kyçe tjetër ose një kod pa pikë (p.sh. <code>3.1</code>).</p>
            </div>
          </div>
        ) : results.items.length === 0 ? null : (
          <div className="k-man-table-wrap">
            <table className="k-man-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Kodi</th>
                  <th>Emërtimi</th>
                  {!manualFilter && <th style={{ width: 120 }}>Manuali</th>}
                  <th style={{ width: 60 }}>Njësia</th>
                  <th className="is-num is-total" style={{ width: 120 }}>Totali</th>
                </tr>
              </thead>
              <tbody>
                {results.items.map((r, i) => (
                  <tr key={(r.kodi || '') + i}
                      className="k-man-row-clickable"
                      onClick={() => onOpenCategory(r.manuali, r.kategoria)}>
                    <td className="k-man-td-code">{r.kodi}</td>
                    <td>{r.emertimi}</td>
                    {!manualFilter && (
                      <td className="k-man-td-unit">{r.manuali}</td>
                    )}
                    <td className="k-man-td-unit">{r.njesia}</td>
                    <td className="is-num is-total">{formatCurrency(r.totali)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ManualiCmimeveViewer({ year }) {
  const [data, setData]       = React.useState(null);
  const [loadErr, setLoadErr] = React.useState(null);
  const [manual, setManual]   = React.useState(null);   // 'Manual 1' | ...
  const [kategoria, setKat]   = React.useState(null);   // category string
  const [query, setQuery]     = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    fetch('manuali-cmimeve-data.json')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setLoadErr(e.message); });
    return () => { cancelled = true; };
  }, []);

  // Group once: manual -> kategoria -> items
  const tree = React.useMemo(() => {
    if (!data) return null;
    const t = {};
    for (const row of data) {
      const m = row.manuali || 'I panjohur';
      const k = row.kategoria || 'Pa kategori';
      if (!t[m]) t[m] = {};
      if (!t[m][k]) t[m][k] = [];
      t[m][k].push(row);
    }
    return t;
  }, [data]);

  const manualList = React.useMemo(() => {
    if (!tree) return [];
    return Object.keys(tree).sort().map((m) => {
      const cats = tree[m];
      const catCount = Object.keys(cats).length;
      const itemCount = Object.values(cats).reduce((a, xs) => a + xs.length, 0);
      return { key: m, catCount, itemCount };
    });
  }, [tree]);

  const categoryList = React.useMemo(() => {
    if (!tree || !manual) return [];
    const cats = tree[manual] || {};
    return Object.keys(cats)
      .map((k) => ({ key: k, count: cats[k].length }))
      .sort((a, b) => b.count - a.count);
  }, [tree, manual]);

  const items = React.useMemo(() => {
    if (!tree || !manual || !kategoria) return [];
    let rows = tree[manual][kategoria] || [];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        (r.kodi || '').toLowerCase().includes(q) ||
        (r.emertimi || '').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [tree, manual, kategoria, query]);

  const totalItems = React.useMemo(() => {
    if (!data) return 0;
    return data.length;
  }, [data]);

  // Loading / error states
  if (loadErr) {
    return (
      <div className="k-man">
        <div className="k-man-empty">
          <span className="material-icons">error_outline</span>
          <div>
            <strong>S'u ngarkua manuali.</strong>
            <p>{loadErr}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="k-man">
        <div className="k-man-empty">
          <span className="material-icons k-man-spin">progress_activity</span>
          <div>
            <strong>Duke ngarkuar manualin…</strong>
            <p>~2,247 zëra po përgatiten për shfletim.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="k-man">
      <header className="k-man-head">
        <div className="k-man-head-icon">
          <span className="material-icons">menu_book</span>
        </div>
        <div>
          <div className="k-man-eyebrow">Sistem · Burim zyrtar</div>
          <h3>Manuali i çmimeve të ndërtimit ({year})</h3>
          <p>
            Lista zyrtare e çmimeve të njësisë, botim <b>{year}</b>, në fuqi për ofertat e vitit <b>2026</b>.
            {manual && kategoria
              ? ` ${items.length} zëra në kategorinë e zgjedhur.`
              : ` ${totalItems.toLocaleString('sq-AL')} zëra, 4 manuale.`}
          </p>
        </div>
        <div className="k-man-year">
          <span className="k-man-year-label">I vlefshëm për</span>
          <span className="k-man-year-value">2026</span>
        </div>
      </header>

      {/* Breadcrumb */}
      {(manual || kategoria) && (
        <div className="k-man-crumbs">
          <button type="button" className="k-man-crumb"
                  onClick={() => { setManual(null); setKat(null); setQuery(''); }}>
            <span className="material-icons">home</span>
            Të gjitha manualet
          </button>
          {manual && (
            <>
              <span className="k-man-crumb-sep material-icons">chevron_right</span>
              <button type="button"
                      className={'k-man-crumb' + (kategoria ? '' : ' is-current')}
                      onClick={() => { setKat(null); setQuery(''); }}>
                {MANUAL_LABELS[manual]?.title || manual}
              </button>
            </>
          )}
          {kategoria && (
            <>
              <span className="k-man-crumb-sep material-icons">chevron_right</span>
              <span className="k-man-crumb is-current">{kategoria}</span>
            </>
          )}
        </div>
      )}

      {/* Global search (visible on levels 1 & 2) */}
      {!kategoria && (
        <div className="k-man-toolbar">
          <div className="k-man-search">
            <span className="material-icons">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={manual
                ? 'Kërko në këtë manual: kategori, kod, ose emërtim…'
                : 'Kërko në të gjitha manualet: kategori, kod, ose emërtim…'}
            />
            {query && (
              <button type="button" className="k-man-search-clear"
                      onClick={() => setQuery('')} aria-label="Pastro">
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Level 1 — Manual list (no query) */}
      {!manual && !query.trim() && (
        <div className="k-man-sections">
          {manualList.map((m) => {
            const meta = MANUAL_LABELS[m.key] || { title: m.key, icon: 'description' };
            return (
              <button key={m.key} type="button" className="k-man-section"
                      onClick={() => setManual(m.key)}>
                <span className="k-man-section-ico">
                  <span className="material-icons">{meta.icon}</span>
                </span>
                <div className="k-man-section-main">
                  <span className="k-man-section-title">{meta.title}</span>
                  <span className="k-man-section-meta">
                    {m.catCount} kategori · {m.itemCount.toLocaleString('sq-AL')} zëra
                  </span>
                </div>
                <span className="k-man-section-open">
                  <span className="material-icons">chevron_right</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Level 2 — Category list for a manual (no query) */}
      {manual && !kategoria && !query.trim() && (
        <div className="k-man-cats">
          {categoryList.map((c) => (
            <button key={c.key} type="button" className="k-man-cat"
                    onClick={() => setKat(c.key)}>
              <span className="k-man-cat-title">{c.key}</span>
              <span className="k-man-cat-count">
                {c.count} {c.count === 1 ? 'zë' : 'zëra'}
              </span>
              <span className="material-icons k-man-cat-caret">chevron_right</span>
            </button>
          ))}
        </div>
      )}

      {/* Global / per-manual search results (levels 1 & 2) */}
      {!kategoria && query.trim() && (
        <ManualSearchResults
          data={data}
          manualFilter={manual}
          query={query}
          onOpenCategory={(m, k) => { setManual(m); setKat(k); setQuery(''); }}
        />
      )}

      {/* Level 3 — Items table for a category */}
      {manual && kategoria && (
        <>
          <div className="k-man-toolbar">
            <div className="k-man-search">
              <span className="material-icons">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko sipas kodit ose emërtimit…"
              />
              {query && (
                <button type="button" className="k-man-search-clear"
                        onClick={() => setQuery('')} aria-label="Pastro">
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>
            <span className="k-man-count">
              {items.length} / {(tree[manual][kategoria] || []).length} zëra
            </span>
          </div>

          <div className="k-man-table-wrap">
            <table className="k-man-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Kodi</th>
                  <th>Emërtimi</th>
                  <th style={{ width: 60 }}>Njësia</th>
                  <th className="is-num" style={{ width: 110 }}>Puntori</th>
                  <th className="is-num" style={{ width: 110 }}>Materiale</th>
                  <th className="is-num" style={{ width: 110 }}>Makineri</th>
                  <th className="is-num is-total" style={{ width: 120 }}>Totali</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="k-man-empty-row">
                      Asnjë zë nuk përputhet me kërkimin.
                    </td>
                  </tr>
                ) : (
                  items.map((r, i) => (
                    <tr key={(r.kodi || '') + i}>
                      <td className="k-man-td-code">{r.kodi}</td>
                      <td>{r.emertimi}</td>
                      <td className="k-man-td-unit">{r.njesia}</td>
                      <td className="is-num">{formatCurrency(r.puntori)}</td>
                      <td className="is-num">{formatCurrency(r.materiale)}</td>
                      <td className="is-num">{formatCurrency(r.makineri)}</td>
                      <td className="is-num is-total">{formatCurrency(r.totali)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}

// ---------- Duration field (number + unit segmented control) ----------
function DurationField({ label, value = {}, units = ['dite', 'jave'],
                         valueKey = 'kohe', unitKey = 'njesia', onChange }) {
  const kohe   = value[valueKey] ?? '';
  const njesia = value[unitKey] || units[0];
  const unitLabel = (u) => u === 'dite' ? 'ditë' : u === 'jave' ? 'javë' : u;
  return (
    <div className={'k-field' + (label ? '' : ' k-field-bare')}>
      {label && <label className="k-field-label">{label}</label>}
      <div className="k-dek-dur">
        <input
          type="number"
          min="0"
          className="k-field-input k-dek-dur-num"
          placeholder="0"
          value={kohe}
          onChange={(e) => onChange({ ...value, [valueKey]: e.target.value, [unitKey]: njesia })}
        />
        <div className="k-dek-dur-units" role="tablist">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              className={'k-dek-dur-unit' + (njesia === u ? ' is-on' : '')}
              onClick={() => onChange({ ...value, [valueKey]: kohe, [unitKey]: u })}>
              {unitLabel(u)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Deklarimet step (inputs that feed the methodology generator) ----------
function DeklarimetStep({ form, setForm }) {
  const m = form.metodologjia || {};
  const setM = (patch) =>
    setForm((p) => ({ ...p, metodologjia: { ...(p.metodologjia || {}), ...patch } }));

  const inputRef = React.useRef(null);

  const onPickExtra = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = [
      ...(m.docsExtra || []),
      ...files.map((f, i) => ({
        id: 'doc-' + Date.now() + '-' + i,
        name: f.name,
        size: f.size,
      })),
    ];
    setM({ docsExtra: next });
    e.target.value = '';
  };

  const removeExtra = (id) =>
    setM({ docsExtra: (m.docsExtra || []).filter((d) => d.id !== id) });

  return (
    <div className="k-card">
      <Section
        title="Mobilizimi i kantierit"
        desc="Sa kohë ju duhet për të filluar punën pas nënshkrimit të kontratës.">
        <DurationField
          value={m.mobilizimi}
          onChange={(v) => setM({ mobilizimi: v })}
        />
      </Section>

      <Section
        title="Afati i punimeve"
        desc={
          <>
            Afati juaj i propozuar. Si default merret nga grafiku fillestar:&nbsp;
            <b>{form.grafiku || '— i paplotësuar në Hapin 1 —'}</b>.
          </>
        }>
        <label className="k-dek-toggle">
          <input
            type="checkbox"
            checked={!!m.afatiPunimeve?.sameAsStep1}
            onChange={(e) => setM({
              afatiPunimeve: {
                ...(m.afatiPunimeve || {}),
                sameAsStep1: e.target.checked,
              },
            })} />
          <span>Përdor të njëjtin afat si në Hapin 1</span>
        </label>
        {!m.afatiPunimeve?.sameAsStep1 && (
          <DurationField
            value={m.afatiPunimeve}
            onChange={(v) => setM({ afatiPunimeve: { ...v, sameAsStep1: false } })}
          />
        )}
      </Section>

      <Section
        title="Garancia e punimeve"
        desc="Periudha e garancisë që ofron kompania pas përfundimit të punimeve.">
        <DurationField
          label="Periudha e garancisë"
          value={m.garancia}
          unitKey="njesiaPer"
          valueKey="periudha"
          units={['muaj', 'vit']}
          onChange={(v) => setM({ garancia: { ...(m.garancia || {}), ...v } })}
        />
      </Section>

      <Section
        title="Dokumente shtesë për metodologjinë"
        desc="Çdo dokument i ngarkuar këtu i shtohet input-it të gjeneruesit të metodologjisë.">
        <button
          type="button"
          className="k-prev-drop"
          onClick={() => inputRef.current && inputRef.current.click()}>
          <span className="material-icons">cloud_upload</span>
          <div>
            <div className="k-prev-drop-title">Ngarko dokumente shtesë</div>
            <div className="k-prev-drop-hint">PDF / Word / Excel</div>
          </div>
          <span className="k-prev-drop-cta">Zgjidh skedarë</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={onPickExtra}
        />
        {(m.docsExtra || []).length > 0 && (
          <ul className="k-dek-extra">
            {m.docsExtra.map((d) => (
              <li key={d.id}>
                <span className="material-icons">description</span>
                <span className="k-dek-extra-name">{d.name}</span>
                <span className="k-dek-extra-size">
                  {d.size ? `${Math.max(1, Math.round(d.size / 1024))} KB` : ''}
                </span>
                <button
                  type="button"
                  className="k-dek-extra-rm"
                  onClick={() => removeExtra(d.id)}
                  aria-label="Hiq">
                  <span className="material-icons">close</span>
                </button>
              </li>
            ))}
          </ul>
        )}

      </Section>
    </div>
  );
}

// ---------- Metodologjia generator (AI-powered, simulated) ----------
function MetodologjiaGenerator({ form, setForm, selectedDocs }) {
  const meta = form.metodologjia || {};
  const generated = meta.generated;
  const [progress, setProgress] = React.useState(0);
  const [step, setStep]         = React.useState(null); // null | 'thinking' | 'writing' | 'done'
  const timersRef = React.useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  React.useEffect(() => () => clearTimers(), []);

  // Summarize inputs the generator "sees".
  const inputs = React.useMemo(() => {
    const picked = new Set(selectedDocs || []);
    const docs = (DOKUMENTACIONI_LIST || []).filter((d) => picked.has(d.id))
      .map((d) => d.name);

    const capCount = (k) => {
      const own = ((form.consortium && form.consortium.partners) || [])
        .reduce((a, p) => a + ((p.capacities && p.capacities[k]) || []).length, 0);
      const support = ((form.support && form.support[k]) || []).length;
      return own + support;
    };

    return {
      basics: {
        objekti: form.objekti || '—',
        autoriteti: form.autoriteti || '—',
        fondi: form.fondi || '—',
        lloji: form.lloji || 'Pjesëmarrje e vetme',
      },
      afati: meta.afatiPunimeve?.sameAsStep1
        ? (form.grafiku || '—')
        : ((meta.afatiPunimeve?.kohe || '—') + ' ' + (meta.afatiPunimeve?.njesia === 'jave' ? 'javë' : 'ditë')),
      mobilizimi: (meta.mobilizimi?.kohe || '—') + ' ' + (meta.mobilizimi?.njesia === 'jave' ? 'javë' : 'ditë'),
      garancia: (meta.garancia?.periudha || '—') + ' ' + (meta.garancia?.njesiaPer || 'muaj'),
      docs,
      preventivi: form.preventivi?.rows?.filter((r) => r.type === 'row').length || 0,
      staff: capCount('staff'),
      machinery: capCount('machinery'),
      extras: (meta.docsExtra || []).length,
    };
  }, [form, meta, selectedDocs]);

  const generate = () => {
    clearTimers();
    setProgress(0);
    setStep('thinking');
    // Simulated streaming: progress ticks up, swap stage at 45%
    let p = 0;
    const tick = () => {
      p += Math.random() * 8 + 3;
      if (p > 100) p = 100;
      setProgress(Math.round(p));
      if (p >= 45 && p < 48) setStep('writing');
      if (p < 100) {
        timersRef.current.push(setTimeout(tick, 180 + Math.random() * 120));
      } else {
        setStep('done');
        setForm((f) => ({
          ...f,
          metodologjia: {
            ...(f.metodologjia || {}),
            generated: {
              at: Date.now(),
              sections: buildMetodologjiaSections(inputs),
            },
          },
        }));
      }
    };
    timersRef.current.push(setTimeout(tick, 200));
  };

  const regenerate = () => {
    setForm((f) => ({
      ...f,
      metodologjia: { ...(f.metodologjia || {}), generated: null },
    }));
    setStep(null);
    setProgress(0);
    setTimeout(generate, 40);
  };

  // Idle state — show ingredients + "Generate" CTA
  if (!generated && step !== 'thinking' && step !== 'writing') {
    return (
      <div className="k-meto">
        <div className="k-meto-ingredients">
          <div className="k-meto-ing-head">
            <span className="material-icons">inventory_2</span>
            <span>Burimet që përdoren për gjenerim</span>
          </div>
          <ul className="k-meto-ing-list">
            <IngredientRow icon="description" label="Të dhënat e dosjes"
              value={`${inputs.basics.autoriteti} · ${inputs.basics.lloji}`} />
            <IngredientRow icon="schedule" label="Afati i punimeve" value={inputs.afati} />
            <IngredientRow icon="play_arrow" label="Mobilizimi" value={inputs.mobilizimi} />
            <IngredientRow icon="verified_user" label="Garancia" value={inputs.garancia} />
            <IngredientRow icon="calculate" label="Preventivi"
              value={`${inputs.preventivi} zëra të plotësuara`} />
            <IngredientRow icon="groups" label="Stafi & makineritë"
              value={`${inputs.staff} staf · ${inputs.machinery} makineri`} />
            <li className="k-meto-ing-row is-stacked">
              <span className="material-icons">folder_open</span>
              <span className="k-meto-ing-label">Dokumentet e përzgjedhura</span>
              <span className="k-meto-ing-value">{inputs.docs.length} dokumente</span>
              {inputs.docs.length > 0 && (
                <ul className="k-meto-ing-sub">
                  {inputs.docs.map((name, i) => (
                    <li key={i}>
                      <span className="material-icons">description</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {inputs.extras > 0 && (
              <IngredientRow icon="attachment" label="Dokumente shtesë"
                value={`${inputs.extras} të ngarkuara në hapin e mëparshëm`} />
            )}
          </ul>
        </div>

        <button type="button" className="k-meto-gen-btn" onClick={generate}>
          <span className="material-icons">auto_awesome</span>
          Gjenero metodologjinë
        </button>
      </div>
    );
  }

  // Generating state
  if (step === 'thinking' || step === 'writing') {
    const stageLabel = step === 'thinking'
      ? 'Po lexon dokumentet dhe të dhënat…'
      : 'Po shkruan metodologjinë…';
    return (
      <div className="k-meto is-generating">
        <div className="k-meto-gen-card">
          <div className="k-meto-gen-ico">
            <span className="material-icons k-meto-spin">autorenew</span>
          </div>
          <div className="k-meto-gen-main">
            <div className="k-meto-gen-stage">{stageLabel}</div>
            <div className="k-meto-gen-bar">
              <div className="k-meto-gen-fill" style={{ width: progress + '%' }} />
            </div>
            <div className="k-meto-gen-pct">{progress}%</div>
          </div>
        </div>
        <ul className="k-meto-gen-steps">
          <GenStep done={progress > 5}  label="Lexuar të dhënat e dosjes" />
          <GenStep done={progress > 20} label="Analizuar preventivin dhe manualin 2023" />
          <GenStep done={progress > 45} label="Përpunuar dokumentet e përzgjedhura" />
          <GenStep done={progress > 70} label="Strukturuar metodologjinë sipas standardit" />
          <GenStep done={progress > 95} label="Formatuar dokumentin PDF" />
        </ul>
      </div>
    );
  }

  // Done — show generated document
  return (
    <div className="k-meto">
      <header className="k-meto-done-head">
        <div className="k-meto-done-badge">
          <span className="material-icons">check_circle</span>
          Metodologjia u gjenerua
        </div>
        <div className="k-meto-done-actions">
          <button type="button" className="k-prev-file-btn" onClick={regenerate}>
            <span className="material-icons">autorenew</span>
            Rigjenero
          </button>
        </div>
      </header>

      <article className="k-meto-doc">
        <div className="k-meto-doc-stamp">
          <b>METODOLOGJIA E REALIZIMIT TË OBJEKTIT</b>
          <span>Ref. {inputs.basics.autoriteti} · {new Date(generated.at).toLocaleDateString('sq-AL')}</span>
        </div>
        <h2 className="k-meto-doc-h1">{inputs.basics.objekti}</h2>
        <p className="k-meto-doc-lead">
          Kompania <b>Kompania Ime SH.P.K.</b>, me NIPT <b>L01234567A</b>, paraqet më poshtë
          metodologjinë e detajuar për realizimin e objektit të kontratës, duke u bazuar në
          kërkesat e autoritetit kontraktor <b>{inputs.basics.autoriteti}</b> dhe kapacitetet
          tona operative.
        </p>
        {generated.sections.map((s, i) => (
          <section key={i} className="k-meto-doc-sec">
            <h3>{i + 1}. {s.title}</h3>
            {s.paragraphs.map((p, j) => (
              <p key={j}>{renderBold(p)}</p>
            ))}
          </section>
        ))}
        <div className="k-meto-doc-sign">
          <div>
            <span>Data</span>
            <b>{new Date(generated.at).toLocaleDateString('sq-AL')}</b>
          </div>
          <div>
            <span>Firma & vula</span>
            <div className="k-doc-paper-stamp-box" aria-hidden>K.I.</div>
          </div>
        </div>
      </article>
    </div>
  );
}

// Render a paragraph with inline **bold** markers (our template uses [[text]]
// markers, split into alternating text/bold React nodes — safer than
// dangerouslySetInnerHTML).
function renderBold(text) {
  const parts = String(text).split(/\[\[(.+?)\]\]/g);
  return parts.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : <React.Fragment key={i}>{p}</React.Fragment>));
}

function IngredientRow({ icon, label, value }) {
  return (
    <li className="k-meto-ing-row">
      <span className="material-icons">{icon}</span>
      <span className="k-meto-ing-label">{label}</span>
      <span className="k-meto-ing-value">{value}</span>
    </li>
  );
}

function GenStep({ done, label }) {
  return (
    <li className={'k-meto-gen-step' + (done ? ' is-done' : '')}>
      <span className="material-icons">
        {done ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {label}
    </li>
  );
}

// Template text — what the "AI" produces. In production this would be a real
// streamed completion from a model, receiving the full form as context.
// Bold spans use [[text]] markers which renderBold() converts to <b>.
function buildMetodologjiaSections(i) {
  const autoriteti = i.basics.autoriteti;
  const objekti    = i.basics.objekti;
  const afati      = i.afati;
  const mob        = i.mobilizimi;
  const gar        = i.garancia;

  return [
    {
      title: 'Qasja e përgjithshme',
      paragraphs: [
        `Objekti [[${objekti}]] do të realizohet në përputhje të plotë me specifikimet teknike të kontraktorit publik [[${autoriteti}]], duke zbatuar standardet shqiptare të ndërtimit (Manuali i çmimeve 2023) dhe praktikat më të mira të sektorit.`,
        `Qasja jonë bazohet në tre shtylla: (1) planifikim i detajuar paraprak, (2) kontroll i vazhdueshëm i cilësisë në terren, (3) raportim transparent te autoriteti kontraktor në çdo fazë kryesore.`,
      ],
    },
    {
      title: 'Organizimi i kantierit dhe mobilizimi',
      paragraphs: [
        `Mobilizimi i kantierit do të kryhet brenda [[${mob}]] nga nënshkrimi i kontratës. Në këtë periudhë do të instalohen strukturat e përkohshme të kantierit, do të bëhet sinjalistika e sigurisë dhe do të pozicionohet makineria kryesore.`,
        `Kantieri do të menaxhohet nga një Drejtues Teknik me licencë profesionale në fushën përkatëse. Struktura organizative përfshin [[${i.staff}]] anëtarë stafi të deklaruar dhe [[${i.machinery}]] makineri operative.`,
      ],
    },
    {
      title: 'Afati dhe grafiku i punimeve',
      paragraphs: [
        `Afati total i realizimit të objektit është [[${afati}]]. Punimet do të zhvillohen sipas një grafiku me milestones të qarta, në koordinim me mbikëqyrësin e caktuar nga autoriteti.`,
        `Për pjesët kritike të punimeve (punime germimi, betoni strukturor, shtresat asfaltike) është parashikuar buffer kohor 10% për të mbuluar kushte të pafavorshme atmosferike ose ndërhyrje të paplanifikuara.`,
      ],
    },
    {
      title: 'Burimet materiale dhe njerëzore',
      paragraphs: [
        `Preventivi përfshin [[${i.preventivi}]] zëra të plotësuar me çmime nga manuali zyrtar 2023. Materialet do të sigurohen nga furnizues të sertifikuar, me certifikatë konformiteti për çdo lot.`,
        `Stafi operativ në kantier është i pajisur me dokumentacionin e plotë të licencave, diplomave dhe kontratave aktive. Makineria është me mirëmbajtje të rregullt dhe me dokumente të regjistrimit.`,
      ],
    },
    {
      title: 'Kontrolli i cilësisë dhe siguria',
      paragraphs: [
        `Kontrolli i cilësisë zbatohet në tre nivele: (a) vetëkontroll nga brigadieri i punimeve, (b) kontroll periodik nga inxhinieri rezident, (c) kontroll i pavarur nga laboratori i akredituar për materialet kryesore (beton, asfalt, hekur).`,
        `Siguria në punë mbahet sipas standardit OHSAS 18001 / ISO 45001. Çdo punonjës plotësohet me DPI (kaskë, vesha, maska, rripa sigurie) dhe kalon trajnim hyrës para se të hyjë në kantier.`,
      ],
    },
    {
      title: 'Garancia dhe dorëzimi',
      paragraphs: [
        `Pas përfundimit të punimeve, objekti i dorëzohet autoritetit në prani të mbikëqyrësit të kontratës. Defektet eventuale mbulohen nga garancia e punimeve prej [[${gar}]] nga data e marrjes në dorëzim.`,
        `Gjatë periudhës së garancisë, kompania angazhohet të ndërhyjë brenda 72 orëve nga njoftimi me shkrim për çdo defekt strukturor ose funksional të raportuar.`,
      ],
    },
    {
      title: 'Përmbyllje',
      paragraphs: [
        `Me këtë metodologji, Kompania Ime SH.P.K. garanton një realizim profesional, brenda afatit dhe brenda buxhetit të parashikuar, në përputhje të plotë me kushtet e kontratës dhe standardet teknike në fuqi.`,
      ],
    },
  ];
}

function PreventiviUpload({ form, setForm }) {
  const file = form.preventivi?.file || null;
  const rows = form.preventivi?.rows || [];
  const inputRef = React.useRef(null);
  const [loadErr, setLoadErr] = React.useState(null);
  const { data: manualData, error: manualErr } = useManualData();

  const setPrev = (patch) =>
    setForm((prev) => ({ ...prev, preventivi: { ...(prev.preventivi || {}), ...patch } }));

  // First upload — parse sample + auto-match once manual data is ready.
  const loadSample = React.useCallback((descriptor) => {
    setLoadErr(null);
    fetch('preventivi-sample.json')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then((sample) => {
        const flat = flattenPreventivi(sample);
        setPrev({ file: descriptor, rows: flat, autoFilledAt: null, sample });
      })
      .catch((e) => {
        // Mos dështo në heshtje — trego userit pse "nuk hapet gjë".
        setLoadErr('S\'u ngarkua preventivi (' + (e && e.message ? e.message : 'gabim rrjeti') +
          '). Sigurohu që faqja po shërbehet me HTTP dhe provo sërish.');
      });
  }, []); // eslint-disable-line

  // Once we have both rows + manualData, run auto-match if rows are un-priced.
  React.useEffect(() => {
    if (!manualData || !rows.length) return;
    const needsMatch = rows.some((r) => r.type === 'row' && r.match == null);
    if (!needsMatch) return;
    const matched = autoMatchAll(rows, manualData);
    setPrev({ rows: matched, autoFilledAt: Date.now() });
  }, [manualData, rows.length]); // eslint-disable-line

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    loadSample({ name: f.name, size: f.size });
    e.target.value = '';
  };

  const onReset = () => setPrev({ file: null, rows: [], autoFilledAt: null });

  // Editor mode — rows are loaded
  if (file && rows.length) {
    return (
      <>
        <div className="k-prev-strip">
          <div className="k-prev-strip-file">
            <span className="material-icons">description</span>
            <div>
              <div className="k-prev-strip-name">{file.name}</div>
              <div className="k-prev-strip-meta">
                {file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB · ` : ''}
                {rows.filter((r) => r.type === 'row').length} zëra u njohën automatikisht
              </div>
            </div>
          </div>
          <div className="k-prev-strip-actions">
            <button type="button" className="k-prev-file-btn"
                    onClick={() => inputRef.current && inputRef.current.click()}>
              <span className="material-icons">autorenew</span>
              Zëvendëso
            </button>
            <button type="button" className="k-prev-file-btn is-danger" onClick={onReset}>
              <span className="material-icons">delete</span>
              Hiq
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.pdf"
                 style={{ display: 'none' }} onChange={onPick} />
        </div>

        <PreventiviEditor
          rows={rows}
          manualData={manualData}
          manualErr={manualErr}
          form={form}
          onChange={(nextRows) => setPrev({ rows: nextRows })}
        />
      </>
    );
  }

  // Empty state — dropzone
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
            Ngarko preventivin bosh të autoritetit kontraktor (pa çmime njësie). Sistemi e lexon,
            njeh kodet dhe mbush automatikisht çmimet nga manuali zyrtar.
          </p>
        </div>
      </header>

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

      {loadErr && (
        <div className="k-prev-error">
          <span className="material-icons">error_outline</span>
          <span>{loadErr}</span>
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
        <li><span className="material-icons">bolt</span> Sistemi mbush automatikisht çmimet për kodet që njeh nga manuali.</li>
        <li><span className="material-icons">edit_note</span> Ju mund ta mbishkruani çdo çmim sipas ofertës suaj.</li>
      </ul>
    </div>
  );
}

// ---------- Preventivi editor ----------
function PreventiviEditor({ rows, manualData, manualErr, form, onChange }) {
  const [activeId, setActiveId] = React.useState(null);
  const [filter, setFilter]     = React.useState('all'); // all | auto | manual | none | partner:<id>

  // --- Bashkim operatorësh: caktimi i zërave te kompanitë ---
  const isConsortium = form && form.lloji === 'Bashkim operatorësh ekonomikë';
  const partners = React.useMemo(
    () => (isConsortium ? (form.consortium?.partners || []).filter((p) => p && p.id) : []),
    [isConsortium, form]
  );
  const partnerById = React.useMemo(() => {
    const m = {};
    partners.forEach((p, i) => { m[p.id] = { ...p, idx: i }; });
    return m;
  }, [partners]);

  const dataRows = React.useMemo(() => rows.filter((r) => r.type === 'row'), [rows]);
  const sectionRows = React.useMemo(() => rows.filter((r) => r.type === 'section'), [rows]);

  // Caktim automatik (një herë) kur ka bashkim, ≥2 partnerë, dhe zërat s'kanë ende caktim.
  React.useEffect(() => {
    if (!isConsortium || partners.length < 2 || !dataRows.length) return;
    if (typeof window.assignPreventivToPartners !== 'function') return;
    const needsAssign = dataRows.some((r) => !r.assignment);
    if (!needsAssign) return;
    onChange(window.assignPreventivToPartners(rows, partners));
  }, [isConsortium, partners, dataRows.length]); // eslint-disable-line

  const setRowAssignment = (id, assignment) => {
    onChange(rows.map((r) => r.id === id ? { ...r, assignment } : r));
  };

  const showCompanyCol = isConsortium && partners.length >= 2;

  // Stats
  const stats = React.useMemo(() => {
    const s = { auto: 0, manual: 0, none: 0, total: dataRows.length };
    for (const r of dataRows) {
      if (r.match === 'auto' || r.match === 'chosen') s.auto += 1;
      else if (r.match === 'manual') s.manual += 1;
      else s.none += 1;
    }
    return s;
  }, [dataRows]);

  // Zërat pa çmim (për validimin / banner-in e bllokimit).
  const unpriced = React.useMemo(
    () => (typeof window.unpricedRows === 'function' ? window.unpricedRows(rows) : []),
    [rows]
  );

  // Balanca aktuale për partner (për banner-in e ndarjes).
  const balance = React.useMemo(
    () => (isConsortium && partners.length >= 2 && typeof window.partnerBalance === 'function'
      ? window.partnerBalance(rows, partners) : []),
    [isConsortium, partners, rows]
  );
  const aiCount = React.useMemo(
    () => dataRows.filter((r) => r.assignment && r.assignment.by === 'ai').length,
    [dataRows]
  );

  // Per-section subtotals
  const sectionSums = React.useMemo(() => {
    const sums = {};
    for (const r of dataRows) {
      if (!r.vlefta) continue;
      sums[r.sectionId] = (sums[r.sectionId] || 0) + Number(r.vlefta);
    }
    return sums;
  }, [dataRows]);

  const grand = React.useMemo(() => {
    let g = 0;
    for (const r of dataRows) if (r.vlefta) g += Number(r.vlefta);
    return g;
  }, [dataRows]);

  const tvsh   = +(grand * 0.20).toFixed(2);
  const totali = +(grand + tvsh).toFixed(2);

  // Totalet për secilën kompani të bashkimit — secila dorëzon ofertën e vet.
  // Vlera e një zëri shpërndahet sipas allocations (single=100% një kompanie,
  // split=% e secilës). TVSH 20% mbi nën-shumën e secilës.
  const partnerTotals = React.useMemo(() => {
    if (!showCompanyCol) return [];
    const sums = {};
    partners.forEach((p) => { sums[p.id] = 0; });
    for (const r of dataRows) {
      const v = Number(r.vlefta);
      if (!isFinite(v) || v <= 0) continue;
      const alloc = (r.assignment && r.assignment.allocations) || [];
      if (!alloc.length) continue;
      alloc.forEach((a) => {
        if (sums[a.partnerId] != null) sums[a.partnerId] += v * (Number(a.percent) || 0) / 100;
      });
    }
    return partners.map((p, i) => {
      const base = +(sums[p.id] || 0).toFixed(2);
      const vat  = +(base * 0.20).toFixed(2);
      return { partnerId: p.id, name: partnerShortName(p), color: partnerColor(i),
               grand: base, tvsh: vat, totali: +(base + vat).toFixed(2) };
    });
  }, [showCompanyCol, partners, dataRows]);

  const updateRow = (id, patch) => {
    onChange(rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  };

  const handlePriceChange = (row, nextCmimi) => {
    const cmimi = nextCmimi === '' || nextCmimi == null ? null : Number(nextCmimi);
    const vlefta = cmimi == null ? null : +(cmimi * row.sasia).toFixed(2);
    updateRow(row.id, { cmimi, vlefta, match: cmimi == null ? 'none' : 'manual' });
  };

  const handleSyncRow = (row) => {
    if (!row.source) return;
    updateRow(row.id, {
      cmimi: row.source.totali,
      vlefta: +(row.source.totali * row.sasia).toFixed(2),
      match: 'auto',
    });
  };

  const handleChooseCandidate = (row, candidate) => {
    updateRow(row.id, {
      cmimi: candidate.totali,
      vlefta: +(candidate.totali * row.sasia).toFixed(2),
      match: 'chosen',
      source: candidate,
    });
  };

  const fillAll = () => {
    if (!manualData) return;
    onChange(autoMatchAll(rows, manualData));
  };

  const activeRow = React.useMemo(() =>
    activeId ? dataRows.find((r) => r.id === activeId) : null,
  [activeId, dataRows]);

  const rowPartnerIds = (r) =>
    ((r.assignment && r.assignment.allocations) || []).map((a) => a.partnerId);

  const passesFilter = (r) => {
    if (filter === 'all') return true;
    if (filter === 'auto') return r.match === 'auto' || r.match === 'chosen';
    if (filter === 'manual') return r.match === 'manual';
    if (filter === 'none') return r.match === 'none' || r.match == null;
    if (filter === 'unpriced') return !(Number(r.cmimi) > 0) && !(r.match === 'manual' && Number(r.cmimi) === 0);
    if (filter.indexOf('partner:') === 0) return rowPartnerIds(r).indexOf(filter.slice(8)) !== -1;
    return true;
  };

  const visibleRows = React.useMemo(() => {
    // Build visible stream: each section is kept only if at least one of its
    // rows passes the current filter.
    const bySection = new Map();
    for (const r of dataRows) {
      if (!passesFilter(r)) continue;
      if (!bySection.has(r.sectionId)) bySection.set(r.sectionId, []);
      bySection.get(r.sectionId).push(r);
    }
    const out = [];
    for (const s of sectionRows) {
      const kids = bySection.get(s.id);
      if (!kids || !kids.length) continue;
      out.push(s);
      for (const k of kids) out.push(k);
    }
    return out;
  }, [dataRows, sectionRows, filter]); // eslint-disable-line

  return (
    <div className={'k-pe' + (activeRow ? ' has-inspector' : '')}>
      <header className="k-pe-head">
        {showCompanyCol ? (
          <div className="k-pe-totals-by">
            {partnerTotals.map((pt) => (
              <div key={pt.partnerId} className="k-pe-ptotal" style={{ '--pc': pt.color }}>
                <div className="k-pe-ptotal-head">
                  <i className="k-pe-dot" /> {pt.name}
                </div>
                <div className="k-pe-ptotal-rows">
                  <span>Shuma</span><b>{formatCurrency(pt.grand)}</b>
                  <span>TVSH 20%</span><b>{formatCurrency(pt.tvsh)}</b>
                  <span className="is-total">Totali</span><b className="is-total">{formatCurrency(pt.totali)} ALL</b>
                </div>
              </div>
            ))}
            <div className="k-pe-ptotal is-combined">
              <div className="k-pe-ptotal-head"><span className="material-icons">functions</span> Totali i përbashkët</div>
              <div className="k-pe-ptotal-rows">
                <span>Shuma</span><b>{formatCurrency(grand)}</b>
                <span>TVSH 20%</span><b>{formatCurrency(tvsh)}</b>
                <span className="is-total">Totali</span><b className="is-total">{formatCurrency(totali)} ALL</b>
              </div>
            </div>
          </div>
        ) : (
        <div className="k-pe-totals">
          <div><span>Shuma analiza</span><strong>{formatCurrency(grand)} ALL</strong></div>
          <div><span>TVSH (20%)</span><strong>{formatCurrency(tvsh)} ALL</strong></div>
          <div className="is-total"><span>Totali</span><strong>{formatCurrency(totali)} ALL</strong></div>
        </div>
        )}
        <div className="k-pe-actions">
          <button type="button" className="k-pe-filter-group" role="tablist">
            {[
              { id: 'all',      label: 'Të gjitha', n: stats.total },
              { id: 'unpriced', label: 'Pa çmim',   n: unpriced.length },
              { id: 'manual',   label: 'Manual',    n: stats.manual },
              { id: 'auto',     label: 'Auto',      n: stats.auto },
            ].map((f) => (
              <span
                key={f.id}
                className={'k-pe-filter' + (filter === f.id ? ' is-on' : '') + (f.id === 'unpriced' && f.n > 0 ? ' is-alert' : '')}
                onClick={() => setFilter(f.id)}>
                {f.label} <b>{f.n}</b>
              </span>
            ))}
            {isConsortium && partners.length >= 2 && partners.map((p, i) => (
              <span
                key={p.id}
                className={'k-pe-filter k-pe-filter-partner' + (filter === 'partner:' + p.id ? ' is-on' : '')}
                style={{ '--pc': partnerColor(i) }}
                onClick={() => setFilter(filter === 'partner:' + p.id ? 'all' : 'partner:' + p.id)}>
                <i className="k-pe-dot" /> {partnerShortName(p)}
              </span>
            ))}
          </button>
        </div>
      </header>

      {unpriced.length > 0 && (
        <div className="k-pe-banner is-alert">
          <span className="material-icons">price_change</span>
          <div className="k-pe-banner-txt">
            <strong>{unpriced.length} {unpriced.length === 1 ? 'zë pa çmim' : 'zëra pa çmim'}</strong>
            <span> — shërbime që s'gjenden te manuali. Plotëso çmimin për të vazhduar në hapin tjetër.</span>
          </div>
          <button type="button" className="k-pe-banner-btn"
                  onClick={() => { setFilter('unpriced'); setActiveId(unpriced[0].id); }}>
            Shko te zëri i parë
          </button>
        </div>
      )}

      {isConsortium && partners.length >= 2 && aiCount > 0 && (
        <div className="k-pe-banner is-ai">
          <span className="material-icons">groups</span>
          <div className="k-pe-banner-txt">
            <span className="k-pe-balance">
              {balance.map((b, i) => (
                <span key={b.partnerId} className="k-pe-balance-item" style={{ '--pc': partnerColor(i) }}>
                  <i className="k-pe-dot" /> {partnerShortName(partnerById[b.partnerId] || {})}: <b>{b.sharePct}%</b>
                  <em> (deklaruar {Math.round(b.percent)}%)</em>
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      {manualErr && (
        <div className="k-man-empty">
          <span className="material-icons">error_outline</span>
          <div>
            <strong>S'u ngarkua manuali për auto-match.</strong>
            <p>{manualErr}</p>
          </div>
        </div>
      )}

      <div className="k-pe-main">
        <div className="k-pe-table-wrap">
          <table className="k-man-table k-pe-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th style={{ width: 80 }}>Kodi</th>
                <th>Emërtimi</th>
                <th style={{ width: 50 }}>Njësia</th>
                <th className="is-num" style={{ width: 90 }}>Sasia</th>
                <th className="is-num" style={{ width: 120 }}>Çmimi</th>
                <th className="is-num is-total" style={{ width: 140 }}>Vlefta</th>
                {showCompanyCol && <th style={{ width: 150 }}>Kompania</th>}
                <th style={{ width: 110 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => {
                if (r.type === 'section') {
                  const sum = sectionSums[r.id] || 0;
                  return (
                    <tr key={r.id} className="k-pe-section-row">
                      <td colSpan={6}>
                        <span className="k-pe-section-nr">{r.nr}.</span>
                        {r.title}
                      </td>
                      <td className="is-num is-total">{formatCurrency(sum)}</td>
                      {showCompanyCol && <td />}
                      <td />
                    </tr>
                  );
                }
                const isActive = activeId === r.id;
                const isUnpriced = !(Number(r.cmimi) > 0) && !(r.match === 'manual' && Number(r.cmimi) === 0);
                const pill = isUnpriced
                  ? { cls: 'is-danger', icon: 'price_change', label: 'Pa çmim' }
                  : r.match === 'auto'   ? { cls: 'is-ok',     icon: 'check_circle', label: 'Auto' } :
                    r.match === 'chosen' ? { cls: 'is-ok',     icon: 'check_circle', label: 'Zgjedhur' } :
                    r.match === 'manual' ? { cls: 'is-indigo', icon: 'edit',         label: 'Manual' } :
                                           { cls: 'is-warn',   icon: 'warning',      label: 'Pa match' };
                return (
                  <tr key={r.id}
                      className={'k-pe-data-row' + (isActive ? ' is-active' : '') + (isUnpriced ? ' is-unpriced' : '')}
                      onClick={() => setActiveId(isActive ? null : r.id)}>
                    <td className="k-pe-td-nr">{r.nr}</td>
                    <td className="k-man-td-code">{r.kodi}</td>
                    <td className="k-pe-td-name">{r.emertimi}</td>
                    <td className="k-man-td-unit">{r.njesia}</td>
                    <td className="is-num">{formatCurrency(r.sasia)}</td>
                    <td className="is-num" onClick={(e) => e.stopPropagation()}>
                      <input
                        className="k-pe-price-input"
                        type="number"
                        step="0.01"
                        value={r.cmimi == null ? '' : r.cmimi}
                        placeholder="—"
                        onChange={(e) => handlePriceChange(r, e.target.value)}
                      />
                    </td>
                    <td className="is-num is-total">{formatCurrency(r.vlefta)}</td>
                    {showCompanyCol && (
                      <td className="k-pe-td-company">
                        <CompanyBadges assignment={r.assignment} partnerById={partnerById} />
                      </td>
                    )}
                    <td>
                      <span className={'d-pill ' + pill.cls}>
                        <span className="material-icons">{pill.icon}</span>
                        {pill.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeRow && (
          <PreventiviInspector
            row={activeRow}
            isConsortium={showCompanyCol}
            partners={partners}
            partnerById={partnerById}
            onAssign={(a) => setRowAssignment(activeRow.id, a)}
            onClose={() => setActiveId(null)}
            onSync={() => handleSyncRow(activeRow)}
            onChoose={(c) => handleChooseCandidate(activeRow, c)}
            onPriceChange={(v) => handlePriceChange(activeRow, v)}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={'k-pe-stat' + (tone ? ' is-' + tone : '')}>
      <div className="k-pe-stat-val">{value}</div>
      <div className="k-pe-stat-lbl">{label}</div>
    </div>
  );
}

// Badge(t) e kompanisë për një zë preventivi te tabela.
function CompanyBadges({ assignment, partnerById }) {
  if (!assignment || !assignment.allocations || !assignment.allocations.length) {
    return <span className="k-pe-company-empty">—</span>;
  }
  const split = assignment.allocations.length > 1;
  return (
    <span className={'k-pe-company' + (split ? ' is-split' : '')}>
      {assignment.allocations.map((a) => {
        const p = partnerById[a.partnerId];
        if (!p) return null;
        return (
          <span key={a.partnerId} className="k-pe-company-badge" style={{ '--pc': partnerColor(p.idx) }}>
            <i className="k-pe-dot" />
            {partnerShortName(p)}{split ? ' ' + Math.round(a.percent) + '%' : ''}
          </span>
        );
      })}
    </span>
  );
}

// Seksioni i caktimit te kompania brenda inspektorit (single / split + validim 100%).
function InspectorAssignment({ row, partners, partnerById, onAssign }) {
  const a = row.assignment || { mode: 'single', allocations: [{ partnerId: partners[0] && partners[0].id, percent: 100 }], by: 'ai', reason: null };
  const mode = a.mode || 'single';
  const allocs = a.allocations && a.allocations.length ? a.allocations : [{ partnerId: partners[0] && partners[0].id, percent: 100 }];

  const emit = (next) => onAssign({ ...next, by: 'user', reason: a.reason });

  const setSingle = (partnerId) =>
    emit({ mode: 'single', allocations: [{ partnerId, percent: 100 }] });

  const toSplit = () => {
    // Fillo split-in me 2 partnerët e parë (ose ndarje sipas % të deklaruar).
    const first = allocs[0] && allocs[0].partnerId;
    const second = partners.find((p) => p.id !== first);
    if (!second) return; // s'ka mjaft partnerë për split
    emit({ mode: 'split', allocations: [
      { partnerId: first || partners[0].id, percent: 50 },
      { partnerId: second.id, percent: 50 },
    ] });
  };

  const setSplitPercent = (idx, val) => {
    const next = allocs.map((al, i) => i === idx ? { ...al, percent: val === '' ? '' : Number(val) } : al);
    emit({ mode: 'split', allocations: next });
  };
  const setSplitPartner = (idx, partnerId) => {
    const next = allocs.map((al, i) => i === idx ? { ...al, partnerId } : al);
    emit({ mode: 'split', allocations: next });
  };
  const addSplitRow = () => {
    const used = allocs.map((al) => al.partnerId);
    const free = partners.find((p) => used.indexOf(p.id) === -1);
    if (!free) return;
    emit({ mode: 'split', allocations: [...allocs, { partnerId: free.id, percent: 0 }] });
  };
  const removeSplitRow = (idx) => {
    if (allocs.length <= 2) { setSingle(allocs[0].partnerId); return; }
    emit({ mode: 'split', allocations: allocs.filter((_, i) => i !== idx) });
  };

  const splitTotal = Math.round(allocs.reduce((s, al) => s + (Number(al.percent) || 0), 0) * 100) / 100;

  return (
    <div className="k-pe-insp-assign">
      <div className="k-pe-insp-assign-head">
        <span className="material-icons">groups</span>
        <strong>Caktimi te kompania</strong>
      </div>

      {a.reason && a.by === 'ai' && <p className="k-pe-insp-reason">{a.reason}</p>}

      <div className="k-pe-insp-modetabs">
        <button type="button" className={mode === 'single' ? 'is-on' : ''}
                onClick={() => setSingle(allocs[0] ? allocs[0].partnerId : partners[0].id)}>
          Një kompani
        </button>
        <button type="button" className={mode === 'split' ? 'is-on' : ''}
                onClick={toSplit} disabled={partners.length < 2}>
          I ndarë
        </button>
      </div>

      {mode === 'single' ? (
        <select className="k-pe-insp-select" value={allocs[0] ? allocs[0].partnerId : ''}
                onChange={(e) => setSingle(e.target.value)}>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{partnerShortName(p)}</option>
          ))}
        </select>
      ) : (
        <div className="k-pe-insp-split">
          {allocs.map((al, i) => {
            const p = partnerById[al.partnerId];
            return (
              <div key={i} className="k-pe-insp-split-row" style={{ '--pc': p ? partnerColor(p.idx) : '#999' }}>
                <i className="k-pe-dot" />
                <select value={al.partnerId} onChange={(e) => setSplitPartner(i, e.target.value)}>
                  {partners.map((pp) => (
                    <option key={pp.id} value={pp.id}>{partnerShortName(pp)}</option>
                  ))}
                </select>
                <div className="k-pe-insp-split-pct">
                  <input type="number" min="0" max="100" step="1"
                         value={al.percent === '' ? '' : al.percent}
                         onChange={(e) => setSplitPercent(i, e.target.value)} />
                  <span>%</span>
                </div>
                <button type="button" className="k-pe-insp-split-x" onClick={() => removeSplitRow(i)}
                        aria-label="Hiq">
                  <span className="material-icons">close</span>
                </button>
              </div>
            );
          })}
          <div className="k-pe-insp-split-foot">
            {allocs.length < partners.length && (
              <button type="button" className="k-pe-insp-split-add" onClick={addSplitRow}>
                <span className="material-icons">add</span> Shto kompani
              </button>
            )}
            <span className={'k-pe-insp-split-total ' + (splitTotal === 100 ? 'is-ok' : 'is-bad')}>
              Totali {splitTotal}% / 100%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PreventiviInspector({ row, isConsortium, partners, partnerById, onAssign, onClose, onSync, onChoose, onPriceChange }) {
  const hasSource = !!row.source;
  const isUnpriced = !(Number(row.cmimi) > 0) && !(row.match === 'manual' && Number(row.cmimi) === 0);
  return (
    <aside className={'k-pe-inspector' + (isUnpriced ? ' is-unpriced' : '')}>
      <header className="k-pe-insp-head">
        <div>
          <div className="k-pe-insp-eyebrow">Inspektor i zërit</div>
          <div className="k-pe-insp-kodi">{row.kodi}</div>
        </div>
        <button type="button" className="k-pe-insp-close" onClick={onClose}
                aria-label="Mbyll">
          <span className="material-icons">close</span>
        </button>
      </header>

      <p className="k-pe-insp-name">{row.emertimi}</p>

      {isUnpriced && (
        <div className="k-pe-insp-alert">
          <span className="material-icons">price_change</span>
          <span>Ky zë s'ka çmim nga manuali. Plotëso çmimin manualisht më poshtë për të vazhduar.</span>
        </div>
      )}

      <div className="k-pe-insp-current">
        <div>
          <span className="k-pe-insp-k">Sasia</span>
          <strong>{formatCurrency(row.sasia)} {row.njesia}</strong>
        </div>
        <div>
          <span className="k-pe-insp-k">Çmimi</span>
          <input
            className={'k-pe-insp-price' + (isUnpriced ? ' is-empty' : '')}
            type="number"
            step="0.01"
            value={row.cmimi == null ? '' : row.cmimi}
            placeholder="—"
            onChange={(e) => onPriceChange(e.target.value)}
          />
        </div>
        <div className="is-total">
          <span className="k-pe-insp-k">Vlefta</span>
          <strong>{formatCurrency(row.vlefta)} ALL</strong>
        </div>
      </div>

      {isConsortium && (
        <InspectorAssignment row={row} partners={partners} partnerById={partnerById} onAssign={onAssign} />
      )}

      {hasSource ? (
        <div className="k-pe-insp-source">
          <div className="k-pe-insp-src-head">
            <span className="material-icons">menu_book</span>
            <div>
              <div className="k-pe-insp-src-title">Referencë nga manuali</div>
              <div className="k-pe-insp-src-meta">
                {row.source.manuali} · {row.source.kategoria}
              </div>
            </div>
          </div>
          <ul className="k-pe-insp-breakdown">
            <li><span>Puntori</span>    <b>{formatCurrency(row.source.puntori)}</b></li>
            <li><span>Transporti</span> <b>{formatCurrency(row.source.transporti)}</b></li>
            <li><span>Makineri</span>   <b>{formatCurrency(row.source.makineri)}</b></li>
            <li><span>Materiale</span>  <b>{formatCurrency(row.source.materiale)}</b></li>
            <li><span>Shpenzime</span>  <b>{formatCurrency(row.source.shpenzime)}</b></li>
            <li><span>Fitimi</span>     <b>{formatCurrency(row.source.fitimi)}</b></li>
            <li className="is-total">
              <span>Totali manual</span>
              <b>{formatCurrency(row.source.totali)} ALL</b>
            </li>
          </ul>
          {row.match === 'manual' && (
            <button type="button" className="k-pe-insp-sync" onClick={onSync}>
              <span className="material-icons">sync</span>
              Sinkronizo me çmimin e manualit
            </button>
          )}
        </div>
      ) : (
        <div className="k-pe-insp-none">
          <div className="k-pe-insp-none-head">
            <span className="material-icons">search</span>
            <strong>Nuk u gjet direkt në manual</strong>
          </div>
          {row.candidates && row.candidates.length > 0 ? (
            <>
              <p>Kandidatë të propozuar:</p>
              <ul className="k-pe-insp-cands">
                {row.candidates.map((c, i) => (
                  <li key={c.kodi + '-' + i}>
                    <div className="k-pe-cand-main">
                      <span className="k-man-td-code">{c.kodi}</span>
                      <span className="k-pe-cand-name">{c.emertimi}</span>
                      <span className="k-pe-cand-meta">{c.njesia} · {formatCurrency(c.totali)} ALL</span>
                    </div>
                    <button type="button" className="k-pe-cand-use" onClick={() => onChoose(c)}>
                      Zgjidh
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Nuk ka kandidatë të ngjashëm. Shkruaj një çmim manualisht.</p>
          )}
        </div>
      )}
    </aside>
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
        {!(current.id === 'vete-deklarim'
           || current.id === 'manuali-cmimeve'
           || current.id === 'preventivi-bosh'
           || current.id === 'metodologjia'
           || DOC_PROFILE_MAP[current.id]) && (
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
        )}
        <div className={'k-doc-preview-body' + (current.id === 'vete-deklarim' ? ' is-vd' : '') + ((current.id === 'manuali-cmimeve' || current.id === 'preventivi-bosh') ? ' is-prev' : '') + (DOC_PROFILE_MAP[current.id] ? ' is-vd' : '')}>
          {current.id === 'vete-deklarim' ? (
            <VeteDeklarimForm form={form} setForm={setForm} />
          ) : current.id === 'manuali-cmimeve' ? (
            <ManualiCmimeveViewer year={current.year || 2026} />
          ) : current.id === 'preventivi-bosh' ? (
            <PreventiviUpload form={form} setForm={setForm} />
          ) : current.id === 'metodologjia' ? (
            <MetodologjiaGenerator form={form} setForm={setForm} selectedDocs={selected} />
          ) : DOC_PROFILE_MAP[current.id] ? (
            <DocSelector docId={current.id} doc={current} form={form} setForm={setForm} parentSelected={selected} setParentSelected={setSelected} />
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
      similarWorks: [],      // Punë të ngjashme — multi, uses `work` drawer kind
      listpagesa: [],      // Listëpagesa — 1 doc { name, size }
      xhiro: null,           // Xhiro vjetore — 1 doc { name, size }
      docExtra: null,        // Dokument tjetër — 1 doc { name, size }
      emailStatus: null,     // null | 'sent' — email kërkese u dërgua
      emailVerified: false,  // Email kontakti u konfirmua nga kompania mbështetëse
      emailVerifySent: false,// Kodi i verifikimit u dërgua në email
      mode: 'direct',        // 'direct' — ky user i fut te dhenat | 'link' — partneri i fut vete
      linkSent: false,       // Linku i ftesës u dërgua te partneri
      shareLink: '',         // mock URL
    },
    consortium: {
      mode: 'manual',       // 'manual' — fill each partner's data yourself | 'link' — partners fill it via link
      linkSentAll: false,   // bulk link dispatch state
      partners: [
        // First partner is always the logged-in company — locked name/NIPT, editable %.
        {
          id: 'self',
          name: 'Albkons SH.P.K.',
          nipt: 'L01234567A',
          percent: '',
          email: '',
          isSelf: true,
          linkSent: false,
          shareLink: '',
          capacities: {
            staff: [], machinery: [], certificates: [], licenses: [],
            similarWorks: [], listpagesa: [], xhiro: null, docExtra: null,
          },
        },
      ],
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
    metodologjia: {
      mobilizimi:    { kohe: '', njesia: 'dite' },
      afatiPunimeve: { kohe: '', njesia: 'dite', sameAsStep1: true },
      garancia:      { periudha: '', njesiaPer: 'muaj', termat: '' },
      docsExtra:     [], // [{ id, name, size }]
      generated:     null,
    },
    // Per-doc selection of existing PROFILE_TREE items to include in this dossier.
    // Shape: { [docId]: [itemId1, itemId2, ...] }
    docSelections: {},
  });
  const [selectedDocs, setSelectedDocs] = React.useState([
    'vete-deklarim', 'konflikt', 'kriteret', 'pavarur', 'xhiro',
  ]);
  const [previewDoc, setPreviewDoc] = React.useState('vete-deklarim');
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setSupport = (k) => (v) => setForm((f) => ({ ...f, support: { ...f.support, [k]: v } }));
  const setConsortium = (k) => (v) => setForm((f) => ({ ...f, consortium: { ...f.consortium, [k]: v } }));

  const LAST_STEP = 7;

  // Mini-validim: te hapi Preventivi (index 4) bllokon kalimin nëse ka zëra pa çmim.
  // Vlen për çdo lloj dosjeje. Aktiv vetëm pasi është ngarkuar një preventiv (ka zëra).
  const PREVENTIVI_STEP = 4;
  const preventiviRows = (form.preventivi && form.preventivi.rows) || [];
  const unpricedCount = preventiviRows.length && typeof window.unpricedRows === 'function'
    ? window.unpricedRows(preventiviRows).length : 0;
  const preventiviBlocked = step === PREVENTIVI_STEP && unpricedCount > 0;

  const goNext = () => {
    if (preventiviBlocked) return; // zëra pa çmim — mos përparo
    if (step < LAST_STEP) setStep(step + 1);
    // Te hapi i fundit, dorëzo formën + dokumentet e zgjedhura te parent-i.
    // Parent-i përdor `window.dossierFromForm` për t'i kthyer në një dosje të re.
    else onNext && onNext({ form, selectedDocs });
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
    { h1: 'Deklarimet për metodologjinë', sub: 'Mobilizimi, afati, garancia dhe dokumente shtesë që ushqejnë gjenerimin e metodologjisë.' },
    { h1: 'Metodologjia',              sub: 'Përshkrimi i metodologjisë së realizimit — mënyra, afatet dhe organizimi.' },
    { h1: 'Rishiko & Krijo',           sub: 'Kontrollo të dhënat e dosjes para se të konfirmosh krijimin.' },
  ];
  const t = titles[step];

  // Map step index → which document category this step scopes to.
  const STEP_CATEGORY = { 1: 'ligjor', 2: 'financiar', 3: 'teknik', 4: 'preventivi', 6: 'metodologjia' };

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
        {step === 5 && <DeklarimetStep form={form} setForm={setForm} />}
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
            {preventiviBlocked && (
              <span className="k-footer-block">
                <span className="material-icons">price_change</span>
                {unpricedCount} {unpricedCount === 1 ? 'zë pa çmim' : 'zëra pa çmim'} — plotëso për të vazhduar
              </span>
            )}
            <MuiButton
              icon={step === LAST_STEP ? 'check' : 'arrow_forward'}
              onClick={goNext}
              disabled={preventiviBlocked}
              title={preventiviBlocked ? 'Plotëso çmimet e mangëta në preventiv' : undefined}>
              {step === LAST_STEP ? 'Krijo dosjen' : 'Hapi tjetër'}
            </MuiButton>
          </div>
        </div>
      </div>
    </>
  );
}
// dossierFromForm(form, selectedDocs) → objekt dosjeje gati për listën "Dosjet e mia".
// Normalizon partnerët nga consortium / support, ndërton documents[] me partnerId aty ku
// ka kuptim, dhe gjeneron një id të ri + datë krijimi.
function dossierFromForm(form, selectedDocs) {
  const f = form || {};
  const lloji = f.lloji || 'Pjesëmarrje e vetme';
  const PT = window.PARTICIPATION_TYPES || {};

  // --- Normalizimi i kompanive sipas llojit ---
  let companies = [];
  if (lloji === PT.JOINT) {
    companies = (f.consortium?.partners || []).map((p) => ({
      id: p.id, name: p.name || 'Kompania', nipt: p.nipt || '',
      percent: Number(p.percent) || 0, isSelf: !!p.isSelf,
      role: p.isSelf ? 'Anëtar' : 'Anëtar',
    }));
  } else if (lloji === PT.SUPPORT) {
    companies = [
      { id: 'self', name: 'Albkons SH.P.K.', nipt: 'L01234567A', percent: 100, isSelf: true, role: 'Pjesëmarrës' },
      { id: 'support', name: f.support?.emri || 'Mbështetësi', nipt: f.support?.nipt || '', percent: 0, isSelf: false, role: 'Mbështetës' },
    ];
  } else {
    companies = [{ id: 'self', name: 'Albkons SH.P.K.', nipt: 'L01234567A', percent: 100, isSelf: true }];
  }

  // --- Dokumentet: nga DOKUMENTACIONI_LIST, sipas selectedDocs + kategorive ---
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const uploadedMeta = `PDF · 240 KB · Ngarkuar ${dd}/${mm}/${today.getFullYear()}`;
  const picked = new Set(selectedDocs || []);
  const documents = [];

  (DOKUMENTACIONI_LIST || []).forEach((doc) => {
    if (!picked.has(doc.id)) return;
    if (doc.category === 'preventivi' || doc.category === 'metodologjia') return; // trajtohen veç
    if (companies.length >= 2) {
      // Per-kompani: çdo dokument ligjor/financiar gjenerohet për secilën kompani.
      companies.forEach((c) => documents.push({
        category: doc.category, name: `${doc.name} — ${c.name}`,
        meta: uploadedMeta, partnerId: c.id, docId: doc.id,
      }));
    } else {
      documents.push({ category: doc.category, name: doc.name, meta: uploadedMeta, partnerId: null, docId: doc.id });
    }
  });

  // Preventivi + metodologjia janë gjithmonë të përbashkëta në nivel dosjeje.
  if (f.preventivi?.file) {
    documents.push({ category: 'teknik', name: 'Preventivi i unifikuar', meta: uploadedMeta, partnerId: null, docId: 'preventivi-bosh' });
  }
  if (f.metodologjia?.generated) {
    documents.push({ category: 'teknik', name: 'Metodologjia e realizimit', meta: uploadedMeta, partnerId: null, docId: 'metodologjia' });
  }
  if (lloji === PT.JOINT) {
    documents.push({ category: 'teknik', name: 'Marrëveshje bashkimi operatorësh', meta: uploadedMeta, partnerId: null });
  } else if (lloji === PT.SUPPORT) {
    documents.push({ category: 'teknik', name: 'Kontratë për mbështetje kapacitetesh', meta: uploadedMeta, partnerId: null });
  }

  const ref = f.referenca || `REF-${today.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  return {
    id: 'new-' + Date.now(),
    title: f.objekti || 'Dosje e re',
    authority: f.autoriteti || '—',
    reference: ref,
    statusKey: 'draft',
    statusLabel: 'Draft',
    fondi: f.fondi ? f.fondi + ' ALL' : '—',
    closingDate: f.dataMbylljes || '—',
    daysLeft: 30,
    docsDone: documents.length,
    docsTotal: documents.length,
    createdAt: `${dd}/${mm}/${today.getFullYear()}`,
    lloji,
    companies,
    documents,
  };
}

window.KrijoDosjeNew = KrijoDosjeNew;
window.buildNextPeriod = buildNextPeriod;
window.dossierFromForm = dossierFromForm;
// Eksporto VeteDeklarimForm që EditDocumentDrawer t'a ripofrdor brenda drawer-it.
window.VeteDeklarimForm = VeteDeklarimForm;
