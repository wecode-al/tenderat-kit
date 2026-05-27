/*
 * assignPreventiv.js — motori i caktimit të zërave të preventivit te partnerët
 * e një Bashkimi Operatorësh Ekonomikë.
 *
 * I PASTËR nga React me qëllim: e gjithë logjika është funksione të thjeshta që
 * marrin të dhëna dhe kthejnë të dhëna. Kështu `assignPreventivToPartners` mund
 * të zëvendësohet nesër me një thirrje reale API (p.sh. `await fetch('/api/assign')`)
 * pa prekur asnjë komponent UI — UI-ja thërret vetëm këtë funksion.
 *
 * Eksportohet në `window` sepse prototipi ngarkohet me <script type="text/babel">
 * (React UMD + Babel standalone), pa modules ES — i njëjti model si komponentët.
 */
(function () {
  'use strict';

  // ---- Harta e fjalë-çelësave: term në preventiv → tag aftësie/burimi ----
  // Çelësat janë rrënjë fjalësh (pa diakritikë specifikë) që kërkohen brenda
  // `emertimi`/`kodi` të zërit. Vlerat janë tagje që krahasohen me profilin e
  // aftësive të partnerit (nxjerrë nga stafi + makineritë e tij).
  var KEYWORD_MAP = [
    { terms: ['germim', 'gërmim', 'dhe', 'hapje', 'mbushje', 'sistemim toke'], tag: 'ekskavator' },
    { terms: ['transport', 'largim', 'shkarkim', 'bartje'],                    tag: 'transport' },
    { terms: ['beton', 'b/a', 'arme', 'shtres', 'kalldrem', 'asfalt'],         tag: 'beton' },
    { terms: ['hekur', 'metal', 'salduar', 'saldim', 'konstruksion'],          tag: 'metalurgji' },
    { terms: ['elektrik', 'kabllo', 'linj', 'kv', 'tension', 'ndricim'],       tag: 'elektrike' },
    { terms: ['ujesjell', 'kanalizim', 'tubacion', 'hidro', 'pompe'],          tag: 'hidraulike' },
    { terms: ['suvatim', 'bojatisje', 'lyerje', 'rifinitur', 'gips'],          tag: 'rifinitura' },
    { terms: ['gjeolog', 'sizmik', 'studim', 'projektim', 'raport', 'topograf', 'mbikqyrje'], tag: 'inxhinieri' },
  ];

  // Fjalë-çelësa që lidhin profilin e STAFIT (pozicion/kualifikim) me tagje.
  var STAFF_TAGS = [
    { terms: ['ndertimi', 'civil', 'kantier'],            tags: ['ekskavator', 'beton'] },
    { terms: ['gjeolog', 'gjeoteknik'],                   tags: ['inxhinieri'] },
    { terms: ['topograf', 'gjeodet'],                     tags: ['inxhinieri'] },
    { terms: ['elektrik', 'energjetik'],                  tags: ['elektrike'] },
    { terms: ['hidro', 'mjedis'],                         tags: ['hidraulike'] },
    { terms: ['mekanik', 'makineri'],                     tags: ['transport', 'ekskavator'] },
    { terms: ['saldator', 'metalurg', 'konstruktor'],     tags: ['metalurgji'] },
    { terms: ['arkitekt', 'projektues'],                  tags: ['inxhinieri', 'rifinitura'] },
  ];

  // Fjalë-çelësa që lidhin profilin e MAKINERIVE (emër/tip) me tagje.
  var MACHINE_TAGS = [
    { terms: ['ekskavator', 'fadrom', 'buldozer', 'rrul'],          tags: ['ekskavator'] },
    { terms: ['kamion', 'autobot', 'rimork', 'furgon', 'kamioncin'],tags: ['transport'] },
    { terms: ['betoniere', 'beton', 'pompe betoni'],                tags: ['beton'] },
    { terms: ['vinc', 'kran'],                                      tags: ['metalurgji', 'beton'] },
    { terms: ['gjenerator', 'sald'],                                tags: ['elektrike', 'metalurgji'] },
  ];

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase();
  }

  function anyTermIn(haystack, terms) {
    for (var i = 0; i < terms.length; i++) {
      if (haystack.indexOf(terms[i]) !== -1) return true;
    }
    return false;
  }

  // ---- Profili i aftësive të një partneri ----
  // Lexon `partner.capacities.staff[]` + `partner.capacities.machinery[]` dhe
  // kthen një set tagjesh (objekt {tag:true}). Stafi/makineritë mund të jenë
  // objekte me fusha të ndryshme; bashkojmë çdo vlerë tekstuale për kërkim.
  function textOf(item) {
    if (item == null) return '';
    if (typeof item === 'string') return norm(item);
    var parts = [];
    for (var k in item) {
      if (!Object.prototype.hasOwnProperty.call(item, k)) continue;
      var v = item[k];
      if (typeof v === 'string') parts.push(v);
      else if (Array.isArray(v)) parts.push(v.join(' '));
    }
    return norm(parts.join(' '));
  }

  function buildPartnerSkillProfile(partner) {
    var tags = {};
    var caps = (partner && partner.capacities) || {};
    var staff = Array.isArray(caps.staff) ? caps.staff : [];
    var machinery = Array.isArray(caps.machinery) ? caps.machinery : [];

    staff.forEach(function (s) {
      var t = textOf(s);
      STAFF_TAGS.forEach(function (rule) {
        if (anyTermIn(t, rule.terms)) rule.tags.forEach(function (tg) { tags[tg] = true; });
      });
    });
    machinery.forEach(function (m) {
      var t = textOf(m);
      MACHINE_TAGS.forEach(function (rule) {
        if (anyTermIn(t, rule.terms)) rule.tags.forEach(function (tg) { tags[tg] = true; });
      });
    });
    return tags;
  }

  // ---- Tagjet që kërkon një zë preventivi ----
  function rowTags(row) {
    var hay = norm(row.emertimi) + ' ' + norm(row.kodi);
    var out = [];
    KEYWORD_MAP.forEach(function (rule) {
      if (anyTermIn(hay, rule.terms)) out.push(rule.tag);
    });
    return out;
  }

  function partnerLabel(p) {
    return (p && (p.name || (p.isSelf ? 'Kompania ime' : 'Partneri'))) || 'Partneri';
  }

  // Vlera e një zëri (për balancim). Pa çmim → 0, që zërat pa çmim të mos
  // shtrembërojnë balancimin para se useri t'i plotësojë.
  function rowValue(row) {
    var v = Number(row.vlefta);
    return isFinite(v) && v > 0 ? v : 0;
  }

  /*
   * assignPreventivToPartners(rows, partners)
   *   rows     — stream-i i preventivit (sections + rows), si te flattenPreventivi.
   *   partners — form.consortium.partners[] ({id, name, percent, isSelf, capacities}).
   * Kthen një kopje të re të `rows` ku çdo zë (type:'row') merr fushën `assignment`.
   *
   * Hapat:
   *   A. Ndërto profilin e aftësive për çdo partner.
   *   B. Cakto çdo zë partnerit me përputhjen më të fortë sipas tagjeve; nëse
   *      asnjë përputhje, lëre të pa-caktuar përkohësisht.
   *   C. Balancim me %: shpërndaj zërat e pa-caktuar dhe rishpërndaj disa zëra
   *      kufitarë që Σ-vlera për partner t'i afrohet përqindjes së deklaruar.
   *
   * Ruan caktimet që useri ka prekur dorazi (assignment.by === 'user').
   */
  function assignPreventivToPartners(rows, partners) {
    if (!Array.isArray(rows)) return rows;
    var ps = (partners || []).filter(function (p) { return p && p.id; });
    if (ps.length < 2) {
      // Pa bashkim real (0/1 partner) — hiq çdo caktim ekzistues.
      return rows.map(function (r) {
        if (r.type !== 'row') return r;
        var c = Object.assign({}, r);
        delete c.assignment;
        return c;
      });
    }

    var profiles = ps.map(buildPartnerSkillProfile);
    var declared = ps.map(function (p) {
      var n = parseFloat(p.percent);
      return isFinite(n) ? n : 0;
    });
    var declaredSum = declared.reduce(function (a, b) { return a + b; }, 0);
    // Nëse përqindjet s'janë plotësuar, ndaji në mënyrë të barabartë.
    if (declaredSum <= 0) declared = ps.map(function () { return 100 / ps.length; });

    // Indeksi i partnerit me % më të madhe — fallback default.
    var topIdx = 0;
    for (var i = 1; i < declared.length; i++) if (declared[i] > declared[topIdx]) topIdx = i;

    // --- Hapi B: caktim fillestar sipas aftësive ---
    var dataRows = rows.filter(function (r) { return r.type === 'row'; });
    var initial = new Map(); // rowId -> { partnerIdx, reason, matched }

    dataRows.forEach(function (row) {
      // Ruaj çdo caktim manual të userit.
      if (row.assignment && row.assignment.by === 'user') {
        initial.set(row.id, { kept: true });
        return;
      }
      var tags = rowTags(row);
      var best = -1, bestScore = 0, matchedTag = null;
      for (var pi = 0; pi < ps.length; pi++) {
        var score = 0, mt = null;
        tags.forEach(function (tg) { if (profiles[pi][tg]) { score += 1; if (!mt) mt = tg; } });
        if (score > bestScore) { bestScore = score; best = pi; matchedTag = mt; }
      }
      if (best >= 0) {
        initial.set(row.id, {
          partnerIdx: best,
          matched: true,
          reason: 'Përmban "' + (matchedTag || 'punë') + '" → përputhet me kapacitetet e ' + partnerLabel(ps[best]) + '.',
        });
      } else {
        initial.set(row.id, { partnerIdx: null, matched: false, reason: null });
      }
    });

    // --- Hapi C: balancim me % ---
    // Vlera totale e shpërndarë (vetëm zërat e caktuar me aftësi) për partner.
    var totalValue = 0;
    dataRows.forEach(function (r) { totalValue += rowValue(r); });
    var targetValue = declared.map(function (d) { return totalValue * (d / (declaredSum > 0 ? declaredSum : 100)); });
    var current = ps.map(function () { return 0; });

    // Akumulo të caktuarit.
    dataRows.forEach(function (row) {
      var info = initial.get(row.id);
      if (info && info.kept) {
        // Caktim manual ekzistues — numëroje në balancë.
        (row.assignment.allocations || []).forEach(function (a) {
          var idx = ps.findIndex(function (p) { return p.id === a.partnerId; });
          if (idx >= 0) current[idx] += rowValue(row) * (Number(a.percent) || 0) / 100;
        });
        return;
      }
      if (info && info.matched) current[info.partnerIdx] += rowValue(row);
    });

    // Cakto zërat pa përputhje partnerit që është më larg objektivit (më pak i mbushur).
    var unassigned = dataRows.filter(function (r) {
      var info = initial.get(r.id);
      return info && !info.kept && !info.matched;
    });
    // Më të mëdhenjtë në vlerë fillimisht, që balancimi të jetë më efektiv.
    unassigned.sort(function (a, b) { return rowValue(b) - rowValue(a); });
    unassigned.forEach(function (row) {
      var pick = topIdx, biggestGap = -Infinity;
      for (var pi = 0; pi < ps.length; pi++) {
        var gap = targetValue[pi] - current[pi];
        if (gap > biggestGap) { biggestGap = gap; pick = pi; }
      }
      var info = initial.get(row.id);
      info.partnerIdx = pick;
      info.reason = 'Caktuar te ' + partnerLabel(ps[pick]) + ' për të balancuar përqindjen e deklaruar (' + Math.round(declared[pick]) + '%).';
      current[pick] += rowValue(row);
    });

    // --- Ndërto rezultatin ---
    return rows.map(function (r) {
      if (r.type !== 'row') return r;
      var info = initial.get(r.id);
      if (info && info.kept) return r; // pa ndryshim — caktim i userit
      var idx = (info && info.partnerIdx != null) ? info.partnerIdx : topIdx;
      var reason = (info && info.reason) ||
        ('Caktuar te ' + partnerLabel(ps[idx]) + ' (partneri kryesor).');
      return Object.assign({}, r, {
        assignment: {
          mode: 'single',
          allocations: [{ partnerId: ps[idx].id, percent: 100 }],
          by: 'ai',
          reason: reason,
        },
      });
    });
  }

  // ---- Zërat pa çmim (për validimin hard) ----
  // Kthen zërat type:'row' që s'kanë çmim të vlefshëm. Zërat e shenuar me qëllim
  // si "falas" (cmimi === 0 me match 'manual') NUK numërohen si pengesë.
  function unpricedRows(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.filter(function (r) {
      if (r.type !== 'row') return false;
      if (r.match === 'manual' && Number(r.cmimi) === 0) return false; // 0 i qëllimshëm
      return r.cmimi == null || r.cmimi === '' || !(Number(r.cmimi) > 0);
    });
  }

  // ---- Përmbledhje e balancës aktuale për banner ----
  // Kthen [{ partnerId, name, percent (deklaruar), value, sharePct (aktuale) }].
  function partnerBalance(rows, partners) {
    var ps = (partners || []).filter(function (p) { return p && p.id; });
    var byId = {};
    ps.forEach(function (p) { byId[p.id] = { partnerId: p.id, name: partnerLabel(p), percent: parseFloat(p.percent) || 0, value: 0 }; });
    var total = 0;
    (rows || []).forEach(function (r) {
      if (r.type !== 'row') return;
      var v = rowValue(r);
      total += v;
      var alloc = (r.assignment && r.assignment.allocations) || [];
      if (!alloc.length) return;
      alloc.forEach(function (a) {
        if (byId[a.partnerId]) byId[a.partnerId].value += v * (Number(a.percent) || 0) / 100;
      });
    });
    return ps.map(function (p) {
      var b = byId[p.id];
      b.sharePct = total > 0 ? Math.round((b.value / total) * 100) : 0;
      return b;
    });
  }

  window.assignPreventivToPartners = assignPreventivToPartners;
  window.buildPartnerSkillProfile = buildPartnerSkillProfile;
  window.unpricedRows = unpricedRows;
  window.partnerBalance = partnerBalance;
})();
