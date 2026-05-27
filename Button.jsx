// Buttons — three variants, all from /Page-1/*.
// 1) <MuiButton> — filled orange, Roboto Medium 15, 4px radius, MUI elevation-1.
//    Used for: "Krijo Dosje të re", "Shkarko Dosjen", "Ndrysho Dosjen", "Plotëso profilin e kompanise".
// 2) <PrimaryButton> — filled orange, Inter 700, uppercase 14, 8px radius, flat.
//    Used for: the login "IDENTIFIKOHU" button.
// 3) <OutlineButton> — white surface, 1px border, Inter 500.
function MuiButton({ icon, children, onClick, variant = 'primary', disabled = false, title }) {
  const bg = variant === 'danger' ? '#C62828' : '#FF8400';
  return (
    <button
      className={'t-btn-mui' + (disabled ? ' is-disabled' : '')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{ background: disabled ? '#D8D8D8' : bg, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {icon && <span className="material-icons">{icon}</span>}
      {children}
    </button>
  );
}
function PrimaryButton({ children, onClick, type }) {
  return (
    <button type={type} className="t-btn-primary" onClick={onClick}>
      {children}
    </button>
  );
}
function OutlineButton({ icon, children, onClick }) {
  return (
    <button className="t-btn-outline" onClick={onClick}>
      {icon && <span className="material-icons">{icon}</span>}
      {children}
    </button>
  );
}
Object.assign(window, { MuiButton, PrimaryButton, OutlineButton });
