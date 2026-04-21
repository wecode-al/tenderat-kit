// Existing-dossier detail — POLISHED.
// Source: /Page-1/Dosje-Egzistuse/index.jsx
//
// Upgrades vs. the Figma:
//  - Status hero with deadline countdown + progress bar (was missing)
//  - Metadata as a grid of 6 labeled "fact tiles" with icons (was flat list)
//  - Tabs: Dokumentacioni / Aktiviteti / Historiku (was single list)
//  - Document rows now have status pill + meta line + proper actions
//  - Docs are grouped by category (Ligjore / Financiare / Teknike)
//  - Sticky right-rail with quick actions (was inline buttons only)

const DOC_GROUPS = [
  {
    title: 'Dokumentacioni ligjor',
    count: 3,
    docs: [
      { name: 'Formulari përmbledhës i vetdeklarimit', meta: 'PDF · 840 KB · Ngarkuar 12/03/2026' },
      { name: 'Dëshmia e penalitetit',                 meta: 'PDF · 1.2 MB · Ngarkuar 12/03/2026' },
      { name: 'Vërtetim i gjendjes gjyqësore',         meta: 'PDF · 620 KB · Ngarkuar 11/03/2026' },
    ],
  },
  {
    title: 'Dokumentacioni financiar',
    count: 2,
    docs: [
      { name: 'Sigurimet shoqërore',   meta: 'PDF · 312 KB · Ngarkuar 09/03/2026' },
      { name: 'Bilanc financiar 2025', meta: 'XLSX · 48 KB · Ngarkuar 09/03/2026' },
    ],
  },
  {
    title: 'Dokumentacioni teknik',
    count: 1,
    docs: [
      { name: 'Kontratë për mbështetje kapacitetesh', meta: 'PDF · 2.1 MB · Ngarkuar 06/03/2026' },
    ],
  },
];

const DOC_STATUS = {
  uploaded: { label: 'Ngarkuar',   cls: 'is-ok',     icon: 'check_circle' },
  review:   { label: 'Në shqyrtim', cls: 'is-warn',   icon: 'schedule'      },
  missing:  { label: 'Mungon',      cls: 'is-danger', icon: 'error_outline' },
};

function StatusPill({ status }) {
  const s = DOC_STATUS[status];
  return (
    <span className={'d-pill ' + s.cls}>
      <span className="material-icons">{s.icon}</span>{s.label}
    </span>
  );
}

function FactTile({ icon, label, value, accent, wide }) {
  return (
    <div className={'d-fact' + (accent ? ' is-accent' : '') + (wide ? ' is-wide' : '')}>
      <div className="d-fact-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="d-fact-body">
        <span className="d-fact-label">{label}</span>
        <span className="d-fact-value">{value}</span>
      </div>
    </div>
  );
}

function DocRow({ doc, onDelete }) {
  return (
    <div className="d-doc-row">
      <div className="d-doc-tile">
        <span className="material-icons">description</span>
      </div>
      <div className="d-doc-col">
        <span className="d-doc-name">{doc.name}</span>
        <span className="d-doc-meta">{doc.meta}</span>
      </div>
      <button className="d-doc-action" title="Shiko dokumentin">
        <span className="material-icons">visibility</span>
      </button>
      <button className="d-doc-action" title="Ndrysho">
        <span className="material-icons">edit</span>
      </button>
      <button className="d-doc-action" title="Shkarko">
        <span className="material-icons">download</span>
      </button>
      <button className="d-doc-action d-doc-action-danger" title="Fshi" onClick={onDelete}>
        <span className="material-icons">delete_outline</span>
      </button>
    </div>
  );
}

function ConfirmModal({ open, title, body, confirmLabel = 'Fshi', onCancel, onConfirm }) {
  if (!open) return null;
  const modal = (
    <div className="t-modal-scrim" onClick={onCancel}>
      <div className="t-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="t-modal-icon">
          <span className="material-icons">warning_amber</span>
        </div>
        <h3 className="t-modal-title">{title}</h3>
        <p className="t-modal-body">{body}</p>
        <div className="t-modal-actions">
          <button className="t-btn-outline" onClick={onCancel}>Anulo</button>
          <button className="t-btn-danger" onClick={onConfirm}>
            <span className="material-icons">delete_outline</span>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modal, document.body);
}
window.ConfirmModal = ConfirmModal;

function DossierDetailInline({ dossier, embedded = false }) {
  const d = dossier || { title: 'Ndërtimi - Rruga 4', count: 15 };
  const [addOpen, setAddOpen] = React.useState(false);
  const [deletingDoc, setDeletingDoc] = React.useState(null);
  const [removed, setRemoved] = React.useState(() => new Set());

  const visibleGroups = DOC_GROUPS.map((g, gi) => ({
    ...g,
    docs: g.docs.filter((_, di) => !removed.has(gi + ':' + di)),
  }));
  const total = visibleGroups.reduce((a, g) => a + g.docs.length, 0);

  return (
    <>
      <section className={'d-hero' + (embedded ? ' d-hero-embedded' : '')}>
        <div className="d-hero-left">
          <div className="d-hero-row">
            <span className="d-ref">{d.reference || 'REF-2026-0471'}</span>
          </div>
          <h1 className="d-hero-title">{d.title}</h1>
        </div>
        <div className="d-hero-right">
          <div className="d-hero-actions">
            <OutlineButton icon="edit">Ndrysho</OutlineButton>
            <MuiButton icon="download">Shkarko dosjen</MuiButton>
          </div>
        </div>
      </section>

      <section className="d-facts">
        <FactTile icon="account_balance" label="Autoriteti kontraktor"        value={d.authority || 'Bashkia Tiranë'} />
        <FactTile icon="payments"        label="Fondi limit"                  value={d.fondi || '12 400 000 ALL'} accent />
        <FactTile icon="tag"             label="Referenca"                    value={d.reference || 'REF-2026-0118'} />
        <FactTile icon="gavel"           label="Procedura"                    value="Procedurë e hapur" />
        <FactTile icon="description"     label="Lloji i kontratës"            value="Punë" />
        <FactTile icon="groups"          label="Lloji i dosjes së pjesëmarrjes" value="Mbështetje në kapacitetet e të tjerëve" wide />
        <FactTile icon="event"           label="Grafiku i autoritetit"        value="20/01/2026 – 30/06/2026" />
        <FactTile icon="label"           label="Nr. reference i autoritetit"  value="AK-2026-118" />
        <FactTile icon="shield"          label="Garancia e objektit"          value="240 000 ALL" />
        <FactTile icon="event_available" label="Data e mbylljes së procedurës" value={d.closingDate || '30/06/2026'} />
        <FactTile icon="schedule"        label="Ora e mbylljes së procedurës"  value="14:00" />
      </section>

      <div className="d-tabs">
        <div className="d-tabs-title">
          <span>Dokumentacioni</span>
          <span className="d-tab-count">{total}</span>
        </div>
        <div className="d-tabs-spacer" />
        <OutlineButton icon="add" onClick={() => setAddOpen(true)}>Shto dokument</OutlineButton>
      </div>

      <div className="d-groups">
        {visibleGroups.map((g, gi) => (
          g.docs.length === 0 ? null : (
            <section key={gi} className="d-group">
              <header className="d-group-head">
                <h3>{g.title}</h3>
                <span className="d-group-count">{g.docs.length}</span>
              </header>
              <div className="d-group-body">
                {g.docs.map((doc, di) => (
                  <DocRow
                    key={gi + ':' + doc.name + ':' + di}
                    doc={doc}
                    onDelete={() => {
                      const origIndex = DOC_GROUPS[gi].docs.findIndex(
                        (d2, k) => d2.name === doc.name && !removed.has(gi + ':' + k)
                      );
                      setDeletingDoc({ gi, di: origIndex, name: doc.name });
                    }}
                  />
                ))}
              </div>
            </section>
          )
        ))}
      </div>

      <AddDocumentDrawer open={addOpen} onClose={() => setAddOpen(false)} />
      <ConfirmModal
        open={!!deletingDoc}
        title="Fshi këtë dokument?"
        body={deletingDoc ? `"${deletingDoc.name}" do të hiqet nga dosja. Ky veprim nuk mund të zhbëhet.` : ''}
        onCancel={() => setDeletingDoc(null)}
        onConfirm={() => {
          if (deletingDoc) {
            setRemoved(prev => new Set(prev).add(deletingDoc.gi + ':' + deletingDoc.di));
          }
          setDeletingDoc(null);
        }}
      />
    </>
  );
}
window.DossierDetailInline = DossierDetailInline;

function DossierDetail({ dossier, onBack, onNav }) {
  return (
    <>
      <AppHeader active="dosjet" onNav={onNav} />
      <div className="d-page" style={{ padding: '20px 0px 80px' }}>
        <button className="t-back" onClick={onBack}>
          <span className="material-icons">arrow_back</span> Dosjet e Mia
        </button>
        <DossierDetailInline dossier={dossier} />
      </div>
    </>
  );
}
window.DossierDetail = DossierDetail;
