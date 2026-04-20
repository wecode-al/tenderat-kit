// Single-document row. Source: /Page-1/Dosje-Egzistuse document list.
function DocumentRow({ name, onMore, dashed }) {
  return (
    <div className={'t-doc-row' + (dashed ? ' is-dashed' : '')}>
      <div className="t-doc-tile">
        <span className="material-icons">description</span>
      </div>
      <span className="t-doc-name">{name}</span>
      {!dashed && (
        <button className="t-doc-kebab" onClick={onMore}>
          <span className="material-icons">more_vert</span>
        </button>
      )}
    </div>
  );
}
window.DocumentRow = DocumentRow;
