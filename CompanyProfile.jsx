// Company profile — polished redesign (20-04-2026).
// Layout: company header with progress → folder tree w/ status dots → document pane
// with status header + light PDF viewer.

const PROFILE_TREE = [
  { id: 'ligj', title: 'Dokumenta ligjore', expanded: true, children: [
    { id: 'l1', title: 'Dëshmi Penaliteti', status: 'ok', uploaded: '12 Shkurt 2026', expires: '12 Mars 2026', size: '284 KB', version: 'v3' },
    { id: 'l2', title: 'Vertetim Përmbarimi', status: 'ok', uploaded: '08 Shkurt 2026' },
    { id: 'l3', title: 'Sigurimet Shoqërore', status: 'warn', uploaded: '15 Janar 2026' },
    { id: 'l4', title: 'Vertetim OSHA', status: 'ok', uploaded: '02 Shkurt 2026' },
    { id: 'l5', title: 'Licenca e Kompanisë', status: 'ok', uploaded: '18 Janar 2026' },
    { id: 'l6', title: 'NIPT i thjeshtë', status: 'ok', uploaded: '10 Janar 2026' },
    { id: 'l7', title: 'Historiku NIPT', status: 'missing' },
    { id: 'l8', title: 'Llogaria Bankare', status: 'ok', uploaded: '22 Janar 2026' },
    { id: 'l9', title: 'Vërtetim mospërjashtim APP', status: 'missing' },
    { id: 'konflikt', title: 'Deklarata mbi Konfliktin e Interesit', status: 'ok', uploaded: '12 Shkurt 2026' },
    { id: 'punesim',  title: 'Deklarata për dispozitat e punës',      status: 'ok', uploaded: '12 Shkurt 2026' },
    { id: 'kriteret', title: 'Deklarata për kriteret e kualifikimit', status: 'ok', uploaded: '12 Shkurt 2026' },
    { id: 'pavarur',  title: 'Deklarata për Ofertat e Pavarura',      status: 'ok', uploaded: '12 Shkurt 2026' },
    { id: 'iso', title: 'Certifikimet ISO', folder: true, expanded: true, children: [
      { id: 'iso1', title: 'ISO 9001', status: 'ok', uploaded: '14 Nën 2025' },
      { id: 'iso2', title: 'ISO 45001', status: 'ok', uploaded: '03 Dhjet 2025' },
      { id: 'iso3', title: 'Shto ISO', add: true },
    ]},
  ]},
  { id: 'fin', title: 'Dokumenta financiare', expanded: true, children: [
    { id: 'f1', title: 'Xhiro Vjetore', status: 'ok', uploaded: '05 Shkurt 2026' },
    { id: 'f2', title: 'Pasqyra Financiare', status: 'ok', uploaded: '28 Janar 2026' },
    { id: 'f3', title: 'Bilanci', status: 'warn', uploaded: '12 Janar 2026' },
    { id: 'listpg', title: 'Listëpagesa', folder: true, expanded: true, count: '3 muaj', children: [
      { id: 'lp1', title: 'Shkurt 2026', status: 'ok', uploaded: '05 Mars 2026' },
      { id: 'lp2', title: 'Janar 2026', status: 'ok', uploaded: '04 Shkurt 2026' },
      { id: 'lp3', title: 'Dhjetor 2025', status: 'ok', uploaded: '06 Janar 2026' },
      { id: 'lp-add', title: 'Shto listëpagesë', add: true },
    ]},
  ]},
  { id: 'tek', title: 'Dokumenta teknik', expanded: true, children: [
    { id: 'stafi', title: 'Stafi', folder: true, expanded: true, count: '3 persona', children: [
      { id: 's1', title: 'Morena Hoxha', status: 'ok', uploaded: '04 Shkurt 2026' },
      { id: 's2', title: 'Meti Musaj', status: 'ok', uploaded: '11 Janar 2026' },
      { id: 's3', title: 'Elira Rama', status: 'warn', uploaded: '22 Dhjet 2025' },
      { id: 's4', title: 'Shto staf', add: true },
    ]},
    { id: 'mak', title: 'Makineritë', folder: true, expanded: false, count: '2 njësi', children: [
      { id: 'm1', title: 'Fugon FR-4521', status: 'ok', uploaded: '15 Janar 2026' },
      { id: 'm2', title: 'Automjet AK-1120', status: 'ok', uploaded: '09 Shkurt 2026' },
      { id: 'm3', title: 'Shto makinerie', add: true },
    ]},
    { id: 'kat', title: 'Katalog / Autorizim', folder: true, expanded: true, count: '3 dokumente', children: [
      { id: 'k1', title: 'Katalog teknik — Pompa uji', status: 'ok', uploaded: '18 Janar 2026' },
      { id: 'k2', title: 'Autorizim prodhuesi — Caterpillar', status: 'ok', uploaded: '02 Shkurt 2026' },
      { id: 'k3', title: 'Katalog pajisje laboratori', status: 'ok', uploaded: '10 Dhjet 2025' },
      { id: 'k-add', title: 'Shto katalog / autorizim', add: true },
    ]},
    { id: 'specifika', title: 'Deklaratë në përmbushje me specifikimet teknike', status: 'ok', uploaded: '14 Shkurt 2026' },
    { id: 'grafiku',   title: 'Deklaratë për grafikun e punimeve',                status: 'ok', uploaded: '14 Shkurt 2026' },
  ]},
  { id: 'pun', title: 'Punët e ngjashme', expanded: false, count: '0 punë', children: [
    { id: 'pun-add', title: 'Shto punë të ngjashme', add: true },
  ]},
];

// Flatten tree leaves to compute progress totals.
function countStatuses(nodes) {
  let ok = 0, warn = 0, missing = 0, total = 0;
  const walk = (n) => {
    if (n.add) return;
    if (n.children) n.children.forEach(walk);
    else {
      total += 1;
      if (n.status === 'ok') ok += 1;
      else if (n.status === 'warn') warn += 1;
      else missing += 1;
    }
  };
  nodes.forEach(walk);
  return { ok, warn, missing, total };
}

function StatusDot({ status }) {
  if (!status) return <span className="cp-dot cp-dot-ghost" aria-hidden />;
  return <span className={`cp-dot cp-dot-${status}`} aria-hidden />;
}

function TreeNode({ node, depth, onAdd, onSelect, onFolderSelect, selectedId, parentKind }) {
  const [expanded, setExpanded] = React.useState(node.expanded ?? false);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isRoot = depth === 0;
  const isFolder = isRoot || node.folder;

  const branch = isRoot ? countStatuses([node]) : null;

  // Figure out what kind of add this is based on parent folder id
  const myKind = node.id === 'iso' ? 'iso'
    : node.id === 'stafi' ? 'staff'
    : node.id === 'mak' ? 'machine'
    : node.id === 'kat' ? 'catalog'
    : node.id === 'pun' ? 'work'
    : node.id === 'listpg' ? 'payroll'
    : parentKind;

  const onClick = (e) => {
    if (node.add) { onAdd && onAdd(parentKind || 'iso'); return; }
    if (hasChildren) {
      // Folder row: clicking anywhere except the caret selects the folder.
      // Caret toggles expand/collapse.
      const isCaret = e.target.closest && e.target.closest('.cp-caret');
      if (isCaret) { setExpanded(!expanded); return; }
      onFolderSelect && onFolderSelect(node, myKind);
      if (!expanded) setExpanded(true);
      return;
    }
    onSelect && onSelect(node, parentKind);
  };

  const isSelected = selectedId && selectedId === node.id;

  return (
    <div className="cp-node">
      <div
        className={
          'cp-row'
          + (node.active || isSelected ? ' is-active' : '')
          + (node.add ? ' is-add' : '')
          + (isRoot ? ' is-root' : '')
          + (isFolder && !isRoot ? ' is-subfolder' : '')
        }
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={onClick}>
        {hasChildren ? (
          <span className="material-icons cp-caret">
            {expanded ? 'expand_more' : 'chevron_right'}
          </span>
        ) : <span className="cp-caret-spacer" />}

        {isFolder
          ? <span className="cp-folder" aria-hidden>
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                <path d="M1 2.2C1 1.5 1.5 1 2.2 1h3.5c.35 0 .68.14.93.38L7.9 2.3h5.9c.7 0 1.2.55 1.2 1.25v7.25c0 .7-.5 1.2-1.2 1.2h-11.6C1.5 12 1 11.45 1 10.75V2.2Z" fill="#F5B800" stroke="#C48A00" strokeWidth="0.7"/>
              </svg>
            </span>
          : node.add
            ? <span className="material-icons cp-add-icon">add</span>
            : <StatusDot status={node.status} />}

        <span className="cp-label">{node.title}</span>

        {isRoot && branch && (
          <span className="cp-branch-count">
            {branch.ok}<span className="cp-branch-count-sep">/</span>{branch.total}
          </span>
        )}
        {!isRoot && node.count && (
          <span className="cp-branch-count cp-branch-count-quiet">{node.count}</span>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="cp-children">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} onAdd={onAdd} onSelect={onSelect} onFolderSelect={onFolderSelect} selectedId={selectedId} parentKind={myKind} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocStatusBadge({ status }) {
  const map = {
    ok: { label: 'Në rregull', cls: 'is-ok', icon: 'check_circle' },
    warn: { label: 'Skadon së shpejti', cls: 'is-warn', icon: 'schedule' },
    missing: { label: 'Mungon', cls: 'is-missing', icon: 'error_outline' },
  };
  const s = map[status] || map.ok;
  return (
    <span className={`cp-badge ${s.cls}`}>
      <span className="material-icons">{s.icon}</span>
      {s.label}
    </span>
  );
}

function PdfToolbar() {
  return (
    <div className="cp-pdf-toolbar">
      <div className="cp-pdf-group">
        <button className="cp-pdf-btn" title="Outline"><span className="material-icons">menu</span></button>
        <button className="cp-pdf-btn" title="Thumbnails"><span className="material-icons">view_sidebar</span></button>
      </div>
      <div className="cp-pdf-spacer" />
      <div className="cp-pdf-pager">
        <button className="cp-pdf-btn-mini"><span className="material-icons">chevron_left</span></button>
        <input type="text" defaultValue="1" aria-label="Page" />
        <span className="cp-pdf-sep">/ 2</span>
        <button className="cp-pdf-btn-mini"><span className="material-icons">chevron_right</span></button>
      </div>
      <div className="cp-pdf-zoom">
        <button className="cp-pdf-btn-mini"><span className="material-icons">remove</span></button>
        <span className="cp-pdf-pct">100%</span>
        <button className="cp-pdf-btn-mini"><span className="material-icons">add</span></button>
      </div>
      <div className="cp-pdf-spacer" />
      <div className="cp-pdf-group">
        <button className="cp-pdf-btn" title="Fit to width"><span className="material-icons">fit_screen</span></button>
        <button className="cp-pdf-btn" title="Rotate"><span className="material-icons">rotate_right</span></button>
        <button className="cp-pdf-btn" title="Print"><span className="material-icons">print</span></button>
      </div>
    </div>
  );
}

function EAlbaniaMark() {
  // Official e-Albania logo.
  return (
    <span className="cp-eal" aria-hidden>
      <img src="https://e-albania.al/images/logo.svg" alt="" width="16" height="16" />
    </span>
  );
}

// Look up a leaf doc node by id anywhere in the tree; also compute its folder path.
function findDocNode(nodes, id, pathAcc = []) {
  for (const n of nodes) {
    if (n.id === id && !n.children) return { node: n, path: pathAcc };
    if (n.children) {
      const found = findDocNode(n.children, id, [...pathAcc, n.title]);
      if (found) return found;
    }
  }
  return null;
}

function DocumentEmptyState({ title, path, onUpload }) {
  return (
    <section className="cp-work">
      <div className="cp-dochead">
        <div className="cp-dochead-left">
          <div className="cp-dochead-top">
            <span className="cp-dochead-path">
              <span className="material-icons cp-dochead-path-ico">folder</span>
              {path}
            </span>
          </div>
          <h1 className="cp-dochead-title">{title}</h1>
          <div className="cp-folder-meta">
            <span className="cp-folder-meta-chip"><em className="cp-dot cp-dot-missing" /> Mungon</span>
          </div>
        </div>
        <div className="cp-dochead-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">upload</span>
            Ngarko dokumentin
          </button>
          <button className="cp-action">
            <EAlbaniaMark />
            Apliko në e-Albania
          </button>
        </div>
      </div>

      <div className="cp-empty-doc">
        <div className="cp-empty-doc-icon" aria-hidden>
          <span className="material-icons">upload_file</span>
        </div>
        <h2>Ky dokument nuk është ngarkuar ende</h2>
        <p>
          Bashkangjit skedarin PDF ose aplikoje në e-Albania për ta plotësuar profilin e kompanisë.
          Pas ngarkimit, ky dokument do të përdoret automatikisht në dosjet e tenderit.
        </p>
        <div className="cp-empty-doc-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">upload</span>
            Ngarko skedarin
          </button>
          <button className="cp-action">
            <EAlbaniaMark />
            Apliko në e-Albania
          </button>
        </div>
        <div className="cp-empty-doc-hint">
          <span className="material-icons">info</span>
          Pranohen PDF ose JPG, deri 20 MB. Pas ngarkimit sistemi njofton për datat e skadencës.
        </div>
      </div>
    </section>
  );
}

function DocumentView({ onUpload, onDelete }) {
  return (
    <section className="cp-work">
      {/* Document status card */}
      <div className="cp-dochead">
        <div className="cp-dochead-left">
          <div className="cp-dochead-top">
            <span className="cp-dochead-path">Dokumenta ligjore</span>
          </div>
          <h1 className="cp-dochead-title">Dëshmi Penaliteti</h1>
          <dl className="cp-dochead-meta">
            <div><dt>Ngarkuar</dt><dd>12 Shkurt 2026</dd></div>
            <div className="is-warn">
              <dt>Skadon</dt>
              <dd>
                <span className="material-icons cp-meta-icon">schedule</span>
                12 Mars 2026
                <span className="cp-meta-hint">· 21 ditë</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="cp-dochead-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">upload</span>
            Ngarko version të ri
          </button>
          <button className="cp-action">
            <EAlbaniaMark />
            Apliko në e-Albania
          </button>
          <button className="cp-action">
            <span className="material-icons">download</span>
            Shkarko
          </button>
          <button className="cp-action cp-action-icon is-danger" title="Fshi" aria-label="Fshi" onClick={onDelete}>
            <span className="material-icons">delete_outline</span>
          </button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="cp-viewer">
        <PdfToolbar />
        <div className="cp-pdf-canvas">
          <div className="cp-pdf-page">
            <div className="cp-pdf-page-head">
              <div className="cp-pdf-crest" aria-hidden>
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                  <circle cx="21" cy="21" r="19" stroke="#111" strokeWidth="1.5" fill="#fff"/>
                  <path d="M21 8 L24 18 L34 18 L26 24 L29 34 L21 28 L13 34 L16 24 L8 18 L18 18 Z" fill="#C62828"/>
                </svg>
              </div>
              <div className="cp-pdf-gov">
                <div>REPUBLIKA E SHQIPËRISË</div>
                <div>MINISTRIA E DREJTËSISË</div>
                <div>ZYRA E GJENDJES GJYQËSORE</div>
              </div>
            </div>
            <h2>DËSHMI PENALITETI</h2>
            <p>Mbi bazën e të dhënave të Regjistrit të Gjendjes Gjyqësore, vërtetohet se personi juridik <strong>AlbConstruct Sh.p.k.</strong>, me NIPT L91234567K, me seli në Rrugën e Kavajës 12, Tiranë, deri në datën e lëshimit të kësaj dëshmie:</p>
            <p><strong>Nuk rezulton i dënuar</strong> me vendim gjyqësor të formës së prerë për asnjë nga veprat penale të parashikuara në nenin 76 të Ligjit Nr. 162/2020 "Për Prokurimin Publik".</p>
            <p>Kjo dëshmi lëshohet për efekt të procedurave të prokurimit publik dhe ka afat vlefshmërie 3 (tre) muaj nga data e lëshimit.</p>
            <div className="cp-pdf-sign">
              <div>
                <div className="cp-pdf-sign-line" />
                <div className="cp-pdf-sign-label">Nënshkrimi i titullarit</div>
              </div>
              <div>
                <div className="cp-pdf-stamp" aria-hidden>
                  <span>VULA</span>
                </div>
              </div>
            </div>
            <div className="cp-pdf-foot">
              Tiranë, 12 Shkurt 2026 · Nr. Prot. 4521/2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FolderOverview({ folder, onAdd, onOpenNode }) {
  // Flatten direct children (docs only — skip "add" rows and folders' children).
  const entries = (folder.children || []).filter((c) => !c.add);
  const totals = countStatuses([folder]);
  const addRow = (folder.children || []).find((c) => c.add);
  const addKind = folder.id === 'iso' ? 'iso'
    : folder.id === 'stafi' ? 'staff'
    : folder.id === 'mak' ? 'machine'
    : folder.id === 'kat' ? 'catalog'
    : folder.id === 'pun' ? 'work'
    : folder.id === 'listpg' ? 'payroll'
    : 'iso';

  return (
    <section className="cp-work">
      <div className="cp-dochead">
        <div className="cp-dochead-left">
          <div className="cp-dochead-top">
            <span className="cp-dochead-path">
              <span className="material-icons cp-dochead-path-ico">folder</span>
              Profili i kompanisë
            </span>
          </div>
          <h1 className="cp-dochead-title">{folder.title}</h1>
          {folder.id !== 'pun' && (
            <div className="cp-folder-meta">
              {totals.ok > 0 && <span className="cp-folder-meta-chip"><em className="cp-dot cp-dot-ok" /> {totals.ok} në rregull</span>}
              {folder.id !== 'kat' && totals.warn > 0 && <span className="cp-folder-meta-chip"><em className="cp-dot cp-dot-warn" /> {totals.warn} duke skaduar</span>}
              {totals.missing > 0 && <span className="cp-folder-meta-chip"><em className="cp-dot cp-dot-missing" /> {totals.missing} mungojnë</span>}
            </div>
          )}
        </div>
        <div className="cp-dochead-actions">
          {addRow && (
            <button className="cp-action is-primary" onClick={() => onAdd(addKind)}>
              <span className="material-icons">add</span>
              {addRow.title}
            </button>
          )}
          <button className="cp-action">
            <span className="material-icons">download</span>
            Shkarko të gjitha
          </button>
        </div>
      </div>

      <div className="cp-folder-grid">
        {entries.map((item) => {
          const isSubfolder = item.folder || Array.isArray(item.children);
          const sub = isSubfolder ? countStatuses([item]) : null;
          const status = isSubfolder
            ? (sub.missing > 0 ? 'missing' : sub.warn > 0 ? 'warn' : 'ok')
            : (item.status || 'ok');
          return (
            <button
              key={item.id}
              type="button"
              className={'cp-folder-card is-' + status + (isSubfolder ? ' is-subfolder' : '')}
              onClick={() => onOpenNode(item, addKind, isSubfolder)}>
              <div className="cp-folder-card-icon">
                {isSubfolder
                  ? <svg width="24" height="20" viewBox="0 0 16 13" fill="none">
                      <path d="M1 2.2C1 1.5 1.5 1 2.2 1h3.5c.35 0 .68.14.93.38L7.9 2.3h5.9c.7 0 1.2.55 1.2 1.25v7.25c0 .7-.5 1.2-1.2 1.2h-11.6C1.5 12 1 11.45 1 10.75V2.2Z" fill="#F5B800" stroke="#C48A00" strokeWidth="0.7"/>
                    </svg>
                  : <span className="material-icons">description</span>}
              </div>
              <div className="cp-folder-card-body">
                <div className="cp-folder-card-title">{item.title}</div>
                <div className="cp-folder-card-sub">
                  {isSubfolder
                    ? `${sub.ok}/${sub.total} dokumente`
                    : item.uploaded
                      ? `Ngarkuar ${item.uploaded}`
                      : 'I pangarkuar'}
                </div>
              </div>
              <span className={'cp-folder-card-dot cp-dot cp-dot-' + status} aria-hidden />
            </button>
          );
        })}
        {addRow && (
          <button
            type="button"
            className="cp-folder-card is-add"
            onClick={() => onAdd(addKind)}>
            <div className="cp-folder-card-icon is-add">
              <span className="material-icons">add</span>
            </div>
            <div className="cp-folder-card-body">
              <div className="cp-folder-card-title">{addRow.title}</div>
              <div className="cp-folder-card-sub">Shto një zë të ri në këtë dosje</div>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

// ——————————————————————————————————————————————————
// CatalogView — catalog/authorization document with a PDF, a name, and
// multi-language support (AI translation). Each language tab shows either the
// uploaded original or an AI-translated version.
// ——————————————————————————————————————————————————
const CATALOG_LANG_LIBRARY = {
  sq: { code: 'sq', label: 'Shqip',    flag: '🇦🇱' },
  en: { code: 'en', label: 'English',  flag: '🇬🇧' },
  it: { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  de: { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  fr: { code: 'fr', label: 'Français', flag: '🇫🇷' },
  tr: { code: 'tr', label: 'Türkçe',   flag: '🇹🇷' },
};

// Per-catalog original language (would come from server in a real app).
const CATALOG_ORIGINALS = {
  k1: 'sq', // Katalog teknik — Pompa uji (shqip)
  k2: 'en', // Autorizim prodhuesi — Caterpillar (anglisht, kërkon përkthim në shqip)
  k3: 'it', // Katalog pajisje laboratori (italisht, kërkon përkthim në shqip)
};

function CatalogView({ node, onUpload }) {
  const title = (node && node.title) || 'Katalog';
  const uploaded = (node && node.uploaded) || '—';
  const originalCode = (node && CATALOG_ORIGINALS[node.id]) || 'sq';
  const original = CATALOG_LANG_LIBRARY[originalCode];
  // Përkthime që krijohen automatikisht me AI: gjithmonë Shqip + English, përveç origjinalit.
  // Useri shqiptar lexon në Shqip; partnerët/autoritetet ndërkombëtare lexojnë në English.
  const TRANSLATION_TARGETS = ['sq', 'en'];
  const autoTranslations = TRANSLATION_TARGETS
    .filter((code) => code !== originalCode)
    .map((code) => CATALOG_LANG_LIBRARY[code]);
  const needsTranslation = autoTranslations.length > 0;
  // Tab-at: origjinali + të gjitha përkthimet automatike.
  const tabs = [original, ...autoTranslations];

  // Default view: nëse origjinali NUK është shqip, hap te përkthimi shqip (useri është shqiptar).
  // Përndryshe hap te origjinali.
  const defaultLang = originalCode !== 'sq' ? 'sq' : originalCode;
  const [lang, setLang] = React.useState(defaultLang);
  // Reset when switching catalogs.
  React.useEffect(() => {
    setLang(defaultLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node && node.id]);

  const current = CATALOG_LANG_LIBRARY[lang] || original;
  const isViewingOriginal = lang === originalCode;
  const [translating, setTranslating] = React.useState(false);

  // Statusi për çdo gjuhë përkthimi: 'pending' (po gjenerohet) → 'ready' (gati).
  // Pas hapjes së dokumentit, simulojmë gjenerim AI me kohëzgjatje të shkurtër,
  // që useri të shohë qartë procesin. Real-i do të vinte nga server.
  const [translationStatus, setTranslationStatus] = React.useState(() => {
    const init = {};
    autoTranslations.forEach((t) => { init[t.code] = 'pending'; });
    return init;
  });
  React.useEffect(() => {
    // Reset kur ndërrohet katalogu — fillojmë pa-të-gatshme dhe i mbarojmë gradualisht.
    const init = {};
    autoTranslations.forEach((t) => { init[t.code] = 'pending'; });
    setTranslationStatus(init);
    const timers = autoTranslations.map((t, i) =>
      setTimeout(() => {
        setTranslationStatus((s) => ({ ...s, [t.code]: 'ready' }));
      }, 900 + i * 700) // kohëzgjatje pak më e ndryshme për secilën
    );
    return () => { timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node && node.id]);
  const [downloadOpen, setDownloadOpen] = React.useState(false);
  const downloadRef = React.useRef(null);
  React.useEffect(() => {
    if (!downloadOpen) return;
    function onDocClick(e) {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) setDownloadOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setDownloadOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [downloadOpen]);

  function switchLang(code) {
    if (code === lang) return;
    // Spin only when moving to a translated version.
    if (code !== originalCode) {
      setTranslating(true);
      setLang(code);
      setTimeout(() => setTranslating(false), 650);
    } else {
      setLang(code);
    }
  }

  return (
    <section className="cp-work">
      <div className="cp-dochead">
        <div className="cp-dochead-left">
          <div className="cp-dochead-top">
            <span className="cp-dochead-path">Dokumenta teknik · Katalog / Autorizim</span>
          </div>
          <h1 className="cp-dochead-title">{title}</h1>
          <dl className="cp-dochead-meta">
            <div><dt>Ngarkuar</dt><dd>{uploaded}</dd></div>
            <div><dt>Gjuha origjinale</dt><dd>{original.flag} {original.label}</dd></div>
            {needsTranslation && (
              <div className="cp-dochead-translations">
                <dt>Përkthim me AI</dt>
                <dd className="cp-trans-chips">
                  {autoTranslations.map((t) => {
                    const status = translationStatus[t.code] || 'pending';
                    const isReady = status === 'ready';
                    return (
                      <span
                        key={t.code}
                        className={'cp-trans-chip is-' + status}
                        title={isReady ? 'Përkthimi është gati' : 'Po përkthen me AI…'}>
                        <span className="cp-trans-chip-flag" aria-hidden>{t.flag}</span>
                        <span className="cp-trans-chip-label">{t.label}</span>
                        {isReady ? (
                          <span className="material-icons cp-trans-chip-icon">check_circle</span>
                        ) : (
                          <span className="cp-trans-chip-spinner" aria-hidden />
                        )}
                      </span>
                    );
                  })}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="cp-dochead-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">upload</span>
            Ngarko version të ri
          </button>
          <div className="cp-action-menu" ref={downloadRef}>
            <button
              className="cp-action"
              aria-haspopup="menu"
              aria-expanded={downloadOpen}
              onClick={() => setDownloadOpen((v) => !v)}>
              <span className="material-icons">download</span>
              Shkarko
              <span className="material-icons cp-action-caret">expand_more</span>
            </button>
            {downloadOpen && (
              <div className="cp-action-menu-pop" role="menu">
                <div className="cp-action-menu-label">Zgjidh gjuhën</div>
                {tabs.map((l) => {
                  const isOrig = l.code === originalCode;
                  return (
                    <button
                      key={l.code}
                      role="menuitem"
                      className="cp-action-menu-item"
                      onClick={() => setDownloadOpen(false)}>
                      <span className="cp-action-menu-flag" aria-hidden>{l.flag}</span>
                      <span className="cp-action-menu-main">
                        <span className="cp-action-menu-name">{l.label}</span>
                        <span className="cp-action-menu-sub">
                          {isOrig ? 'Origjinal · PDF' : 'Përkthim me AI · PDF'}
                        </span>
                      </span>
                      <span className="material-icons cp-action-menu-dl">file_download</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button className="cp-action cp-action-icon is-danger" title="Fshi" aria-label="Fshi">
            <span className="material-icons">delete_outline</span>
          </button>
        </div>
      </div>

      {/* Language tabs — only show if translation exists */}
      {needsTranslation && (
        <div className="cp-catalog-langs" role="tablist" aria-label="Gjuha">
          {tabs.map((l) => {
            const isOrig = l.code === originalCode;
            const status = isOrig ? 'ready' : (translationStatus[l.code] || 'pending');
            const isPending = status === 'pending';
            return (
              <button
                key={l.code}
                role="tab"
                aria-selected={lang === l.code}
                aria-busy={isPending}
                disabled={isPending}
                className={'cp-catalog-lang' + (lang === l.code ? ' is-active' : '') + (isPending ? ' is-pending' : '')}
                onClick={() => !isPending && switchLang(l.code)}>
                <span className="cp-catalog-flag" aria-hidden>{l.flag}</span>
                {l.label}
                {isOrig
                  ? <span className="cp-catalog-tag is-origin">origjinali</span>
                  : isPending
                    ? <span className="cp-catalog-tag is-loading">
                        <span className="cp-trans-chip-spinner" aria-hidden /> po përkthen
                      </span>
                    : null}
              </button>
            );
          })}
        </div>
      )}

      {needsTranslation && !isViewingOriginal && null}


      <div className="cp-viewer">
        <PdfToolbar />
        <div className="cp-pdf-canvas">
          <div className="cp-pdf-page">
            {translating ? (
              <div className="cp-catalog-translating">
                <span className="material-icons cp-catalog-spin">auto_awesome</span>
                Duke përkthyer në {current.label}…
              </div>
            ) : (
              <CatalogPdfBody lang={lang} title={title} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CatalogPdfBody({ lang, title }) {
  // A tiny bilingual catalog body so the preview changes as the user switches
  // languages. Real implementation would stream PDF from storage.
  const copy = {
    sq: {
      subtitle: 'Katalog teknik · Specifikime produkti',
      section1: 'Përshkrim i përgjithshëm',
      body1: 'Ky katalog përmban specifikimet teknike të produktit, duke përfshirë dimensionet, materialet dhe standardet e zbatueshme.',
      section2: 'Specifikime teknike',
      items: ['Fuqi nominale: 7.5 kW', 'Tension furnizimi: 400 V / 50 Hz', 'Rrjedhje maksimale: 120 l/min', 'Standard: EN ISO 9906'],
      section3: 'Autorizim prodhuesi',
      body3: 'Kompania është e autorizuar zyrtarisht për shitje, instalim dhe mirëmbajtje të produkteve në tregun e Shqipërisë.',
    },
    en: {
      subtitle: 'Technical catalog · Product specifications',
      section1: 'General description',
      body1: 'This catalog contains the technical specifications of the product, including dimensions, materials and applicable standards.',
      section2: 'Technical specifications',
      items: ['Rated power: 7.5 kW', 'Supply voltage: 400 V / 50 Hz', 'Max flow: 120 l/min', 'Standard: EN ISO 9906'],
      section3: 'Manufacturer authorization',
      body3: 'The company is officially authorized for sale, installation and maintenance of the products on the Albanian market.',
    },
    it: {
      subtitle: 'Catalogo tecnico · Specifiche prodotto',
      section1: 'Descrizione generale',
      body1: 'Questo catalogo contiene le specifiche tecniche del prodotto, incluse dimensioni, materiali e standard applicabili.',
      section2: 'Specifiche tecniche',
      items: ['Potenza nominale: 7.5 kW', 'Tensione di alimentazione: 400 V / 50 Hz', 'Portata massima: 120 l/min', 'Standard: EN ISO 9906'],
      section3: 'Autorizzazione produttore',
      body3: 'La società è ufficialmente autorizzata alla vendita, installazione e manutenzione dei prodotti sul mercato albanese.',
    },
    de: {
      subtitle: 'Technischer Katalog · Produktspezifikationen',
      section1: 'Allgemeine Beschreibung',
      body1: 'Dieser Katalog enthält die technischen Spezifikationen des Produkts, einschließlich Abmessungen, Materialien und geltender Normen.',
      section2: 'Technische Daten',
      items: ['Nennleistung: 7.5 kW', 'Versorgungsspannung: 400 V / 50 Hz', 'Maximaler Durchfluss: 120 l/min', 'Norm: EN ISO 9906'],
      section3: 'Herstellerautorisierung',
      body3: 'Das Unternehmen ist offiziell für Verkauf, Installation und Wartung der Produkte auf dem albanischen Markt autorisiert.',
    },
  }[lang] || {};

  return (
    <>
      <div className="cp-pdf-page-head">
        <div className="cp-pdf-gov">
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div>{copy.subtitle}</div>
        </div>
      </div>
      <h3 style={{ marginTop: 12 }}>{copy.section1}</h3>
      <p>{copy.body1}</p>
      <h3>{copy.section2}</h3>
      <ul style={{ margin: '6px 0 10px 20px' }}>
        {(copy.items || []).map((it, i) => <li key={i}>{it}</li>)}
      </ul>
      <h3>{copy.section3}</h3>
      <p>{copy.body3}</p>
      <div className="cp-pdf-sign">
        <div>
          <div className="cp-pdf-sign-line" />
          <div className="cp-pdf-sign-label">Prodhuesi / Manufacturer</div>
        </div>
        <div>
          <div className="cp-pdf-stamp" aria-hidden><span>VULA</span></div>
        </div>
      </div>
    </>
  );
}

function CompanyProfile({ onNav }) {
  const totals = countStatuses(PROFILE_TREE);
  const pct = Math.round((totals.ok / totals.total) * 100);
  const [addOpen, setAddOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [addKind, setAddKind] = React.useState(null); // 'iso' | 'staff' | 'machine' | 'work'
  const [selected, setSelected] = React.useState(() => {
    // Default: open the "Dokumenta ligjore" folder so users land on the
    // folder overview rather than a specific doc.
    const ligj = PROFILE_TREE.find((n) => n.id === 'ligj');
    return ligj ? { id: 'ligj', kind: 'folder', folder: ligj } : { id: 'l1', kind: 'doc' };
  });

  function handleSelect(node, parentKind) {
    if (parentKind === 'staff') setSelected({ id: node.id, kind: 'staff' });
    else if (parentKind === 'machine') setSelected({ id: node.id, kind: 'machine' });
    else if (parentKind === 'catalog') setSelected({ id: node.id, kind: 'catalog' });
    else setSelected({ id: node.id, kind: 'doc' });
  }

  function handleFolderSelect(folder) {
    setSelected({ id: folder.id, kind: 'folder', folder });
  }

  function handleOpenNodeFromFolder(node, parentKind, isSubfolder) {
    if (isSubfolder) {
      setSelected({ id: node.id, kind: 'folder', folder: node });
    } else if (parentKind === 'staff') {
      setSelected({ id: node.id, kind: 'staff' });
    } else if (parentKind === 'machine') {
      setSelected({ id: node.id, kind: 'machine' });
    } else if (parentKind === 'catalog') {
      setSelected({ id: node.id, kind: 'catalog' });
    } else {
      setSelected({ id: node.id, kind: 'doc' });
    }
  }

  function renderWorkspace() {
    if (selected.kind === 'folder' && selected.folder) {
      return (
        <FolderOverview
          folder={selected.folder}
          onAdd={(k) => setAddKind(k)}
          onOpenNode={handleOpenNodeFromFolder}
        />
      );
    }
    if (selected.kind === 'staff' && window.STAFF_DATA && window.STAFF_DATA[selected.id]) {
      return <window.StaffProfile data={window.STAFF_DATA[selected.id]} onUpload={() => setAddKind('staff')} />;
    }
    if (selected.kind === 'machine' && window.MACHINE_DATA && window.MACHINE_DATA[selected.id]) {
      return <window.MachineProfile data={window.MACHINE_DATA[selected.id]} onUpload={() => setAddKind('machine')} />;
    }
    if (selected.kind === 'catalog') {
      const foundCat = findDocNode(PROFILE_TREE, selected.id);
      return <CatalogView node={foundCat && foundCat.node} onUpload={() => setAddKind('catalog')} />;
    }
    // Doc kind — check the tree for the node and decide PDF vs empty state.
    const found = findDocNode(PROFILE_TREE, selected.id);
    if (found && found.node.status === 'missing') {
      return (
        <DocumentEmptyState
          title={found.node.title}
          path={found.path.join(' · ')}
          onUpload={() => setAddOpen(true)}
        />
      );
    }
    return <DocumentView onUpload={() => setAddOpen(true)} onDelete={() => setConfirmDelete(true)} />;
  }

  return (
    <>
      <AppHeader active="profili" onNav={onNav} />

      {/* Page chrome — company identity + overall progress */}
      <div className="cp-pageheader">
        <div className="cp-pageheader-inner">
          <div className="cp-co">
            <div className="cp-co-logo" aria-hidden>AL</div>
            <div>
              <div className="cp-co-name">AlbConstruct Sh.p.k.</div>
              <div className="cp-co-meta">
                NIPT L91234567K · Rruga e Kavajës 12, Tiranë · Administrator: Arben Krasniqi
              </div>
            </div>
          </div>

          <div className="cp-progress">
            <div className="cp-progress-head">
              <span className="cp-progress-label">Profili i kompanisë</span>
            </div>
            <div className="cp-progress-legend">
              <span><em className="cp-dot cp-dot-ok" /> {totals.ok} në rregull</span>
              <span><em className="cp-dot cp-dot-warn" /> {totals.warn} duke skaduar</span>
              <span><em className="cp-dot cp-dot-missing" /> {totals.missing} mungojnë</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cp-shell" style={{ padding: '20px 0px' }}>
        {/* Left rail — folder tree with status */}
        <aside className="cp-rail">
          <div className="cp-rail-tree" style={{ padding: '20px 6px' }}>
            {PROFILE_TREE.map((n) => (
              <TreeNode key={n.id} node={n} depth={0}
                onAdd={(k) => setAddKind(k)}
                onSelect={handleSelect}
                onFolderSelect={handleFolderSelect}
                selectedId={selected.id} />
            ))}
          </div>
        </aside>

        {/* Right — dynamic workspace */}
        {renderWorkspace()}
      </div>
      <AddDocumentDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        hideCategory={true}
        title="Ngarko version të ri"
        subtitle="Ngarko një version të ri të dokumentit. Versioni i mëparshëm ruhet si histori."
      />
      {window.ConfirmModal && (
        <window.ConfirmModal
          open={confirmDelete}
          title="Fshi këtë dokument?"
          body={'"Dëshmi Penaliteti" do të hiqet nga profili i kompanisë. Ky veprim nuk mund të zhbëhet.'}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => setConfirmDelete(false)}
        />
      )}
      {window.AddIsoDrawer && (
        <window.AddIsoDrawer
          open={!!addKind}
          kind={addKind || 'iso'}
          onClose={() => setAddKind(null)}
        />
      )}
    </>
  );
}
window.CompanyProfile = CompanyProfile;
window.PROFILE_TREE = PROFILE_TREE;

// Generic mutator for the new DocSelector: append (folder mode) or replace
// in place (direct mode) a PROFILE_TREE leaf.
//   pathArr = [rootId, 'direct'|'folder', leafOrFolderId]
//   entry   = { clientId, name, issued?, expires?, file?, periudha? }
window.addDocToProfile = function (pathArr, entry) {
  if (!pathArr || pathArr.length !== 3 || !entry) return;
  const [rootId, mode, id] = pathArr;
  const root = PROFILE_TREE.find((n) => n.id === rootId);
  if (!root || !root.children) return;
  const title = entry.periudha || entry.name || entry.title || 'Dokument';
  const row = {
    id: entry.clientId || id,
    title,
    status: 'ok',
    uploaded: entry.uploaded || 'Sot',
    expires: entry.expires,
  };
  if (mode === 'folder') {
    const folder = root.children.find((c) => c.id === id);
    if (!folder) return;
    if (!folder.children) folder.children = [];
    const addIdx = folder.children.findIndex((c) => c.add);
    if (addIdx >= 0) folder.children.splice(addIdx, 0, row);
    else folder.children.push(row);
    return;
  }
  // direct — replace the existing leaf in place so the "latest" version wins.
  const idx = root.children.findIndex((c) => c.id === id);
  if (idx >= 0) {
    root.children[idx] = { ...root.children[idx], ...row, id };
  }
};

// Mutator used by the Krijo-dosje vete-deklarim flow to persist an inline-created
// catalog into the Katalog / Autorizim folder of the company profile.
window.addCatalogToProfile = function (id, entry) {
  const tek = PROFILE_TREE.find((n) => n.id === 'tek');
  if (!tek) return id;
  const kat = tek.children.find((n) => n.id === 'kat');
  if (!kat) return id;
  // Insert before the "Shto katalog / autorizim" add-row.
  const addIdx = kat.children.findIndex((c) => c.add);
  const row = { id, title: entry.title, status: 'ok', uploaded: entry.uploaded || 'Sot' };
  if (addIdx >= 0) kat.children.splice(addIdx, 0, row);
  else kat.children.push(row);
  return id;
};

// Ditto for staf and makineri — keeps the tree consistent with the underlying
// STAFF_DATA / MACHINE_DATA maps written by addStaffToProfile / addMachineToProfile.
window.addStaffTreeRow = function (id, title) {
  const tek = PROFILE_TREE.find((n) => n.id === 'tek');
  if (!tek) return id;
  const f = tek.children.find((n) => n.id === 'stafi');
  if (!f) return id;
  const addIdx = f.children.findIndex((c) => c.add);
  const row = { id, title, status: 'ok', uploaded: 'Sot' };
  if (addIdx >= 0) f.children.splice(addIdx, 0, row);
  else f.children.push(row);
  return id;
};
window.addMachineTreeRow = function (id, title) {
  const tek = PROFILE_TREE.find((n) => n.id === 'tek');
  if (!tek) return id;
  const f = tek.children.find((n) => n.id === 'mak');
  if (!f) return id;
  const addIdx = f.children.findIndex((c) => c.add);
  const row = { id, title, status: 'ok', uploaded: 'Sot' };
  if (addIdx >= 0) f.children.splice(addIdx, 0, row);
  else f.children.push(row);
  return id;
};
