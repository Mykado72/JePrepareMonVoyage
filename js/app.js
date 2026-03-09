/* ============================================================
   JE PRÉPARE MON VOYAGE – app.js  (v2)
   ============================================================ */

// ── STATE ──────────────────────────────────────────────────
let state = {
  trips: [],
  currentTripId: null,
  currentPage: 'infos',
};

// ── PERSISTENCE ────────────────────────────────────────────
function save() {
  localStorage.setItem('jpmv_state', JSON.stringify(state));
}
function load() {
  try {
    const raw = localStorage.getItem('jpmv_state');
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch(e) { console.warn('Load error', e); }
}

// ── CURRENT TRIP ───────────────────────────────────────────
function currentTrip() {
  return state.trips.find(t => t.id === state.currentTripId) || null;
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── TOAST ──────────────────────────────────────────────────
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' ' + type : '');
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(function() { el.style.display = 'none'; }, 3000);
}

// ── UTILS ──────────────────────────────────────────────────
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
  if (!d) return '';
  var parts = d.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}
function nbNuits(d1, d2) {
  if (!d1 || !d2) return 0;
  return Math.max(0, Math.round((new Date(d2) - new Date(d1)) / 86400000));
}
function fmt(n) {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── TRIPS MANAGEMENT ───────────────────────────────────────
function newTrip() {
  closeDropdown();
  document.getElementById('newTripName').value = '';
  openModal('modalNewTrip');
  setTimeout(function() { document.getElementById('newTripName').focus(); }, 100);
}

function confirmNewTrip() {
  var name = document.getElementById('newTripName').value.trim();
  if (!name) { toast('Donnez un nom au voyage', 'error'); return; }
  var trip = {
    id: genId(), name: name,
    infos: {},
    checklist: [],
    bagages: defaultBagages(),
    lieux: [],
    depenses: []
  };
  state.trips.push(trip);
  state.currentTripId = trip.id;
  save();
  closeModal('modalNewTrip');
  renderTripSelector();
  loadCurrentTrip();
  toast('✈️ Voyage créé !', 'success');
}

function selectTrip(id) {
  state.currentTripId = id;
  save();
  closeDropdown();
  renderTripSelector();
  loadCurrentTrip();
}

function deleteTrip(id, e) {
  e.stopPropagation();
  if (!confirm('Supprimer ce voyage et toutes ses données ?')) return;
  state.trips = state.trips.filter(function(t) { return t.id !== id; });
  if (state.currentTripId === id) state.currentTripId = state.trips[0] ? state.trips[0].id : null;
  save();
  renderTripSelector();
  loadCurrentTrip();
}

function toggleTripDropdown() {
  var dd = document.getElementById('tripDropdown');
  var hidden = dd.style.display === 'none' || dd.style.display === '';
  dd.style.display = hidden ? 'block' : 'none';
  if (hidden) renderTripList();
}

function closeDropdown() {
  document.getElementById('tripDropdown').style.display = 'none';
}

function renderTripList() {
  var container = document.getElementById('tripList');
  if (!state.trips.length) {
    container.innerHTML = '<div style="padding:10px 14px;font-size:0.85rem;color:var(--text3)">Aucun voyage</div>';
    return;
  }
  container.innerHTML = state.trips.map(function(t) {
    return '<div class="trip-option' + (t.id === state.currentTripId ? ' active' : '') + '" onclick="selectTrip(\'' + t.id + '\')">' +
      '<span>✈️ ' + escHtml(t.name) + '</span>' +
      '<span class="trip-option-del" onclick="deleteTrip(\'' + t.id + '\',event)">✕</span>' +
      '</div>';
  }).join('');
}

function renderTripSelector() {
  var trip = currentTrip();
  document.getElementById('tripCurrentLabel').textContent = trip ? trip.name : 'Aucun voyage';
}

// ── NAVIGATION ─────────────────────────────────────────────
var PAGE_TITLES = {
  infos: '🗺️ Infos voyage', checklist: '✅ Checklist',
  bagages: '🧳 Bagages', documents: '📄 Documents',
  visiter: '📍 À visiter', budget: '💶 Budget'
};

function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(function(p) {
    p.style.display = (p.id === 'page-' + page) ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.toggle('active', n.dataset.page === page);
  });
  var titleEl = document.getElementById('mobileTitle');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;
  closeSidebar();
  closeDropdown();

  if (page === 'checklist') refreshChecklist();
  else if (page === 'bagages') renderBagages();
  else if (page === 'documents') renderDocuments();
  else if (page === 'visiter') renderLieux();
  else if (page === 'budget') renderBudget();
}

function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebarOverlay');
  var open = sb.classList.toggle('open');
  ov.style.display = open ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').style.display = 'none';
}

// ── INFOS FIELDS ───────────────────────────────────────────
var INFO_FIELDS = [
  'infoPays','infoVille','infoDateDepart','infoDateRetour','infoNbVoyageurs',
  'infoTypeHebergement','infoNomHebergement','infoAdresseHebergement','infoTelHebergement',
  'infoRefHebergement','infoLienHebergement',
  'infoTransportAller','infoAeroportDepart','infoAeroportArrivee','infoNumVolAller',
  'infoHeureDepart','infoHeureArrivee','infoPNRAller',
  'infoTransportRetour','infoNumVolRetour','infoHeureDepartRetour','infoPNRRetour',
  'infoParkingReserve','infoParkingNom','infoParkingRef','infoTransfertNotes',
  'infoLocationVoiture','infoLocationSociete','infoLocationRef','infoLocationLieu',
  'infoBagageCabine','infoBagageSoute','infoBagagesNotes',
  'infoAssurance','infoAssuranceTel','infoGroupeSanguin','infoMedicaments'
];

function saveInfos() {
  var trip = currentTrip();
  if (!trip) { toast('Créez d\'abord un voyage ✈️', 'error'); return; }
  INFO_FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) trip.infos[id] = el.value;
  });
  save();
  updateSubtitle();
  updateNuitsDisplay();
  updateBadges();
  toast('💾 Informations enregistrées', 'success');
}

function loadCurrentTrip() {
  var trip = currentTrip();
  INFO_FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = trip ? (trip.infos[id] || '') : '';
  });
  updateSubtitle();
  updateNuitsDisplay();
  updateBadges();
  var p = state.currentPage;
  if (p === 'checklist') refreshChecklist();
  else if (p === 'bagages') renderBagages();
  else if (p === 'documents') renderDocuments();
  else if (p === 'visiter') renderLieux();
  else if (p === 'budget') renderBudget();
}

function updateSubtitle() {
  var trip = currentTrip();
  var el = document.getElementById('infosSubtitle');
  if (!el) return;
  if (!trip) { el.textContent = 'Créez votre premier voyage pour commencer'; return; }
  var pays = trip.infos.infoPays || '';
  var ville = trip.infos.infoVille || '';
  var d1 = trip.infos.infoDateDepart ? formatDate(trip.infos.infoDateDepart) : '';
  var d2 = trip.infos.infoDateRetour ? formatDate(trip.infos.infoDateRetour) : '';
  var txt = [ville, pays].filter(Boolean).join(', ');
  if (d1) txt += (txt ? ' · ' : '') + d1 + (d2 ? ' → ' + d2 : '');
  el.textContent = txt || 'Renseignez les informations de votre voyage';
}

// ── NUITS DYNAMIQUES ───────────────────────────────────────
function updateNuitsDisplay() {
  var d1El = document.getElementById('infoDateDepart');
  var d2El = document.getElementById('infoDateRetour');
  var el = document.getElementById('nuitsDisplay');
  if (!el) return;
  var d1 = d1El ? d1El.value : '';
  var d2 = d2El ? d2El.value : '';
  var n = nbNuits(d1, d2);
  if (d1 && d2 && n > 0) {
    el.textContent = '🌙 ' + n + ' nuit' + (n > 1 ? 's' : '');
    el.style.display = 'inline-flex';
  } else {
    el.style.display = 'none';
  }
}

// ── BADGES ─────────────────────────────────────────────────
function updateBadges() {
  var trip = currentTrip();
  if (!trip) { clearBadge('badgeChecklist'); clearBadge('badgeBagages'); return; }
  var clTodo = (trip.checklist || []).filter(function(i) { return !i.done; }).length;
  var bgTodo = (trip.bagages  || []).filter(function(i) { return !i.packed; }).length;
  setBadge('badgeChecklist', clTodo);
  setBadge('badgeBagages', bgTodo);
}
function setBadge(id, n) {
  var el = document.getElementById(id);
  if (!el) return;
  if (n > 0) { el.textContent = n; el.style.display = 'inline-block'; }
  else el.style.display = 'none';
}
function clearBadge(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ── AUTOCOMPLETE ───────────────────────────────────────────
var PAYS_LIST = [
  'Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola',
  'Arabie Saoudite','Argentine','Arménie','Australie','Autriche','Azerbaïdjan',
  'Bahamas','Bahreïn','Bangladesh','Belgique','Bénin','Bolivie','Bosnie-Herzégovine',
  'Brésil','Bulgarie','Burkina Faso','Cambodge','Cameroun','Canada','Chili','Chine',
  'Chypre','Colombie','Congo','Corée du Sud','Costa Rica',"Côte d'Ivoire",'Croatie',
  'Cuba','Danemark','Égypte','Émirats Arabes Unis','Équateur','Espagne','Estonie',
  'États-Unis','Éthiopie','Finlande','France','Gabon','Géorgie','Ghana','Grèce',
  'Guatemala','Honduras','Hongrie','Inde','Indonésie','Irak','Iran','Irlande',
  'Islande','Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya',
  'Laos','Lettonie','Liban','Liechtenstein','Lituanie','Luxembourg','Madagascar',
  'Malaisie','Maldives','Mali','Malte','Maroc','Maurice','Mexique','Monaco',
  'Mongolie','Monténégro','Mozambique','Myanmar','Namibie','Népal','Nicaragua',
  'Niger','Nigéria','Norvège','Nouvelle-Zélande','Oman','Ouzbékistan','Pakistan',
  'Panama','Paraguay','Pays-Bas','Pérou','Philippines','Pologne','Portugal','Qatar',
  'République Dominicaine','République Tchèque','Roumanie','Royaume-Uni','Russie',
  'Rwanda','Saint-Marin','Sénégal','Serbie','Singapour','Slovaquie','Slovénie',
  'Sri Lanka','Suède','Suisse','Taiwan','Tanzanie','Thaïlande','Togo','Tunisie',
  'Turquie','Ukraine','Uruguay','Vatican','Venezuela','Vietnam','Zimbabwe'
];

var VILLES_LIST = [
  'Abidjan','Abou Dabi','Accra','Agadir','Alger','Alicante','Amsterdam','Athènes',
  'Atlanta','Auckland','Bangkok','Barcelone','Beijing','Beyrouth','Bogotá','Bordeaux',
  'Bruxelles','Budapest','Buenos Aires','Cancún','Cape Town','Casablanca','Chicago',
  'Copenhague','Dakar','Doha','Dubai','Dublin','Édimbourg','Florence','Francfort',
  'Genève','Hong Kong','Istanbul','Jakarta','Johannesburg','Kuala Lumpur','Lagos',
  'Lima','Lisbonne','Londres','Los Angeles','Lyon','Madrid','Malaga','Marrakech',
  'Marseille','Miami','Milan','Montréal','Moscou','Mumbai','Munich','Nairobi',
  'Naples','New York','Nice','Oslo','Palma de Majorque','Paris','Prague','Québec',
  'Rabat','Reykjavik','Rio de Janeiro','Rome','Saint-Pétersbourg','Santiago',
  'São Paulo','Séoul','Séville','Shanghai','Singapour','Stockholm','Sydney',
  'Tenerife','Tokyo','Toronto','Tunis','Valence','Vancouver','Varsovie','Vienne',
  'Zurich'
];

var AEROPORTS_LIST = [
  'CDG – Paris Charles-de-Gaulle','ORY – Paris Orly','LYS – Lyon Saint-Exupéry',
  'NCE – Nice Côte d\'Azur','MRS – Marseille Provence','TLS – Toulouse Blagnac',
  'BOD – Bordeaux Mérignac','NTE – Nantes Atlantique','BSL – Bâle Mulhouse',
  'SXB – Strasbourg Entzheim','LIL – Lille Lesquin','RNS – Rennes',
  'FCO – Rome Fiumicino','MXP – Milan Malpensa','VCE – Venise Marco Polo',
  'BCN – Barcelone El Prat','MAD – Madrid Barajas','AGP – Malaga',
  'PMI – Palma de Majorque','LHR – Londres Heathrow','LGW – Londres Gatwick',
  'AMS – Amsterdam Schiphol','FRA – Francfort','MUC – Munich','BER – Berlin Brandenburg',
  'ZRH – Zurich','GVA – Genève','BRU – Bruxelles Zaventem','VIE – Vienne',
  'ATH – Athènes','IST – Istanbul','DXB – Dubai','DOH – Doha','AUH – Abu Dhabi',
  'JFK – New York Kennedy','LAX – Los Angeles','MIA – Miami','ORD – Chicago O\'Hare',
  'YUL – Montréal Trudeau','YYZ – Toronto Pearson','GRU – São Paulo Guarulhos',
  'NRT – Tokyo Narita','HND – Tokyo Haneda','ICN – Séoul Incheon',
  'PEK – Beijing Capital','PVG – Shanghai Pudong','HKG – Hong Kong',
  'SIN – Singapour Changi','BKK – Bangkok Suvarnabhumi','KUL – Kuala Lumpur',
  'SYD – Sydney Kingsford','AKL – Auckland','JNB – Johannesburg',
  'CMN – Casablanca Mohammed V','CAI – Le Caire','NBO – Nairobi',
  'CPT – Cape Town','RAK – Marrakech Menara','TUN – Tunis Carthage','ALG – Alger Houari Boumediene'
];

function normalizeStr(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function setupAutocomplete(inputId, list, maxItems) {
  var input = document.getElementById(inputId);
  if (!input) return;
  maxItems = maxItems || 8;

  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  var dd = document.createElement('div');
  dd.style.cssText = [
    'display:none','position:absolute','top:100%','left:0','right:0','z-index:500',
    'background:var(--surface2)','border:1.5px solid var(--primary)',
    'border-top:none','border-radius:0 0 8px 8px',
    'max-height:200px','overflow-y:auto','box-shadow:0 8px 24px rgba(0,0,0,0.5)'
  ].join(';');
  wrap.appendChild(dd);

  function show(val) {
    if (!val || val.length < 1) { dd.style.display = 'none'; return; }
    var q = normalizeStr(val);
    var matches = list.filter(function(item) {
      return normalizeStr(item).indexOf(q) !== -1;
    }).slice(0, maxItems);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(function(m) {
      var norm = normalizeStr(m);
      var idx = norm.indexOf(q);
      var display = idx >= 0
        ? escHtml(m.slice(0, idx)) + '<strong style="color:var(--primary)">' + escHtml(m.slice(idx, idx + val.length)) + '</strong>' + escHtml(m.slice(idx + val.length))
        : escHtml(m);
      return '<div style="padding:9px 14px;cursor:pointer;font-size:0.875rem;border-bottom:1px solid var(--border-light);transition:background 0.1s" ' +
        'onmouseover="this.style.background=\'var(--surface)\'" ' +
        'onmouseout="this.style.background=\'\'" ' +
        'onmousedown="pickAC(event,\'' + inputId + '\',\'' + escHtml(m) + '\')">' + display + '</div>';
    }).join('');
    dd.style.display = 'block';
  }

  input.addEventListener('input', function() { show(input.value); });
  input.addEventListener('focus', function() { show(input.value); });
  input.addEventListener('blur', function() { setTimeout(function() { dd.style.display = 'none'; }, 200); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') dd.style.display = 'none';
  });
}

function pickAC(e, inputId, val) {
  e.preventDefault();
  var input = document.getElementById(inputId);
  if (input) input.value = val;
  // trigger nuits update if dates
  if (inputId === 'infoDateDepart' || inputId === 'infoDateRetour') updateNuitsDisplay();
}

function initAutocompletes() {
  setupAutocomplete('infoPays', PAYS_LIST, 8);
  setupAutocomplete('infoVille', VILLES_LIST, 10);
  setupAutocomplete('infoAeroportDepart', AEROPORTS_LIST, 8);
  setupAutocomplete('infoAeroportArrivee', AEROPORTS_LIST, 8);
}

// ── CHECKLIST ──────────────────────────────────────────────
function buildChecklist(infos) {
  infos = infos || {};
  var pays = normalizeStr(infos.infoPays || '');
  var transport = infos.infoTransportAller || '';
  var location = infos.infoLocationVoiture || 'non';
  var parking = infos.infoParkingReserve || 'non';
  var bagCabine = infos.infoBagageCabine || 'aucun';
  var bagSoute = infos.infoBagageSoute || 'aucun';

  var schengen = ['france','espagne','italie','allemagne','portugal','pays-bas','belgique',
    'autriche','suisse','grece','pologne','tcheque','hongrie','slovaquie','slovenie',
    'croatie','estonie','lettonie','lituanie','luxembourg','malte','danemark','suede',
    'finlande','norvege','islande','liechtenstein','andorre','monaco'];
  var isSchengen = schengen.some(function(p) { return pays.indexOf(p) !== -1; });
  var needsPassport = pays !== '' && !isSchengen;

  var groups = [
    {
      id: 'docs', icon: '📄', title: 'Documents & Identité',
      items: [
        { id: 'id_doc', text: needsPassport ? '🛂 Passeport valide (validité min. 6 mois)' : '🪪 Carte d\'identité ou passeport valide', priority: 'high' },
        needsPassport ? { id: 'visa', text: '📋 Vérifier si visa requis pour ' + (infos.infoPays || 'ce pays'), priority: 'high' } : null,
        { id: 'copies_id', text: '📸 Photocopies / photos des documents d\'identité', priority: 'medium' },
        location === 'oui' ? { id: 'permis', text: '🚗 Permis de conduire (original)', priority: 'high' } : null,
      ].filter(Boolean)
    },
    {
      id: 'transport', icon: '✈️', title: 'Transport & Billets',
      items: [
        transport === 'avion' ? { id: 'billet_avion', text: '🎫 Billets d\'avion aller imprimés / sur mobile', priority: 'high' } : null,
        transport === 'avion' ? { id: 'carte_embarquement', text: '🗂️ Carte d\'embarquement (check-in en ligne)', priority: 'high' } : null,
        transport === 'avion' ? { id: 'liquides', text: '💧 Liquides cabine : flacons ≤ 100ml dans sac zip', priority: 'medium' } : null,
        transport === 'avion' ? { id: 'aeroport_heure', text: '⏰ Arriver à l\'aéroport 2h avant le vol', priority: 'high' } : null,
        transport === 'train' ? { id: 'billet_train', text: '🚄 Billets de train téléchargés / imprimés', priority: 'high' } : null,
        { id: 'billet_retour', text: '🔁 Billets retour vérifiés et accessibles', priority: 'medium' },
      ].filter(Boolean)
    },
    {
      id: 'hebergement', icon: '🏨', title: 'Hébergement',
      items: [
        { id: 'resa_hotel', text: '🏨 Confirmation de réservation hébergement', priority: 'high' },
        { id: 'adresse_hotel', text: '📍 Adresse hébergement notée / enregistrée', priority: 'medium' },
        { id: 'check_in', text: '🔑 Horaires check-in / check-out confirmés', priority: 'low' },
      ]
    },
    {
      id: 'parking_section', icon: '🅿️', title: 'Parking & Transfert',
      items: [
        parking === 'oui' ? { id: 'parking_resa', text: '🅿️ Réservation parking confirmée', priority: 'high' } : null,
        (parking === 'navette' || parking === 'taxi') ? { id: 'transfert', text: '🚌 Transfert / navette aéroport organisé', priority: 'medium' } : null,
        { id: 'trajet_aeroport', text: '🗺️ Itinéraire vers aéroport / gare planifié', priority: 'medium' },
      ].filter(Boolean)
    },
    {
      id: 'location_section', icon: '🚗', title: 'Location de véhicule',
      items: location === 'oui' ? [
        { id: 'location_resa', text: '🚗 Réservation location de voiture confirmée', priority: 'high' },
        { id: 'location_assurance', text: '🛡️ Assurance véhicule de location vérifiée', priority: 'high' },
        { id: 'gps', text: '📱 GPS / cartes hors ligne téléchargées', priority: 'medium' },
      ] : []
    },
    {
      id: 'bagages_section', icon: '🧳', title: 'Préparation des bagages',
      items: [
        bagSoute !== 'aucun' ? { id: 'poids_soute', text: '⚖️ Poids valise soute vérifié (max ' + bagSoute + ')', priority: 'high' } : null,
        bagCabine !== 'aucun' ? { id: 'poids_cabine', text: '⚖️ Poids bagage cabine vérifié', priority: 'high' } : null,
        { id: 'bagages_prepares', text: '🧳 Bagages préparés et vérifiés', priority: 'high' },
        { id: 'cadenas', text: '🔒 Cadenas TSA sur valise soute', priority: 'low' },
        { id: 'etiquette', text: '🏷️ Étiquette bagage avec coordonnées', priority: 'medium' },
      ].filter(Boolean)
    },
    {
      id: 'sante', icon: '🏥', title: 'Santé & Assurance',
      items: [
        { id: 'assurance', text: '🛡️ Assurance voyage souscrite / CB vérifiée', priority: 'high' },
        { id: 'carte_vitale', text: '💳 Carte Vitale / CEAM (Europe)', priority: 'medium' },
        { id: 'pharmacie', text: '💊 Trousse à pharmacie préparée', priority: 'medium' },
        { id: 'ordonnances', text: '📋 Ordonnances en quantité suffisante', priority: 'medium' },
      ]
    },
    {
      id: 'pratique', icon: '📱', title: 'Divers & Pratique',
      items: [
        { id: 'monnaie', text: '💵 Monnaie locale / carte bancaire acceptée', priority: 'medium' },
        { id: 'roaming', text: '📶 Forfait téléphone / roaming activé', priority: 'medium' },
        { id: 'chargeurs', text: '🔌 Chargeurs + adaptateur électrique', priority: 'medium' },
        { id: 'maison', text: '🏠 Maison / appartement sécurisé(e)', priority: 'low' },
        { id: 'voisin', text: '🌿 Voisin prévenu (plantes, courrier, animaux)', priority: 'low' },
        { id: 'urgences_locales', text: '☎️ Numéros d\'urgence locaux notés', priority: 'medium' },
      ]
    },
  ].filter(function(g) { return g.items.length > 0; });

  return groups;
}

function refreshChecklist() {
  var trip = currentTrip();
  var container = document.getElementById('checklistContainer');
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✈️</div><h2>Aucun voyage sélectionné</h2><p>Créez ou sélectionnez un voyage</p></div>';
    updateProgressBar('checklistProgressFill', 'checklistProgressLabel', 'checklistProgressPct', 0, 0, false);
    return;
  }

  var groups = buildChecklist(trip.infos || {});
  var existingMap = {};
  (trip.checklist || []).forEach(function(i) { existingMap[i.id] = i.done; });

  var merged = [];
  groups.forEach(function(g) {
    g.items.forEach(function(item) {
      merged.push({ id: item.id, text: item.text, priority: item.priority, group: g.id, done: existingMap[item.id] || false });
    });
  });
  trip.checklist = merged;
  save();
  renderChecklist(trip, groups);
  updateBadges();
}

function renderChecklist(trip, groups) {
  var allItems = trip.checklist || [];
  var itemMap = {};
  allItems.forEach(function(i) { itemMap[i.id] = i; });

  var done = allItems.filter(function(i) { return i.done; }).length;
  updateProgressBar('checklistProgressFill', 'checklistProgressLabel', 'checklistProgressPct', done, allItems.length, false);

  var html = groups.map(function(g) {
    var gItems = g.items.filter(function(it) { return itemMap[it.id]; });
    if (!gItems.length) return '';
    var gDone = gItems.filter(function(it) { return itemMap[it.id] && itemMap[it.id].done; }).length;
    return '<div class="checklist-group">' +
      '<div class="checklist-group-header">' +
      '<span class="checklist-group-icon">' + g.icon + '</span>' +
      '<span>' + g.title + '</span>' +
      '<span style="margin-left:auto;font-size:0.8rem;color:var(--text3);font-weight:400">' + gDone + '/' + gItems.length + '</span>' +
      '</div>' +
      gItems.map(function(it) {
        var item = itemMap[it.id];
        var prioLabel = item.priority === 'high' ? 'Urgent' : item.priority === 'medium' ? 'Important' : 'Normal';
        return '<div class="checklist-item' + (item.done ? ' done' : '') + '" onclick="toggleChecklist(\'' + item.id + '\')">' +
          '<div class="checklist-cb">' + (item.done ? '✓' : '') + '</div>' +
          '<span class="checklist-text">' + item.text + '</span>' +
          '<span class="checklist-priority priority-' + item.priority + '">' + prioLabel + '</span>' +
          '</div>';
      }).join('') +
      '</div>';
  }).join('');

  document.getElementById('checklistContainer').innerHTML = html ||
    '<div class="empty-state"><div class="empty-state-icon">✅</div><h2>Renseignez les infos voyage d\'abord</h2><p>La checklist se génère automatiquement selon votre destination, transport…</p></div>';
}

function updateProgressBar(fillId, labelId, pctId, done, total, isBagage) {
  var pct = total ? Math.round(done / total * 100) : 0;
  var fill = document.getElementById(fillId);
  var label = document.getElementById(labelId);
  var pctEl = document.getElementById(pctId);
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = done + ' / ' + total + (isBagage ? ' articles préparés' : ' tâches complétées');
  if (pctEl) pctEl.textContent = pct + '%';
}

function toggleChecklist(id) {
  var trip = currentTrip(); if (!trip) return;
  var item = trip.checklist.find(function(i) { return i.id === id; });
  if (item) { item.done = !item.done; save(); }
  renderChecklist(trip, buildChecklist(trip.infos || {}));
  updateBadges();
}

function resetChecklist() {
  var trip = currentTrip();
  if (!trip || !confirm('Réinitialiser toute la checklist ?')) return;
  trip.checklist.forEach(function(i) { i.done = false; });
  save(); refreshChecklist();
  toast('↺ Checklist réinitialisée');
}

// ── BAGAGES ────────────────────────────────────────────────
var BAG_ICONS = { Documents:'📄', 'Vêtements':'👔', 'Hygiène':'🧴', 'Électronique':'🔌', 'Médicaments':'💊', Loisirs:'🎮', Divers:'📦' };

function defaultBagages() {
  return [
    { id: genId(), cat: 'Documents', nom: 'Passeport / Carte d\'identité', packed: false },
    { id: genId(), cat: 'Documents', nom: 'Billets / Confirmations imprimées', packed: false },
    { id: genId(), cat: 'Documents', nom: 'Assurance voyage', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'T-shirts', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Pantalons / Shorts', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Veste / Sweat', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Sous-vêtements', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Chaussures de rechange', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Pyjama', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Brosse à dents + dentifrice', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Shampoing / gel douche', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Déodorant', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Crème solaire', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Rasoir / épilateur', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Téléphone + chargeur', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Adaptateur électrique', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Batterie externe', packed: false },
    { id: genId(), cat: 'Médicaments', nom: 'Médicaments habituels', packed: false },
    { id: genId(), cat: 'Médicaments', nom: 'Antidouleurs / antihistaminiques', packed: false },
    { id: genId(), cat: 'Divers', nom: 'Lunettes de soleil', packed: false },
  ];
}

function renderBagages() {
  var trip = currentTrip();
  var container = document.getElementById('bagagesContainer');
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🧳</div><h2>Aucun voyage sélectionné</h2></div>';
    updateProgressBar('bagageProgressFill', 'bagageProgressLabel', 'bagageProgressPct', 0, 0, true);
    return;
  }

  var items = trip.bagages || [];
  var packed = items.filter(function(i) { return i.packed; }).length;
  updateProgressBar('bagageProgressFill', 'bagageProgressLabel', 'bagageProgressPct', packed, items.length, true);

  if (!items.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🧳</div><h2>Liste vide</h2><p>Cliquez sur "+ Ajouter" pour ajouter des articles</p></div>';
    return;
  }

  var byCat = {};
  items.forEach(function(i) { if (!byCat[i.cat]) byCat[i.cat] = []; byCat[i.cat].push(i); });

  container.innerHTML = Object.entries(byCat).map(function(entry) {
    var cat = entry[0]; var list = entry[1];
    var catPacked = list.filter(function(i) { return i.packed; }).length;
    return '<div class="bagage-group">' +
      '<div class="bagage-group-header">' +
      '<span class="bagage-group-title">' + (BAG_ICONS[cat] || '📦') + ' ' + cat + '</span>' +
      '<span class="bagage-group-count">' + catPacked + '/' + list.length + '</span>' +
      '</div>' +
      list.map(function(item) {
        return '<div class="bagage-item' + (item.packed ? ' packed' : '') + '" onclick="toggleBagage(\'' + item.id + '\')">' +
          '<div class="bagage-cb">' + (item.packed ? '✓' : '') + '</div>' +
          '<span class="bagage-text">' + escHtml(item.nom) + '</span>' +
          '<button class="btn-icon" onclick="deleteBagage(\'' + item.id + '\',event)" title="Supprimer">🗑️</button>' +
          '</div>';
      }).join('') +
      '</div>';
  }).join('');

  updateBadges();
}

function toggleBagage(id) {
  var trip = currentTrip(); if (!trip) return;
  var item = trip.bagages.find(function(i) { return i.id === id; });
  if (item) { item.packed = !item.packed; save(); renderBagages(); }
}

function deleteBagage(id, e) {
  e.stopPropagation();
  var trip = currentTrip(); if (!trip) return;
  trip.bagages = trip.bagages.filter(function(i) { return i.id !== id; });
  save(); renderBagages();
}

function addBagage() {
  document.getElementById('addBagageBar').style.display = 'flex';
  document.getElementById('newBagageNom').focus();
}
function cancelAddBagage() { document.getElementById('addBagageBar').style.display = 'none'; }
function confirmAddBagage() {
  var trip = currentTrip(); if (!trip) return;
  var nom = document.getElementById('newBagageNom').value.trim();
  if (!nom) { toast('Entrez un nom', 'error'); return; }
  var cat = document.getElementById('newBagageCategorie').value;
  if (!trip.bagages) trip.bagages = [];
  trip.bagages.push({ id: genId(), cat: cat, nom: nom, packed: false });
  save(); renderBagages();
  document.getElementById('newBagageNom').value = '';
  document.getElementById('addBagageBar').style.display = 'none';
  toast('✓ Article ajouté', 'success');
}

function resetBagages() {
  var trip = currentTrip();
  if (!trip || !confirm('Réinitialiser la liste de bagages par défaut ?')) return;
  trip.bagages = defaultBagages();
  save(); renderBagages();
  toast('↺ Bagages réinitialisés');
}

// ── DOCUMENTS ──────────────────────────────────────────────
function renderDocuments() {
  var trip = currentTrip();
  var container = document.getElementById('documentsContainer');
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><h2>Aucun voyage sélectionné</h2></div>';
    return;
  }

  var i = trip.infos || {};
  function f(val) { return val ? '<span class="doc-field-value">' + escHtml(val) + '</span>' : '<span class="doc-field-value empty">—</span>'; }
  function fLink(val) { return val ? '<span class="doc-field-value link"><a href="' + escHtml(val) + '" target="_blank" rel="noopener">🔗 Ouvrir le lien</a></span>' : '<span class="doc-field-value empty">—</span>'; }

  var nuits = nbNuits(i.infoDateDepart, i.infoDateRetour);
  var typeTransport = { avion:'✈️ Avion', train:'🚄 Train', voiture:'🚗 Voiture', bus:'🚌 Bus', ferry:'⛴️ Ferry' };
  var typeHeberg = { hotel:'🏨 Hôtel', gite:'🏡 Gîte', airbnb:'🏠 Airbnb', camping:'⛺ Camping', autre:'🛖 Autre' };

  container.innerHTML =
    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🌍</span><span class="doc-card-title">Destination</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Pays</span>' + f(i.infoPays) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Ville / Région</span>' + f(i.infoVille) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Date départ</span>' + f(i.infoDateDepart ? formatDate(i.infoDateDepart) : '') + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Date retour</span>' + f(i.infoDateRetour ? formatDate(i.infoDateRetour) : '') + '</div>' +
    (nuits > 0 ? '<div class="doc-field"><span class="doc-field-label">Durée</span><span class="doc-field-value">🌙 ' + nuits + ' nuit' + (nuits > 1 ? 's' : '') + '</span></div>' : '') +
    '<div class="doc-field"><span class="doc-field-label">Voyageurs</span>' + f(i.infoNbVoyageurs) + '</div>' +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🏨</span><span class="doc-card-title">Hébergement</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Type</span>' + f(typeHeberg[i.infoTypeHebergement] || i.infoTypeHebergement) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Nom</span>' + f(i.infoNomHebergement) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Téléphone</span>' + f(i.infoTelHebergement) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Réf. réservation</span>' + f(i.infoRefHebergement) + '</div>' +
    '<div class="doc-field" style="grid-column:1/-1"><span class="doc-field-label">Adresse</span>' + f(i.infoAdresseHebergement) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Lien réservation</span>' + fLink(i.infoLienHebergement) + '</div>' +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🛫</span><span class="doc-card-title">Transport aller</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Type</span>' + f(typeTransport[i.infoTransportAller] || i.infoTransportAller) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">N° vol / train</span>' + f(i.infoNumVolAller) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Aéroport départ</span>' + f(i.infoAeroportDepart) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Aéroport arrivée</span>' + f(i.infoAeroportArrivee) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure départ</span>' + f(i.infoHeureDepart) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure arrivée</span>' + f(i.infoHeureArrivee) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Référence / PNR</span>' + f(i.infoPNRAller) + '</div>' +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🛬</span><span class="doc-card-title">Transport retour</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Type</span>' + f(typeTransport[i.infoTransportRetour] || i.infoTransportRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">N° vol / train</span>' + f(i.infoNumVolRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure départ</span>' + f(i.infoHeureDepartRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Référence / PNR</span>' + f(i.infoPNRRetour) + '</div>' +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🅿️</span><span class="doc-card-title">Parking & Location véhicule</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Parking</span>' + f(i.infoParkingNom) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Réf. parking</span>' + f(i.infoParkingRef) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Société location</span>' + f(i.infoLocationSociete) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Réf. location</span>' + f(i.infoLocationRef) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Lieu prise en charge</span>' + f(i.infoLocationLieu) + '</div>' +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🏥</span><span class="doc-card-title">Santé & Urgences</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Assurance</span>' + f(i.infoAssurance) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">N° urgence assurance</span>' + f(i.infoAssuranceTel) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Groupe sanguin</span>' + f(i.infoGroupeSanguin) + '</div>' +
    (i.infoMedicaments ? '<div class="doc-field" style="grid-column:1/-1"><span class="doc-field-label">Notes médicales</span><span class="doc-field-value">' + escHtml(i.infoMedicaments) + '</span></div>' : '') +
    '</div></div>';
}

// ── À VISITER ──────────────────────────────────────────────
var CAT_ICONS  = { monument:'🏛️', restaurant:'🍽️', nature:'🌿', musee:'🖼️', shopping:'🛍️', autre:'📌' };
var CAT_LABELS = { monument:'Monument', restaurant:'Restaurant', nature:'Nature', musee:'Musée', shopping:'Shopping', autre:'Autre' };
var currentLieuFilter = 'tous';

function renderLieux() {
  var trip = currentTrip();
  var container = document.getElementById('lieuxContainer');
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun voyage sélectionné</h2></div>';
    return;
  }
  var dest = [trip.infos && trip.infos.infoVille, trip.infos && trip.infos.infoPays].filter(Boolean).join(', ');
  document.getElementById('visiterSubtitle').textContent = dest || 'Planifiez vos visites';

  var lieux = (trip.lieux || []).filter(function(l) { return currentLieuFilter === 'tous' || l.cat === currentLieuFilter; });
  if (!lieux.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun lieu' + (currentLieuFilter !== 'tous' ? ' dans cette catégorie' : '') + '</h2><p>Cliquez sur "+ Ajouter un lieu" pour commencer</p></div>';
    return;
  }

  container.innerHTML = lieux.map(function(l) {
    var addr = encodeURIComponent(l.adresse || l.nom);
    return '<div class="lieu-card">' +
      '<div class="lieu-header">' +
      '<span class="lieu-title">' + (CAT_ICONS[l.cat] || '📌') + ' ' + escHtml(l.nom) + '</span>' +
      '<span class="lieu-cat-badge">' + (CAT_LABELS[l.cat] || l.cat) + '</span>' +
      '</div>' +
      '<div class="lieu-meta">' +
      (l.adresse ? '<span>📍 ' + escHtml(l.adresse) + '</span>' : '') +
      (l.distance ? '<span>📏 ' + escHtml(l.distance) + '</span>' : '') +
      '</div>' +
      (l.notes ? '<div class="lieu-notes">💬 ' + escHtml(l.notes) + '</div>' : '') +
      '<div class="lieu-actions">' +
      '<a class="btn-maps" href="https://www.google.com/maps/search/?api=1&query=' + addr + '" target="_blank" rel="noopener">🗺️ Google Maps</a>' +
      '<a class="btn-maps plans" href="https://maps.apple.com/?q=' + addr + '" target="_blank" rel="noopener">🍎 Plans</a>' +
      '<a class="btn-maps waze" href="https://waze.com/ul?q=' + addr + '" target="_blank" rel="noopener">🚗 Waze</a>' +
      '<button class="btn-danger" onclick="deleteLieu(\'' + l.id + '\')">🗑️</button>' +
      '</div></div>';
  }).join('');
}

function filterLieux(filter, btn) {
  currentLieuFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderLieux();
}

function triParDistance() {
  var trip = currentTrip(); if (!trip) return;
  trip.lieux.sort(function(a, b) { return (parseFloat(a.distance) || 9999) - (parseFloat(b.distance) || 9999); });
  save(); renderLieux();
  toast('📏 Triés par distance');
}

function showAddLieu() {
  ['newLieuNom','newLieuAdresse','newLieuDistance','newLieuNotes'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  openModal('modalAddLieu');
  setTimeout(function() { document.getElementById('newLieuNom').focus(); }, 100);
}

function confirmAddLieu() {
  var trip = currentTrip(); if (!trip) return;
  var nom = document.getElementById('newLieuNom').value.trim();
  if (!nom) { toast('Entrez un nom de lieu', 'error'); return; }
  if (!trip.lieux) trip.lieux = [];
  trip.lieux.push({
    id: genId(), nom: nom,
    cat: document.getElementById('newLieuCategorie').value,
    adresse: document.getElementById('newLieuAdresse').value.trim(),
    distance: document.getElementById('newLieuDistance').value.trim(),
    notes: document.getElementById('newLieuNotes').value.trim(),
  });
  save(); closeModal('modalAddLieu'); renderLieux();
  toast('📍 Lieu ajouté', 'success');
}

function deleteLieu(id) {
  var trip = currentTrip(); if (!trip) return;
  trip.lieux = trip.lieux.filter(function(l) { return l.id !== id; });
  save(); renderLieux();
}

// ── BUDGET ─────────────────────────────────────────────────
var DEP_ICONS  = { transport:'✈️', hebergement:'🏨', restauration:'🍽️', activites:'🎡', shopping:'🛍️', sante:'💊', autre:'📦' };
var DEP_LABELS = { transport:'Transport', hebergement:'Hébergement', restauration:'Restauration', activites:'Activités', shopping:'Shopping', sante:'Santé', autre:'Divers' };

function renderBudget() {
  var trip = currentTrip();
  var summary = document.getElementById('budgetSummary');
  var container = document.getElementById('budgetContainer');
  if (!trip) {
    summary.innerHTML = '';
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💶</div><h2>Aucun voyage sélectionné</h2></div>';
    return;
  }

  var deps = trip.depenses || [];
  var totalPrevu = deps.filter(function(d) { return d.type === 'prevu'; }).reduce(function(s, d) { return s + Number(d.montant); }, 0);
  var totalReel  = deps.filter(function(d) { return d.type === 'reel';  }).reduce(function(s, d) { return s + Number(d.montant); }, 0);

  summary.innerHTML =
    '<div class="budget-kpi"><div class="budget-kpi-label">Total global</div><div class="budget-kpi-value total">' + fmt(totalPrevu + totalReel) + ' €</div></div>' +
    '<div class="budget-kpi"><div class="budget-kpi-label">Prévu</div><div class="budget-kpi-value prevu">' + fmt(totalPrevu) + ' €</div></div>' +
    '<div class="budget-kpi"><div class="budget-kpi-label">Dépensé</div><div class="budget-kpi-value reel">' + fmt(totalReel) + ' €</div></div>' +
    '<div class="budget-kpi"><div class="budget-kpi-label">Nb dépenses</div><div class="budget-kpi-value total">' + deps.length + '</div></div>';

  if (!deps.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💶</div><h2>Aucune dépense enregistrée</h2><p>Cliquez sur "+ Ajouter" pour suivre votre budget</p></div>';
    return;
  }

  var byCat = {};
  deps.forEach(function(d) { if (!byCat[d.cat]) byCat[d.cat] = []; byCat[d.cat].push(d); });

  container.innerHTML = Object.entries(byCat).map(function(entry) {
    var cat = entry[0]; var items = entry[1];
    var catTotal = items.reduce(function(s, d) { return s + Number(d.montant); }, 0);
    return '<div class="budget-group">' +
      '<div class="budget-group-header"><span>' + (DEP_ICONS[cat] || '📦') + ' ' + (DEP_LABELS[cat] || cat) + '</span><span>' + fmt(catTotal) + ' €</span></div>' +
      items.map(function(d) {
        return '<div class="budget-item">' +
          '<span class="budget-item-desc">' + escHtml(d.desc) + '</span>' +
          '<div class="budget-item-right">' +
          '<span class="budget-item-type ' + (d.type === 'prevu' ? 'type-prevu' : 'type-reel') + '">' + (d.type === 'prevu' ? 'Prévu' : 'Réel') + '</span>' +
          '<span class="budget-item-amount">' + fmt(d.montant) + ' €</span>' +
          '<button class="btn-icon" onclick="deleteDepense(\'' + d.id + '\')">🗑️</button>' +
          '</div></div>';
      }).join('') +
      '</div>';
  }).join('');
}

function showAddDepense() {
  document.getElementById('newDepenseDesc').value = '';
  document.getElementById('newDepenseMontant').value = '';
  openModal('modalAddDepense');
  setTimeout(function() { document.getElementById('newDepenseDesc').focus(); }, 100);
}

function confirmAddDepense() {
  var trip = currentTrip(); if (!trip) return;
  var desc = document.getElementById('newDepenseDesc').value.trim();
  var montant = parseFloat(document.getElementById('newDepenseMontant').value);
  if (!desc || isNaN(montant) || montant < 0) { toast('Remplissez tous les champs', 'error'); return; }
  if (!trip.depenses) trip.depenses = [];
  trip.depenses.push({
    id: genId(),
    cat: document.getElementById('newDepenseCat').value,
    desc: desc, montant: montant,
    type: document.getElementById('newDepenseType').value
  });
  save(); closeModal('modalAddDepense'); renderBudget();
  toast('💶 Dépense ajoutée', 'success');
}

function deleteDepense(id) {
  var trip = currentTrip(); if (!trip) return;
  trip.depenses = trip.depenses.filter(function(d) { return d.id !== id; });
  save(); renderBudget();
}

// ── MODALS ─────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  load();

  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) { p.style.display = 'none'; });
  // Hide all modals
  document.querySelectorAll('.modal').forEach(function(m) { m.style.display = 'none'; });
  // Hide badges
  document.querySelectorAll('.nav-badge').forEach(function(b) { b.style.display = 'none'; });
  // Hide misc
  document.getElementById('toast').style.display = 'none';
  document.getElementById('sidebarOverlay').style.display = 'none';
  document.getElementById('tripDropdown').style.display = 'none';
  document.getElementById('addBagageBar').style.display = 'none';

  renderTripSelector();
  renderTripList();

  if (state.trips.length > 0) {
    if (!state.currentTripId) state.currentTripId = state.trips[0].id;
    loadCurrentTrip();
  } else {
    var sub = document.getElementById('infosSubtitle');
    if (sub) sub.textContent = 'Créez votre premier voyage pour commencer';
  }

  navigate(state.currentPage || 'infos');
  initAutocompletes();

  var d1 = document.getElementById('infoDateDepart');
  var d2 = document.getElementById('infoDateRetour');
  if (d1) d1.addEventListener('change', updateNuitsDisplay);
  if (d2) d2.addEventListener('change', updateNuitsDisplay);
  updateNuitsDisplay();

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    var dd = document.getElementById('tripDropdown');
    var btn = document.getElementById('tripCurrentBtn');
    if (dd.style.display !== 'none' && !dd.contains(e.target) && !btn.contains(e.target)) {
      closeDropdown();
    }
  });

  // Escape closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(function(m) { m.style.display = 'none'; });
    }
  });
});
