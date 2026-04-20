// Labelled input field with a leading Material icon.
// Source: /Page-1/Login/index.jsx NIPT + Password fields.
function Field({ label, icon, type = 'text', placeholder, value, onChange, trailingIcon }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label className="t-field">
      <span className="t-field-label">{label}</span>
      <div className={'t-field-input' + (focus ? ' is-focus' : '')}>
        {icon && <span className="material-icons t-field-lead">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        {trailingIcon && <span className="material-icons t-field-trail">{trailingIcon}</span>}
      </div>
    </label>
  );
}
window.Field = Field;
