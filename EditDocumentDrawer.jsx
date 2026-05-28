// EditDocumentDrawer — slide-in djathtas për redaktimin e nje dokumenti ekzistues.
//
// Dy mode:
//   1) doc.docId === 'vete-deklarim' → ngarkon `window.VeteDeklarimForm` (i njëjti komponent
//      nga wizard-i, që menaxhon staf + makineri + kualifikime). Pa file picker — vetëm formë.
//   2) Përndryshe (file-doc) → emri input + file aktual me buton "Zëvendëso" + dropdown kompanie
//      (kur dosja ka ≥2 kompani). Ruajtja kthen patch-in { name?, file?, partnerId? }.
//
// Nuk e modifikon dosjen drejtpërdrejt — parent-i thërret onSave(patch) për të aplikuar.

function EditDocumentDrawer({ open, doc, companies = [], vdForm, setVdForm, onClose, onSave }) {
  const isVD = doc && doc.docId === 'vete-deklarim';
  const isMulti = companies.length >= 2;

  // State lokal për file-doc mode. Inicializohet nga `doc` kur drawer-i hapet.
  const [name, setName] = React.useState('');
  const [partnerId, setPartnerId] = React.useState('');
  const [newFile, setNewFile] = React.useState(null); // { name, size } ose null
  const fileInputRef = React.useRef(null);

  // Reset kur ndryshon doc-i ose drawer-i mbyllet/hapet.
  React.useEffect(() => {
    if (!doc) return;
    setName(doc.name || '');
    setPartnerId(doc.partnerId || '');
    setNewFile(null);
  }, [doc]);

  if (!doc) {
    // Kur s'ka doc aktiv, ende rendero scrim+drawer që animimi i mbylljes të punojë mirë.
    return (
      <>
        <div className={'edit-doc-scrim' + (open ? ' is-open' : '')} onClick={onClose} />
        <aside className={'edit-doc-drawer' + (open ? ' is-open' : '')} role="dialog" aria-hidden={!open} />
      </>
    );
  }

  const VeteDeklarimForm = window.VeteDeklarimForm;

  function pickFile() {
    fileInputRef.current && fileInputRef.current.click();
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const kb = Math.max(1, Math.round(f.size / 1024));
    const size = kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
    setNewFile({ name: f.name, size });
    e.target.value = '';
  }

  function save() {
    const patch = {};
    if (isVD) {
      // Vetëm forma — patch.veteDeklarim ruan një snapshot referues. Përmbajtja reale
      // mbahet te vdForm (që parent-i tashmë e ka modifikuar gjatë redaktimit).
      patch.veteDeklarimTouched = true;
    } else {
      if (name && name !== doc.name) patch.name = name;
      if (isMulti) {
        const next = partnerId === 'shared' ? null : partnerId;
        if (next !== doc.partnerId) patch.partnerId = next;
      }
      if (newFile) {
        // Përditëso meta-n nga file-i i ri (në prototip s'ka ruajtje reale).
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const ext = (newFile.name.split('.').pop() || 'FILE').toUpperCase();
        patch.meta = `${ext} · ${newFile.size} · Ngarkuar ${dd}/${mm}/${today.getFullYear()}`;
      }
    }
    onSave && onSave(patch);
  }

  // Krye-titulli i drawer-it varion sipas mode-it.
  const headerTitle = isVD ? 'Redakto vetëdeklarimin' : 'Redakto dokumentin';
  const headerSub = isVD
    ? 'Përditëso stafin, makineritë dhe kualifikimet që do të pasqyrohen te formulari.'
    : 'Zëvendëso file-in, përditëso emrin ose riatribo kompaninë.';

  return (
    <>
      <div className={'edit-doc-scrim' + (open ? ' is-open' : '')} onClick={onClose} />
      <aside className={'edit-doc-drawer' + (open ? ' is-open' : '')} role="dialog" aria-hidden={!open}>
        <header className="edit-doc-head">
          <div>
            <div className="edit-doc-eyebrow">{doc.category ? doc.category.toUpperCase() : 'DOKUMENT'}</div>
            <h2>{headerTitle}</h2>
            <p>{headerSub}</p>
          </div>
          <button className="edit-doc-close" onClick={onClose} aria-label="Mbyll">
            <span className="material-icons">close</span>
          </button>
        </header>

        <div className="edit-doc-body">
          {isVD ? (
            VeteDeklarimForm ? (
              <VeteDeklarimForm form={vdForm} setForm={setVdForm} />
            ) : (
              <div className="edit-doc-warn">
                <span className="material-icons">error_outline</span>
                <div>
                  <strong>VeteDeklarimForm nuk u ngarkua.</strong>
                  <p>Sigurohu që KrijoDosjeNew.jsx ngarkohet para EditDocumentDrawer.jsx.</p>
                </div>
              </div>
            )
          ) : (
            <>
              {/* Emri i dokumentit */}
              <section className="edit-doc-section">
                <label className="edit-doc-label">Emri i dokumentit</label>
                <input
                  type="text"
                  className="edit-doc-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="P.sh. Bilanc financiar 2025"
                />
              </section>

              {/* File aktual + zëvendësim */}
              <section className="edit-doc-section">
                <label className="edit-doc-label">File-i i dokumentit</label>
                <div className="edit-doc-file">
                  <div className="edit-doc-file-icon"><span className="material-icons">description</span></div>
                  <div className="edit-doc-file-body">
                    {newFile ? (
                      <>
                        <div className="edit-doc-file-name">{newFile.name}</div>
                        <div className="edit-doc-file-meta">{newFile.size} · do të zëvendësojë file-in aktual</div>
                      </>
                    ) : (
                      <>
                        <div className="edit-doc-file-name">{doc.name}</div>
                        <div className="edit-doc-file-meta">{doc.meta}</div>
                      </>
                    )}
                  </div>
                  <button type="button" className="edit-doc-file-btn" onClick={pickFile}>
                    <span className="material-icons">{newFile ? 'autorenew' : 'upload_file'}</span>
                    {newFile ? 'Ndrysho' : 'Zëvendëso file-in'}
                  </button>
                  {newFile && (
                    <button type="button" className="edit-doc-file-undo" onClick={() => setNewFile(null)}
                            aria-label="Anulo zëvendësimin">
                      <span className="material-icons">close</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" style={{ display: 'none' }}
                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                         onChange={onFileChange} />
                </div>
              </section>

              {/* Kompania — vetëm kur dosja ka ≥2 kompani */}
              {isMulti && (
                <section className="edit-doc-section">
                  <label className="edit-doc-label">Kompania</label>
                  <select
                    className="edit-doc-select"
                    value={partnerId || 'shared'}
                    onChange={(e) => setPartnerId(e.target.value)}>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.isSelf ? ' (Kompania ime)' : ''}
                      </option>
                    ))}
                    <option value="shared">Të përbashkët për dosjen</option>
                  </select>
                  <p className="edit-doc-help">
                    Përcakton se cilës kompani të bashkimit i përket ky dokument.
                  </p>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="edit-doc-foot">
          <button type="button" className="t-btn-outline" onClick={onClose}>Anulo</button>
          <button type="button" className="t-btn-mui" onClick={save}>
            <span className="material-icons">check</span>
            Ruaj ndryshimet
          </button>
        </footer>
      </aside>
    </>
  );
}

window.EditDocumentDrawer = EditDocumentDrawer;
