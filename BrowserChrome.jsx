// Browser chrome mock — the /Page-1 frames all sit inside a fake browser tab
// with url "app.tenderat.al/<path>". We don't literally reproduce the Figma's
// browser component (lots of decoration); instead a calm tab + address bar.
function BrowserChrome({ path, children }) {
  return (
    <div className="t-browser">
      <div className="t-browser-bar">
        <div className="t-browser-dots">
          <span className="t-dot t-dot-r" />
          <span className="t-dot t-dot-y" />
          <span className="t-dot t-dot-g" />
        </div>
        <div className="t-browser-tab">
          <span className="material-icons">public</span>
          Tenderat
        </div>
      </div>
      <div className="t-browser-url">
        <button className="t-browser-nav"><span className="material-icons">arrow_back</span></button>
        <button className="t-browser-nav"><span className="material-icons">arrow_forward</span></button>
        <button className="t-browser-nav"><span className="material-icons">refresh</span></button>
        <div className="t-browser-address">
          <span className="material-icons" style={{ fontSize: 16, color: '#6B7280' }}>lock</span>
          <span>app.tenderat.al</span>
          <span style={{ color: '#6B7280' }}>{path}</span>
        </div>
      </div>
      <div className="t-browser-body">{children}</div>
    </div>
  );
}
window.BrowserChrome = BrowserChrome;
