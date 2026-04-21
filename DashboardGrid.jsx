// Dashboard — populated dossier grid ("Dosjet e Mia").
// Polished variant with summary stats, filter toolbar, and richer cards.

const SAMPLE_DOSSIERS = [
  {
    id: 'd5', title: 'Blerje lëndë djegëse për flotën',
    authority: 'ARRSH', reference: 'REF-2026-0255',
    statusKey: 'draft', statusLabel: 'Draft',
    fondi: '18 750 000 ALL', closingDate: '15/05/2026', daysLeft: 27,
    docsDone: 1, docsTotal: 12, createdAt: '18/04/2026',
  },
  {
    id: 'd1', title: 'Ndërtimi i rrugës rurale — Loti 4',
    authority: 'Bashkia Tiranë', reference: 'REF-2026-0118',
    statusKey: 'submitted', statusLabel: 'Dorëzuar',
    fondi: '82 400 000 ALL', closingDate: '22/04/2026', daysLeft: 4,
    docsDone: 14, docsTotal: 15, createdAt: '02/04/2026',
  },
  {
    id: 'd4', title: 'Shërbime konsulence strategjike 2026',
    authority: 'Ministria e Financave', reference: 'REF-2026-0107',
    statusKey: 'submitted', statusLabel: 'Dorëzuar',
    fondi: '3 200 000 ALL', closingDate: '28/04/2026', daysLeft: 10,
    docsDone: 2, docsTotal: 7, createdAt: '08/04/2026',
  },
  {
    id: 'd2', title: 'Furnizim pajisje ZK',
    authority: 'Spitali Rajonal Durrës', reference: 'REF-2026-0471',
    statusKey: 'submitted', statusLabel: 'Dorëzuar',
    fondi: '12 400 000 ALL', closingDate: '30/06/2026', daysLeft: 73,
    docsDone: 6, docsTotal: 8, createdAt: '15/04/2026',
  },
  {
    id: 'd3', title: 'Mirëmbajtje ambienti dhe gjelbërim',
    authority: 'Bashkia Vlorë', reference: 'REF-2026-0392',
    statusKey: 'closed', statusLabel: 'Mbyllur',
    fondi: '4 800 000 ALL', closingDate: '02/03/2026', daysLeft: 0,
    docsDone: 22, docsTotal: 22, createdAt: '10/02/2026',
  },
  {
    id: 'd6', title: 'Rikonstruksion çerdhe nr. 12',
    authority: 'Bashkia Tiranë', reference: 'REF-2026-0088',
    statusKey: 'closed', statusLabel: 'Mbyllur',
    fondi: '24 100 000 ALL', closingDate: '12/01/2026', daysLeft: -96,
    docsDone: 18, docsTotal: 18, createdAt: '22/12/2025',
  },
];

const FILTERS = [
  { key: 'all',        label: 'Të gjitha' },
  { key: 'draft',      label: 'Draft' },
  { key: 'submitted',  label: 'Dorëzuar' },
  { key: 'closed',     label: 'Mbyllur' },
];

function DashboardGrid({ onOpen, onCreate, onNav }) {
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery]   = React.useState('');
  const [sort, setSort]     = React.useState('closing'); // closing | updated | value
  const [removed, setRemoved] = React.useState(() => new Set());

  const allRows = React.useMemo(
    () => SAMPLE_DOSSIERS.filter(d => !removed.has(d.id)),
    [removed]
  );

  // Summary stats
  const stats = React.useMemo(() => {
    const active = allRows.filter(d => d.statusKey !== 'closed' && d.statusKey !== 'submitted');
    const urgent = active.filter(d => d.daysLeft <= 7);
    const submitted = allRows.filter(d => d.statusKey === 'submitted');
    return {
      total: allRows.length,
      active: active.length,
      urgent: urgent.length,
      submitted: submitted.length,
    };
  }, [allRows]);

  const rows = React.useMemo(() => {
    let r = allRows;
    if (filter !== 'all') r = r.filter(d => d.statusKey === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      r = r.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.authority.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q)
      );
    }
    const statusRank = { draft: 0, submitted: 1, closed: 2 };
    r = [...r].sort((a, b) => {
      const ra = statusRank[a.statusKey] ?? 99;
      const rb = statusRank[b.statusKey] ?? 99;
      if (ra !== rb) return ra - rb;
      if (sort === 'closing') return a.daysLeft - b.daysLeft;
      if (sort === 'value')   return parseInt(b.fondi.replace(/\D/g,'')) - parseInt(a.fondi.replace(/\D/g,''));
      return 0;
    });
    return r;
  }, [allRows, filter, query, sort]);

  const [active, setActive] = React.useState(() => rows[0] || null);

  React.useEffect(() => {
    if (rows.length === 0) { setActive(null); return; }
    if (!active || !rows.some((r) => r.id === active.id)) setActive(rows[0]);
  }, [filter, query, rows.length]);

  const DetailInline = (typeof window !== 'undefined' && window.DossierDetailInline) || null;

  return (
    <>
      <AppHeader active="dosjet" onNav={onNav} />
      <div className="t-page" style={{ padding: '20px 0px 64px' }}>
        <div className="t-page-heading">
          <div>
            <h1 className="t-page-title">Dosjet e Mia</h1>
            <p className="t-page-sub">Menaxho dokumentet e tenderave dhe dosjet e projekteve.</p>
          </div>
        </div>

        <div className="t-dash-shell">
          <aside className="t-dash-rail">
            <div className="t-filter-row">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={'t-filter-chip' + (filter === f.key ? ' is-on' : '')}
                  onClick={() => setFilter(f.key)}>
                  {f.label}
                  <span className="t-filter-count">
                    {f.key === 'all'
                      ? SAMPLE_DOSSIERS.length
                      : SAMPLE_DOSSIERS.filter(d => d.statusKey === f.key).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="t-search">
              <span className="material-icons">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko sipas titullit, autoritetit ose referencës…"
              />
              {query && (
                <button className="t-search-clear" aria-label="Pastro"
                        onClick={() => setQuery('')}>
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>

            <button type="button" className="t-dash-rail-create" onClick={onCreate}>
              <span className="material-icons">add</span>
              <span>Krijo dosje të re</span>
            </button>

            {rows.length === 0 ? (
              <div className="t-dash-rail-empty">
                <span className="material-icons">search_off</span>
                <p>Asnjë dosje nuk përputhet</p>
                <button className="t-btn t-btn-outline" onClick={() => { setQuery(''); setFilter('all'); }}>
                  Rivendos filtrat
                </button>
              </div>
            ) : (
              <div className="t-dash-raillist">
                {rows.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={'t-dash-rrow is-' + d.statusKey + (active && active.id === d.id ? ' is-on' : '')}
                    onClick={() => setActive(d)}>
                    <span className="t-dash-rrow-dot" />
                    <span className="t-dash-rrow-body">
                      <span className="t-dash-rrow-title">{d.title}</span>
                      <span className="t-dash-rrow-sub">{d.authority} · {d.reference}</span>
                    </span>
                    <span className="t-dash-rrow-date">{d.closingDate}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="t-dash-work">
            {active && DetailInline ? (
              <DetailInline key={active.id} dossier={active} embedded={true} />
            ) : (
              <div className="t-dash-empty-right">
                <span className="material-icons">folder_open</span>
                <div>
                  <h3>Zgjidh një dosje</h3>
                  <p>Zgjidh një dosje nga lista për ta hapur këtu, ose krijo një të re.</p>
                </div>
                <button className="t-btn t-btn-primary" onClick={onCreate}>
                  <span className="material-icons">add</span>
                  Krijo dosje të re
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function StatTile({ icon, label, value, tone }) {
  return (
    <div className={'t-stat' + (tone ? ' is-' + tone : '')}>
      <div className="t-stat-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <div className="t-stat-body">
        <div className="t-stat-value">{value}</div>
        <div className="t-stat-label">{label}</div>
      </div>
    </div>
  );
}

window.DashboardGrid = DashboardGrid;
