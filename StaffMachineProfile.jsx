// StaffProfile / MachineProfile — right-pane detail views shown when a person
// or a machine is clicked in the Company Profile tree.
//
// Uses the same cp-work shell (status header + documents list) as the PDF view,
// but swaps the viewer for a profile card.

const STAFF_DATA = {
  s1: {
    name: 'Morena Hoxha',
    position: 'Inxhiniere ndërtimi',
    avatarBg: '#6B4FB0',
    contractStart: '14 Janar 2024',
    contractEnd:   '14 Janar 2027',
    contractStatus: 'ok',         // ok | warn | expired
    qualifications: ['Inxhinier ndërtimi', 'Drejtues teknik', 'Koordinator sigurie'],
    status: 'ok',
    docs: [
      { key: 'licensa', label: 'Licenca e profesionit', file: 'Licensa_MH_2024.pdf', uploaded: '14 Jan 2024', expires: '14 Jan 2027', status: 'ok' },
      { key: 'diploma', label: 'Diploma',                file: 'Diploma_UPT.pdf',     uploaded: '14 Jan 2024', status: 'ok' },
      { key: 'kontrata', label: 'Kontrata e punës',      file: 'Kontrata_MH.pdf',     uploaded: '14 Jan 2024', status: 'ok' },
      { key: 'libreza', label: 'Libreza e punës',        file: 'Libreza_MH.pdf',      uploaded: '14 Jan 2024', status: 'ok' },
    ],
  },
  s2: {
    name: 'Meti Musaj',
    position: 'Web Designer',
    avatarBg: '#2E7DB5',
    contractStart: '03 Mars 2024',
    contractEnd:   '03 Mars 2026',
    contractStatus: 'warn',       // expiring soon
    contractExpiresIn: '12 ditë',
    qualifications: ['Teknik', 'Asistent administrativ'],
    status: 'warn',
    docs: [
      { key: 'licensa', label: 'Licenca e profesionit', file: 'Licensa_MM.pdf', uploaded: '03 Mar 2024', status: 'ok' },
      { key: 'diploma', label: 'Diploma',                file: 'Diploma_MM.pdf', uploaded: '03 Mar 2024', status: 'ok' },
      { key: 'kontrata', label: 'Kontrata e punës',      file: 'Kontrata_MM.pdf', uploaded: '03 Mar 2024', status: 'ok' },
      { key: 'libreza', label: 'Libreza e punës',        file: 'Libreza_MM.pdf', uploaded: '03 Mar 2024', status: 'ok' },
    ],
  },
  s3: {
    name: 'Elira Rama',
    position: 'Administrator',
    avatarBg: '#C5544B',
    contractStart: '22 Gusht 2022',
    contractEnd:   '22 Gusht 2025',
    contractStatus: 'expired',    // past validity
    qualifications: ['Administrator', 'Jurist'],
    status: 'warn',
    docs: [
      { key: 'licensa', label: 'Licenca e profesionit', file: 'Licensa_ER.pdf',  uploaded: '22 Gush 2023', expires: '22 Gush 2026', status: 'warn', expiresIn: '18 ditë' },
      { key: 'diploma', label: 'Diploma',                file: 'Diploma_ER.pdf',  uploaded: '22 Gush 2023', status: 'ok' },
      { key: 'kontrata', label: 'Kontrata e punës',      file: 'Kontrata_ER.pdf', uploaded: '22 Gush 2023', status: 'ok' },
      { key: 'libreza', label: 'Libreza e punës',        file: null,              status: 'missing' },
    ],
  },
};

const MACHINE_DATA = {
  m1: {
    name: 'Sprinter',
    type: 'Furgon',
    plate: 'AA953AP',
    vin:  'WVWZZZ1KZ5P047891',
    ownership: 'Në pronësi',
    status: 'ok',
    docs: [
      { key: 'sigurimi',   label: 'Sigurimi',           file: 'Sigurimi_2026.pdf',     uploaded: '10 Jan 2026', expires: '10 Jan 2027', status: 'ok' },
      { key: 'kontrolli',  label: 'Kontrolli teknik',   file: 'Kontrolli_2025.pdf',    uploaded: '15 Nën 2025', expires: '15 Nën 2026', status: 'ok' },
      { key: 'taksat',     label: 'Taksat',             file: 'Taksat_2026.pdf',       uploaded: '05 Jan 2026', status: 'ok' },
      { key: 'leja',       label: 'Leja e qarkullimit', file: 'Leja_qarkullimit.pdf',  uploaded: '12 Mar 2024', status: 'ok' },
      { key: 'tatimore',   label: 'Deklarata tatimore', file: 'Deklarata_2025.pdf',    uploaded: '28 Shk 2025', status: 'ok' },
    ],
  },
  m2: {
    name: 'Iveco Daily',
    type: 'Kamion',
    plate: 'AK-1120',
    vin:  'ZCFC1357005892134',
    ownership: 'Me qera',
    status: 'ok',
    docs: [
      { key: 'sigurimi',   label: 'Sigurimi',           file: 'Sigurimi_Iveco.pdf',   uploaded: '22 Dhj 2025', expires: '22 Dhj 2026', status: 'ok' },
      { key: 'kontrolli',  label: 'Kontrolli teknik',   file: 'Kontrolli_Iveco.pdf',  uploaded: '04 Sht 2025', expires: '04 Sht 2026', status: 'ok' },
      { key: 'taksat',     label: 'Taksat',             file: 'Taksat_Iveco.pdf',     uploaded: '15 Jan 2026', status: 'ok' },
      { key: 'leja',       label: 'Leja e qarkullimit', file: 'Leja_Iveco.pdf',       uploaded: '09 Pri 2023', status: 'ok' },
      { key: 'tatimore',   label: 'Deklarata tatimore', file: 'Deklarata_Iveco.pdf',  uploaded: '12 Mar 2025', status: 'ok' },
      { key: 'noteriale',  label: 'Kontrata noteriale', file: 'Kontrata_Iveco.pdf',   uploaded: '01 Qer 2024', expires: '01 Qer 2027', status: 'ok' },
    ],
  },
};

function initialsOf(name) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function DocStatusPill({ status, hint }) {
  const map = {
    ok:      { label: 'Në rregull',        cls: 'is-ok',      icon: 'check_circle' },
    warn:    { label: hint || 'Skadon',    cls: 'is-warn',    icon: 'schedule' },
    missing: { label: 'Mungon',            cls: 'is-missing', icon: 'error_outline' },
  };
  const s = map[status] || map.ok;
  return (
    <span className={'sp-doc-pill ' + s.cls}>
      <span className="material-icons">{s.icon}</span>
      {s.label}
    </span>
  );
}

function StaffProfile({ data, path = 'Stafi', onUpload }) {
  const ok = data.docs.filter((d) => d.status === 'ok').length;
  return (
    <section className="cp-work">
      <div className="sp-hero">
        <div className="sp-hero-main">
          <div className="sp-avatar" style={{ background: data.avatarBg }}>
            {initialsOf(data.name)}
          </div>
          <div className="sp-hero-text">
            <div className="sp-hero-path">
              <span className="material-icons">folder</span>
              Dokumenta teknik · {path}
            </div>
            <h1 className="sp-hero-title">{data.name}</h1>
            <div className="sp-hero-sub">
              <span>{data.position}</span>
              <span className="sp-dot" aria-hidden />
              <span>
                Kontratë: {data.contractStart} → {data.contractEnd}
              </span>
              {data.contractStatus === 'warn' && (
                <span className="sp-contract-pill is-warn">
                  <span className="material-icons">schedule</span>
                  Skadon për {data.contractExpiresIn}
                </span>
              )}
              {data.contractStatus === 'expired' && (
                <span className="sp-contract-pill is-expired">
                  <span className="material-icons">error</span>
                  Jashtë afatit
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="sp-hero-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">edit</span>
            Ndrysho profilin
          </button>
          <button className="cp-action">
            <span className="material-icons">download</span>
            Shkarko të gjitha
          </button>
        </div>
      </div>

      {data.contractStatus === 'expired' && (
        <div className="sp-alert is-expired">
          <span className="material-icons">error</span>
          <div>
            <strong>Kontrata e punës ka skaduar</strong>
            <span> — mbaroi më {data.contractEnd}. Ky staf nuk mund të përdoret në dosje derisa të rinovohet.</span>
          </div>
          <button className="sp-alert-action" onClick={onUpload}>Rinovo</button>
        </div>
      )}
      {data.contractStatus === 'warn' && (
        <div className="sp-alert is-warn">
          <span className="material-icons">schedule</span>
          <div>
            <strong>Kontrata skadon së shpejti</strong>
            <span> — deri në afatin {data.contractEnd} kanë mbetur {data.contractExpiresIn}.</span>
          </div>
          <button className="sp-alert-action" onClick={onUpload}>Rinovo</button>
        </div>
      )}

      <div className="sp-grid">
        <div className="sp-info-card">
          <div className="sp-info-head">
            <h2>Informacione</h2>
          </div>
          <dl className="sp-info-list">
            <div><dt>Pozicioni</dt><dd>{data.position}</dd></div>
            <div className={'sp-contract-row' + (data.contractStatus === 'expired' ? ' is-expired' : data.contractStatus === 'warn' ? ' is-warn' : '')}>
              <dt>Fillim kontrate</dt>
              <dd>{data.contractStart}</dd>
            </div>
            <div className={'sp-contract-row' + (data.contractStatus === 'expired' ? ' is-expired' : data.contractStatus === 'warn' ? ' is-warn' : '')}>
              <dt>Mbarim kontrate</dt>
              <dd>
                {data.contractEnd}
                {data.contractStatus === 'warn' && (
                  <span className="sp-contract-inline is-warn">
                    <span className="material-icons">schedule</span>
                    Skadon për {data.contractExpiresIn}
                  </span>
                )}
                {data.contractStatus === 'expired' && (
                  <span className="sp-contract-inline is-expired">
                    <span className="material-icons">error</span>
                    Jashtë afatit
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt>Kualifikimet</dt>
              <dd>
                <div className="sp-quals">
                  {data.qualifications.map((q) => (
                    <span key={q} className="sp-qual-pill">{q}</span>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </div>

        <div className="sp-docs-card">
          <div className="sp-info-head">
            <h2>Dokumentet</h2>
            <span className="sp-docs-count">{ok}/{data.docs.length} në rregull</span>
          </div>
          <div className="sp-docs-list">
            {data.docs.map((d) => (
              <div key={d.key} className={'sp-doc' + (d.status === 'missing' ? ' is-missing' : '')}>
                <div className={'sp-doc-icon is-' + d.status}>
                  <span className="material-icons">
                    {d.status === 'missing' ? 'upload_file' : 'description'}
                  </span>
                </div>
                <div className="sp-doc-main">
                  <div className="sp-doc-label">{d.label}</div>
                  {d.file
                    ? <div className="sp-doc-file">
                        <div className="sp-doc-file-name">{d.file}</div>
                        <div className="sp-doc-file-meta">
                          <span>Ngarkuar {d.uploaded}</span>
                          {d.expires && <span className={'sp-doc-expire' + (d.status === 'warn' ? ' is-warn' : '')}>Skadon {d.expires}</span>}
                        </div>
                      </div>
                    : <div className="sp-doc-file is-missing">Ende i pangarkuar</div>}
                </div>
                <DocStatusPill status={d.status} hint={d.expiresIn} />
                <div className="sp-doc-actions">
                  {d.file
                    ? <>
                        <button className="sp-doc-iconbtn" title="Shiko"><span className="material-icons">visibility</span></button>
                        <button className="sp-doc-iconbtn" title="Shkarko"><span className="material-icons">download</span></button>
                      </>
                    : <button className="sp-doc-iconbtn is-primary" title="Ngarko"><span className="material-icons">upload</span></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MachineProfile({ data, path = 'Makineritë', onUpload }) {
  const ok = data.docs.filter((d) => d.status === 'ok').length;
  return (
    <section className="cp-work">
      <div className="sp-hero">
        <div className="sp-hero-main">
          <div className="sp-avatar sp-avatar-machine" aria-hidden>
            <span className="material-icons">local_shipping</span>
          </div>
          <div className="sp-hero-text">
            <div className="sp-hero-path">
              <span className="material-icons">folder</span>
              Dokumenta teknik · {path}
            </div>
            <h1 className="sp-hero-title">{data.name}</h1>
            <div className="sp-hero-sub">
              <span>{data.type}</span>
              <span className="sp-dot" aria-hidden />
              <span>Targa {data.plate}</span>
              <span className="sp-dot" aria-hidden />
              <span className={'sp-ownership' + (data.ownership === 'Me qera' ? ' is-rent' : '')}>
                {data.ownership}
              </span>
            </div>
          </div>
        </div>
        <div className="sp-hero-actions">
          <button className="cp-action is-primary" onClick={onUpload}>
            <span className="material-icons">edit</span>
            Ndrysho profilin
          </button>
          <button className="cp-action">
            <span className="material-icons">download</span>
            Shkarko të gjitha
          </button>
        </div>
      </div>

      <div className="sp-grid">
        <div className="sp-info-card">
          <div className="sp-info-head">
            <h2>Specifikimet</h2>
          </div>
          <dl className="sp-info-list">
            <div><dt>Emri</dt><dd>{data.name}</dd></div>
            <div><dt>Lloji i mjetit</dt><dd>{data.type}</dd></div>
            <div><dt>Targa</dt><dd className="sp-mono">{data.plate}</dd></div>
            <div><dt>Nr. shasie</dt><dd className="sp-mono">{data.vin}</dd></div>
            <div><dt>Statusi</dt><dd>{data.ownership}</dd></div>
          </dl>
        </div>

        <div className="sp-docs-card">
          <div className="sp-info-head">
            <h2>Dokumentet</h2>
            <span className="sp-docs-count">{ok}/{data.docs.length} në rregull</span>
          </div>
          <div className="sp-docs-list">
            {data.docs.map((d) => (
              <div key={d.key} className={'sp-doc' + (d.status === 'missing' ? ' is-missing' : '')}>
                <div className={'sp-doc-icon is-' + d.status}>
                  <span className="material-icons">
                    {d.status === 'missing' ? 'upload_file' : 'description'}
                  </span>
                </div>
                <div className="sp-doc-main">
                  <div className="sp-doc-label">{d.label}</div>
                  {d.file
                    ? <div className="sp-doc-file">
                        <div className="sp-doc-file-name">{d.file}</div>
                        <div className="sp-doc-file-meta">
                          <span>Ngarkuar {d.uploaded}</span>
                          {d.expires && <span className={'sp-doc-expire' + (d.status === 'warn' ? ' is-warn' : '')}>Skadon {d.expires}</span>}
                        </div>
                      </div>
                    : <div className="sp-doc-file is-missing">Ende i pangarkuar</div>}
                </div>
                <DocStatusPill status={d.status} hint={d.expiresIn} />
                <div className="sp-doc-actions">
                  {d.file
                    ? <>
                        <button className="sp-doc-iconbtn" title="Shiko"><span className="material-icons">visibility</span></button>
                        <button className="sp-doc-iconbtn" title="Shkarko"><span className="material-icons">download</span></button>
                      </>
                    : <button className="sp-doc-iconbtn is-primary" title="Ngarko"><span className="material-icons">upload</span></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.StaffProfile = StaffProfile;
window.MachineProfile = MachineProfile;
window.STAFF_DATA = STAFF_DATA;
window.MACHINE_DATA = MACHINE_DATA;

// Mutators used by the Krijo-dosje vete-deklarim flow to persist inline-created
// entries back to the company profile. Payload shape matches the STAFF_DATA /
// MACHINE_DATA entries; caller is responsible for picking an id (e.g. 's_' + Date.now()).
window.addStaffToProfile = function (id, entry) {
  STAFF_DATA[id] = entry;
  return id;
};
window.addMachineToProfile = function (id, entry) {
  MACHINE_DATA[id] = entry;
  return id;
};
