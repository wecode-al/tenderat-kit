// Top app header — logo, nav, notifications bell, user.
function AppHeader({ active = 'dosjet', onNav }) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const userRef = React.useRef(null);
  const notifRef = React.useRef(null);

  React.useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [userMenuOpen]);

  React.useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [notifOpen]);

  const chip = (key, icon, label) => {
    const on = active === key;
    return (
      <button
        key={key}
        onClick={() => onNav && onNav(key)}
        className={'t-nav-chip' + (on ? ' is-active' : '')}>
        <span className="material-icons">{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className="t-header" style={{ borderRadius: '10px' }}>
      <div className="t-header-inner">
        <div className="t-header-left">
          <div className="t-logo">
            <span className="t-logo-mark" aria-hidden>T</span>
            <span className="t-logo-word">Tenderat</span>
          </div>
          <nav className="t-nav">
            {chip('dosjet', 'folder_open', 'Dosjet e mia')}
            {chip('profili', 'business', 'Profili i kompanisë')}
          </nav>
        </div>

        <div className="t-header-right">
          <div className="t-notif" ref={notifRef}>
            <button
              className={'t-icon-btn t-bell' + (notifOpen ? ' is-open' : '')}
              aria-label="Njoftime"
              onClick={() => setNotifOpen(v => !v)}>
              <span className="material-icons">notifications_none</span>
              <span className="t-bell-dot" />
            </button>
            {notifOpen && (
              <div className="t-notif-menu" role="menu">
                <div className="t-notif-head">
                  <span className="t-notif-title">Njoftime</span>
                  <button className="t-notif-markall">Shëno të gjitha si të lexuara</button>
                </div>
                <div className="t-notif-list">
                  <div className="t-notif-item is-unread">
                    <span className="t-notif-icon is-warn"><span className="material-icons">schedule</span></span>
                    <div className="t-notif-body">
                      <div className="t-notif-text"><strong>Afati i dosjes afron</strong> — Ndërtimi i rrugës rurale — Loti 4 mbyllet për 4 ditë.</div>
                      <div className="t-notif-time">Sot, 09:12</div>
                    </div>
                  </div>
                  <div className="t-notif-item is-unread">
                    <span className="t-notif-icon is-ok"><span className="material-icons">task_alt</span></span>
                    <div className="t-notif-body">
                      <div className="t-notif-text"><strong>Dosja u dorëzua</strong> — Mirëmbajtje ambienti dhe gjelbërim u regjistrua me sukses.</div>
                      <div className="t-notif-time">Dje, 16:04</div>
                    </div>
                  </div>
                  <div className="t-notif-item">
                    <span className="t-notif-icon is-info"><span className="material-icons">description</span></span>
                    <div className="t-notif-body">
                      <div className="t-notif-text"><strong>Dokument i ri i kërkuar</strong> — Furnizim pajisje ZK kërkon certifikatë ISO 9001.</div>
                      <div className="t-notif-time">2 ditë më parë</div>
                    </div>
                  </div>
                  <div className="t-notif-item">
                    <span className="t-notif-icon is-info"><span className="material-icons">update</span></span>
                    <div className="t-notif-body">
                      <div className="t-notif-text"><strong>Licenca e kompanisë</strong> skadon pas 21 ditësh. Rinovo në kohë.</div>
                      <div className="t-notif-time">3 ditë më parë</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="t-user" ref={userRef}>
            <button
              className={'t-user-btn' + (userMenuOpen ? ' is-open' : '')}
              onClick={() => setUserMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}>
              <span className="t-avatar">OP</span>
              <span className="t-user-meta">
                <span className="t-user-name">Ornela P.</span>
                <span className="t-user-role">Administrator</span>
              </span>
              <span className="material-icons t-user-caret">expand_more</span>
            </button>
            {userMenuOpen && (
              <div className="t-user-menu" role="menu">
                <div className="t-user-menu-head">
                  <span className="t-avatar t-avatar-lg">OP</span>
                  <div>
                    <div className="t-user-menu-name">Ornela Prifti</div>
                    <div className="t-user-menu-email">ornela@kompania.al</div>
                  </div>
                </div>
                <button className="t-user-menu-item">
                  <span className="material-icons">workspace_premium</span>
                  <div className="t-user-menu-item-body">
                    <span>Paketa ime</span>
                    <span className="t-user-menu-item-sub">Pro · 48 dosje/muaj</span>
                  </div>
                  <span className="t-user-menu-badge">Pro</span>
                </button>
                <button className="t-user-menu-item">
                  <span className="material-icons">credit_card</span>
                  <div className="t-user-menu-item-body">
                    <span>Pagesa & faturim</span>
                    <span className="t-user-menu-item-sub">Fatura e radhës: 15 Maj</span>
                  </div>
                </button>
                <div className="t-user-menu-sep" />
                <button className="t-user-menu-item">
                  <span className="material-icons">settings</span>
                  Cilësimet
                </button>
                <button className="t-user-menu-item">
                  <span className="material-icons">help_outline</span>
                  Ndihmë
                </button>
                <div className="t-user-menu-sep" />
                <button className="t-user-menu-item is-signout">
                  <span className="material-icons">logout</span>
                  Dil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
window.AppHeader = AppHeader;
