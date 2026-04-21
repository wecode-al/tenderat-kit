// AddIsoDrawer — right-side drawer for adding entries to Company Profile.
// Branches by kind:
//   iso     — name + issued/expires + optional file
//   staff   — name, position, contract date, qualifications (pills), doc set
//   machine — name/plate + issued/expires + optional file
//   work    — contract name + issued/expires + optional file

const STAFF_QUALIFICATIONS = [
  'Roje', 'Punëtor', 'Administrator', 'Inxhinier ndërtimi', 'Inxhinier elektrik',
  'Inxhinier mekanik', 'Inxhinier hidroteknik', 'Inxhinier gjeodet',
  'Arkitekt', 'Topograf', 'Teknik ndërtimi', 'Teknik elektrik',
  'Drejtues teknik', 'Drejtues projekti', 'Asistent administrativ',
  'Elektricist', 'Hidraulik', 'Saldator', 'Murator', 'Karpentier',
  'Shofer kamioni', 'Shofer furgoni', 'Operator eskavatori', 'Operator buldozeri',
  'Kontabilist', 'Ekonomist', 'Jurist', 'Specialist BSH', 'Koordinator sigurie',
  'Magaziner', 'Kuzhinier', 'Pastrues', 'Rrobaqepëse', 'Pedagog',
];

const STAFF_DOCS = [
  { key: 'licensa',  label: 'Licenca e profesionit' },
  { key: 'diploma',  label: 'Diploma' },
  { key: 'kontrata', label: 'Kontrata e punës' },
  { key: 'libreza',  label: 'Libreza e punës' },
];

const MACHINE_TYPES = [
  'Furgon', 'Kamion', 'Eskavator', 'Buldozer', 'Ngarkues', 'Rul', 'Automjet', 'Rimorkio',
];
const MACHINE_DOCS = [
  { key: 'sigurimi',      label: 'Sigurimi' },
  { key: 'kontrolli',     label: 'Kontrolli teknik' },
  { key: 'taksat',        label: 'Taksat' },
  { key: 'leja',          label: 'Leja e qarkullimit' },
  { key: 'tatimore',      label: 'Deklarata tatimore' },
];
const MACHINE_RENT_DOC = { key: 'noteriale', label: 'Kontrata noteriale', hint: 'Kërkohet për mjete me qera' };

function QualificationPicker({ value, onChange }) {
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const suggestions = STAFF_QUALIFICATIONS
    .filter((s) => !value.has(s))
    .filter((s) => !q || s.toLowerCase().includes(q))
    .slice(0, 8);

  const canCreate = q.length > 0
    && !STAFF_QUALIFICATIONS.some((s) => s.toLowerCase() === q)
    && !Array.from(value).some((v) => v.toLowerCase() === q);

  function addQualif(v) {
    const next = new Set(value);
    next.add(v);
    onChange(next);
    setQuery('');
  }
  function removeQualif(v) {
    const next = new Set(value);
    next.delete(v);
    onChange(next);
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) addQualif(suggestions[0]);
      else if (canCreate) addQualif(query.trim());
    } else if (e.key === 'Backspace' && query === '' && value.size > 0) {
      const last = Array.from(value).pop();
      removeQualif(last);
    }
  }

  const showDropdown = focused && (suggestions.length > 0 || canCreate);

  return (
    <div className="add-qualif" ref={wrapRef}>
      <div
        className={'add-qualif-input' + (focused ? ' is-focus' : '')}
        onClick={() => {
          const input = wrapRef.current && wrapRef.current.querySelector('input');
          input && input.focus();
        }}>
        {Array.from(value).map((v) => (
          <span key={v} className="add-qualif-pill">
            {v}
            <button
              type="button"
              className="add-qualif-pill-x"
              onClick={(e) => { e.stopPropagation(); removeQualif(v); }}
              aria-label={'Hiq ' + v}>
              <span className="material-icons">close</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKey}
          placeholder={value.size === 0 ? 'Shkruaj për të kërkuar kualifikimin...' : ''}
        />
      </div>

      {showDropdown && (
        <div className="add-qualif-menu" role="listbox">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="add-qualif-opt"
              onClick={() => addQualif(s)}>
              <span className="material-icons">add</span>
              <span className="add-qualif-opt-label">{s}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              className="add-qualif-opt is-create"
              onClick={() => addQualif(query.trim())}>
              <span className="material-icons">add_circle_outline</span>
              <span className="add-qualif-opt-label">Krijo "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StaffForm({ onCancel, onChange, initial }) {
  const init = initial || {};
  const [name, setName] = React.useState(init.name || '');
  const [role, setRole] = React.useState(init.role || '');
  const [contractStart, setContractStart] = React.useState(init.contractStart || '');
  const [contractEnd, setContractEnd] = React.useState(init.contractEnd || '');
  const [qualifs, setQualifs] = React.useState(new Set(Array.isArray(init.qualifications) ? init.qualifications : []));
  const [files, setFiles] = React.useState(init.docs || {});

  React.useEffect(() => {
    if (!onChange) return;
    onChange({
      name: name.trim(),
      role: role.trim(),
      contractStart,
      contractEnd,
      qualifications: Array.from(qualifs),
      docs: files,
    });
  }, [name, role, contractStart, contractEnd, qualifs, files]);

  function mockUpload(key) {
    const mockNames = {
      licensa:  'Licenca_profesionale.pdf',
      diploma:  'Diploma_bachelor.pdf',
      kontrata: 'Kontrata_pune.pdf',
      libreza:  'Libreza_pune.pdf',
    };
    setFiles((cur) => ({ ...cur, [key]: { name: mockNames[key] || 'Skedari.pdf' } }));
  }
  function removeFile(key) {
    setFiles((cur) => { const n = { ...cur }; delete n[key]; return n; });
  }

  return (
    <div className="add-iso-form">
      <label className="add-iso-field">
        <span className="add-iso-label">Emri dhe mbiemri</span>
        <input type="text" placeholder="p.sh. Meti Musaj" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="add-iso-row">
        <label className="add-iso-field">
          <span className="add-iso-label">Pozicioni</span>
          <input type="text" placeholder="p.sh. Web Designer" value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="add-iso-field">
          <span className="add-iso-label">Fillim kontrate</span>
          <input type="date" value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
        </label>
        <label className="add-iso-field">
          <span className="add-iso-label">Mbarim kontrate</span>
          <input type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
        </label>
      </div>

      <div className="add-iso-field">
        <span className="add-iso-label">Kualifikimet</span>
        <QualificationPicker value={qualifs} onChange={setQualifs} />
      </div>

      <div className="add-iso-field">
        <div className="add-staff-docs-head">
          <span className="add-iso-label">Dokumente të bashkangjitura</span>
          <span className="add-staff-docs-count">
            {Object.keys(files).length}/{STAFF_DOCS.length}
          </span>
        </div>
        <div className="add-staff-docs">
          {STAFF_DOCS.map((d) => {
            const f = files[d.key];
            return (
              <div key={d.key} className={'add-staff-doc' + (f ? ' is-filled' : '')}>
                <div className="add-staff-doc-icon">
                  <span className="material-icons">{f ? 'description' : 'upload_file'}</span>
                </div>
                <div className="add-staff-doc-main">
                  <div className="add-staff-doc-label">{d.label}</div>
                  {f
                    ? <div className="add-staff-doc-file">{f.name}</div>
                    : <div className="add-staff-doc-hint">PDF, deri 20 MB</div>}
                </div>
                {f
                  ? <button
                      type="button"
                      className="add-staff-doc-x"
                      onClick={() => removeFile(d.key)}
                      aria-label="Hiq">
                      <span className="material-icons">close</span>
                    </button>
                  : <button
                      type="button"
                      className="add-iso-upload-btn"
                      onClick={() => mockUpload(d.key)}>
                      Ngarko
                    </button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TypeCombo({ options, value, onChange, placeholder = 'Zgjidh llojin...' }) {
  const [open, setOpen] = React.useState(false);
  const [customMode, setCustomMode] = React.useState(false);
  const [custom, setCustom] = React.useState('');
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        if (customMode && !custom.trim()) setCustomMode(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [customMode, custom]);

  function pick(v) {
    onChange(v);
    setOpen(false);
    setCustomMode(false);
    setCustom('');
  }
  function startCustom() {
    setOpen(false);
    setCustomMode(true);
    setCustom('');
    setTimeout(() => {
      const el = wrapRef.current && wrapRef.current.querySelector('input');
      el && el.focus();
    }, 0);
  }
  function commitCustom() {
    const v = custom.trim();
    if (v) { onChange(v); }
    setCustomMode(false);
  }

  if (customMode) {
    return (
      <div className="add-type-combo" ref={wrapRef}>
        <div className="add-type-custom">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitCustom(); }
              if (e.key === 'Escape') { setCustomMode(false); setCustom(''); }
            }}
            placeholder="Shkruaj llojin..."
          />
          <button
            type="button"
            className="add-type-custom-back"
            onClick={() => { setCustomMode(false); setCustom(''); setOpen(true); }}
            aria-label="Kthehu">
            <span className="material-icons">arrow_back</span>
          </button>
        </div>
      </div>
    );
  }

  const isCustomValue = value && !options.includes(value);

  return (
    <div className="add-type-combo" ref={wrapRef}>
      <button
        type="button"
        className={'add-type-trigger' + (open ? ' is-open' : '') + (value ? '' : ' is-empty')}
        onClick={() => setOpen((x) => !x)}>
        <span className="add-type-trigger-label">
          {value || placeholder}
          {isCustomValue && <span className="add-type-custom-badge">Tjetër</span>}
        </span>
        <span className="material-icons">expand_more</span>
      </button>
      {open && (
        <div className="add-type-menu" role="listbox">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              className={'add-type-opt' + (o === value ? ' is-on' : '')}
              onClick={() => pick(o)}>
              <span className="add-type-opt-label">{o}</span>
              {o === value && <span className="material-icons">check</span>}
            </button>
          ))}
          <div className="add-type-menu-sep" />
          <button
            type="button"
            className="add-type-opt is-other"
            onClick={startCustom}>
            <span className="material-icons">edit</span>
            <span className="add-type-opt-label">Tjetër — shkruaj vetë</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MachineForm({ onChange, initial }) {
  const init = initial || {};
  const [name, setName] = React.useState(init.name || '');
  const [plate, setPlate] = React.useState(init.plate || '');
  const [vin, setVin] = React.useState(init.vin || '');
  const [status, setStatus] = React.useState(init.status || 'owned'); // 'owned' | 'rent'
  const [files, setFiles] = React.useState(init.docs || {});
  const [machineType, setMachineType] = React.useState(init.type || '');
  const docs = status === 'rent' ? [...MACHINE_DOCS, MACHINE_RENT_DOC] : MACHINE_DOCS;

  React.useEffect(() => {
    if (!onChange) return;
    onChange({
      name: name.trim(),
      plate: plate.trim(),
      vin: vin.trim(),
      type: machineType,
      status,
      docs: files,
    });
  }, [name, plate, vin, machineType, status, files]);

  function mockUpload(key) {
    const names = {
      sigurimi: 'Sigurimi_2026.pdf',
      kontrolli: 'Kontrolli_teknik.pdf',
      taksat: 'Taksat_2026.pdf',
      leja: 'Leja_qarkullimit.pdf',
      tatimore: 'Deklarata_tatimore.pdf',
      noteriale: 'Kontrata_noteriale.pdf',
    };
    setFiles((cur) => ({ ...cur, [key]: { name: names[key] || 'Skedari.pdf' } }));
  }
  function removeFile(key) {
    setFiles((cur) => { const n = { ...cur }; delete n[key]; return n; });
  }

  return (
    <div className="add-iso-form">
      <div className="add-iso-row">
        <label className="add-iso-field">
          <span className="add-iso-label">Emri</span>
          <input type="text" placeholder="p.sh. Sprinter" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="add-iso-field">
          <span className="add-iso-label">Lloji i mjetit</span>
          <TypeCombo options={MACHINE_TYPES} value={machineType} onChange={setMachineType} />
        </label>
      </div>

      <div className="add-iso-row">
        <label className="add-iso-field">
          <span className="add-iso-label">Targa</span>
          <input type="text" placeholder="p.sh. AA953AP" value={plate} onChange={(e) => setPlate(e.target.value)} />
        </label>
        <label className="add-iso-field">
          <span className="add-iso-label">Nr. shasie</span>
          <input type="text" placeholder="p.sh. WVWZZZ1KZ5P047891" value={vin} onChange={(e) => setVin(e.target.value)} />
        </label>
      </div>

      <div className="add-iso-field">
        <span className="add-iso-label">Statusi</span>
        <div className="add-machine-toggle" role="radiogroup">
          <button
            type="button"
            role="radio"
            aria-checked={status === 'owned'}
            className={'add-machine-toggle-opt' + (status === 'owned' ? ' is-on' : '')}
            onClick={() => setStatus('owned')}>
            <span className="material-icons">verified</span>
            Në pronësi
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={status === 'rent'}
            className={'add-machine-toggle-opt' + (status === 'rent' ? ' is-on' : '')}
            onClick={() => setStatus('rent')}>
            <span className="material-icons">receipt_long</span>
            Me qera
          </button>
        </div>
      </div>

      <div className="add-iso-field">
        <div className="add-staff-docs-head">
          <span className="add-iso-label">Dokumente të bashkangjitura</span>
          <span className="add-staff-docs-count">
            {Object.keys(files).filter((k) => docs.some((d) => d.key === k)).length}/{docs.length}
          </span>
        </div>
        <div className="add-staff-docs">
          {docs.map((d) => {
            const f = files[d.key];
            return (
              <div key={d.key} className={'add-staff-doc' + (f ? ' is-filled' : '')}>
                <div className="add-staff-doc-icon">
                  <span className="material-icons">{f ? 'description' : 'upload_file'}</span>
                </div>
                <div className="add-staff-doc-main">
                  <div className="add-staff-doc-label">{d.label}</div>
                  {f
                    ? <div className="add-staff-doc-file">{f.name}</div>
                    : <div className="add-staff-doc-hint">{d.hint || 'PDF, deri 20 MB'}</div>}
                </div>
                {f
                  ? <button type="button" className="add-staff-doc-x" onClick={() => removeFile(d.key)} aria-label="Hiq">
                      <span className="material-icons">close</span>
                    </button>
                  : <button type="button" className="add-iso-upload-btn" onClick={() => mockUpload(d.key)}>
                      Ngarko
                    </button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimpleForm({ nameLabel, namePh, kind, onChange, initial }) {
  const isCatalog = kind === 'catalog';
  const isLicense = kind === 'license';
  const init = initial || {};
  const [name, setName] = React.useState(init.name || '');
  const [issuer, setIssuer] = React.useState(init.issuer || '');
  const [issued, setIssued] = React.useState(init.issued || '');
  const [expires, setExpires] = React.useState(init.expires || '');
  const [file, setFile] = React.useState(init.file || null);
  // Source language of the uploaded catalog. If 'sq', no translation needed;
  // otherwise AI translates the file into Albanian.
  const [srcLang, setSrcLang] = React.useState(init.srcLang || 'sq');
  // "Popular" languages shown at the top of the dropdown, then the rest
  // sorted alphabetically. Users can search by name or native name.
  const LANGS = [
    { code: 'sq', label: 'Shqip',      native: 'Albanian',   flag: '🇦🇱', popular: true },
    { code: 'en', label: 'English',    native: 'English',    flag: '🇬🇧', popular: true },
    { code: 'it', label: 'Italiano',   native: 'Italian',    flag: '🇮🇹', popular: true },
    { code: 'de', label: 'Deutsch',    native: 'German',     flag: '🇩🇪', popular: true },
    { code: 'fr', label: 'Français',   native: 'French',     flag: '🇫🇷', popular: true },
    { code: 'es', label: 'Español',    native: 'Spanish',    flag: '🇪🇸', popular: true },
    { code: 'tr', label: 'Türkçe',     native: 'Turkish',    flag: '🇹🇷', popular: true },
    { code: 'zh', label: '中文',        native: 'Chinese',    flag: '🇨🇳', popular: true },
    { code: 'ar', label: 'العربية',    native: 'Arabic',     flag: '🇸🇦' },
    { code: 'bg', label: 'Български',  native: 'Bulgarian',  flag: '🇧🇬' },
    { code: 'cs', label: 'Čeština',    native: 'Czech',      flag: '🇨🇿' },
    { code: 'da', label: 'Dansk',      native: 'Danish',     flag: '🇩🇰' },
    { code: 'el', label: 'Ελληνικά',   native: 'Greek',      flag: '🇬🇷' },
    { code: 'fi', label: 'Suomi',      native: 'Finnish',    flag: '🇫🇮' },
    { code: 'hi', label: 'हिन्दी',       native: 'Hindi',      flag: '🇮🇳' },
    { code: 'hr', label: 'Hrvatski',   native: 'Croatian',   flag: '🇭🇷' },
    { code: 'hu', label: 'Magyar',     native: 'Hungarian',  flag: '🇭🇺' },
    { code: 'ja', label: '日本語',      native: 'Japanese',   flag: '🇯🇵' },
    { code: 'ko', label: '한국어',      native: 'Korean',     flag: '🇰🇷' },
    { code: 'mk', label: 'Македонски', native: 'Macedonian', flag: '🇲🇰' },
    { code: 'nl', label: 'Nederlands', native: 'Dutch',      flag: '🇳🇱' },
    { code: 'no', label: 'Norsk',      native: 'Norwegian',  flag: '🇳🇴' },
    { code: 'pl', label: 'Polski',     native: 'Polish',     flag: '🇵🇱' },
    { code: 'pt', label: 'Português',  native: 'Portuguese', flag: '🇵🇹' },
    { code: 'ro', label: 'Română',     native: 'Romanian',   flag: '🇷🇴' },
    { code: 'ru', label: 'Русский',    native: 'Russian',    flag: '🇷🇺' },
    { code: 'sr', label: 'Српски',     native: 'Serbian',    flag: '🇷🇸' },
    { code: 'sv', label: 'Svenska',    native: 'Swedish',    flag: '🇸🇪' },
    { code: 'sk', label: 'Slovenčina', native: 'Slovak',     flag: '🇸🇰' },
    { code: 'sl', label: 'Slovenščina',native: 'Slovenian',  flag: '🇸🇮' },
    { code: 'uk', label: 'Українська', native: 'Ukrainian',  flag: '🇺🇦' },
  ];
  const willTranslate = isCatalog && srcLang !== 'sq';
  const selected = LANGS.find((l) => l.code === srcLang);
  const srcLangLabel = selected?.label;

  // Combobox state
  const [langOpen, setLangOpen] = React.useState(false);
  const [langQuery, setLangQuery] = React.useState('');
  const comboRef = React.useRef(null);
  const searchRef = React.useRef(null);
  React.useEffect(() => {
    if (!langOpen) return;
    function onDoc(e) {
      if (comboRef.current && !comboRef.current.contains(e.target)) setLangOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setLangOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    // focus the search field when opening
    setTimeout(() => searchRef.current && searchRef.current.focus(), 0);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const q = langQuery.trim().toLowerCase();
  const matches = q
    ? LANGS.filter((l) =>
        l.label.toLowerCase().includes(q) ||
        (l.native && l.native.toLowerCase().includes(q)) ||
        l.code.includes(q)
      )
    : LANGS;
  const popular = q ? [] : matches.filter((l) => l.popular);
  const rest = q ? matches : matches.filter((l) => !l.popular).slice().sort((a,b) => a.label.localeCompare(b.label));

  function pickLang(code) {
    setSrcLang(code);
    setLangOpen(false);
    setLangQuery('');
  }

  React.useEffect(() => {
    if (!onChange) return;
    const base = { name: name.trim(), file };
    if (isCatalog) {
      onChange({ ...base, srcLang });
    } else if (isLicense) {
      onChange({ ...base, issuer: issuer.trim(), issued, expires });
    } else {
      onChange({ ...base, issued, expires });
    }
  }, [name, issuer, issued, expires, file, srcLang, isCatalog, isLicense]);

  return (
    <div className="add-iso-form">
      <label className="add-iso-field">
        <span className="add-iso-label">{nameLabel}</span>
        <input type="text" placeholder={namePh} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      {isLicense && (
        <label className="add-iso-field">
          <span className="add-iso-label">Organi lëshues</span>
          <input type="text" placeholder="p.sh. Ministria e Infrastrukturës" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
        </label>
      )}

      {isCatalog && (
        <div className="add-iso-field">
          <span className="add-iso-label">Gjuha e dokumentit që po ngarkoni</span>
          <div className={'add-iso-lang-combo' + (langOpen ? ' is-open' : '')} ref={comboRef}>
            <button
              type="button"
              className="add-iso-lang-trigger"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}>
              <span className="add-iso-lang-trigger-main">
                <span className="add-iso-lang-flag" aria-hidden>{selected?.flag}</span>
                <span className="add-iso-lang-trigger-name">{selected?.label}</span>
                {selected?.native && selected.native !== selected.label && (
                  <span className="add-iso-lang-trigger-native">· {selected.native}</span>
                )}
              </span>
              <span className="material-icons">expand_more</span>
            </button>
            {langOpen && (
              <div className="add-iso-lang-menu" role="listbox">
                <div className="add-iso-lang-search">
                  <span className="material-icons">search</span>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Kërko gjuhën…"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                  />
                </div>
                <div className="add-iso-lang-list">
                  {popular.length > 0 && (
                    <>
                      <div className="add-iso-lang-group">Kryesore</div>
                      {popular.map((l) => (
                        <LangOpt key={l.code} l={l} active={srcLang === l.code} onPick={pickLang} />
                      ))}
                      <div className="add-iso-lang-group">Të tjera</div>
                    </>
                  )}
                  {rest.length === 0 && popular.length === 0 ? (
                    <div className="add-iso-lang-empty">Asnjë rezultat për "{langQuery}"</div>
                  ) : (
                    rest.map((l) => (
                      <LangOpt key={l.code} l={l} active={srcLang === l.code} onPick={pickLang} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isCatalog && (
        <div className="add-iso-row">
          <label className="add-iso-field">
            <span className="add-iso-label">Data e lëshimit</span>
            <input type="date" value={issued} onChange={(e) => setIssued(e.target.value)} />
          </label>
          <label className="add-iso-field">
            <span className="add-iso-label">Data e skadencës</span>
            <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </label>
        </div>
      )}

      <div className={'add-iso-upload' + (file ? ' is-filled' : '')}>
        <div className="add-iso-upload-icon">
          <span className="material-icons">{file ? 'description' : 'upload_file'}</span>
        </div>
        <div>
          <div className="add-iso-upload-title">
            {file ? file.name : (isCatalog ? 'Ngarko PDF-in e katalogut' : 'Bashkangjit skedarin (opsional)')}
          </div>
          <div className="add-iso-upload-hint">PDF{isCatalog ? '' : ' ose JPG'}, deri 20 MB</div>
        </div>
        {file
          ? <button className="add-iso-upload-btn" type="button" onClick={() => setFile(null)}>Hiq</button>
          : <button className="add-iso-upload-btn" type="button" onClick={() => setFile({ name: isCatalog ? 'Katalogu.pdf' : (isLicense ? 'Licenca.pdf' : 'Certifikata.pdf') })}>Zgjidh</button>}
      </div>

      {isCatalog && willTranslate && (
        <div className="add-iso-ai-note">
          <span className="material-icons">auto_awesome</span>
          <div>
            <strong>Do të përkthehet në shqip me AI</strong>
            <span> — dokumenti është në <b>{srcLangLabel}</b>. Pas ngarkimit, sistemi gjeneron një version shqip me AI. Versioni origjinal ruhet gjithmonë.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LangOpt({ l, active, onPick }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={'add-iso-lang-opt' + (active ? ' is-on' : '')}
      onClick={() => onPick(l.code)}>
      <span className="add-iso-lang-flag" aria-hidden>{l.flag}</span>
      <span className="add-iso-lang-opt-main">
        <span className="add-iso-lang-opt-name">{l.label}</span>
        {l.native && l.native !== l.label && (
          <span className="add-iso-lang-opt-native">{l.native}</span>
        )}
      </span>
      {active && <span className="material-icons add-iso-lang-check">check</span>}
    </button>
  );
}

function AddIsoDrawer({ open, onClose, onSave, kind = 'iso', saveToProfileToggle, initial }) {
  const isEdit = !!initial;
  const baseConfig = {
    iso:     { title: 'certifikim ISO',    subtitle: 'Emri i certifikimit dhe datat e vlefshmërisë.',            nameLabel: 'Emri i ISO',          namePh: 'p.sh. ISO 14001' },
    staff:   { title: 'staf',               subtitle: 'Të dhënat, kualifikimet dhe dokumentet e punonjësit.',    nameLabel: 'Emri dhe mbiemri',    namePh: 'p.sh. Meti Musaj' },
    machine: { title: 'makinerie',          subtitle: 'Të dhënat e makinerisë/mjetit dhe datat përkatëse.',      nameLabel: 'Emri / targa',        namePh: 'p.sh. Fugon FR-4521' },
    work:    { title: 'punë të ngjashme',   subtitle: 'Të dhënat e kontratës së ngjashme të realizuar.',         nameLabel: 'Emri i kontratës',    namePh: 'p.sh. Rikonstruksion rruga Elbasan' },
    catalog: { title: 'katalog / autorizim', subtitle: 'Ngarko PDF-in. Përkthimet në gjuhë të tjera gjenerohen me AI.', nameLabel: 'Emri i dokumentit', namePh: 'p.sh. Katalog teknik — Pompa uji' },
    license: { title: 'licencë',             subtitle: 'Licenca profesionale dhe data e vlefshmërisë.',          nameLabel: 'Emri i licencës',     namePh: 'p.sh. Licencë ndërtimi — NP-4A' },
  }[kind] || { title: '', subtitle: '', nameLabel: 'Emri', namePh: '' };
  const config = {
    ...baseConfig,
    title: (isEdit ? 'Ndrysho ' : 'Shto ') + baseConfig.title,
  };

  // Hold the in-progress form data so Ruaj can emit it.
  const dataRef = React.useRef(null);
  const receive = React.useCallback((d) => { dataRef.current = d; }, []);

  // Reset the inner form each time the drawer opens so reused drawers start fresh.
  const [openSession, setOpenSession] = React.useState(0);
  React.useEffect(() => {
    if (open) {
      dataRef.current = null;
      setOpenSession((n) => n + 1);
    }
  }, [open]);

  function handleSave() {
    const payload = dataRef.current || {};
    if (onSave) {
      if (saveToProfileToggle) {
        onSave({ ...payload, saveToProfile: !!saveToProfileToggle.value });
      } else {
        onSave(payload);
      }
    }
    onClose && onClose();
  }

  return (
    <>
      <div className={'add-doc-scrim' + (open ? ' is-open' : '')} onClick={onClose} />
      <aside
        className={'add-doc-drawer add-iso-drawer' + (open ? ' is-open' : '')}
        role="dialog"
        aria-hidden={!open}>
        <header className="add-doc-head">
          <div>
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>
          <button className="add-doc-close" onClick={onClose} aria-label="Mbyll">
            <span className="material-icons">close</span>
          </button>
        </header>

        <div className="add-doc-body" key={`${kind}-${openSession}`}>
          {kind === 'staff'
            ? <StaffForm onCancel={onClose} onChange={receive} initial={initial} />
            : kind === 'machine'
              ? <MachineForm onChange={receive} initial={initial} />
              : <SimpleForm kind={kind} nameLabel={config.nameLabel} namePh={config.namePh} onChange={receive} initial={initial} />}
        </div>

        <footer className="add-doc-foot">
          <div className="add-doc-foot-counts">
            {saveToProfileToggle ? (
              <label className="add-doc-save-toggle">
                <input
                  type="checkbox"
                  checked={!!saveToProfileToggle.value}
                  onChange={(e) => saveToProfileToggle.onChange(e.target.checked)}
                />
                <span className="add-doc-save-switch" aria-hidden><span /></span>
                <span>{saveToProfileToggle.label || 'Ruaj tek profili i kompanisë'}</span>
              </label>
            ) : (
              <span className="add-doc-foot-empty">Plotëso fushat për të ruajtur</span>
            )}
          </div>
          <div className="add-doc-foot-actions">
            <button className="t-btn-outline" onClick={onClose}>Anulo</button>
            <button className="t-btn-mui" onClick={handleSave}>
              <span className="material-icons">check</span>
              Ruaj
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

window.AddIsoDrawer = AddIsoDrawer;
window.STAFF_QUALIFICATIONS = STAFF_QUALIFICATIONS;
