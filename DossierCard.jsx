// Dossier card — status-aware tile used on the Dosjet e Mia grid.
// Shows status pill, authority, closing countdown, progress bar, and actions.
function DossierCard({
  title, authority, reference, statusKey = 'prep', statusLabel,
  fondi, closingDate, daysLeft, docsDone = 0, docsTotal = 0,
  onOpen, onEdit, onDelete,
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const menuRef = React.useRef(null);
  const urgent = typeof daysLeft === 'number' && daysLeft <= 5 && statusKey !== 'closed';

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  return (
    <div
      className={'t-dossier-card is-' + statusKey + (urgent ? ' is-urgent' : '')}
      role="button" tabIndex={0}
      onClick={(e) => {
        if (menuOpen || confirming) return;
        onOpen && onOpen();
      }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen && onOpen()}>
      <div className="t-dc-accent" aria-hidden />

      <div className="t-dc-top">
        <div className="t-dc-kebab-wrap" ref={menuRef}>
          <button
            className="t-dc-kebab"
            aria-label="Më shumë"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}>
            <span className="material-icons">more_vert</span>
          </button>
          {menuOpen && (
            <div className="t-dc-menu" onClick={(e) => e.stopPropagation()}>
              <button className="t-dc-menu-item" onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onEdit && onEdit();
              }}>
                <span className="material-icons">edit</span>
                Edito
              </button>
              <button className="t-dc-menu-item is-danger" onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setConfirming(true);
              }}>
                <span className="material-icons">delete_outline</span>
                Fshi dosjen
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="t-dc-title" title={title}>{title}</h3>
      <div className="t-dc-sub">
        <span className="material-icons">account_balance</span>
        <span>{authority}</span>
      </div>

      <div className="t-dc-meta">
        <div className="t-dc-meta-item">
          <div className="t-dc-meta-label">Fondi limit</div>
          <div className="t-dc-meta-value">{fondi}</div>
        </div>
        <div className="t-dc-meta-item">
          <div className="t-dc-meta-label">Mbyllet</div>
          <div className="t-dc-meta-value">{closingDate}</div>
        </div>
      </div>

      <div className="t-dc-foot">
        <span className="t-dc-ref">{reference}</span>
        {typeof daysLeft === 'number' && (
          <span className={'t-dc-countdown' + (urgent ? ' is-urgent' : '')}>
            <span className="material-icons">schedule</span>
            {daysLeft <= 0 ? 'Mbyllur' : daysLeft + ' ditë'}
          </span>
        )}
      </div>

      {confirming && window.ConfirmModal && (
        <window.ConfirmModal
          open={true}
          title="Fshi këtë dosje?"
          body="Ky veprim nuk mund të zhbëhet. Të gjitha dokumentet e ngarkuara do të humbasin."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete && onDelete();
          }}
        />
      )}
    </div>
  );
}

// Dashed "Krijo dosje të re" empty slot.
function DossierCardEmpty({ onClick }) {
  return (
    <button className="t-dossier-card is-empty" onClick={onClick}>
      <span className="t-dc-empty-icon">
        <span className="material-icons">add</span>
      </span>
      <span className="t-dc-empty-label">Krijo dosje të re</span>
    </button>
  );
}

Object.assign(window, { DossierCard, DossierCardEmpty });
