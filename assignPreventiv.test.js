// Test i shpejtë Node për motorin assignPreventiv.js (pa test-runner; node assignPreventiv.test.js).
// Ngarkon IIFE-në me një `window` fals dhe verifikon caktimet + balancimin.
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync(__dirname + '/assignPreventiv.js', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const { assignPreventivToPartners, unpricedRows, partnerBalance, buildPartnerSkillProfile } = sandbox.window;

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } }

// --- Partnerët: Albkons 20% (ekskavator/transport), Tjetra 80% (inxhinier/elektrike) ---
const partners = [
  { id: 'self', name: 'Albkons SH.P.K.', isSelf: true, percent: '20', capacities: {
    staff: [{ name: 'Ardit B.', position: 'Mekanik makinerish' }],
    machinery: [{ name: 'Ekskavator CAT', type: 'Ekskavator' }, { name: 'Kamion', type: 'Kamion' }],
  } },
  { id: 'p2', name: 'Energo SH.P.K.', isSelf: false, percent: '80', capacities: {
    staff: [{ name: 'Eva K.', position: 'Inxhiniere elektrike energjetik' },
            { name: 'Geo G.', position: 'Inxhinier gjeolog' }],
    machinery: [{ name: 'Gjenerator', type: 'Gjenerator' }],
  } },
];

// --- Rresta preventivi (me vlera për balancim) ---
const rows = [
  { type: 'section', id: 's1', nr: 1, title: 'PUNIME PARAPRAKE' },
  { type: 'row', id: 's1-r1', sectionId: 's1', nr: 1, kodi: '3.89/a', emertimi: 'Germim dheu me ekskavator', njesia: 'm3', sasia: 100, cmimi: 50, vlefta: 5000, match: 'auto' },
  { type: 'row', id: 's1-r2', sectionId: 's1', nr: 2, kodi: '1.2', emertimi: 'Transport materialesh me kamion', njesia: 'm3', sasia: 100, cmimi: 20, vlefta: 2000, match: 'auto' },
  { type: 'row', id: 's1-r3', sectionId: 's1', nr: 3, kodi: 'x.1', emertimi: 'Linje elektrike 35kV ndricim', njesia: 'ml', sasia: 100, cmimi: 80, vlefta: 8000, match: 'auto' },
  { type: 'row', id: 's1-r4', sectionId: 's1', nr: 4, kodi: 'kontr', emertimi: 'Raporti gjeologjik, studimi sizmik i tokes', njesia: 'lot', sasia: 1, cmimi: null, vlefta: null, match: 'none' },
];

console.log('Test 1 — profili i aftësive');
const prof0 = buildPartnerSkillProfile(partners[0]);
const prof1 = buildPartnerSkillProfile(partners[1]);
ok('Albkons ka tag ekskavator', !!prof0.ekskavator);
ok('Albkons ka tag transport', !!prof0.transport);
ok('Energo ka tag elektrike', !!prof1.elektrike);
ok('Energo ka tag inxhinieri (gjeolog)', !!prof1.inxhinieri);

console.log('Test 2 — caktimi sipas aftësive');
const out = assignPreventivToPartners(rows, partners);
const byId = Object.fromEntries(out.filter(r => r.type === 'row').map(r => [r.id, r]));
ok('Germim → Albkons (self)', byId['s1-r1'].assignment.allocations[0].partnerId === 'self');
ok('Transport → Albkons (self)', byId['s1-r2'].assignment.allocations[0].partnerId === 'self');
ok('Linje elektrike → Energo (p2)', byId['s1-r3'].assignment.allocations[0].partnerId === 'p2');
ok('Raporti gjeologjik → Energo (p2, inxhinieri)', byId['s1-r4'].assignment.allocations[0].partnerId === 'p2');
ok('Çdo zë ka by:ai', out.filter(r => r.type === 'row').every(r => r.assignment.by === 'ai'));
ok('Çdo zë ka reason jo bosh', out.filter(r => r.type === 'row').every(r => r.assignment.reason && r.assignment.reason.length > 5));

console.log('Test 3 — ruajtja e caktimit manual të userit');
const withUser = out.map(r => r.id === 's1-r1'
  ? Object.assign({}, r, { assignment: { mode: 'single', allocations: [{ partnerId: 'p2', percent: 100 }], by: 'user', reason: 'manual' } })
  : r);
const out2 = assignPreventivToPartners(withUser, partners);
const r1after = out2.find(r => r.id === 's1-r1');
ok('Caktimi i userit ruhet', r1after.assignment.by === 'user' && r1after.assignment.allocations[0].partnerId === 'p2');

console.log('Test 4 — unpricedRows');
const unp = unpricedRows(rows);
ok('Vetëm 1 zë pa çmim', unp.length === 1 && unp[0].id === 's1-r4');
const withZero = rows.map(r => r.id === 's1-r4' ? Object.assign({}, r, { cmimi: 0, match: 'manual' }) : r);
ok('Çmim 0 i qëllimshëm (manual) nuk numërohet', unpricedRows(withZero).length === 0);

console.log('Test 5 — partnerBalance');
const bal = partnerBalance(out, partners);
const self = bal.find(b => b.partnerId === 'self');
const p2 = bal.find(b => b.partnerId === 'p2');
ok('Balanca përmban të dy partnerët', !!self && !!p2);
ok('Përqindjet aktuale mblidhen ~100', Math.abs(self.sharePct + p2.sharePct - 100) <= 1);

console.log('Test 6 — pa bashkim (1 partner) heq caktimet');
const single = assignPreventivToPartners(out, [partners[0]]);
ok('Caktimet hiqen kur < 2 partnerë', single.filter(r => r.type === 'row').every(r => !r.assignment));

console.log('\n' + pass + ' kaluan, ' + fail + ' dështuan.');
process.exit(fail ? 1 : 0);
