// AddDocumentDrawer — slide-in right panel for adding documents to a dossier.
// User picks category (Ligjor / Financiar / Teknik) for each file,
// can stage multiple files at once, each with its own category.

const DOC_CATEGORIES = [
  { key: 'legal',     label: 'Dokumentacioni ligjor',    icon: 'gavel',       hint: 'Licensa, vërtetime, deklarata' },
  { key: 'financial', label: 'Dokumentacioni financiar', icon: 'payments',    hint: 'Bilance, sigurime, xhiro' },
  { key: 'technical', label: 'Dokumentacioni teknik',    icon: 'engineering', hint: 'Kontrata, CV, specifikime' },
];

function fakeSize() {
  const v = Math.floor(240 + Math.random() * 2400);
  return v > 1024 ? (v / 1024).toFixed(1) + ' MB' : v + ' KB';
}

function AddDocumentDrawer({ open, onClose, hideCategory = false, title = 'Shto dokument', subtitle = "Ngarko një ose disa dokumente njëherësh. Zgjidh kategorinë për secilin." }) {
  const [items, setItems] = React.useState([]);
  const inputRef = React.useRef(null);

  // Reset staging whenever drawer closes.
  React.useEffect(() => {
    if (!open) {
      // Slight delay so the slide-out animation runs before we clear.
      const t = setTimeout(() => setItems([]), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  function pickFiles() {
    inputRef.current && inputRef.current.click();
  }

  // Hiq prapashtesën nga emri i skedarit — extension-i shfaqet veçmas si badge,
  // dhe useri ka më shumë gjasa të riemërtojë në një emër njerëzor (p.sh.
  // "Bilanc financiar 2025" në vend të "DOC_4847A_signed_v2_final.pdf").
  function nameWithoutExt(filename) {
    const dot = filename.lastIndexOf('.');
    return dot > 0 ? filename.slice(0, dot) : filename;
  }

  function onFiles(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setItems((cur) => [
      ...cur,
      ...list.map((f) => {
        const ext = (f.name.split('.').pop() || '').toUpperCase().slice(0, 4) || 'FILE';
        return {
          id: Math.random().toString(36).slice(2),
          name: nameWithoutExt(f.name),
          ext,
          size: (f.size / 1024 > 1024)
            ? (f.size / 1024 / 1024).toFixed(1) + ' MB'
            : Math.round(f.size / 1024) + ' KB',
          category: 'legal',
        };
      }),
    ]);
    // Reset input so the same file can be re-added after removing.
    e.target.value = '';
  }

  function addMockFile() {
    // Lets the demo show the flow without a real file picker.
    const names = [
      'Licencë profesionale 2026.pdf',
      'CV - Drejtues projekti.pdf',
      'Vërtetim xhiro vjetor.pdf',
      'Bilanc financiar 2025.xlsx',
      'Deklaratë tatimore.pdf',
    ];
    const fullName = names[Math.floor(Math.random() * names.length)];
    const ext = fullName.split('.').pop().toUpperCase();
    setItems((cur) => [
      ...cur,
      {
        id: Math.random().toString(36).slice(2),
        name: nameWithoutExt(fullName),
        ext, size: fakeSize(), category: 'legal',
      },
    ]);
  }

  function setCategory(id, cat) {
    setItems((cur) => cur.map((it) => it.id === id ? { ...it, category: cat } : it));
  }
  function setName(id, name) {
    setItems((cur) => cur.map((it) => it.id === id ? { ...it, name } : it));
  }
  function removeItem(id) {
    setItems((cur) => cur.filter((it) => it.id !== id));
  }

  // Group counts for the summary.
  const counts = DOC_CATEGORIES.map((c) => ({
    ...c,
    n: items.filter((it) => it.category === c.key).length,
  }));

  return (
    <>
      <div
        className={'add-doc-scrim' + (open ? ' is-open' : '')}
        onClick={onClose}
      />
      <aside className={'add-doc-drawer' + (open ? ' is-open' : '')} role="dialog" aria-hidden={!open}>
        <header className="add-doc-head">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="add-doc-close" onClick={onClose} aria-label="Mbyll">
            <span className="material-icons">close</span>
          </button>
        </header>

        <div className="add-doc-body">
          {/* Dropzone */}
          <div className="add-doc-drop" onClick={pickFiles}>
            <div className="add-doc-drop-icon"><span className="material-icons">cloud_upload</span></div>
            <div className="add-doc-drop-title">Tërhiq skedarët këtu ose <u>zgjidh nga kompjuteri</u></div>
            <div className="add-doc-drop-hint">PDF, DOCX, XLSX, JPG · deri 20 MB për skedar</div>
            <button
              type="button"
              className="add-doc-drop-demo"
              onClick={(e) => { e.stopPropagation(); addMockFile(); }}>
              + Shto shembull (demo)
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={onFiles}
            />
          </div>

          {/* Staged list */}
          {items.length > 0 && (
            <div className="add-doc-list">
              <div className="add-doc-list-head">
                <span>Skedarët për t'u shtuar · {items.length}</span>
              </div>
              {items.map((it) => (
                <div key={it.id} className="add-doc-item">
                  <div className="add-doc-item-ext">{it.ext}</div>
                  <div className="add-doc-item-main">
                    <input
                      type="text"
                      className="add-doc-item-name-input"
                      value={it.name}
                      placeholder="Emri i dokumentit"
                      onChange={(e) => setName(it.id, e.target.value)}
                      title="Riemërto dokumentin"
                    />
                    <div className="add-doc-item-meta">{it.ext} · {it.size}</div>
                    {!hideCategory && (
                      <div className="add-doc-item-cats">
                        {DOC_CATEGORIES.map((c) => (
                          <button
                            key={c.key}
                            className={'add-doc-cat' + (it.category === c.key ? ' is-on' : '')}
                            onClick={() => setCategory(it.id, c.key)}>
                            <span className="material-icons">{c.icon}</span>
                            {c.label.replace('Dokumentacioni ', '')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="add-doc-item-x"
                    onClick={() => removeItem(it.id)}
                    aria-label="Hiq">
                    <span className="material-icons">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="add-doc-foot">
          <div className="add-doc-foot-counts">
            {!hideCategory && counts.map((c) => c.n > 0 && (
              <span key={c.key} className="add-doc-foot-pill">
                <span className="material-icons">{c.icon}</span>
                {c.n} {c.label.replace('Dokumentacioni ', '')}
              </span>
            ))}
            {hideCategory && items.length > 0 && (
              <span className="add-doc-foot-empty">{items.length} skedar{items.length === 1 ? '' : 'ë'} gati</span>
            )}
            {items.length === 0 && <span className="add-doc-foot-empty">Nuk ka skedarë të zgjedhur</span>}
          </div>
          <div className="add-doc-foot-actions">
            <button className="t-btn-outline" onClick={onClose}>Anulo</button>
            <button
              className="t-btn-mui"
              disabled={items.length === 0}
              onClick={onClose}>
              <span className="material-icons">check</span>
              Shto {items.length > 0 ? items.length + ' ' : ''}dokumente
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

window.AddDocumentDrawer = AddDocumentDrawer;
