/* ============================================================
   JE PRÉPARE MON VOYAGE – app.js  (v2)
   ============================================================ */

// ── STATE (var global, jamais réassigné – mutation directe) ────
var state = {
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
    var raw = localStorage.getItem('jpmv_state');
    if (!raw) return;
    var parsed = JSON.parse(raw);
    // Mutation directe – on ne réassigne JAMAIS state
    if (Array.isArray(parsed.trips)) state.trips = parsed.trips;
    if (parsed.currentTripId !== undefined) state.currentTripId = parsed.currentTripId;
    if (parsed.currentPage) state.currentPage = parsed.currentPage;
  } catch(e) { console.warn('Load error', e); }
}

// ── CURRENT TRIP ───────────────────────────────────────────
function currentTrip() {
  if (!state.currentTripId) return null;
  for (var i = 0; i < state.trips.length; i++) {
    if (state.trips[i].id === state.currentTripId) return state.trips[i];
  }
  return null;
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
function openNewTripModal() {
  closeDropdown();
  // Préremplir avec pays + ville si renseignés
  var pays = document.getElementById('infoPays') ? document.getElementById('infoPays').value.trim() : '';
  var ville = document.getElementById('infoVille') ? document.getElementById('infoVille').value.trim() : '';
  var annee = new Date().getFullYear();
  // Placeholder dynamique avec l'année en cours
  var ph = 'ex: Vacances Barcelone ' + annee;
  document.getElementById('newTripName').placeholder = ph;
  // Préremplir le champ si pays/ville disponibles
  var prefill = [ville, pays].filter(Boolean).join(' – ');
  document.getElementById('newTripName').value = prefill;
  document.getElementById('modalNewTrip').style.display = 'flex';
  setTimeout(function() {
    var inp = document.getElementById('newTripName');
    inp.focus();
    // Sélectionner tout pour faciliter la modification
    inp.select();
  }, 80);
}

function newTrip() {
  openNewTripModal();
}

function confirmNewTrip() {
  var name = document.getElementById('newTripName').value.trim();
  if (!name) { toast('Donnez un nom au voyage', 'error'); return; }
  var trip = {
    id: genId(), name: name,
    infos: { infoNbVoyageurs: '2' },
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
  if (state.currentTripId === id) state.currentTripId = state.trips.length > 0 ? state.trips[0].id : null;
  save();
  closeDropdown();
  renderTripSelector();
  loadCurrentTrip();
  // Si plus aucun voyage, proposer d'en créer un
  if (state.trips.length === 0) {
    setTimeout(function() { openNewTripModal(); }, 200);
  }
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
  // Mettre à jour le label sous le titre de la page infos
  var lbl = document.getElementById('tripActiveLabel');
  if (lbl) {
    if (trip) {
      lbl.textContent = '✈️ Voyage actif : ' + trip.name;
      lbl.style.display = 'block';
    } else {
      lbl.style.display = 'none';
    }
  }
}

// ── NAVIGATION ─────────────────────────────────────────────
var PAGE_TITLES = {
  infos: '🗺️ Infos voyage', transports: '✈️ Transports',
  deplacements: '🚗 Déplacements', checklist: '✅ Checklist',
  bagages: '🧳 Bagages', documents: '📄 Documents',
  visiter: '📍 À visiter', budget: '💶 Budget',
  parametres: '⚙️ Paramètres'
};

function navigate(page) {
  // Sauvegarde automatique de la rubrique courante avant de changer de page
  var currentPage = state.currentPage;
  if (currentPage && currentPage !== page) {
    var hasInfoField = INFO_FIELDS.some(function(id) { return !!document.getElementById(id); });
    if (hasInfoField) _saveInfosSilent();
  }

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
  else if (page === 'documents') { renderDocuments(); loadCurrentTrip(); }
  else if (page === 'visiter') {
    renderLieux();
    if (_visiterMap && _visiterLastTripId !== (currentTrip() && currentTrip().id)) {
      _visiterMap = null; _visiterAutocomplete = null;
      _visiterHebMarker = null; _visiterInfoWindow = null;
      _visiterLieuMarkers = []; _visiterSearchMarkers = [];
    }
    setTimeout(function() {
      if (!_visiterMap) {
        initVisiterMap();
      } else {
        google.maps.event.trigger(_visiterMap, 'resize');
        _renderHebMarkerOnVisiter();
        _renderVisiterMarkers();
      }
    }, 100);
  }
  else if (page === 'budget') renderBudget();
  else if (page === 'parametres') renderParametres();
  else if (page === 'infos') {
    _hebMap = null; _hebCurrentMarker = null; _hebAutocomplete = null; _hebInfoWindow = null;
    setTimeout(refreshHebMap, 100);
  }
  else if (page === 'transports' || page === 'deplacements') {
    loadCurrentTrip();
    updateTransportUI();
    updateDeplUI();
    if (page === 'deplacements') {
      setTimeout(function() { if (!_deplMap) initDeplMap(); else google.maps.event.trigger(_deplMap, 'resize'); }, 100);
    }
  }
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
  'infoRefHebergement','infoLienHebergement','infoSiteHebergement','infoRatingHebergement',
  'infoTransportAller','infoAeroportDepart','infoAeroportArrivee','infoNumVolAller',
  'infoHeureDepart','infoHeureArrivee','infoPNRAller','infoCompagnieAller','infoTerminalAller','infoLienTicketAller',
  'infoTransportRetour','infoAeroportRetourDepart','infoAeroportRetourArrivee','infoNumVolRetour',
  'infoHeureDepartRetour','infoHeureArriveeRetour','infoPNRRetour','infoCompagnieRetour','infoTerminalRetour','infoLienTicketRetour',
  'infoParkingReserve','infoParkingNom','infoParkingRef','infoTransfertNotes',
  'infoLocationVoiture','infoLocationSociete','infoLocationRef','infoLocationLieu','infoLocationMaps',
  'infoBagageCabine','infoBagageSoute','infoBagagesNotes',
  'infoAssurance','infoAssuranceTel','infoGroupeSanguin','infoMedicaments'
];

function saveInfos() {
  var trip = currentTrip();
  // Fallback : si aucun voyage sélectionné mais qu'il en existe un, le prendre
  if (!trip && state.trips.length > 0) {
    state.currentTripId = state.trips[0].id;
    trip = state.trips[0];
    renderTripSelector();
  }
  // Pas de voyage : ouvrir le modal de création au lieu d'afficher une erreur
  if (!trip) {
    openNewTripModal();
    return;
  }
  var oldNom = trip.infos.infoNomHebergement || '';
  var oldAddr = trip.infos.infoAdresseHebergement || '';
  INFO_FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) trip.infos[id] = el.value;
  });
  save();
  updateSubtitle();
  updateNuitsDisplay();
  updateBadges();
  toast('💾 Informations enregistrées', 'success');

  // Si le nom ou l'adresse de l'hébergement a changé → recoder et recalculer
  var newNom = trip.infos.infoNomHebergement || '';
  var newAddr = trip.infos.infoAdresseHebergement || '';
  if ((newNom !== oldNom || newAddr !== oldAddr) && (newNom || newAddr)) {
    var addr = [newNom, newAddr].filter(Boolean).join(', ');
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addr, language: 'fr' }, function(results, status) {
      if (status === 'OK' && results[0]) {
        trip.infos._hebLat = results[0].geometry.location.lat();
        trip.infos._hebLon = results[0].geometry.location.lng();
        save();
        _recalcAllDistances(trip);
        // Mettre à jour le marqueur vert sur la carte héb
        if (_hebMap && _hebCurrentMarker) {
          var pos = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
          _hebCurrentMarker.setPosition(pos);
          _hebMap.panTo(pos);
        }
      }
    });
  }
}

// Sauvegarde silencieuse (sans toast) — appelée au changement de rubrique
function _saveInfosSilent() {
  var trip = currentTrip();
  if (!trip) return;
  INFO_FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) trip.infos[id] = el.value;
  });
  save();
  updateBadges();
}

// ── AFFICHAGE CONDITIONNEL TRANSPORTS ─────────────────────────
// Affiche/cache les sections Transport selon si aéroport ou gare choisi
function updateTransportUI() {
  var trip = currentTrip();
  var mode = trip && trip.infos && trip.infos._modeArrivee; // 'aeroport' | 'gare' | undefined

  var cards  = ['cardTransportAller','cardTransportRetour','cardParking','cardBagagesAutoris'];
  var banner = document.getElementById('transportPropresMoyens');

  if (mode === 'aeroport' || mode === 'gare') {
    cards.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    if (banner) banner.style.display = 'none';
  } else {
    cards.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (banner) banner.style.display = '';
  }
}

// ── AFFICHAGE CONDITIONNEL DÉPLACEMENTS ───────────────────────
// Affiche/cache les sections Location selon si loueur ou location choisie
function updateDeplUI() {
  var trip = currentTrip();
  var hasLocation = trip && trip.infos &&
    (trip.infos.infoLocationVoiture === 'oui' || trip.infos._modeArrivee === 'loueur');

  var cardMap    = document.getElementById('cardDeplMap');
  var cardLoc    = document.getElementById('cardLocationVehicule');
  var banner     = document.getElementById('deplPropresMoyens');

  if (hasLocation) {
    if (cardMap) cardMap.style.display = '';
    if (cardLoc) cardLoc.style.display = '';
    if (banner)  banner.style.display  = 'none';
  } else {
    if (cardMap) cardMap.style.display = 'none';
    if (cardLoc) cardLoc.style.display = 'none';
    if (banner)  banner.style.display  = '';
  }
}

// Pré-remplir datetime-local de départ/retour quand les dates du voyage changent
function prefillTransportDates() {
  var d1 = document.getElementById('infoDateDepart') ? document.getElementById('infoDateDepart').value : '';
  var d2 = document.getElementById('infoDateRetour') ? document.getElementById('infoDateRetour').value : '';
  var hdAller = document.getElementById('infoHeureDepart');
  var hdRetour = document.getElementById('infoHeureDepartRetour');
  // Pré-remplir seulement si le champ est vide
  if (hdAller && !hdAller.value && d1) {
    hdAller.value = d1 + 'T08:00';
  }
  if (hdRetour && !hdRetour.value && d2) {
    hdRetour.value = d2 + 'T14:00';
  }
  updateNuitsDisplay();
}

function loadCurrentTrip() {
  var trip = currentTrip();
  INFO_FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = trip ? (trip.infos[id] || '') : '';
  });
  updateSubtitle();
  // Sync the visual range calendar from hidden date fields
  _rcpSyncDisplay();
  updateNuitsDisplay();
  updateMapsHebDest();
  var hdAller = document.getElementById('infoHeureDepart');
  var hdRetour = document.getElementById('infoHeureDepartRetour');
  var d1 = document.getElementById('infoDateDepart') ? document.getElementById('infoDateDepart').value : '';
  var d2 = document.getElementById('infoDateRetour') ? document.getElementById('infoDateRetour').value : '';
  if (hdAller && !hdAller.value && d1) hdAller.value = d1 + 'T08:00';
  if (hdRetour && !hdRetour.value && d2) hdRetour.value = d2 + 'T14:00';
  updateBadges();
  updateTransportUI();
  updateDeplUI();
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


// Données villes/pays chargées depuis villes.js (VILLES_GLOBALES + VILLES_PAR_PAYS)


function getVillesList() {
  var pays = document.getElementById('infoPays') ? normalizeStr(document.getElementById('infoPays').value).replace(/\s/g,'') : '';
  if (!pays || pays.length < 2) return VILLES_GLOBALES;

  // Cherche la meilleure correspondance dans VILLES_PAR_PAYS et REGIONS_PAR_PAYS
  function bestMatch(dict) {
    var bestKey = null, bestScore = 0;
    Object.keys(dict).forEach(function(key) {
      var normKey = normalizeStr(key).replace(/\s/g,'');
      var score = 0;
      if (normKey === pays) score = 100;
      else if (pays.indexOf(normKey) !== -1) score = normKey.length;
      else if (normKey.indexOf(pays) !== -1) score = pays.length;
      if (score > bestScore) { bestScore = score; bestKey = key; }
    });
    return bestScore >= 4 ? bestKey : null;
  }

  var villeKey   = bestMatch(VILLES_PAR_PAYS);
  var regionKey  = bestMatch(REGIONS_PAR_PAYS);

  // Combiner villes + régions, dédupliqué, régions en tête
  var villes  = villeKey  ? VILLES_PAR_PAYS[villeKey]   : VILLES_GLOBALES;
  var regions = regionKey ? REGIONS_PAR_PAYS[regionKey] : [];

  if (!regions.length) return villes;

  // Régions en tête, puis villes (sans doublons)
  var seen = {};
  regions.forEach(function(r) { seen[r] = true; });
  var unique = villes.filter(function(v) { return !seen[v]; });
  return regions.concat(unique);
}

function initAutocompletes() {
  setupAutocomplete('infoPays', PAYS_LIST, 8);
  // Villes: dynamic based on pays
  setupAutocompleteFunc('infoVille', getVillesList, 12);
  setupAutocomplete('infoAeroportDepart', AEROPORTS_LIST, 8);
  setupAutocomplete('infoAeroportArrivee', AEROPORTS_LIST, 8);
  setupAutocomplete('infoAeroportRetourDepart', AEROPORTS_LIST, 8);
  setupAutocomplete('infoAeroportRetourArrivee', AEROPORTS_LIST, 8);
}

// Variant of setupAutocomplete that calls a function to get the list (for dynamic lists)
function setupAutocompleteFunc(inputId, listFn, maxItems) {
  _setupAC(inputId, null, listFn, maxItems || 12);
}

function setupAutocomplete(inputId, list, maxItems) {
  _setupAC(inputId, list, null, maxItems || 8);
}

// Fonction commune — list fixe OU listFn dynamique
function _setupAC(inputId, list, listFn, maxItems) {
  var input = document.getElementById(inputId);
  if (!input) return;
  // Guard : ne pas initialiser deux fois
  if (input._acInitialized) return;
  input._acInitialized = true;

  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:block;';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  var dd = document.createElement('div');
  dd.style.cssText = [
    'display:none','position:absolute','top:100%','left:0','right:0','z-index:900',
    'background:var(--surface2)','border:1.5px solid var(--primary)',
    'border-top:none','border-radius:0 0 8px 8px',
    'max-height:220px','overflow-y:auto','box-shadow:0 8px 24px rgba(0,0,0,0.5)'
  ].join(';');
  wrap.appendChild(dd);

  input._acDropdown = dd;

  function getList() { return listFn ? listFn() : list; }

  function show(val) {
    if (!val || val.length < 1) { dd.style.display = 'none'; return; }
    var q = normalizeStr(val);
    var matches = getList().filter(function(item) {
      return normalizeStr(item).indexOf(q) !== -1;
    }).slice(0, maxItems);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(function(m) {
      var norm = normalizeStr(m);
      var idx = norm.indexOf(q);
      var highlighted = idx >= 0
        ? escHtml(m.slice(0, idx))
          + '<strong style="color:var(--primary)">' + escHtml(m.slice(idx, idx + val.length)) + '</strong>'
          + escHtml(m.slice(idx + val.length))
        : escHtml(m);
      // ← mousedown pour capturer avant blur, mais on gère la fermeture manuellement
      return '<div class="_ac-item" data-val="' + escHtml(m) + '" data-field="' + inputId + '" '
        + 'style="padding:9px 14px;cursor:pointer;font-size:0.875rem;border-bottom:1px solid var(--border-light)">'
        + highlighted + '</div>';
    }).join('');
    // Délégation d'événements sur le conteneur (mousedown)
    dd.style.display = 'block';
  }

  // Délégation unique sur dd pour éviter les problèmes de fermeture
  dd.addEventListener('mousedown', function(e) {
    var item = e.target.closest ? e.target.closest('._ac-item') : e.target;
    if (!item || !item.dataset.val) return;
    e.preventDefault(); // empêche blur de se déclencher avant qu'on ait lu la valeur
    var chosenVal = item.dataset.val;
    var chosenField = item.dataset.field;
    dd.style.display = 'none';
    var targetInput = document.getElementById(chosenField);
    if (!targetInput) return;
    var oldVal = targetInput.value;
    targetInput.value = chosenVal;
    targetInput.blur();
    // Si le pays change → vider ville
    if (chosenField === 'infoPays' && oldVal !== chosenVal) {
      var villeInput = document.getElementById('infoVille');
      if (villeInput) villeInput.value = '';
    }
    if (chosenField === 'infoDateDepart' || chosenField === 'infoDateRetour') updateNuitsDisplay();
    if (chosenField === 'infoPays' || chosenField === 'infoVille') {
      setTimeout(refreshHebMap, 300);
      setTimeout(refreshVisiterMap, 400);
      setTimeout(refreshDeplMap, 400);
    }
  });

  input.addEventListener('input',  function() { show(input.value); });
  input.addEventListener('focus',  function() { if (input.value) show(input.value); });
  input.addEventListener('blur',   function() {
    setTimeout(function() { dd.style.display = 'none'; }, 150);
    // Recentrer les cartes si ville ou pays modifié manuellement
    if (inputId === 'infoVille' || inputId === 'infoPays') {
      setTimeout(refreshHebMap, 300);
      setTimeout(refreshVisiterMap, 400);
      setTimeout(refreshDeplMap, 400);
    }
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { dd.style.display = 'none'; input.blur(); }
    if (e.key === 'Enter' && (inputId === 'infoVille' || inputId === 'infoPays')) {
      dd.style.display = 'none';
      setTimeout(refreshHebMap, 300);
      setTimeout(refreshVisiterMap, 400);
      setTimeout(refreshDeplMap, 400);
    }
  });
}

function pickAC(e, inputId, val) {
  // Conservé pour compatibilité mais plus utilisé — la logique est dans _setupAC
  e.preventDefault();
}

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

// (setupAutocomplete et pickAC définis plus haut via _setupAC)

// (initAutocompletes defined above with dynamic villes-by-country)

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
// ── STUB manquant (appelé par onHebTypeChange) ─────────────
function updateHebergementUI() { /* plus de show/hide nécessaire */ }

// ── RANGE CALENDAR ─────────────────────────────────────────
var _rcpYear  = new Date().getFullYear();
var _rcpMonth = new Date().getMonth(); // 0-based
var _rcpStart = null; // 'YYYY-MM-DD'
var _rcpEnd   = null;
var _rcpDragging = false;

var _RCP_DAYS_FR = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
var _RCP_MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function toggleRangeCal() {
  var popup = document.getElementById('rangeCalPopup');
  if (!popup) return;
  if (popup.classList.contains('open')) {
    popup.classList.remove('open');
  } else {
    // Centrer sur le mois de départ si déjà sélectionné
    if (_rcpStart) {
      var d = new Date(_rcpStart + 'T00:00');
      _rcpYear = d.getFullYear(); _rcpMonth = d.getMonth();
    } else {
      var now = new Date();
      _rcpYear = now.getFullYear(); _rcpMonth = now.getMonth();
    }
    _rcpRender();
    popup.classList.add('open');
  }
}

function _rcpClose() {
  var popup = document.getElementById('rangeCalPopup');
  if (popup) popup.classList.remove('open');
}

function rangeCalPrev() { _rcpMonth--; if (_rcpMonth < 0) { _rcpMonth = 11; _rcpYear--; } _rcpRender(); }
function rangeCalNext() { _rcpMonth++; if (_rcpMonth > 11) { _rcpMonth = 0; _rcpYear++; } _rcpRender(); }

function _rcpRender() {
  var labelEl  = document.getElementById('rcpMonthLabel');
  var namesEl  = document.getElementById('rcpDayNames');
  var daysEl   = document.getElementById('rcpDays');
  var hintEl   = document.getElementById('rcpHint');
  if (!labelEl || !daysEl) return;

  labelEl.textContent = _RCP_MONTHS_FR[_rcpMonth] + ' ' + _rcpYear;

  // En-têtes jours
  namesEl.innerHTML = _RCP_DAYS_FR.map(function(d) {
    return '<div class="rcp-day-name">' + d + '</div>';
  }).join('');

  // Calcul des jours du mois (lundi=0 en semaine)
  var firstDay = new Date(_rcpYear, _rcpMonth, 1).getDay(); // 0=dim
  var firstMon = (firstDay + 6) % 7; // décalage lundi=0
  var daysInMonth = new Date(_rcpYear, _rcpMonth + 1, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);

  var cells = '';
  // Vides avant le 1er
  for (var i = 0; i < firstMon; i++) cells += '<div class="rcp-day"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var iso = _rcpYear + '-' + _pad((_rcpMonth+1)) + '-' + _pad(d);
    var cls = ['rcp-day'];
    var cellDate = new Date(iso + 'T00:00');
    if (cellDate.getTime() === today.getTime()) cls.push('today');
    if (_rcpStart && iso === _rcpStart) cls.push('start');
    if (_rcpEnd   && iso === _rcpEnd)   cls.push('end');
    if (_rcpStart && _rcpEnd && iso > _rcpStart && iso < _rcpEnd) cls.push('in-range');
    cells += '<div class="' + cls.join(' ') + '" data-date="' + iso + '"'
           + ' ontouchstart="_rcpTouchStart(\'' + iso + '\',event)"'
           + ' ontouchmove="_rcpTouchMove(event)"'
           + ' ontouchend="_rcpTouchEnd(event)"'
           + '>' + d + '</div>';
  }
  daysEl.innerHTML = cells;

  // Délégation d'événements sur le conteneur des jours (meilleur que per-cell pour le drag)
  daysEl.onmousedown = function(e) {
    var cell = e.target.closest ? e.target.closest('.rcp-day') : e.target;
    if (!cell || !cell.dataset.date) return;
    e.preventDefault();
    _rcpMouseDown(cell.dataset.date);
  };
  daysEl.onmousemove = function(e) {
    if (!_rcpDragging) return;
    var cell = e.target.closest ? e.target.closest('.rcp-day') : e.target;
    if (cell && cell.dataset.date) _rcpMouseEnter(cell.dataset.date);
  };
  daysEl.onmouseup = function(e) {
    var cell = e.target.closest ? e.target.closest('.rcp-day') : e.target;
    if (!cell || !cell.dataset.date) return;
    _rcpMouseUp(cell.dataset.date);
  };

  // Hint
  if (hintEl) {
    if (!_rcpStart) hintEl.textContent = 'Cliquez sur la date de départ';
    else if (!_rcpEnd) hintEl.textContent = 'Cliquez sur la date de retour (ou glissez)';
    else hintEl.textContent = _rcpFormatDisplay(_rcpStart) + '  →  ' + _rcpFormatDisplay(_rcpEnd);
  }
}

function _pad(n) { return n < 10 ? '0' + n : '' + n; }

function _rcpFormatDisplay(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function _rcpMouseDown(iso) {
  _rcpDragging = true;
  _rcpStart = iso; _rcpEnd = null;
  _rcpHighlight(); // Ne PAS reconstruire le DOM, juste mettre à jour les classes
}
function _rcpMouseEnter(iso) {
  if (!_rcpDragging || !_rcpStart) return;
  if (iso >= _rcpStart) _rcpEnd = iso;
  else { _rcpEnd = _rcpStart; _rcpStart = iso; }
  _rcpHighlight();
}
function _rcpHighlight() {
  // Met à jour les classes CSS sans reconstruire le DOM
  var daysEl = document.getElementById('rcpDays');
  if (!daysEl) return;
  daysEl.querySelectorAll('.rcp-day[data-date]').forEach(function(cell) {
    var iso = cell.dataset.date;
    cell.classList.remove('start','end','in-range');
    if (_rcpStart && iso === _rcpStart) cell.classList.add('start');
    if (_rcpEnd   && iso === _rcpEnd)   cell.classList.add('end');
    if (_rcpStart && _rcpEnd && iso > _rcpStart && iso < _rcpEnd) cell.classList.add('in-range');
  });
  var hintEl = document.getElementById('rcpHint');
  if (hintEl) {
    if (!_rcpStart) hintEl.textContent = 'Cliquez sur la date de départ';
    else if (!_rcpEnd) hintEl.textContent = 'Cliquez sur la date de retour (ou glissez)';
    else hintEl.textContent = _rcpFormatDisplay(_rcpStart) + '  →  ' + _rcpFormatDisplay(_rcpEnd);
  }
}

function _rcpMouseUp(iso) {
  if (!_rcpDragging) return;
  _rcpDragging = false;
  if (iso >= _rcpStart) _rcpEnd = iso;
  else { _rcpEnd = _rcpStart; _rcpStart = iso; }
  if (_rcpStart === _rcpEnd) _rcpEnd = null;
  _rcpHighlight();
  if (_rcpStart && _rcpEnd) { _rcpCommit(); }
}
var _rcpTouchIso = null;
function _rcpTouchStart(iso, e) {
  e.preventDefault();
  _rcpDragging = true; _rcpTouchIso = iso;
  _rcpStart = iso; _rcpEnd = null;
  _rcpRender();
}
function _rcpTouchMove(e) {
  if (!_rcpDragging) return;
  e.preventDefault();
  var touch = e.touches[0];
  var el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.dataset && el.dataset.date) {
    var iso = el.dataset.date;
    if (iso >= _rcpStart) _rcpEnd = iso;
    else { _rcpEnd = _rcpStart; _rcpStart = iso; }
    _rcpRender();
  }
}
function _rcpTouchEnd(e) {
  _rcpDragging = false;
  if (_rcpStart && _rcpEnd && _rcpStart !== _rcpEnd) _rcpCommit();
  else if (_rcpStart && !_rcpEnd) {
    // Simple tap → attendre 2e tap pour la fin
  }
}

function _rcpCommit() {
  var d1El = document.getElementById('infoDateDepart');
  var d2El = document.getElementById('infoDateRetour');
  if (d1El) d1El.value = _rcpStart;
  if (d2El) d2El.value = _rcpEnd;
  _rcpSyncDisplay();
  updateNuitsDisplay();
  updateChecklistOnChange();
  // Fermer après un court délai pour que l'user voie la sélection
  setTimeout(_rcpClose, 300);
}

function _rcpSyncDisplay() {
  var d1El = document.getElementById('infoDateDepart');
  var d2El = document.getElementById('infoDateRetour');
  var d1 = d1El ? d1El.value : '';
  var d2 = d2El ? d2El.value : '';
  _rcpStart = d1 || null;
  _rcpEnd   = d2 || null;

  var dispEl  = document.getElementById('dateRangeDisplay');
  var labelEl = document.getElementById('dateRangeLabel');
  var clearEl = document.getElementById('dateRangeClear');
  if (!labelEl) return;
  if (d1 && d2) {
    labelEl.className = 'rcd-dates';
    labelEl.innerHTML = '<span>' + _rcpFormatDisplay(d1) + '</span>'
      + '<span class="rcd-arrow">→</span>'
      + '<span>' + _rcpFormatDisplay(d2) + '</span>';
    if (clearEl) clearEl.style.display = 'inline-block';
    if (dispEl) dispEl.classList.add('has-dates');
  } else if (d1) {
    labelEl.className = 'rcd-dates';
    labelEl.innerHTML = '<span>' + _rcpFormatDisplay(d1) + '</span><span style="color:var(--text3)"> → …</span>';
    if (clearEl) clearEl.style.display = 'inline-block';
    if (dispEl) dispEl.classList.add('has-dates');
  } else {
    labelEl.className = 'rcd-placeholder';
    labelEl.textContent = 'Sélectionner les dates…';
    if (clearEl) clearEl.style.display = 'none';
    if (dispEl) dispEl.classList.remove('has-dates');
  }
}

function clearRangeDates(e) {
  e.stopPropagation();
  _rcpStart = null; _rcpEnd = null;
  var d1El = document.getElementById('infoDateDepart');
  var d2El = document.getElementById('infoDateRetour');
  if (d1El) d1El.value = '';
  if (d2El) d2El.value = '';
  _rcpSyncDisplay();
  updateNuitsDisplay();
}

// Fermer le calendrier si clic en dehors
document.addEventListener('mousedown', function(e) {
  var wrap = document.getElementById('dateRangeWrap');
  if (wrap && !wrap.contains(e.target)) _rcpClose();
});
// Mouseup global : finalise le drag même si la souris sort des cellules
document.addEventListener('mouseup', function(e) {
  if (!_rcpDragging) return;
  _rcpDragging = false;
  var el = e.target && (e.target.closest ? e.target.closest('.rcp-day') : e.target);
  if (el && el.dataset && el.dataset.date) {
    var iso = el.dataset.date;
    if (iso >= _rcpStart) _rcpEnd = iso;
    else { _rcpEnd = _rcpStart; _rcpStart = iso; }
  }
  if (_rcpStart === _rcpEnd) _rcpEnd = null;
  _rcpHighlight();
  if (_rcpStart && _rcpEnd) _rcpCommit();
});

// ── CARTE DÉPLACEMENTS (loueurs) ───────────────────────────
var _deplMap          = null;
var _deplAutocomplete = null;
var _deplInfoWindow   = null;
var _deplSearchMarkers = [];
var _deplLastTripId   = null;

function initDeplMap() {
  if (!_googleMapsReady || !window.google) return;
  var trip   = currentTrip();
  var tripId = trip ? trip.id : null;
  if (_deplMap && _deplLastTripId !== tripId) {
    _deplMap = null; _deplAutocomplete = null;
    _deplInfoWindow = null; _deplSearchMarkers = [];
    var old = document.getElementById('deplGoogleMap');
    if (old) old.innerHTML = '';
  }
  _deplLastTripId = tripId;

  var center = { lat: 48.8566, lng: 2.3522 };
  var zoom   = 13;

  // Hébergement enregistré → centre prioritaire
  var hebCenter = null;
  if (trip && trip.infos && trip.infos._hebLat) {
    hebCenter = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
  }

  var dest = [
    trip && trip.infos && trip.infos.infoVille,
    trip && trip.infos && trip.infos.infoPays
  ].filter(Boolean).join(', ');

  function build(c, z) {
    var mapEl = document.getElementById('deplGoogleMap');
    if (!mapEl || _deplMap) return;
    _deplMap = new google.maps.Map(mapEl, {
      center: c, zoom: z,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
      gestureHandling: 'cooperative',
      styles: _darkMapStyles()
    });
    _deplInfoWindow = new google.maps.InfoWindow();

    // ── Marqueur vert hébergement ──
    if (hebCenter) {
      var hebNom = (trip && trip.infos && trip.infos.infoNomHebergement) || 'Hébergement';
      var hebMarker = new google.maps.Marker({
        position: hebCenter, map: _deplMap, title: hebNom,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', zIndex: 999
      });
      hebMarker.addListener('click', function() {
        _deplInfoWindow.setContent('<div style="color:#111;font-size:13px"><b>🏨 ' + escHtml(hebNom) + '</b><br><span style="color:#555">Votre hébergement</span></div>');
        _deplInfoWindow.open(_deplMap, hebMarker);
      });
    }

    // ── Marqueur bleu aéroport ──
    _renderAeroMarkerOnDepl();

    var searchInput = document.getElementById('deplMapSearch');
    _deplAutocomplete = new google.maps.places.Autocomplete(searchInput, { language: 'fr' });
    _deplAutocomplete.bindTo('bounds', _deplMap);
    _deplAutocomplete.addListener('place_changed', function() {
      var place = _deplAutocomplete.getPlace();
      if (!place || !place.geometry) return;
      _deplClearMarkers();
      _deplPlaceMarker(place, 0);
      _deplMap.panTo(place.geometry.location);
    });

    _deplMap.addListener('click', function(e) { _deplShowNearby(e.latLng); });

    var hint = document.getElementById('deplMapHint');
    if (hint) hint.textContent = '💡 🟢 = hébergement · 🔵 = aéroport · Cliquez sur la carte pour afficher les loueurs 🟡 à proximité.';

    setTimeout(function() {
      if (_deplMap) _deplShowNearby(_deplMap.getCenter());
    }, 700);
  }

  if (hebCenter) {
    build(hebCenter, 14);
  } else if (dest) {
    new google.maps.Geocoder().geocode({ address: dest, language: 'fr' }, function(res, st) {
      if (st === 'OK' && res[0]) {
        center = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
      }
      build(center, zoom);
    });
  } else {
    build(center, zoom);
  }
}

function _deplShowNearby(latLng) {
  if (!_deplMap) return;
  var service = new google.maps.places.PlacesService(_deplMap);
  service.nearbySearch({
    location: latLng,
    radius: 20000,
    keyword: 'location voiture rental car Hertz Europcar Sixt',
    language: 'fr'
  }, function(results, status) {
    _deplClearMarkers();
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
    results.slice(0, 12).forEach(function(place, idx) { _deplPlaceMarker(place, idx); });
  });
}

// Table d'index pour éviter l'injection de chaînes spéciales dans les onclick inline
var _deplPlaceData = [];

function _deplClearMarkers() {
  _deplSearchMarkers.forEach(function(m) { m.setMap(null); });
  _deplSearchMarkers = [];
  _deplPlaceData = [];
}

function _deplPlaceMarker(place, idx) {
  if (!place.geometry) return;

  // Stocker les données du lieu par index — évite tout problème d'encodage dans onclick
  var dataIdx = _deplPlaceData.length;
  var mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
    + encodeURIComponent(place.name + ' ' + (place.vicinity || ''))
    + (place.place_id ? '&query_place_id=' + place.place_id : '');
  _deplPlaceData.push({ placeId: place.place_id, name: place.name, mapsUrl: mapsUrl });

  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: _deplMap,
    title: place.name,
    icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    zIndex: idx
  });
  _deplSearchMarkers.push(marker);
  marker.addListener('click', function() {
    var content = '<div style="color:#111;font-size:13px;max-width:240px">'
      + '<b>🚗 ' + escHtml(place.name) + '</b><br>'
      + (place.vicinity ? '<span style="color:#555">' + escHtml(place.vicinity) + '</span><br>' : '')
      + (place.rating ? '⭐ ' + place.rating + '<br>' : '')
      + '<button onclick="selectDeplPlace(' + dataIdx + ')" '
      + 'style="margin-top:7px;background:#1565C0;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">'
      + '🚗 Choisir ce loueur</button></div>';
    _deplInfoWindow.setContent(content);
    _deplInfoWindow.open(_deplMap, marker);
  });
}

function selectDeplPlace(dataIdx) {
  var data = _deplPlaceData[dataIdx];
  if (!data) return;
  new google.maps.places.PlacesService(_deplMap).getDetails({
    placeId: data.placeId, language: 'fr',
    fields: ['name','formatted_address','formatted_phone_number','website','geometry','place_id']
  }, function(detail, st) {
    var place = (st === google.maps.places.PlacesServiceStatus.OK && detail) ? detail : { name: data.name };
    var nomEl  = document.getElementById('infoLocationSociete');
    var lieuEl = document.getElementById('infoLocationLieu');
    var mapsEl = document.getElementById('infoLocationMaps');
    if (nomEl)  nomEl.value  = place.name || data.name;
    if (lieuEl) lieuEl.value = place.formatted_address || '';
    if (mapsEl) mapsEl.value = data.mapsUrl;
    if (_deplInfoWindow) _deplInfoWindow.close();
    var locEl = document.getElementById('infoLocationVoiture');
    if (locEl) locEl.value = 'oui';
    toast('🚗 Loueur sélectionné : ' + (place.name || data.name), 'success');
  });
}

function locateMeDepl() {
  if (!navigator.geolocation) { toast('Géolocalisation non supportée', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    if (!_deplMap) return;
    var ll = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    _deplMap.panTo(ll); _deplMap.setZoom(14);
    _deplShowNearby(ll);
  });
}

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
    '<div class="doc-field"><span class="doc-field-label">Aéroport / Gare départ</span>' + f(i.infoAeroportDepart) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Aéroport / Gare arrivée</span>' + f(i.infoAeroportArrivee) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure départ</span>' + f(i.infoHeureDepart) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure arrivée</span>' + f(i.infoHeureArrivee) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Référence / PNR</span>' + f(i.infoPNRAller) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Compagnie</span>' + f(i.infoCompagnieAller) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Terminal / Voie</span>' + f(i.infoTerminalAller) + '</div>' +
    (i.infoLienTicketAller ? '<div class="doc-field"><span class="doc-field-label">E-ticket aller</span>' + fLink(i.infoLienTicketAller) + '</div>' : '') +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🛬</span><span class="doc-card-title">Transport retour</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Type</span>' + f(typeTransport[i.infoTransportRetour] || i.infoTransportRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">N° vol / train</span>' + f(i.infoNumVolRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Aéroport / Gare départ</span>' + f(i.infoAeroportRetourDepart) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Aéroport / Gare arrivée</span>' + f(i.infoAeroportRetourArrivee) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure départ</span>' + f(i.infoHeureDepartRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Heure arrivée</span>' + f(i.infoHeureArriveeRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Référence / PNR</span>' + f(i.infoPNRRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Compagnie</span>' + f(i.infoCompagnieRetour) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Terminal / Voie</span>' + f(i.infoTerminalRetour) + '</div>' +
    (i.infoLienTicketRetour ? '<div class="doc-field"><span class="doc-field-label">E-ticket retour</span>' + fLink(i.infoLienTicketRetour) + '</div>' : '') +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🅿️</span><span class="doc-card-title">Parking & Déplacements</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Parking</span>' + f(i.infoParkingNom) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Réf. parking</span>' + f(i.infoParkingRef) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Société location</span>' + f(i.infoLocationSociete) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Réf. location</span>' + f(i.infoLocationRef) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Lieu prise en charge</span>' + f(i.infoLocationLieu) + '</div>' +
    (i.infoLocationMaps ? '<div class="doc-field"><span class="doc-field-label">Maps loueur</span>' + fLink(i.infoLocationMaps) + '</div>' : '') +
    '</div></div>' +

    '<div class="doc-card">' +
    '<div class="doc-card-header"><span>🏥</span><span class="doc-card-title">Assurance & Santé</span></div>' +
    '<div class="doc-grid">' +
    '<div class="doc-field"><span class="doc-field-label">Assurance</span>' + f(i.infoAssurance) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">N° urgence assurance</span>' + f(i.infoAssuranceTel) + '</div>' +
    '<div class="doc-field"><span class="doc-field-label">Groupe sanguin</span>' + f(i.infoGroupeSanguin) + '</div>' +
    (i.infoMedicaments ? '<div class="doc-field" style="grid-column:1/-1"><span class="doc-field-label">Notes médicales</span><span class="doc-field-value">' + escHtml(i.infoMedicaments) + '</span></div>' : '') +
    '</div></div>';
}

// ── GOOGLE MAPS SEARCH ─────────────────────────────────────
// ── À VISITER ──────────────────────────────────────────────
var CAT_ICONS  = { monument:'🏛️', restaurant:'🍽️', plage:'🏖️', shopping:'🛍️' };
var CAT_LABELS = { monument:'Monument', restaurant:'Restaurant', plage:'Plage', shopping:'Shopping' };
var currentLieuFilter = 'tous';

// ── GOOGLE MAPS API ────────────────────────────────────────
var _googleMapsReady = false;

// Carte hébergement
var _hebMap           = null;
var _hebAutocomplete  = null;
var _hebInfoWindow    = null;
var _hebCurrentMarker = null;   // marqueur vert = hébergement actuel sauvegardé
var _hebSearchMarkers = [];     // marqueurs jaunes = résultats de recherche
var _hebActiveIW      = null;   // infowindow active (une seule à la fois)
var _hebLastTripId    = null;

// Carte À visiter
var _visiterMap          = null;
var _visiterAutocomplete = null;
var _visiterHebMarker    = null;
var _visiterAeroMarker   = null; // marqueur bleu = aéroport d'arrivée
var _visiterInfoWindow   = null;
var _visiterLieuMarkers  = [];
var _editingLieuId       = null;
var _visiterLastTripId   = null;

// Marqueur aéroport sur la carte déplacements
var _deplAeroMarker = null;

// Callback appelé par le SDK Google Maps
function onGoogleMapsReady() {
  _googleMapsReady = true;
}

// ── Carte Hébergement (page Infos) ──────────────────────────
// Même architecture exacte que la carte "À visiter" — seule différence :
// on cherche uniquement des hébergements, et le bouton dit "Choisir cet hébergement".

function initHebMap() {
  if (!_googleMapsReady || !window.google) return;

  var trip   = currentTrip();
  var tripId = trip ? trip.id : null;

  // Voyage changé → détruire la carte pour repartir proprement
  if (_hebMap && _hebLastTripId !== tripId) {
    _hebMap = null;
    _hebCurrentMarker = null;
    _hebAutocomplete  = null;
    _hebInfoWindow    = null;
    _hebSearchMarkers = [];
    _hebActiveIW      = null;
    _hebLastTripId    = null;
    var old = document.getElementById('hebGoogleMap');
    if (old) old.innerHTML = '';
  }
  _hebLastTripId = tripId;

  // Centre : hébergement enregistré → sinon géocoder ville+pays
  var center = { lat: 48.8566, lng: 2.3522 };
  var zoom   = 12;

  if (trip && trip.infos && trip.infos._hebLat) {
    center = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
    zoom   = 15;
    _buildHebMap(center, zoom);
  } else {
    var dest = [
      trip && trip.infos && trip.infos.infoVille,
      trip && trip.infos && trip.infos.infoPays
    ].filter(Boolean).join(', ');
    if (dest) {
      new google.maps.Geocoder().geocode({ address: dest, language: 'fr' }, function(res, st) {
        if (st === 'OK' && res[0]) {
          center = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
          zoom   = 13;
        }
        _buildHebMap(center, zoom);
      });
    } else {
      _buildHebMap(center, zoom);
    }
  }
}

function _buildHebMap(center, zoom) {
  if (_hebMap) return; // déjà construite entre deux appels async

  var mapEl = document.getElementById('hebGoogleMap');
  if (!mapEl) return;

  // ── Créer la carte ──
  _hebMap = new google.maps.Map(mapEl, {
    center: center, zoom: zoom,
    mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    gestureHandling: 'cooperative',
    styles: _darkMapStyles()
  });
  _hebInfoWindow = new google.maps.InfoWindow();

  // ── Marqueur vert = hébergement actuellement enregistré ──
  _renderCurrentHebMarker();

  // ── Autocomplete ──
  var searchInput = document.getElementById('hebMapSearch');
  // Pré-remplir avec la ville si le champ est vide
  var trip    = currentTrip();
  var cityVal = (document.getElementById('infoVille') || {}).value
               || (trip && trip.infos && trip.infos.infoVille) || '';
  if (searchInput && cityVal && !searchInput.value) searchInput.value = cityVal;

  _hebAutocomplete = new google.maps.places.Autocomplete(searchInput, { language: 'fr' });
  _hebAutocomplete.bindTo('bounds', _hebMap);
  _hebAutocomplete.addListener('place_changed', function() {
    var place = _hebAutocomplete.getPlace();
    if (!place || !place.geometry) return;
    // Récupérer les détails complets puis afficher marqueur jaune
    new google.maps.places.PlacesService(_hebMap).getDetails({
      placeId: place.place_id, language: 'fr',
      fields: ['name','formatted_address','formatted_phone_number','website',
               'rating','user_ratings_total','geometry','types','place_id']
    }, function(detail, st) {
      var p = st === google.maps.places.PlacesServiceStatus.OK ? detail : place;
      // Afficher directement le marqueur jaune pour ce lieu précis
      _clearHebSearchMarkers();
      _placeHebSearchMarker(p, 0);
      _hebMap.panTo(p.geometry.location);
    });
  });

  // ── Clic sur la carte → chercher hébergements à proximité ──
  _hebMap.addListener('click', function(e) {
    _showNearbyHebMarkers(e.latLng);
  });

  // ── Hint ──
  var hint = document.getElementById('hebMapHint');
  if (hint) hint.textContent = '💡 🟢 = hébergement enregistré · Cliquez sur la carte pour afficher les hébergements 🟡 à proximité.';

  // ── Auto-affichage au chargement ──
  setTimeout(function() {
    if (_hebMap) _showNearbyHebMarkers(_hebMap.getCenter());
  }, 700);
}

function refreshHebMap() {
  if (!_googleMapsReady || !window.google) return;

  // Si la carte n'est pas encore construite → init normale
  if (!_hebMap) { initHebMap(); return; }

  // Carte déjà construite : lire la nouvelle ville/pays depuis le DOM
  var trip    = currentTrip();
  var infoVille = (document.getElementById('infoVille') || {}).value
                || (trip && trip.infos && trip.infos.infoVille) || '';
  var infoPays  = (document.getElementById('infoPays')  || {}).value
                || (trip && trip.infos && trip.infos.infoPays)  || '';
  var dest = [infoVille, infoPays].filter(Boolean).join(', ');
  if (!dest) return;

  // Mettre à jour le champ de recherche et valider automatiquement (geocode + recentrage)
  var searchEl = document.getElementById('hebMapSearch');
  if (searchEl) searchEl.value = infoVille || dest;

  // Si un hébergement est déjà géocodé → ne pas bouger la carte
  if (trip && trip.infos && trip.infos._hebLat) return;

  // Géocoder la nouvelle destination et recentrer la carte
  new google.maps.Geocoder().geocode({ address: dest, language: 'fr' }, function(res, st) {
    if (st !== 'OK' || !res[0] || !_hebMap) return;
    var center = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
    _hebMap.setCenter(center);
    _hebMap.setZoom(13);
    setTimeout(function() { if (_hebMap) _showNearbyHebMarkers(_hebMap.getCenter()); }, 300);
  });
}

// Recentre la carte "À visiter" sur la nouvelle ville sans détruire la carte
function refreshVisiterMap() {
  if (!_googleMapsReady || !window.google) return;
  if (!_visiterMap) return; // pas encore construite, sera initialisée à la navigation

  var trip = currentTrip();
  var infoVille = (document.getElementById('infoVille') || {}).value
                || (trip && trip.infos && trip.infos.infoVille) || '';
  var infoPays  = (document.getElementById('infoPays')  || {}).value
                || (trip && trip.infos && trip.infos.infoPays)  || '';
  var dest = [infoVille, infoPays].filter(Boolean).join(', ');
  if (!dest) return;

  // Si hébergement géocodé → on reste centré dessus
  if (trip && trip.infos && trip.infos._hebLat) return;

  new google.maps.Geocoder().geocode({ address: dest, language: 'fr' }, function(res, st) {
    if (st !== 'OK' || !res[0] || !_visiterMap) return;
    var center = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
    _visiterMap.setCenter(center);
    _visiterMap.setZoom(13);
    setTimeout(function() { if (_visiterMap) _showVisiterSearchMarkers(_visiterMap.getCenter(), null); }, 300);
  });
}

// Recentre la carte "Déplacements" sur la nouvelle ville sans détruire la carte
function refreshDeplMap() {
  if (!_googleMapsReady || !window.google) return;
  if (!_deplMap) return;

  var trip = currentTrip();
  var infoVille = (document.getElementById('infoVille') || {}).value
                || (trip && trip.infos && trip.infos.infoVille) || '';
  var infoPays  = (document.getElementById('infoPays')  || {}).value
                || (trip && trip.infos && trip.infos.infoPays)  || '';
  var dest = [infoVille, infoPays].filter(Boolean).join(', ');
  if (!dest) return;

  if (trip && trip.infos && trip.infos._hebLat) return;

  new google.maps.Geocoder().geocode({ address: dest, language: 'fr' }, function(res, st) {
    if (st !== 'OK' || !res[0] || !_deplMap) return;
    var center = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
    _deplMap.setCenter(center);
    _deplMap.setZoom(13);
    setTimeout(function() { if (_deplMap) _deplShowNearby(_deplMap.getCenter()); }, 300);
  });
}

// Affiche le marqueur vert de l'hébergement enregistré (même logique que _renderHebMarkerOnVisiter)
function _renderCurrentHebMarker() {
  if (!_hebMap) return;
  if (_hebCurrentMarker) { _hebCurrentMarker.setMap(null); _hebCurrentMarker = null; }
  var trip = currentTrip();
  if (!trip || !trip.infos || !trip.infos._hebLat) return;
  var pos = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
  _hebCurrentMarker = new google.maps.Marker({
    map: _hebMap, position: pos, zIndex: 20,
    title: trip.infos.infoNomHebergement || 'Hébergement',
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px"><b>🏨 ' + escHtml(trip.infos.infoNomHebergement || 'Hébergement') + '</b></div>'
  });
  _hebCurrentMarker.addListener('click', function() { iw.open(_hebMap, _hebCurrentMarker); });
  iw.open(_hebMap, _hebCurrentMarker);
}

// Vide les marqueurs jaunes de recherche
function _clearHebSearchMarkers() {
  _hebSearchMarkers.forEach(function(m) { m.setMap(null); });
  _hebSearchMarkers = [];
  if (_hebActiveIW) { _hebActiveIW.close(); _hebActiveIW = null; }
}

// Recherche les hébergements (ou loueurs) à proximité d'un point et affiche les marqueurs jaunes
function _showNearbyHebMarkers(latLng) {
  if (!_hebMap || !window.google) return;
  var service = new google.maps.places.PlacesService(_hebMap);

  // Keyword selon le type sélectionné
  var val = (document.getElementById('infoTypeHebergement') || {}).value || '';

  if (val === 'loueur') {
    // Mode loueur de véhicule
    service.nearbySearch({ location: latLng, radius: 20000,
      keyword: 'location voiture rental car Hertz Europcar Sixt', language: 'fr' },
      function(results, status) {
        _clearHebSearchMarkers();
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) return;
        results.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
      });
    return;
  }

  if (val === 'aeroport') {
    // Mode aéroport d'arrivée
    service.nearbySearch({ location: latLng, radius: 150000,
      type: 'airport', language: 'fr' },
      function(results, status) {
        _clearHebSearchMarkers();
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) return;
        results.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
      });
    return;
  }

  if (val === 'gare') {
    // Mode gare d'arrivée
    service.nearbySearch({ location: latLng, radius: 100000,
      type: 'train_station', language: 'fr' },
      function(results, status) {
        _clearHebSearchMarkers();
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
          // Fallback transit_station (inclut RER, métro, etc.)
          service.nearbySearch({ location: latLng, radius: 100000,
            type: 'transit_station', keyword: 'gare SNCF train', language: 'fr' },
            function(r2, s2) {
              if (s2 === google.maps.places.PlacesServiceStatus.OK)
                r2.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
            });
          return;
        }
        results.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
      });
    return;
  }

  var keyword = val === 'camping' ? 'camping'
              : val === 'airbnb'  ? 'location vacances appartement'
              : val === 'gite'    ? 'gite chambre hotes bed breakfast'
              : 'hotel';

  service.nearbySearch({ location: latLng, radius: 20000, keyword: keyword, language: 'fr' },
    function(results, status) {
      _clearHebSearchMarkers();
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        // Fallback : chercher "lodging" (type natif Google pour tout hébergement)
        service.nearbySearch({ location: latLng, radius: 20000, type: 'lodging', language: 'fr' },
          function(r2, s2) {
            if (s2 === google.maps.places.PlacesServiceStatus.OK)
              r2.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
          });
        return;
      }
      results.slice(0, 15).forEach(function(p, i) { _placeHebSearchMarker(p, i); });
    });
}

// Place un marqueur jaune avec infowindow (même pattern que _placeVisiterSearchMarker)
function _placeHebSearchMarker(place, idx) {
  if (!place.geometry) return;
  var pos     = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
  var mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
                + encodeURIComponent(place.name)
                + (place.place_id ? '&query_place_id=' + place.place_id : '');
  var rating  = place.rating
    ? '<br>⭐ ' + place.rating + '/5'
      + (place.user_ratings_total
         ? ' <span style="color:#888;font-size:11px">(' + place.user_ratings_total + ' avis)</span>'
         : '')
    : '';

  var val = (document.getElementById('infoTypeHebergement') || {}).value || '';
  var isLoueur   = val === 'loueur';
  var isAeroport = val === 'aeroport';
  var isGare     = val === 'gare';

  var marker = new google.maps.Marker({
    map: _hebMap, position: pos, title: place.name,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    animation: idx < 3 ? google.maps.Animation.DROP : null
  });

  var btnLabel  = isLoueur   ? '🚗 Choisir ce loueur'
                : isAeroport ? '✈️ Choisir cet aéroport'
                : isGare     ? '🚄 Choisir cette gare'
                : '🏨 Choisir cet hébergement';
  var btnAction = isLoueur   ? 'selectLoueurFromHebMap(\'' + place.place_id + '\',\'' + encodeURIComponent(mapsUrl) + '\')'
                : isAeroport ? 'selectAeroportFromHebMap(\'' + place.place_id + '\',\'' + encodeURIComponent(place.name) + '\',\'' + encodeURIComponent(place.vicinity || place.formatted_address || '') + '\')'
                : isGare     ? 'selectGareFromHebMap(\'' + place.place_id + '\',\'' + encodeURIComponent(place.name) + '\',\'' + encodeURIComponent(place.vicinity || place.formatted_address || '') + '\')'
                : 'selectHebPlace(\'' + place.place_id + '\')';

  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px;max-width:260px">'
      + '<b>' + escHtml(place.name) + '</b>'
      + rating
      + (place.vicinity ? '<br><span style="color:#555;font-size:11px">' + escHtml(place.vicinity) + '</span>' : '')
      + '<br><div style="display:flex;gap:6px;margin-top:8px">'
      + '<button onclick="' + btnAction + '" '
      + 'style="flex:1;padding:6px 8px;background:#1976D2;color:#fff;border:none;border-radius:4px;'
      + 'cursor:pointer;font-size:12px;font-weight:700">' + btnLabel + '</button>'
      + '<a href="' + mapsUrl + '" target="_blank" rel="noopener" '
      + 'style="padding:6px 10px;background:#4CAF50;color:#fff;border-radius:4px;'
      + 'font-size:12px;font-weight:700;text-decoration:none">🗺️</a>'
      + '</div></div>'
  });

  marker.addListener('click', function() {
    if (_hebActiveIW) _hebActiveIW.close();
    _hebActiveIW = iw;
    iw.open(_hebMap, marker);
  });
  _hebSearchMarkers.push(marker);
}

// Récupère les détails complets puis remplit les champs (appelé depuis le bouton infowindow)
function selectHebPlace(placeId) {
  if (!_hebMap || !window.google) return;
  new google.maps.places.PlacesService(_hebMap).getDetails({
    placeId: placeId, language: 'fr',
    fields: ['name','formatted_address','formatted_phone_number','website',
             'rating','user_ratings_total','geometry','types','place_id']
  }, function(place, st) {
    if (st !== google.maps.places.PlacesServiceStatus.OK || !place) return;
    _clearHebSearchMarkers();
    _fillHebFromPlace(place);
  });
}

// Sélectionne un loueur depuis la carte hébergement → redirige vers les champs Déplacements
function selectLoueurFromHebMap(placeId, encodedMapsUrl) {
  if (!_hebMap || !window.google) return;
  new google.maps.places.PlacesService(_hebMap).getDetails({
    placeId: placeId, language: 'fr',
    fields: ['name','formatted_address','formatted_phone_number','website','geometry','place_id']
  }, function(place, st) {
    var mapsUrl = decodeURIComponent(encodedMapsUrl);
    var nom     = (st === google.maps.places.PlacesServiceStatus.OK && place) ? place.name : '';
    var adresse = (st === google.maps.places.PlacesServiceStatus.OK && place) ? (place.formatted_address || '') : '';

    // Remplir les champs de la page Déplacements
    var nomEl   = document.getElementById('infoLocationSociete');
    var lieuEl  = document.getElementById('infoLocationLieu');
    var mapsEl  = document.getElementById('infoLocationMaps');
    var locEl   = document.getElementById('infoLocationVoiture');
    if (nomEl)  nomEl.value  = nom;
    if (lieuEl) lieuEl.value = adresse;
    if (mapsEl) mapsEl.value = mapsUrl;
    if (locEl)  locEl.value  = 'oui';

    // Stocker le mode dans le trip
    var trip = currentTrip();
    if (trip) {
      trip.infos._modeArrivee = 'loueur';
      INFO_FIELDS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) trip.infos[id] = el.value;
      });
      save();
    }

    _clearHebSearchMarkers();
    if (_hebActiveIW) { _hebActiveIW.close(); _hebActiveIW = null; }

    updateDeplUI();
    toast('🚗 Loueur sélectionné : ' + nom + ' — voir page Déplacements', 'success');
    // Proposer de naviguer vers la page Déplacements
    setTimeout(function() {
      if (confirm('Loueur "' + nom + '" enregistré. Aller sur la page Déplacements ?')) navigate('deplacements');
    }, 400);
  });
}

// Sélectionne un aéroport → remplit aéroport arrivée aller + départ retour + stocke coords
function selectAeroportFromHebMap(placeId, encodedName, encodedAddr) {
  if (!_hebMap || !window.google) return;
  new google.maps.places.PlacesService(_hebMap).getDetails({
    placeId: placeId, language: 'fr',
    fields: ['name','formatted_address','geometry','place_id']
  }, function(place, st) {
    var nom    = (st === google.maps.places.PlacesServiceStatus.OK && place) ? place.name : decodeURIComponent(encodedName);
    var lat = place && place.geometry ? place.geometry.location.lat() : null;
    var lng = place && place.geometry ? place.geometry.location.lng() : null;

    // Remplir aéroport/gare arrivée aller ET départ retour
    var arrEl  = document.getElementById('infoAeroportArrivee');
    var depRet = document.getElementById('infoAeroportRetourDepart');
    if (arrEl)  arrEl.value  = nom;
    if (depRet) depRet.value = nom;

    // Type de transport → Avion
    var transAllerEl  = document.getElementById('infoTransportAller');
    var transRetourEl = document.getElementById('infoTransportRetour');
    if (transAllerEl)  transAllerEl.value  = 'avion';
    if (transRetourEl) transRetourEl.value = 'avion';

    // Pré-remplir les dates des vols avec les dates du séjour
    var trip = currentTrip();
    var d1 = trip && trip.infos && trip.infos.infoDateDepart  ? trip.infos.infoDateDepart  : '';
    var d2 = trip && trip.infos && trip.infos.infoDateRetour  ? trip.infos.infoDateRetour  : '';
    var hdAller  = document.getElementById('infoHeureDepart');
    var hdRetour = document.getElementById('infoHeureDepartRetour');
    if (hdAller  && d1) hdAller.value  = d1 + 'T08:00';
    if (hdRetour && d2) hdRetour.value = d2 + 'T14:00';

    // Stocker les coords + mode dans le trip
    if (trip) {
      if (lat && lng) { trip.infos._aeroLat = lat; trip.infos._aeroLon = lng; }
      trip.infos._aeroNom      = nom;
      trip.infos._modeArrivee  = 'aeroport';
      // Sauvegarder aussi les champs DOM déjà remplis
      INFO_FIELDS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) trip.infos[id] = el.value;
      });
      save();
    }

    _clearHebSearchMarkers();
    if (_hebActiveIW) { _hebActiveIW.close(); _hebActiveIW = null; }

    // Rafraîchir marqueurs et UI conditionnelle
    _renderAeroMarkerOnVisiter();
    _renderAeroMarkerOnDepl();
    updateTransportUI();

    toast('✈️ Aéroport enregistré : ' + nom + ' — transport aller/retour mis à jour', 'success');
  });
}

// Affiche le marqueur bleu de l'aéroport/gare sur la carte À visiter
function _renderAeroMarkerOnVisiter() {
  if (!_visiterMap) return;
  if (_visiterAeroMarker) { _visiterAeroMarker.setMap(null); _visiterAeroMarker = null; }
  var trip = currentTrip();
  if (!trip || !trip.infos || !trip.infos._aeroLat) return;
  var pos  = { lat: parseFloat(trip.infos._aeroLat), lng: parseFloat(trip.infos._aeroLon) };
  var nom  = trip.infos._aeroNom || 'Arrivée';
  var mode = trip.infos._modeArrivee || 'aeroport';
  var icon = mode === 'gare' ? '🚄' : '✈️';
  var label = mode === 'gare' ? 'Gare d\'arrivée' : 'Aéroport d\'arrivée';
  _visiterAeroMarker = new google.maps.Marker({
    map: _visiterMap, position: pos, zIndex: 19,
    title: nom,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px"><b>' + icon + ' ' + escHtml(nom) + '</b><br><span style="color:#555">' + label + '</span></div>'
  });
  _visiterAeroMarker.addListener('click', function() { iw.open(_visiterMap, _visiterAeroMarker); });
}

// Affiche le marqueur bleu de l'aéroport/gare sur la carte Déplacements
function _renderAeroMarkerOnDepl() {
  if (!_deplMap) return;
  if (_deplAeroMarker) { _deplAeroMarker.setMap(null); _deplAeroMarker = null; }
  var trip = currentTrip();
  if (!trip || !trip.infos || !trip.infos._aeroLat) return;
  var pos  = { lat: parseFloat(trip.infos._aeroLat), lng: parseFloat(trip.infos._aeroLon) };
  var nom  = trip.infos._aeroNom || 'Arrivée';
  var mode = trip.infos._modeArrivee || 'aeroport';
  var icon = mode === 'gare' ? '🚄' : '✈️';
  var label = mode === 'gare' ? 'Gare d\'arrivée' : 'Aéroport d\'arrivée';
  _deplAeroMarker = new google.maps.Marker({
    map: _deplMap, position: pos, zIndex: 98,
    title: nom,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px"><b>' + icon + ' ' + escHtml(nom) + '</b><br><span style="color:#555">' + label + '</span></div>'
  });
  _deplAeroMarker.addListener('click', function() { iw.open(_deplMap, _deplAeroMarker); });
}

// Sélectionne une gare → remplit gare arrivée aller + départ retour + transport Train
function selectGareFromHebMap(placeId, encodedName, encodedAddr) {
  if (!_hebMap || !window.google) return;
  new google.maps.places.PlacesService(_hebMap).getDetails({
    placeId: placeId, language: 'fr',
    fields: ['name','formatted_address','geometry','place_id']
  }, function(place, st) {
    var nom = (st === google.maps.places.PlacesServiceStatus.OK && place) ? place.name : decodeURIComponent(encodedName);
    var lat = place && place.geometry ? place.geometry.location.lat() : null;
    var lng = place && place.geometry ? place.geometry.location.lng() : null;

    // Remplir aéroport/gare arrivée aller ET départ retour
    var arrEl  = document.getElementById('infoAeroportArrivee');
    var depRet = document.getElementById('infoAeroportRetourDepart');
    if (arrEl)  arrEl.value  = nom;
    if (depRet) depRet.value = nom;

    // Type de transport → Train
    var transAllerEl  = document.getElementById('infoTransportAller');
    var transRetourEl = document.getElementById('infoTransportRetour');
    if (transAllerEl)  transAllerEl.value  = 'train';
    if (transRetourEl) transRetourEl.value = 'train';

    // Pré-remplir les dates des trajets avec les dates du séjour
    var trip = currentTrip();
    var d1 = trip && trip.infos && trip.infos.infoDateDepart ? trip.infos.infoDateDepart : '';
    var d2 = trip && trip.infos && trip.infos.infoDateRetour ? trip.infos.infoDateRetour : '';
    var hdAller  = document.getElementById('infoHeureDepart');
    var hdRetour = document.getElementById('infoHeureDepartRetour');
    if (hdAller  && d1) hdAller.value  = d1 + 'T08:00';
    if (hdRetour && d2) hdRetour.value = d2 + 'T14:00';

    // Stocker les coords + mode dans le trip
    if (trip) {
      if (lat && lng) { trip.infos._aeroLat = lat; trip.infos._aeroLon = lng; }
      trip.infos._aeroNom     = nom;
      trip.infos._modeArrivee = 'gare';
      INFO_FIELDS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) trip.infos[id] = el.value;
      });
      save();
    }

    _clearHebSearchMarkers();
    if (_hebActiveIW) { _hebActiveIW.close(); _hebActiveIW = null; }

    _renderAeroMarkerOnVisiter();
    _renderAeroMarkerOnDepl();
    updateTransportUI();

    toast('🚄 Gare enregistrée : ' + nom + ' — transport aller/retour mis à jour', 'success');
  });
}

// Remplit tous les champs hébergement + met à jour le marqueur vert + recalcule distances
function _fillHebFromPlace(place) {
  if (!place.geometry) return;
  var lat = place.geometry.location.lat();
  var lng = place.geometry.location.lng();

  // Mettre à jour le champ de recherche
  var si = document.getElementById('hebMapSearch');
  if (si) si.value = place.name || '';

  // Marqueur vert mis à jour
  _hebMap.panTo({ lat: lat, lng: lng });
  _hebMap.setZoom(16);
  if (_hebCurrentMarker) _hebCurrentMarker.setMap(null);
  _hebCurrentMarker = new google.maps.Marker({
    map: _hebMap, position: { lat: lat, lng: lng },
    title: place.name, animation: google.maps.Animation.DROP,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    zIndex: 20
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px"><b>🏨 ' + escHtml(place.name) + '</b><br>'
             + escHtml(place.formatted_address || '') + '</div>'
  });
  _hebCurrentMarker.addListener('click', function() { iw.open(_hebMap, _hebCurrentMarker); });
  iw.open(_hebMap, _hebCurrentMarker);

  // Remplir les champs formulaire
  document.getElementById('infoNomHebergement').value     = place.name || '';
  document.getElementById('infoAdresseHebergement').value = place.formatted_address || '';
  document.getElementById('infoTelHebergement').value     = place.formatted_phone_number || '';
  document.getElementById('infoSiteHebergement').value    = place.website || '';
  document.getElementById('infoRatingHebergement').value  = place.rating
    ? '⭐ ' + place.rating + '/5'
      + (place.user_ratings_total ? ' (' + place.user_ratings_total + ' avis)' : '')
    : '';

  // Type hébergement automatique
  var types = (place.types || []).join(',');
  var sel   = document.getElementById('infoTypeHebergement');
  if (sel) {
    if (/\bhotel\b/.test(types))        sel.value = 'hotel';
    else if (/campground/.test(types))  sel.value = 'camping';
    else if (/lodging/.test(types))     sel.value = 'hotel';
    else                                sel.value = 'autre';
  }

  // Sauvegarder coords + recalculer distances lieux "À visiter"
  var trip = currentTrip();
  if (trip) {
    var oldLat = trip.infos._hebLat;
    trip.infos._hebLat = lat;
    trip.infos._hebLon = lng;
    save();
    if (oldLat !== lat && trip.lieux && trip.lieux.length) _recalcAllDistances(trip);
  }
}

// Recalcule la distance de tous les lieux depuis le nouvel hébergement
function _recalcAllDistances(trip) {
  if (!trip || !trip.infos || !trip.infos._hebLat || !trip.lieux) return;
  var changed = false;
  trip.lieux.forEach(function(l) {
    if (!l.lat || !l.lon) return;
    var d = _computeDist(parseFloat(l.lat), parseFloat(l.lon));
    if (d) { l.distance = d; changed = true; }
  });
  if (changed) { save(); toast('📏 Distances recalculées', 'success'); renderLieux(); }
}

// Changement de type → relancer la recherche autour du centre actuel
function onHebTypeChange() {
  updateHebergementUI();
  if (!_hebMap) return;
  var val = (document.getElementById('infoTypeHebergement') || {}).value || '';
  var hint = document.getElementById('hebMapHint');
  if (val === 'loueur') {
    if (hint) hint.textContent = '🚗 Mode loueur · Cliquez sur la carte pour afficher les loueurs 🟡 — sélectionnez-en un pour remplir la page Déplacements.';
  } else if (val === 'aeroport') {
    if (hint) hint.textContent = '✈️ Mode aéroport · Les aéroports 🟡 s\'affichent — sélectionnez-en un pour remplir automatiquement l\'aéroport d\'arrivée (aller) et de départ (retour).';
  } else if (val === 'gare') {
    if (hint) hint.textContent = '🚄 Mode gare · Les gares 🟡 s\'affichent — sélectionnez-en une pour remplir automatiquement la gare d\'arrivée (aller) et de départ (retour).';
  } else {
    if (hint) hint.textContent = '💡 🟢 = hébergement enregistré · Cliquez sur la carte pour afficher les hébergements 🟡 à proximité.';
  }
  _showNearbyHebMarkers(_hebMap.getCenter());
}

// Géolocalisation
function locateMeHeb() {
  if (!navigator.geolocation) { toast('Géolocalisation non supportée', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    if (!_hebMap) return;
    var ll = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    _hebMap.panTo(ll); _hebMap.setZoom(15);
    _showNearbyHebMarkers(ll);
  });
}

// ── Carte À visiter ─────────────────────────────────────────
// Variables globales visiter (déclarées en haut de fichier avec les autres)
// _visiterMap, _visiterAutocomplete, _visiterHebMarker, _visiterLieuMarkers, _visiterInfoWindow
var _visiterSearchMarkers = []; // marqueurs jaunes résultats de recherche (comme _hebSearchMarkers)

// Catégories visiter → types Google Places pour la recherche à proximité
var _visiterCatTypes = {
  tous:       'point_of_interest',
  monument:   'tourist_attraction',
  restaurant: 'restaurant',
  nature:     'park',
  musee:      'museum',
  shopping:   'shopping_mall',
  autre:      'point_of_interest'
};

function initVisiterMap() {
  if (!_googleMapsReady || !window.google || _visiterMap) return;

  var trip = currentTrip();
  _visiterLastTripId = trip ? trip.id : null;

  // Centre par défaut = Paris
  var center = { lat: 48.8566, lng: 2.3522 };
  var zoom = 12;

  // Si hébergement géocodé → centrer dessus directement
  if (trip && trip.infos && trip.infos._hebLat) {
    center = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
    zoom = 14;
    _buildVisiterMap(center, zoom);
  } else {
    // Sinon géocoder la destination (ville+pays) comme la carte hébergement
    var dest = [
      trip && trip.infos && trip.infos.infoVille,
      trip && trip.infos && trip.infos.infoPays
    ].filter(Boolean).join(', ');

    if (dest) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: dest, language: 'fr' }, function(results, status) {
        if (status === 'OK' && results[0]) {
          center = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
          zoom = 13;
        }
        _buildVisiterMap(center, zoom);
      });
    } else {
      _buildVisiterMap(center, zoom);
    }
  }
}

function _buildVisiterMap(center, zoom) {
  if (_visiterMap) return; // déjà créée entre-temps
  var mapEl = document.getElementById('visiterGoogleMap');
  if (!mapEl) return;

  _visiterMap = new google.maps.Map(mapEl, {
    center: center, zoom: zoom,
    mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    gestureHandling: 'cooperative',
    styles: _darkMapStyles()
  });

  _visiterInfoWindow = new google.maps.InfoWindow();

  // Marqueur hébergement vert
  _renderHebMarkerOnVisiter();

  // Marqueur aéroport bleu
  _renderAeroMarkerOnVisiter();

  // Marqueurs lieux sauvegardés
  _renderVisiterMarkers();

  // Autocomplete
  _visiterAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('visiterMapSearch'), { language: 'fr' }
  );
  _visiterAutocomplete.bindTo('bounds', _visiterMap);
  _visiterAutocomplete.addListener('place_changed', function() {
    var place = _visiterAutocomplete.getPlace();
    if (!place || !place.geometry) return;
    var service = new google.maps.places.PlacesService(_visiterMap);
    service.getDetails({
      placeId: place.place_id, language: 'fr',
      fields: ['name','formatted_address','formatted_phone_number','website',
               'rating','user_ratings_total','geometry','types','place_id']
    }, function(detail, st) {
      var p = st === google.maps.places.PlacesServiceStatus.OK ? detail : place;
      _showVisiterSearchMarkers(p.geometry.location, p);
    });
  });

  // Clic simple → marqueurs jaunes à proximité
  _visiterMap.addListener('click', function(e) {
    _showVisiterSearchMarkers(e.latLng, null);
  });

  var hint = document.getElementById('visiterMapHint');
  if (hint) hint.textContent = '💡 🟢 = hébergement · 🔵 = aéroport · Cliquez sur la carte pour afficher les lieux 🟡 à proximité.';

  // Afficher automatiquement des marqueurs autour du centre au chargement
  setTimeout(function() {
    if (_visiterMap) _showVisiterSearchMarkers(_visiterMap.getCenter(), null);
  }, 700);
}

// Affiche le marqueur vert de l'hébergement sur la carte visiter
function _renderHebMarkerOnVisiter() {
  if (!_visiterMap) return;
  if (_visiterHebMarker) { _visiterHebMarker.setMap(null); _visiterHebMarker = null; }
  var trip = currentTrip();
  if (!trip || !trip.infos || !trip.infos._hebLat) return;
  var pos = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
  _visiterHebMarker = new google.maps.Marker({
    map: _visiterMap, position: pos, zIndex: 20,
    title: trip.infos.infoNomHebergement || 'Hébergement',
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px"><b>🏨 ' + escHtml(trip.infos.infoNomHebergement || 'Hébergement') + '</b></div>'
  });
  _visiterHebMarker.addListener('click', function() { iw.open(_visiterMap, _visiterHebMarker); });
  iw.open(_visiterMap, _visiterHebMarker);
}

// InfoWindow unique partagée pour visiter (ferme l'ancienne automatiquement)
var _visiterActiveIW = null;

// Affiche les marqueurs jaunes de résultats de recherche
function _showVisiterSearchMarkers(latLng, directPlace) {
  if (!_visiterMap || !window.google) return;
  var service = new google.maps.places.PlacesService(_visiterMap);

  // Effacer anciens marqueurs jaunes et fermer infowindow active
  _visiterSearchMarkers.forEach(function(m) { m.setMap(null); });
  _visiterSearchMarkers = [];
  if (_visiterActiveIW) { _visiterActiveIW.close(); _visiterActiveIW = null; }

  // Lieu précis depuis autocomplete → marqueur jaune direct
  if (directPlace && directPlace.geometry) {
    _placeVisiterSearchMarker(directPlace, 0);
    _visiterMap.panTo(directPlace.geometry.location);
    return;
  }

  // Recherche à proximité selon filtre actif
  // Pour plage et shopping on utilise `type` (plus ciblé), pour les autres `keyword`
  var searchParams = { location: latLng, radius: 20000, language: 'fr' };
  if (currentLieuFilter === 'plage') {
    // Google Places a "beach" dans les noms mais rarement en type
    // On cherche avec keyword en anglais ET français
    searchParams.keyword = 'plage beach';
  } else if (currentLieuFilter === 'shopping') {
    // type 'shopping_mall' est fiable pour les centres commerciaux
    searchParams.type = 'shopping_mall';
  } else if (currentLieuFilter === 'restaurant') {
    searchParams.type = 'restaurant';
  } else if (currentLieuFilter === 'monument') {
    searchParams.keyword = 'monument tourist église cathédrale historique';
  }
  // filtre 'tous' → pas de keyword ni type

  service.nearbySearch(searchParams, function(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
      // Fallback sans filtre
      service.nearbySearch({ location: latLng, radius: 20000, language: 'fr' }, function(r2, s2) {
        if (s2 === google.maps.places.PlacesServiceStatus.OK && r2.length) {
          r2.slice(0, 15).forEach(function(p, i) { _placeVisiterSearchMarker(p, i); });
        }
      });
      return;
    }
    results.slice(0, 15).forEach(function(p, i) { _placeVisiterSearchMarker(p, i); });
  });
}

// Place un marqueur jaune avec infowindow (ferme les autres au clic)
function _placeVisiterSearchMarker(place, idx) {
  if (!place.geometry) return;
  var pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
  var mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name) + '&query_place_id=' + place.place_id;
  var marker = new google.maps.Marker({
    map: _visiterMap, position: pos,
    title: place.name,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    animation: idx < 3 ? google.maps.Animation.DROP : null
  });
  var iw = new google.maps.InfoWindow({
    content: '<div style="color:#111;font-size:13px;max-width:240px">'
      + '<b>' + escHtml(place.name) + '</b>'
      + (place.rating ? '<br>⭐ ' + place.rating : '')
      + (place.vicinity ? '<br><span style="color:#555;font-size:11px">' + escHtml(place.vicinity) + '</span>' : '')
      + '<br><div style="display:flex;gap:6px;margin-top:7px">'
      + '<button onclick="selectVisiterPlace(\'' + place.place_id + '\')" style="flex:1;padding:5px 8px;background:#1976D2;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600">＋ Ajouter</button>'
      + '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="flex:1;padding:5px 8px;background:#4CAF50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;text-decoration:none;text-align:center">🗺️ Maps</a>'
      + '</div></div>'
  });
  marker.addListener('click', function() {
    if (_visiterActiveIW) _visiterActiveIW.close();
    _visiterActiveIW = iw;
    iw.open(_visiterMap, marker);
  });
  _visiterSearchMarkers.push(marker);
}

// Récupère les détails complets et ouvre le modal (appelée depuis le bouton dans l'infowindow)
function selectVisiterPlace(placeId) {
  if (!_visiterMap || !window.google) return;
  var service = new google.maps.places.PlacesService(_visiterMap);
  service.getDetails({
    placeId: placeId, language: 'fr',
    fields: ['name','formatted_address','formatted_phone_number','website',
             'rating','user_ratings_total','geometry','types','place_id']
  }, function(place, st) {
    if (st !== google.maps.places.PlacesServiceStatus.OK || !place) return;
    // Effacer les marqueurs jaunes
    _visiterSearchMarkers.forEach(function(m) { m.setMap(null); });
    _visiterSearchMarkers = [];
    // Remplir et ouvrir le modal
    _openLieuModalFromPlace(place);
  });
}

// Pré-remplit le modal depuis un objet place Google
function _openLieuModalFromPlace(place) {
  if (!place.geometry) return;
  var lat = place.geometry.location.lat();
  var lng = place.geometry.location.lng();
  var rating = place.rating
    ? '⭐ ' + place.rating + '/5' + (place.user_ratings_total ? ' (' + place.user_ratings_total + ' avis)' : '')
    : '';
  var dist = _computeDist(lat, lng);
  var cat = (currentLieuFilter && currentLieuFilter !== 'tous')
    ? currentLieuFilter
    : (guessCategoryFromGoogleTypes(place.types || [])
       || guessCategoryFromName(place.name)
       || 'monument');

  document.getElementById('newLieuNom').value       = place.name || '';
  document.getElementById('newLieuAdresse').value   = place.formatted_address || '';
  document.getElementById('newLieuRating').value    = rating;
  document.getElementById('newLieuTel').value       = place.formatted_phone_number || '';
  document.getElementById('newLieuSite').value      = place.website || '';
  document.getElementById('newLieuCoords').value    = lat + ',' + lng;
  document.getElementById('newLieuDistance').value  = dist;
  document.getElementById('newLieuNotes').value     = '';
  document.getElementById('newLieuCategorie').value = cat;
  // Stocker le place_id pour le bouton Maps précis
  var placeIdEl = document.getElementById('newLieuPlaceId');
  if (placeIdEl) placeIdEl.value = place.place_id || '';

  _editingLieuId = null;
  document.getElementById('modalLieuTitle').textContent  = '📍 Ajouter ce lieu';
  document.getElementById('btnConfirmLieu').textContent  = '＋ Ajouter';
  openModal('modalAddLieu');
}

// Marqueurs des lieux sauvegardés (couleurs par catégorie)
function _renderVisiterMarkers() {
  if (!_visiterMap) return;
  _visiterLieuMarkers.forEach(function(m) { m.setMap(null); });
  _visiterLieuMarkers = [];
  var trip = currentTrip();
  if (!trip || !trip.lieux || !trip.lieux.length) return;

  var catIcons = {
    monument:   'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    restaurant: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
    plage:      'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png',
    shopping:   'https://maps.google.com/mapfiles/ms/icons/pink-dot.png'
  };
  var defaultIcon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';

  var filtered = trip.lieux.filter(function(l) {
    return currentLieuFilter === 'tous' || l.cat === currentLieuFilter;
  });

  filtered.forEach(function(l) {
    if (!l.lat || !l.lon) return;
    var marker = new google.maps.Marker({
      map: _visiterMap,
      position: { lat: parseFloat(l.lat), lng: parseFloat(l.lon) },
      title: l.nom,
      icon: { url: catIcons[l.cat] || defaultIcon },
      zIndex: 5
    });
    var iw = new google.maps.InfoWindow({
      content: '<div style="color:#111;font-size:12px;max-width:200px">'
        + '<b>' + escHtml(l.nom) + '</b>'
        + (l.distance ? '<br>📏 ' + escHtml(l.distance) : '')
        + (l.rating   ? '<br>⭐ ' + escHtml(l.rating)   : '')
        + (l.adresse  ? '<br><span style="color:#555;font-size:11px">' + escHtml(l.adresse.split(',')[0]) + '</span>' : '')
        + '</div>'
    });
    marker.addListener('click', function() { iw.open(_visiterMap, marker); });
    _visiterLieuMarkers.push(marker);
  });
}

function locateMeVisiter() {
  if (!navigator.geolocation) { toast('Géolocalisation non supportée', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    if (!_visiterMap) return;
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    _visiterMap.panTo(latlng);
    _visiterMap.setZoom(15);
    _showVisiterSearchMarkers(latlng, null);
  }, function() {
    toast('Impossible d\'obtenir la position', 'error');
  });
}

// Distance hébergement (Haversine)
function _computeDist(lat, lng) {
  var trip = currentTrip();
  if (!trip || !trip.infos || !trip.infos._hebLat) return '';
  var hebLat = parseFloat(trip.infos._hebLat);
  var hebLng = parseFloat(trip.infos._hebLon);
  if (_googleMapsReady && window.google && google.maps.geometry) {
    var dist = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(hebLat, hebLng), new google.maps.LatLng(lat, lng)
    );
    return dist < 1000 ? Math.round(dist) + ' m' : (dist/1000).toFixed(1) + ' km';
  }
  var R = 6371000, dLat = (lat-hebLat)*Math.PI/180, dLon = (lng-hebLng)*Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(hebLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  var d = R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return d < 1000 ? Math.round(d) + ' m' : (d/1000).toFixed(1) + ' km';
}

function geocodeHebergement() {
  var trip = currentTrip(); if (!trip) return;
  if (!_googleMapsReady || !window.google) return;
  var addr = [trip.infos.infoNomHebergement, trip.infos.infoAdresseHebergement].filter(Boolean).join(', ');
  if (!addr) return;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: addr, language: 'fr' }, function(results, status) {
    if (status === 'OK' && results[0]) {
      trip.infos._hebLat = results[0].geometry.location.lat();
      trip.infos._hebLon = results[0].geometry.location.lng();
      save();
    }
  });
}

function guessCategoryFromGoogleTypes(types) {
  var t = (types || []).join(',');
  // Restaurant en priorité (très nombreux types Google)
  if (/restaurant|food|cafe|bar|meal_takeaway|meal_delivery|bakery|night_club/.test(t)) return 'restaurant';
  // Shopping
  if (/shopping_mall|department_store|clothing_store|shoe_store|jewelry_store|furniture_store|home_goods_store|electronics_store|hardware_store|store/.test(t)) return 'shopping';
  // Plage — Google n'a pas de type "beach" mais on voit "natural_feature" parfois + on vérifie le nom
  if (/\bbeach\b/.test(t)) return 'plage';
  // Monuments, tourisme, culture
  if (/tourist_attraction|point_of_interest|church|place_of_worship|stadium|museum|art_gallery|park|natural_feature|campground|amusement_park|zoo|aquarium|hindu_temple|mosque|synagogue|casino/.test(t)) return 'monument';
  return null;
}

// Devine la catégorie depuis le NOM d'un lieu (fallback si types insuffisants)
function guessCategoryFromName(name) {
  if (!name) return null;
  var n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\b(plage|beach|spiaggia|playa|praia|strand)\b/.test(n)) return 'plage';
  if (/\b(restaurant|brasserie|bistrot|bistro|cafe|cafe|bar\b|grill|pizzeria|trattoria|sushi|ramen|kebab|burger|mcdo|kfc|subway)\b/.test(n)) return 'restaurant';
  if (/\b(mall|galerie|centre commercial|shopping|zara|h&m|primark|lidl|carrefour|auchan|leclerc|super|hyper)\b/.test(n)) return 'shopping';
  return null;
}

function _darkMapStyles() {
  return [
    { featureType:'all',       elementType:'geometry',            stylers:[{color:'#1e2130'}] },
    { featureType:'all',       elementType:'labels.text.fill',    stylers:[{color:'#8899bb'}] },
    { featureType:'all',       elementType:'labels.text.stroke',  stylers:[{color:'#13172a'},{weight:2}] },
    { featureType:'all',       elementType:'labels.icon',         stylers:[{visibility:'off'}] },
    { featureType:'water',     elementType:'geometry',            stylers:[{color:'#0d1321'}] },
    { featureType:'road',      elementType:'geometry',            stylers:[{color:'#2d3148'}] },
    { featureType:'road',      elementType:'geometry.stroke',     stylers:[{color:'#1a1e2e'}] },
    { featureType:'landscape', elementType:'geometry',            stylers:[{color:'#1a1e2e'}] },
    { featureType:'transit',   elementType:'geometry',            stylers:[{color:'#252840'}] },
    { featureType:'poi',       elementType:'geometry',            stylers:[{color:'#1e2232'}] },
    { featureType:'poi',       elementType:'labels.text.fill',    stylers:[{color:'#6677aa'}] },
    { featureType:'poi.park',  elementType:'geometry',            stylers:[{color:'#182420'}] },
  ];
}

// Fonctions hébergement Maps externes (panneaux de recherche) conservées pour compatibilité
function getMapsDestination() {
  // Lire depuis le DOM en priorité (avant sauvegarde), fallback sur state
  var ville = (document.getElementById('infoVille') || {}).value
    || (currentTrip() && currentTrip().infos && currentTrip().infos.infoVille) || '';
  var pays  = (document.getElementById('infoPays')  || {}).value
    || (currentTrip() && currentTrip().infos && currentTrip().infos.infoPays)  || '';
  return [ville, pays].filter(Boolean).join(', ');
}
function openMapsSearch() {
  var q = (document.getElementById('mapsSearchInput') || {}).value; if (!q) return;
  window.open('https://www.google.com/maps/search/' + encodeURIComponent(q + ' ' + getMapsDestination()), '_blank', 'noopener');
}
function openMapsCategory(cat) {
  window.open('https://www.google.com/maps/search/' + encodeURIComponent(cat + ' ' + getMapsDestination()), '_blank', 'noopener');
}
function openMapsHeb() {
  var q = (document.getElementById('mapsHebInput') || {}).value; if (!q) return;
  window.open('https://www.google.com/maps/search/' + encodeURIComponent(q + ' ' + getMapsDestination()), '_blank', 'noopener');
}
function openMapsHebCat(cat) {
  window.open('https://www.google.com/maps/search/' + encodeURIComponent(cat + ' ' + getMapsDestination()), '_blank', 'noopener');
}
function updateMapsHebDest() {
  var el = document.getElementById('mapsHebDest'); if (!el) return;
  var d = getMapsDestination();
  el.textContent = d ? '📍 ' + d : ''; el.style.display = d ? 'inline-block' : 'none';
}
function updateMapsSearchDest() {
  var el = document.getElementById('mapsSearchDest'); if (!el) return;
  var d = getMapsDestination();
  el.textContent = d ? '📍 ' + d : ''; el.style.display = d ? 'inline-block' : 'none';
  updateMapsHebDest();
}
function openMapsHotelWithProposal() { openMapsCategory('hôtels'); }
function goSearchHotelsAndFill() { closeModal('modalHotelProposal'); openMapsHebCat('hôtels'); }
function goToHebergement() { closeModal('modalHotelProposal'); navigate('infos'); }

// ── À VISITER ──────────────────────────────────────────────
function renderLieux() {
  var trip = currentTrip();
  var container = document.getElementById('lieuxContainer');
  updateMapsSearchDest();
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun voyage sélectionné</h2></div>';
    _renderVisiterMarkers();
    return;
  }
  var dest = [trip.infos && trip.infos.infoVille, trip.infos && trip.infos.infoPays].filter(Boolean).join(', ');
  document.getElementById('visiterSubtitle').textContent = dest || 'Planifiez vos visites';

  // Géocoder hébergement en arrière-plan si pas fait
  if (trip.infos && !trip.infos._hebLat && (trip.infos.infoAdresseHebergement || trip.infos.infoNomHebergement)) {
    geocodeHebergement();
  }

  var lieux = (trip.lieux || []).filter(function(l) { return currentLieuFilter === 'tous' || l.cat === currentLieuFilter; });
  if (!lieux.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun lieu' + (currentLieuFilter !== 'tous' ? ' dans cette catégorie' : '') + '</h2><p>Cliquez sur "+ Ajouter un lieu" pour commencer</p></div>';
    _renderVisiterMarkers();
    return;
  }

  container.innerHTML = lieux.map(function(l) {
    var addrEnc = encodeURIComponent(l.adresse || l.nom);
    var gmUrl = l.placeId
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.nom) + '&query_place_id=' + l.placeId
      : (l.lat && l.lon
          ? 'https://www.google.com/maps/search/?api=1&query=' + l.lat + ',' + l.lon
          : 'https://www.google.com/maps/search/?api=1&query=' + addrEnc);
    return '<div class="lieu-card">' +
      '<div class="lieu-header">' +
        '<span class="lieu-title">' + (CAT_ICONS[l.cat] || '📌') + ' ' + escHtml(l.nom) + '</span>' +
        '<span class="lieu-cat-badge">' + (CAT_LABELS[l.cat] || l.cat) + '</span>' +
      '</div>' +
      '<div class="lieu-meta">' +
        (l.adresse  ? '<span>📍 ' + escHtml(l.adresse.split(',')[0]) + '</span>' : '') +
        (l.distance ? '<span>📏 ' + escHtml(l.distance) + '</span>' : '') +
        (l.rating   ? '<span>⭐ ' + escHtml(l.rating) + '</span>' : '') +
      '</div>' +
      (l.notes ? '<div class="lieu-notes">💬 ' + escHtml(l.notes) + '</div>' : '') +
      '<div class="lieu-actions">' +
        '<a class="btn-maps" href="' + gmUrl + '" target="_blank" rel="noopener">🗺️ Google Maps</a>' +
        '<a class="btn-maps plans" href="https://maps.apple.com/?q=' + addrEnc + '" target="_blank" rel="noopener">🍎 Plans</a>' +
        '<a class="btn-maps waze" href="https://waze.com/ul?q=' + addrEnc + '" target="_blank" rel="noopener">🚗 Waze</a>' +
        '<button class="btn-icon btn-edit" onclick="editLieu(\'' + l.id + '\')" title="Modifier">✏️</button>' +
        '<button class="btn-danger" onclick="deleteLieu(\'' + l.id + '\')">🗑️</button>' +
      '</div></div>';
  }).join('');

  // Rafraîchir les marqueurs sur la carte
  _renderVisiterMarkers();
}

function filterLieux(filter, btn) {
  currentLieuFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderLieux();
  if (_visiterMap) {
    _renderVisiterMarkers();
    // Relancer la recherche de marqueurs jaunes avec le nouveau filtre
    _showVisiterSearchMarkers(_visiterMap.getCenter(), null);
  }
}

function triParDistance() {
  var trip = currentTrip(); if (!trip) return;
  trip.lieux.sort(function(a, b) { return (parseFloat(a.distance) || 9999) - (parseFloat(b.distance) || 9999); });
  save(); renderLieux();
  toast('📏 Triés par distance');
}


function showAddLieu() {
  _editingLieuId = null;
  _openLieuModal(null);
}

function editLieu(id) {
  var trip = currentTrip(); if (!trip) return;
  var lieu = (trip.lieux || []).find(function(l) { return l.id === id; });
  if (!lieu) return;
  _editingLieuId = id;
  _openLieuModal(lieu);
}


function _openLieuModal(lieu) {
  document.getElementById('newLieuNom').value      = lieu ? (lieu.nom      || '') : '';
  document.getElementById('newLieuAdresse').value  = lieu ? (lieu.adresse  || '') : '';
  document.getElementById('newLieuDistance').value = lieu ? (lieu.distance || '') : '';
  document.getElementById('newLieuNotes').value    = lieu ? (lieu.notes    || '') : '';
  document.getElementById('newLieuCoords').value   = lieu && lieu.lat ? lieu.lat + ',' + lieu.lon : '';
  var placeIdEl = document.getElementById('newLieuPlaceId');
  if (placeIdEl) placeIdEl.value = lieu ? (lieu.placeId || '') : '';
  document.getElementById('newLieuRating').value   = lieu ? (lieu.rating   || '') : '';
  document.getElementById('newLieuTel').value      = lieu ? (lieu.tel      || '') : '';
  document.getElementById('newLieuSite').value     = lieu ? (lieu.site     || '') : '';
  if (lieu) {
    document.getElementById('newLieuCategorie').value  = lieu.cat || 'autre';
    document.getElementById('modalLieuTitle').textContent   = '✏️ Modifier le lieu';
    document.getElementById('btnConfirmLieu').textContent   = '💾 Enregistrer';
  } else {
    document.getElementById('modalLieuTitle').textContent   = '📍 Ajouter un lieu';
    document.getElementById('btnConfirmLieu').textContent   = '＋ Ajouter';
  }
  openModal('modalAddLieu');
}

function confirmAddLieu() {
  var trip = currentTrip(); if (!trip) return;
  var nom = document.getElementById('newLieuNom').value.trim();
  if (!nom) { toast('Entrez un nom de lieu', 'error'); return; }

  var coords = document.getElementById('newLieuCoords').value.split(',');
  var lat = coords[0] ? coords[0].trim() : '';
  var lon = coords[1] ? coords[1].trim() : '';
  var placeId = (document.getElementById('newLieuPlaceId') || {}).value || '';

  if (_editingLieuId) {
    for (var i = 0; i < (trip.lieux || []).length; i++) {
      if (trip.lieux[i].id === _editingLieuId) {
        trip.lieux[i].nom      = nom;
        trip.lieux[i].cat      = document.getElementById('newLieuCategorie').value;
        trip.lieux[i].adresse  = document.getElementById('newLieuAdresse').value.trim();
        trip.lieux[i].distance = document.getElementById('newLieuDistance').value.trim();
        trip.lieux[i].notes    = document.getElementById('newLieuNotes').value.trim();
        trip.lieux[i].rating   = document.getElementById('newLieuRating').value.trim();
        trip.lieux[i].tel      = document.getElementById('newLieuTel').value.trim();
        trip.lieux[i].site     = document.getElementById('newLieuSite').value.trim();
        trip.lieux[i].lat      = lat;
        trip.lieux[i].lon      = lon;
        if (placeId) trip.lieux[i].placeId = placeId;
        break;
      }
    }
    toast('✏️ Lieu modifié', 'success');
  } else {
    if (!trip.lieux) trip.lieux = [];
    trip.lieux.push({
      id: genId(), nom: nom,
      cat:      document.getElementById('newLieuCategorie').value,
      adresse:  document.getElementById('newLieuAdresse').value.trim(),
      distance: document.getElementById('newLieuDistance').value.trim(),
      notes:    document.getElementById('newLieuNotes').value.trim(),
      rating:   document.getElementById('newLieuRating').value.trim(),
      tel:      document.getElementById('newLieuTel').value.trim(),
      site:     document.getElementById('newLieuSite').value.trim(),
      lat: lat, lon: lon,
      placeId:  placeId,
    });
    toast('📍 Lieu ajouté', 'success');
  }
  _editingLieuId = null;
  save(); closeModal('modalAddLieu'); renderLieux();
}

function deleteLieu(id) {
  var trip = currentTrip(); if (!trip) return;
  if (!confirm('Supprimer ce lieu ?')) return;
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

  // Cohérence : si currentTripId ne correspond à aucun trip, corriger
  if (state.currentTripId) {
    var found = false;
    for (var i = 0; i < state.trips.length; i++) {
      if (state.trips[i].id === state.currentTripId) { found = true; break; }
    }
    if (!found) state.currentTripId = state.trips.length > 0 ? state.trips[0].id : null;
  }

  if (state.trips.length > 0) {
    if (!state.currentTripId) state.currentTripId = state.trips[0].id;
    loadCurrentTrip();
  } else {
    var sub = document.getElementById('infosSubtitle');
    if (sub) sub.textContent = 'Créez votre premier voyage pour commencer';
    // Ouvrir automatiquement le modal "Nouveau voyage"
    setTimeout(function() { openNewTripModal(); }, 300);
  }

  navigate(state.currentPage || 'infos');
  initAutocompletes();

  var d1 = document.getElementById('infoDateDepart');
  var d2 = document.getElementById('infoDateRetour');
  if (d1) d1.addEventListener('change', prefillTransportDates);
  if (d2) d2.addEventListener('change', prefillTransportDates);
  prefillTransportDates();

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

// ── PARAMÈTRES ─────────────────────────────────────────────
var APP_VERSION = 'v1.1.0';

function renderParametres() {
  // Mettre à jour les affichages de version
  var el = document.getElementById('aboutVersion');
  if (el) el.textContent = APP_VERSION;
  var elv = document.getElementById('appVersion');
  if (elv) elv.textContent = APP_VERSION;
  // Infos export
  var info = document.getElementById('exportInfo');
  if (info) {
    var nb = (state.trips || []).length;
    info.textContent = nb + ' voyage' + (nb > 1 ? 's' : '') + ' enregistré' + (nb > 1 ? 's' : '');
  }
}

function exportData() {
  try {
    var data = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      state: state
    };
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var d = new Date();
    var dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    a.href = url;
    a.download = 'jpmv-sauvegarde-' + dateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('💾 Sauvegarde téléchargée', 'success');
    var info = document.getElementById('exportInfo');
    if (info) info.textContent = '✅ Fichier téléchargé le ' + d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR');
  } catch(e) {
    toast('Erreur lors de l\'export', 'error');
  }
}

function importData(event) {
  var file = event.target.files[0];
  if (!file) return;
  var info = document.getElementById('importInfo');
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      // Accepter format direct state ou enveloppé
      var imported = data.state || data;
      if (!imported.trips) throw new Error('Format invalide');
      if (!confirm('⚠️ Remplacer toutes vos données actuelles par cette sauvegarde (' + (imported.trips.length) + ' voyage(s)) ?')) {
        event.target.value = '';
        return;
      }
      // Fusionner proprement
      state.trips = imported.trips || [];
      state.currentTripId = imported.currentTripId || (state.trips[0] ? state.trips[0].id : null);
      save();
      loadCurrentTrip();
      renderTripSelector();
      navigate(state.currentPage || 'infos');
      toast('📂 ' + state.trips.length + ' voyage(s) importé(s) !', 'success');
      if (info) info.textContent = '✅ ' + state.trips.length + ' voyage(s) importé(s) depuis "' + file.name + '"';
    } catch(err) {
      toast('Fichier invalide ou corrompu', 'error');
      if (info) info.textContent = '❌ Erreur : ' + err.message;
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('⚠️ Supprimer DÉFINITIVEMENT tous les voyages et données ?\n\nCette action est irréversible.')) return;
  if (!confirm('Êtes-vous sûr(e) ? Toutes les données seront perdues.')) return;
  state = { trips: [], currentTripId: null, currentPage: 'infos' };
  save();
  renderTripSelector();
  loadCurrentTrip();
  navigate('infos');
  toast('🗑️ Toutes les données supprimées', 'success');
}

// ── POPUPS D'AIDE ──────────────────────────────────────────
function toggleHebHelp() {
  var p = document.getElementById('hebHelpPopup');
  if (!p) return;
  p.style.display = p.style.display === 'block' ? 'none' : 'block';
}
function toggleVisiterHelp() {
  var p = document.getElementById('visiterHelpPopup');
  if (!p) return;
  p.style.display = p.style.display === 'block' ? 'none' : 'block';
}
