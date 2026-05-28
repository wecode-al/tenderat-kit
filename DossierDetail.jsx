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

// Etiketat e kategorive — të njëjta me ato te wizard-i.
const CATEGORY_LABELS = {
  ligjor:    'Dokumentacioni ligjor',
  financiar: 'Dokumentacioni financiar',
  teknik:    'Dokumentacioni teknik',
};
const CATEGORY_ORDER = ['ligjor', 'financiar', 'teknik'];

// Fallback për dosje pa `documents[]` (kompatibilitet me thirrjet ekzistuese).
const LEGACY_DOCS = [
  { category: 'ligjor',    name: 'Formulari përmbledhës i vetdeklarimit', meta: 'PDF · 840 KB · Ngarkuar 12/03/2026', partnerId: null },
  { category: 'ligjor',    name: 'Dëshmia e penalitetit',                 meta: 'PDF · 1.2 MB · Ngarkuar 12/03/2026', partnerId: null },
  { category: 'ligjor',    name: 'Vërtetim i gjendjes gjyqësore',         meta: 'PDF · 620 KB · Ngarkuar 11/03/2026', partnerId: null },
  { category: 'financiar', name: 'Sigurimet shoqërore',                   meta: 'PDF · 312 KB · Ngarkuar 09/03/2026', partnerId: null },
  { category: 'financiar', name: 'Bilanc financiar 2025',                 meta: 'XLSX · 48 KB · Ngarkuar 09/03/2026', partnerId: null },
  { category: 'teknik',    name: 'Kontratë për mbështetje kapacitetesh',  meta: 'PDF · 2.1 MB · Ngarkuar 06/03/2026', partnerId: null },
];

// Paletë e qëndrueshme ngjyrash — e njëjta me atë te `KrijoDosjeNew.jsx`/preventivi
// (që dosja, wizard-i dhe preventivi të kenë të njëjtin ngjyrim për të njëjtin partner).
const D_PARTNER_COLORS = ['#E8772E', '#2563EB', '#0F9D58', '#9333EA', '#DB2777', '#0891B2'];
const dPartnerColor = (i) => D_PARTNER_COLORS[((i % D_PARTNER_COLORS.length) + D_PARTNER_COLORS.length) % D_PARTNER_COLORS.length];
const dShortName = (p) => {
  const n = (p && p.name) || (p && p.isSelf ? 'Kompania ime' : 'Partneri');
  return String(n).replace(/\s*(sh\.?p\.?k\.?|sh\.?a\.?|ltd\.?)\s*$/i, '').trim() || n;
};

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

function DocRow({ doc, partnerById, showCompany, onEdit, onDelete }) {
  const partner = doc.partnerId ? partnerById[doc.partnerId] : null;
  return (
    <div className="d-doc-row">
      <div className="d-doc-tile">
        <span className="material-icons">description</span>
      </div>
      <div className="d-doc-col">
        <span className="d-doc-name">{doc.name}</span>
        <span className="d-doc-meta">{doc.meta}</span>
      </div>
      {showCompany && (
        partner ? (
          <span className="d-doc-company" style={{ '--pc': dPartnerColor(partner.idx) }}>
            <i className="d-doc-dot" />
            {dShortName(partner)}
          </span>
        ) : (
          <span className="d-doc-company is-shared" title="I përbashkët për dosjen">
            <span className="material-icons">groups</span>
            E përbashkët
          </span>
        )
      )}
      <button className="d-doc-action" title="Shiko dokumentin">
        <span className="material-icons">visibility</span>
      </button>
      <button className="d-doc-action" title="Ndrysho" onClick={onEdit}>
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
  const [editingDoc, setEditingDoc] = React.useState(null);  // dokumenti që po redaktohet ose null
  const [deletingDoc, setDeletingDoc] = React.useState(null);
  const [removed, setRemoved] = React.useState(() => new Set());
  const [partnerFilter, setPartnerFilter] = React.useState('all'); // 'all' | 'shared' | partnerId
  // Overrides lokale për redaktim (pa propaguar te lista mëma): { _uid: { name?, meta?, partnerId? } }
  const [overrides, setOverrides] = React.useState(() => ({}));
  // Snapshot i ndarë i formës së vetëdeklarimit — drawer-i e modifikon këtu kur isVD.
  const [vdForm, setVdForm] = React.useState(() => ({
    veteDeklarim: { staff: [], machinery: [], catalogs: [], inline: { staff: {}, machinery: {}, catalogs: {} } },
  }));

  // Lloji + kompanitë — derivohen nga dosja. Fallback për dosjet e vjetra mock.
  const lloji = d.lloji || 'Pjesëmarrje e vetme';
  const companies = Array.isArray(d.companies) ? d.companies : [];
  const isMulti = (lloji === (window.PARTICIPATION_TYPES?.SUPPORT || 'Mbështetje në kapacitetet e të tjerëve') ||
                   lloji === (window.PARTICIPATION_TYPES?.JOINT   || 'Bashkim operatorësh ekonomikë'))
                  && companies.length >= 2;

  const partnerById = React.useMemo(() => {
    const m = {};
    companies.forEach((p, i) => { m[p.id] = { ...p, idx: i }; });
    return m;
  }, [companies]);

  // Burimi i dokumenteve: dossier.documents nëse ekziston, përndryshe seed legacy.
  // Çdo dokument fiton një `_uid` stabël (indeksi në burim) — bazë për overrides + React key.
  const allDocs = React.useMemo(() => {
    const src = Array.isArray(d.documents) ? d.documents : LEGACY_DOCS;
    return src.map((doc, i) => {
      const uid = '_doc' + i;
      const patch = overrides[uid] || {};
      return { ...doc, ...patch, _uid: uid };
    });
  }, [d.documents, overrides]);

  // Apliko filtrin (vetëm kur isMulti — përndryshe filtri injorohet).
  const filteredDocs = React.useMemo(() => {
    if (!isMulti || partnerFilter === 'all') return allDocs;
    if (partnerFilter === 'shared') return allDocs.filter((x) => !x.partnerId);
    return allDocs.filter((x) => x.partnerId === partnerFilter);
  }, [allDocs, partnerFilter, isMulti]);

  // Çelësi i dokumentit për React key + për listën `removed`.
  const docKey = (doc) => doc._uid || (doc.category + ':' + doc.name + ':' + (doc.partnerId || 'shared'));
  const visibleGroups = React.useMemo(() => {
    const byCat = {};
    filteredDocs.forEach((doc) => {
      if (removed.has(docKey(doc))) return;
      const cat = doc.category || 'ligjor';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(doc);
    });
    return CATEGORY_ORDER.filter((cat) => byCat[cat] && byCat[cat].length).map((cat) => ({
      key: cat,
      title: CATEGORY_LABELS[cat] || cat,
      docs: byCat[cat],
    }));
  }, [filteredDocs, removed]);

  const total = visibleGroups.reduce((a, g) => a + g.docs.length, 0);

  // Numrat te chips — të bazuar te dokumentet aktuale (jo te filtri aktiv).
  const counts = React.useMemo(() => {
    const c = { all: allDocs.length, shared: 0 };
    companies.forEach((p) => { c[p.id] = 0; });
    allDocs.forEach((doc) => {
      if (!doc.partnerId) c.shared += 1;
      else if (c[doc.partnerId] != null) c[doc.partnerId] += 1;
    });
    return c;
  }, [allDocs, companies]);

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
        <FactTile icon="groups"          label="Lloji i dosjes së pjesëmarrjes" value={lloji} wide />
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

      {isMulti && (
        <div className="d-doc-filters" role="tablist" aria-label="Filtro sipas kompanisë">
          <button
            type="button"
            className={'d-doc-filter' + (partnerFilter === 'all' ? ' is-on' : '')}
            onClick={() => setPartnerFilter('all')}>
            Të gjitha <b>{counts.all}</b>
          </button>
          {companies.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={'d-doc-filter d-doc-filter-partner' + (partnerFilter === p.id ? ' is-on' : '')}
              style={{ '--pc': dPartnerColor(i) }}
              onClick={() => setPartnerFilter(p.id)}>
              <i className="d-doc-dot" /> {dShortName(p)} <b>{counts[p.id] || 0}</b>
            </button>
          ))}
          {counts.shared > 0 && (
            <button
              type="button"
              className={'d-doc-filter d-doc-filter-shared' + (partnerFilter === 'shared' ? ' is-on' : '')}
              onClick={() => setPartnerFilter('shared')}>
              <span className="material-icons">groups</span> Të përbashkëta <b>{counts.shared}</b>
            </button>
          )}
        </div>
      )}

      <div className="d-groups">
        {visibleGroups.map((g) => (
          <section key={g.key} className="d-group">
            <header className="d-group-head">
              <h3>{g.title}</h3>
              <span className="d-group-count">{g.docs.length}</span>
            </header>
            <div className="d-group-body">
              {g.docs.map((doc) => (
                <DocRow
                  key={docKey(doc)}
                  doc={doc}
                  partnerById={partnerById}
                  showCompany={isMulti}
                  onEdit={() => setEditingDoc(doc)}
                  onDelete={() => setDeletingDoc({ key: docKey(doc), name: doc.name })}
                />
              ))}
            </div>
          </section>
        ))}
        {total === 0 && (
          <div className="d-group d-group-empty">
            <span className="material-icons">search_off</span>
            <p>Nuk ka dokumente që përputhen me filtrin.</p>
          </div>
        )}
      </div>

      <AddDocumentDrawer open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Drawer për redaktimin e një dokumenti — mode VD vs file-doc gjykohet brenda. */}
      {window.EditDocumentDrawer && (
        <window.EditDocumentDrawer
          open={!!editingDoc}
          doc={editingDoc}
          companies={companies}
          vdForm={vdForm}
          setVdForm={(updater) => setVdForm(typeof updater === 'function' ? updater : (prev) => ({ ...prev, ...updater }))}
          onClose={() => setEditingDoc(null)}
          onSave={(patch) => {
            // Apliko patch-in lokalisht — ndryshimi reflektohet menjëherë te lista.
            if (editingDoc && editingDoc._uid && patch && Object.keys(patch).length) {
              setOverrides((prev) => ({
                ...prev,
                [editingDoc._uid]: { ...(prev[editingDoc._uid] || {}), ...patch },
              }));
            }
            setEditingDoc(null);
          }}
        />
      )}

      <ConfirmModal
        open={!!deletingDoc}
        title="Fshi këtë dokument?"
        body={deletingDoc ? `"${deletingDoc.name}" do të hiqet nga dosja. Ky veprim nuk mund të zhbëhet.` : ''}
        onCancel={() => setDeletingDoc(null)}
        onConfirm={() => {
          if (deletingDoc) {
            setRemoved(prev => new Set(prev).add(deletingDoc.key));
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
