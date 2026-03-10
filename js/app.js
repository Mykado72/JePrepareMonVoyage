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

function resetAllData() {
  if (!confirm('⚠️ Supprimer TOUTES les données et repartir de zéro ?\n\nCette action est irréversible.')) return;
  localStorage.removeItem('jpmv_state');
  state.trips = [];
  state.currentTripId = null;
  state.currentPage = 'infos';
  renderTripSelector();
  renderTripList();
  loadCurrentTrip();
  navigate('infos');
  toast('🗑️ Données réinitialisées', 'success');
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
  else if (page === 'visiter') { renderLieux(); setTimeout(function() { if (!_visiterMap) initVisiterMap(); else google.maps.event.trigger(_visiterMap, 'resize'); }, 150); }
  else if (page === 'budget') renderBudget();
  else if (page === 'infos') { setTimeout(function() { refreshHebMap(); }, 200); }
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
  'infoLocationVoiture','infoLocationSociete','infoLocationRef','infoLocationLieu',
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
  updateNuitsDisplay();
  updateMapsHebDest();
  // Pré-remplir les dates transport uniquement si champs encore vides
  var hdAller = document.getElementById('infoHeureDepart');
  var hdRetour = document.getElementById('infoHeureDepartRetour');
  var d1 = document.getElementById('infoDateDepart') ? document.getElementById('infoDateDepart').value : '';
  var d2 = document.getElementById('infoDateRetour') ? document.getElementById('infoDateRetour').value : '';
  if (hdAller && !hdAller.value && d1) hdAller.value = d1 + 'T08:00';
  if (hdRetour && !hdRetour.value && d2) hdRetour.value = d2 + 'T14:00';
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

// Villes globales (liste étendue ~500 villes)
var VILLES_GLOBALES = [
  // France
  'Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Strasbourg','Montpellier','Bordeaux',
  'Lille','Rennes','Reims','Saint-Étienne','Toulon','Grenoble','Dijon','Angers','Nîmes',
  'Aix-en-Provence','Clermont-Ferrand','Brest','Tours','Amiens','Metz','Perpignan','Caen',
  'Rouen','Nancy','Avignon','Orléans','Mulhouse','Cannes','Antibes','Montauban','La Rochelle',
  'Biarritz','Bayonne','Pau','Annecy','Chambéry','Ajaccio','Bastia',
  // Espagne
  'Madrid','Barcelone','Valence','Séville','Saragosse','Málaga','Murcie','Palma de Majorque',
  'Las Palmas','Bilbao','Alicante','Cordoue','Valladolid','Vigo','Gijón','Grenade','Cadix',
  'Ibiza','Tenerife','Lanzarote','Fuerteventura','Saint-Sébastien','Santander','Salamanque',
  'Tolède','Burgos','León',
  // Italie
  'Rome','Milan','Naples','Turin','Palerme','Gênes','Bologne','Florence','Bari','Catane',
  'Venise','Vérone','Messine','Padoue','Trieste','Tarente','Brescia','Prato','Parme','Modène',
  'Reggio de Calabre','Livourne','Cagliari','Ferrare','Bolzano','Trente','Pérouse','Sienne',
  'Ravenne','Ancône','Amalfi','Capri','Positano','Portofino','Cinque Terre','Côme','Bellagio',
  // Portugal
  'Lisbonne','Porto','Braga','Amadora','Setúbal','Coimbra','Funchal','Faro','Évora',
  'Sintra','Cascais','Albufeira','Lagos','Portimão','Tavira',
  // Grèce
  'Athènes','Thessalonique','Héraklion','Patras','Larissa','Volos','Ioannina','Kavala',
  'Santorin','Mykonos','Rhodes','Corfou','Zakynthos','Skiathos','Paros','Naxos','Kos','Crete',
  // Allemagne
  'Berlin','Hambourg','Munich','Cologne','Francfort','Stuttgart','Düsseldorf','Leipzig',
  'Dortmund','Essen','Bremen','Dresde','Hanovre','Nuremberg','Duisbourg','Bochum','Wuppertal',
  'Bielefeld','Bonn','Mannheim','Karlsruhe','Münster','Augsbourg','Wiesbaden','Heidelberg',
  'Fribourg-en-Brisgau','Kiel','Mayence','Aix-la-Chapelle','Trèves','Constance','Bamberg',
  // Royaume-Uni
  'Londres','Birmingham','Manchester','Leeds','Glasgow','Sheffield','Bradford','Liverpool',
  'Édimbourg','Bristol','Cardiff','Belfast','Leicester','Nottingham','Coventry','Hull',
  'Bradford','Southampton','Oxford','Cambridge','Bath','Brighton','York','Chester','Exeter',
  'Inverness','Aberdeen','Dundee','Stirling',
  // Pays-Bas
  'Amsterdam','Rotterdam','La Haye','Utrecht','Eindhoven','Tilburg','Groningue','Almere',
  'Breda','Nimègue','Enschede','Apeldoorn','Leyde','Delft','Maastricht','Zwolle',
  // Belgique
  'Bruxelles','Anvers','Gand','Charleroi','Liège','Bruges','Namur','Louvain','Mons',
  'Aalst','Genk','Hasselt','Tournai',
  // Suisse
  'Zurich','Genève','Bâle','Berne','Lausanne','Winterthour','Saint-Gall','Lucerne',
  'Lugano','Bienne','Thoune','Coire','Zoug','Fribourg','Sion','Interlaken',
  // Autriche
  'Vienne','Graz','Linz','Salzbourg','Innsbruck','Klagenfurt','Villach','Wels','Steyr',
  // Scandinavie
  'Stockholm','Göteborg','Malmö','Uppsala','Oslo','Bergen','Stavanger','Trondheim',
  'Copenhague','Aarhus','Odense','Helsinki','Tampere','Turku','Espoo','Oulu',
  'Reykjavik','Akureyri',
  // Europe de l'Est
  'Prague','Brno','Ostrava','Varsovie','Cracovie','Łódź','Wrocław','Poznań','Gdańsk',
  'Budapest','Debrecen','Miskolc','Bratislava','Košice','Bucarest','Cluj-Napoca','Timișoara',
  'Sofia','Plovdiv','Varna','Zagreb','Split','Dubrovnik','Sarajevo','Belgrade','Novi Sad',
  'Ljubljana','Tallinn','Riga','Vilnius','Minsk','Kiev','Lviv','Odessa','Kharkiv',
  // Turquie
  'Istanbul','Ankara','Izmir','Bursa','Antalya','Adana','Konya','Gaziantep','Trabzon',
  'Cappadoce','Pamukkale','Éphèse','Bodrum','Marmaris','Alanya','Belek',
  // Russie
  'Moscou','Saint-Pétersbourg','Novossibirsk','Iekaterinbourg','Kazan','Nijni Novgorod',
  'Vladivostok','Sotchi','Krasnodar',
  // Afrique du Nord
  'Casablanca','Rabat','Fès','Marrakech','Tanger','Agadir','Meknès','Oujda','Tétouan',
  'Alger','Oran','Constantine','Annaba','Batna','Sétif','Tunis','Sfax','Sousse','Monastir',
  'Le Caire','Alexandrie','Louxor','Assouan','Hurghada','Charm el-Cheikh','Dahab',
  // Afrique subsaharienne
  'Dakar','Abidjan','Accra','Lagos','Nairobi','Le Cap','Johannesburg','Durban','Pretoria',
  'Addis-Abeba','Dar es Salaam','Maputo','Kampala','Kigali','Douala','Yaoundé',
  'Abuja','Libreville','Brazzaville','Luanda','Antananarivo','Île Maurice',
  // Moyen-Orient
  'Dubai','Abu Dhabi','Dubaï','Sharjah','Doha','Koweït','Manama','Mascate','Riyad','Djeddah',
  'Tel Aviv','Jérusalem','Haïfa','Beyrouth','Amman','Bagdad','Téhéran','Ispahan',
  // Inde & Asie du Sud
  'Mumbai','Delhi','Bangalore','Hyderabad','Ahmedabad','Chennai','Kolkata','Surat','Pune',
  'Jaipur','Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Goa',
  'Agra','Varanasi','Amritsar','Chandigarh','Kochi','Trivandrum','Mysore','Jodhpur','Udaipur',
  'Colombo','Negombo','Kandy','Galle','Katmandou','Pokhara','Dhaka','Karachi','Lahore',
  // Asie du Sud-Est
  'Bangkok','Chiang Mai','Phuket','Pattaya','Koh Samui','Koh Phangan','Kanchanaburi',
  'Singapour','Kuala Lumpur','Penang','Langkawi','Kota Kinabalu','Johor Bahru',
  'Jakarta','Bali','Ubud','Lombok','Yogyakarta','Surabaya','Bandung','Medan',
  'Ho Chi Minh-Ville','Hanoi','Da Nang','Hoi An','Hué','Nha Trang','Ha Long',
  'Phnom Penh','Siem Reap','Vientiane','Luang Prabang','Rangoun','Mandalay',
  'Manille','Cebu','Boracay','Palawan','Davao',
  // Chine & Asie de l'Est
  'Pékin','Shanghai','Guangzhou','Shenzhen','Chengdu','Xi\'an','Hangzhou','Wuhan',
  'Chongqing','Nanjing','Tianjin','Suzhou','Zhengzhou','Qingdao','Xiamen','Guilin','Lijiang',
  'Hong Kong','Macao','Taipei','Tainan','Kaohsiung',
  'Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Fukuoka','Kobe','Hiroshima','Nara',
  'Séoul','Busan','Incheon','Daegu','Gwangju','Jeju',
  // Amériques
  'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphie','San Antonio',
  'San Diego','Dallas','San José','Austin','Jacksonville','Fort Worth','Columbus','Charlotte',
  'Indianapolis','San Francisco','Seattle','Denver','Nashville','Washington','Boston','Miami',
  'Las Vegas','Portland','Memphis','Louisville','Baltimore','Atlanta','Montréal','Toronto',
  'Vancouver','Calgary','Ottawa','Québec','Winnipeg','Halifax',
  'Mexico','Guadalajara','Monterrey','Cancún','Playa del Carmen','Tulum','Puerto Vallarta',
  'Havane','Santiago','Buenos Aires','Montevideo','Lima','Bogotá','Medellín','Cali',
  'São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza','Recife','Belo Horizonte',
  'Quito','La Paz','Sucre','Asunción','Caracas',
  // Océanie
  'Sydney','Melbourne','Brisbane','Perth','Adélaïde','Canberra','Cairns','Darwin','Hobart',
  'Auckland','Wellington','Christchurch','Queenstown','Rotorua',
  'Fidji','Bora Bora','Papeete','Nouméa',
  // Maldives / Îles
  'Malé','Hulhumalé','Maafushi','Maldives',
  'Pointe-à-Pitre','Fort-de-France','Saint-Denis','Papeete','Cayenne',
];

// Villes par pays (sous-liste affinée quand un pays est saisi)
var VILLES_PAR_PAYS = {
  'france': ['Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Strasbourg','Montpellier',
    'Bordeaux','Lille','Rennes','Reims','Saint-Étienne','Toulon','Grenoble','Dijon','Angers',
    'Nîmes','Aix-en-Provence','Clermont-Ferrand','Brest','Tours','Amiens','Metz','Perpignan',
    'Caen','Rouen','Nancy','Avignon','Orléans','Mulhouse','Cannes','Antibes','La Rochelle',
    'Biarritz','Bayonne','Pau','Annecy','Chambéry','Ajaccio','Bastia','Metz','Colmar'],
  'espagne': ['Madrid','Barcelone','Valence','Séville','Saragosse','Málaga','Murcie',
    'Palma de Majorque','Las Palmas','Bilbao','Alicante','Cordoue','Valladolid','Vigo',
    'Grenade','Cadix','Ibiza','Tenerife','Lanzarote','Fuerteventura','Saint-Sébastien',
    'Santander','Salamanque','Tolède','Burgos','Léon','Tarragone','Gérone'],
  'italie': ['Rome','Milan','Naples','Turin','Palerme','Gênes','Bologne','Florence','Bari',
    'Catane','Venise','Vérone','Messine','Padoue','Trieste','Tarente','Brescia','Parme',
    'Modène','Cagliari','Ferrare','Bolzano','Pérouse','Sienne','Ravenne','Ancône','Amalfi',
    'Capri','Positano','Portofino','Cinque Terre','Côme','Bellagio'],
  'portugal': ['Lisbonne','Porto','Braga','Setúbal','Coimbra','Funchal','Faro','Évora',
    'Sintra','Cascais','Albufeira','Lagos','Portimão','Tavira','Nazaré','Óbidos'],
  'grece': ['Athènes','Thessalonique','Héraklion','Patras','Santorin','Mykonos','Rhodes',
    'Corfou','Zakynthos','Skiathos','Paros','Naxos','Kos','La Canée','Rethymnon',
    'Ioannina','Kavala','Volos','Kalamata','Larissa'],
  'allemagne': ['Berlin','Hambourg','Munich','Cologne','Francfort','Stuttgart','Düsseldorf',
    'Leipzig','Dresde','Hanovre','Nuremberg','Bremen','Bonn','Heidelberg','Karlsruhe',
    'Fribourg-en-Brisgau','Augsbourg','Wiesbaden','Trèves','Constance','Bamberg','Rothenburg'],
  'royaume-uni': ['Londres','Édimbourg','Manchester','Birmingham','Liverpool','Bristol',
    'Glasgow','Leeds','Cardiff','Belfast','Sheffield','Brighton','Oxford','Cambridge',
    'Bath','York','Chester','Exeter','Inverness','Aberdeen','Dundee'],
  'pays-bas': ['Amsterdam','Rotterdam','La Haye','Utrecht','Eindhoven','Groningue',
    'Almere','Breda','Nimègue','Leyde','Delft','Maastricht','Haarlem','Zwolle'],
  'belgique': ['Bruxelles','Anvers','Gand','Bruges','Liège','Namur','Louvain','Mons',
    'Charleroi','Tournai','Hasselt','Genk'],
  'suisse': ['Zurich','Genève','Bâle','Berne','Lausanne','Lucerne','Lugano','Bienne',
    'Thoune','Saint-Gall','Interlaken','Grindelwald','Zermatt','Verbier','Crans-Montana'],
  'autriche': ['Vienne','Graz','Salzbourg','Innsbruck','Linz','Klagenfurt','Hallstatt','Zell am See'],
  'maroc': ['Casablanca','Marrakech','Fès','Rabat','Tanger','Agadir','Meknès','Oujda',
    'Tétouan','Essaouira','Chefchaouen','Ifrane','Ouarzazate','Merzouga','Dakhla'],
  'tunisie': ['Tunis','Sfax','Sousse','Monastir','Kairouan','Bizerte','Gabès','Jerba','Hammamet','Djerba'],
  'algerie': ['Alger','Oran','Constantine','Annaba','Batna','Sétif','Blida','Tlemcen','Béjaïa'],
  'egypte': ['Le Caire','Alexandrie','Louxor','Assouan','Hurghada','Charm el-Cheikh','Dahab','Marsa Alam'],
  'turquie': ['Istanbul','Ankara','Izmir','Antalya','Bursa','Bodrum','Marmaris','Alanya',
    'Cappadoce','Pamukkale','Göreme','Kaş','Fethiye','Ölüdeniz','Trabzon'],
  'etats-unis': ['New York','Los Angeles','Chicago','San Francisco','Miami','Las Vegas',
    'Seattle','Boston','Washington','Houston','Phoenix','Denver','Nashville','Atlanta',
    'San Diego','Portland','New Orleans','Austin','Honolulu','Orlando'],
  'japon': ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Fukuoka','Kobe',
    'Hiroshima','Nara','Nikko','Hakone','Kamakura','Nagasaki','Okinawa','Kanazawa'],
  'thai lande': ['Bangkok','Chiang Mai','Phuket','Pattaya','Koh Samui','Koh Phangan',
    'Kanchanaburi','Hua Hin','Pai','Chiang Rai','Ayutthaya','Sukhothai'],
  'thailande': ['Bangkok','Chiang Mai','Phuket','Pattaya','Koh Samui','Koh Phangan',
    'Kanchanaburi','Hua Hin','Pai','Chiang Rai','Ayutthaya','Sukhothai'],
  'vietnam': ['Ho Chi Minh-Ville','Hanoi','Da Nang','Hoi An','Hué','Nha Trang','Ha Long',
    'Sapa','Mũi Né','Phú Quốc','Dalat','Can Tho'],
  'indonesie': ['Bali','Jakarta','Ubud','Lombok','Yogyakarta','Surabaya','Bandung','Medan',
    'Makassar','Padang','Gili Islands','Labuan Bajo'],
  'inde': ['Mumbai','Delhi','Bangalore','Jaipur','Agra','Varanasi','Goa','Kochi','Mysore',
    'Jodhpur','Udaipur','Rishikesh','Dharamsala','Amritsar','Chennai','Kolkata'],
  'chine': ['Pékin','Shanghai','Guangzhou','Shenzhen','Chengdu','Xi\'an','Hangzhou',
    'Guilin','Lijiang','Zhangjiajie','Pingyao','Suzhou','Wuhan','Chongqing','Kunming'],
  'australie': ['Sydney','Melbourne','Brisbane','Perth','Adélaïde','Cairns','Darwin',
    'Hobart','Gold Coast','Byron Bay','Uluru','Port Douglas'],
  'canada': ['Toronto','Montréal','Vancouver','Calgary','Ottawa','Québec','Winnipeg',
    'Halifax','Victoria','Banff','Whistler','Jasper'],
  'bresil': ['Rio de Janeiro','São Paulo','Brasília','Salvador','Fortaleza','Recife',
    'Belo Horizonte','Florianópolis','Foz do Iguaçu','Manaus','Natal','Maceió'],
  'mexique': ['Mexico','Cancún','Playa del Carmen','Tulum','Puerto Vallarta','Los Cabos',
    'Guadalajara','Monterrey','Oaxaca','San Miguel de Allende','Mérida','Chichen Itza'],
  'argentie': ['Buenos Aires','Córdoba','Rosario','Mendoza','Bariloche','Ushuaia','El Calafate','Salta'],
  'afrique du sud': ['Le Cap','Johannesburg','Durban','Pretoria','Port Elizabeth','Stellenbosch',
    'Franschhoek','Knysna','Oudtshoorn','Hermanus','Plettenberg Bay'],
  'kenya': ['Nairobi','Mombasa','Malindi','Lamu','Kisumu','Nakuru','Amboseli','Masai Mara'],
  'tanzanie': ['Dar es Salaam','Zanzibar','Arusha','Kilimanjaro','Serengeti','Ngorongoro'],
};

function getVillesList() {
  var pays = document.getElementById('infoPays') ? normalizeStr(document.getElementById('infoPays').value).replace(/\s/g,'') : '';
  if (!pays || pays.length < 2) return VILLES_GLOBALES;

  // Cherche la meilleure correspondance dans VILLES_PAR_PAYS
  var bestKey = null;
  var bestScore = 0;
  Object.keys(VILLES_PAR_PAYS).forEach(function(key) {
    var normKey = key.replace(/\s/g,'');
    var score = 0;
    // Correspondance exacte
    if (normKey === pays) score = 100;
    // Le pays saisi contient la clé (ex: "etats-unis" dans "etats-unis-amerique")
    else if (pays.indexOf(normKey) !== -1) score = normKey.length;
    // La clé contient le pays saisi
    else if (normKey.indexOf(pays) !== -1) score = pays.length;
    if (score > bestScore) { bestScore = score; bestKey = key; }
  });

  // Seulement si la correspondance est suffisamment forte (>= 4 chars)
  if (bestKey && bestScore >= 4) {
    return VILLES_PAR_PAYS[bestKey];
  }
  return VILLES_GLOBALES;
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

  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:block;';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  var dd = document.createElement('div');
  dd.style.cssText = [
    'display:none','position:absolute','top:100%','left:0','right:0','z-index:600',
    'background:var(--surface2)','border:1.5px solid var(--primary)',
    'border-top:none','border-radius:0 0 8px 8px',
    'max-height:220px','overflow-y:auto','box-shadow:0 8px 24px rgba(0,0,0,0.5)'
  ].join(';');
  wrap.appendChild(dd);

  // Stocker ref directe sur l'input pour pouvoir fermer depuis pickAC
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
    if (chosenField === 'infoPays' || chosenField === 'infoVille') setTimeout(refreshHebMap, 300);
  });

  input.addEventListener('input',  function() { show(input.value); });
  input.addEventListener('focus',  function() { if (input.value) show(input.value); });
  input.addEventListener('blur',   function() { setTimeout(function() { dd.style.display = 'none'; }, 150); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { dd.style.display = 'none'; input.blur(); }
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

// ── GOOGLE MAPS SEARCH ─────────────────────────────────────
// ── À VISITER ──────────────────────────────────────────────
var CAT_ICONS  = { monument:'🏛️', restaurant:'🍽️', nature:'🌿', musee:'🖼️', shopping:'🛍️', autre:'📌' };
var CAT_LABELS = { monument:'Monument', restaurant:'Restaurant', nature:'Nature', musee:'Musée', shopping:'Shopping', autre:'Autre' };
var currentLieuFilter = 'tous';

// ── GOOGLE MAPS API ────────────────────────────────────────
var _googleMapsReady = false;

// Carte hébergement
var _hebMap = null;
var _hebMarker = null;
var _hebAutocomplete = null;
var _hebInfoWindow = null;

// Carte À visiter
var _visiterMap = null;
var _visiterMarker = null;
var _visiterAutocomplete = null;
var _visiterHebMarker = null;

// Modal édition lieu
var _editingLieuId = null;

// Callback appelé par le SDK Google Maps
function onGoogleMapsReady() {
  _googleMapsReady = true;
}

// ── Carte Hébergement (page Infos) ──────────────────────────
var _visiterLieuMarkers = []; // stocke les marqueurs lieux pour pouvoir les effacer

function initHebMap() {
  if (!_googleMapsReady || !window.google) return;
  var dest = getMapsDestination();
  if (!dest) return;

  // Géocoder la destination pour centrer la carte
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: dest, language: 'fr' }, function(results, status) {
    var center = { lat: 48.8566, lng: 2.3522 };
    var zoom = 12;
    if (status === 'OK' && results[0]) {
      center = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
      zoom = 13;
    }
    // Si hébergement déjà géocodé, centrer dessus
    var trip = currentTrip();
    if (trip && trip.infos && trip.infos._hebLat) {
      center = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
      zoom = 15;
    }

    // Si carte déjà initialisée → juste recentrer
    if (_hebMap) {
      _hebMap.setCenter(center);
      _hebMap.setZoom(zoom);
      return;
    }

    _hebMap = new google.maps.Map(document.getElementById('hebGoogleMap'), {
      center: center, zoom: zoom,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
      styles: _darkMapStyles()
    });
    _hebInfoWindow = new google.maps.InfoWindow();

    // Marqueur hébergement existant
    if (trip && trip.infos && trip.infos._hebLat) {
      if (_hebMarker) _hebMarker.setMap(null);
      _hebMarker = new google.maps.Marker({
        map: _hebMap, position: center, animation: google.maps.Animation.DROP,
        title: trip.infos.infoNomHebergement || 'Hébergement'
      });
      _hebInfoWindow.setContent('<div style="color:#111;font-size:13px"><b>' + escHtml(trip.infos.infoNomHebergement || 'Hébergement') + '</b></div>');
      _hebInfoWindow.open(_hebMap, _hebMarker);
    }

    // Autocomplete — même config que visiterMap (sans restriction de type)
    _hebAutocomplete = new google.maps.places.Autocomplete(
      document.getElementById('hebMapSearch'), { language: 'fr' }
    );
    _hebAutocomplete.bindTo('bounds', _hebMap);
    _hebAutocomplete.addListener('place_changed', function() {
      var place = _hebAutocomplete.getPlace();
      if (!place.geometry) return;
      // Récupérer les détails complets (téléphone, site, note...)
      var service = new google.maps.places.PlacesService(_hebMap);
      service.getDetails({
        placeId: place.place_id, language: 'fr',
        fields: ['name','formatted_address','formatted_phone_number','website',
                 'rating','user_ratings_total','geometry','types','place_id']
      }, function(detail, st) {
        fillHebergementFromPlace(st === google.maps.places.PlacesServiceStatus.OK ? detail : place);
      });
    });

    // Clic carte → chercher établissements proches
    _hebMap.addListener('click', function(e) { searchNearbyHeb(e.latLng); });

    document.getElementById('hebMapHint').textContent = '💡 Tapez le nom de votre hébergement ou cliquez sur la carte.';
  });
}

function refreshHebMap() {
  if (!_googleMapsReady || !window.google) return;
  var dest = getMapsDestination();
  if (!dest) return;
  if (_hebMap) {
    // Carte déjà créée → recentrer sur la nouvelle destination
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: dest, language: 'fr' }, function(results, status) {
      if (status === 'OK') { _hebMap.setCenter(results[0].geometry.location); _hebMap.setZoom(13); }
    });
  } else {
    initHebMap();
  }
}

function fillHebergementFromPlace(place) {
  if (!place.geometry) return;
  var lat = place.geometry.location.lat();
  var lng = place.geometry.location.lng();

  // Marqueur sur la carte
  if (_hebMarker) _hebMarker.setMap(null);
  _hebMarker = new google.maps.Marker({
    map: _hebMap, position: { lat: lat, lng: lng },
    title: place.name, animation: google.maps.Animation.DROP
  });
  _hebMap.panTo({ lat: lat, lng: lng });
  _hebMap.setZoom(17);

  // Popup info
  _hebInfoWindow.setContent('<div style="color:#111;font-size:13px"><b>' + place.name + '</b><br>' + (place.formatted_address || '') + '</div>');
  _hebInfoWindow.open(_hebMap, _hebMarker);

  // Remplir les champs
  document.getElementById('infoNomHebergement').value      = place.name || '';
  document.getElementById('infoAdresseHebergement').value  = place.formatted_address || '';
  document.getElementById('infoTelHebergement').value      = place.formatted_phone_number || '';
  document.getElementById('infoSiteHebergement').value     = place.website || '';
  document.getElementById('infoRatingHebergement').value   = place.rating
    ? '⭐ ' + place.rating + ' / 5' + (place.user_ratings_total ? ' (' + place.user_ratings_total + ' avis)' : '')
    : '';

  // Type hébergement auto
  var types = place.types || [];
  var typeSelect = document.getElementById('infoTypeHebergement');
  if (/hotel/.test(types.join(',')))        typeSelect.value = 'hotel';
  else if (/campground/.test(types.join(','))) typeSelect.value = 'camping';
  else typeSelect.value = 'autre';

  // Sauvegarder coords hébergement
  var trip = currentTrip();
  if (trip) {
    trip.infos._hebLat = lat;
    trip.infos._hebLon = lng;
    save();
  }
}

function searchNearbyHeb(latLng) {
  if (!_hebMap || !window.google) return;
  var service = new google.maps.places.PlacesService(_hebMap);
  service.nearbySearch({
    location: latLng,
    radius: 200,
    type: ['lodging'],
    language: 'fr'
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
      // Prendre le plus proche
      service.getDetails({ placeId: results[0].place_id, language: 'fr',
        fields: ['name','formatted_address','formatted_phone_number','website','rating','user_ratings_total','geometry','types']
      }, function(place, st) {
        if (st === google.maps.places.PlacesServiceStatus.OK) fillHebergementFromPlace(place);
      });
    }
  });
}

function locateMeHeb() {
  if (!navigator.geolocation) { toast('Géolocalisation non supportée', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    if (!_hebMap) return;
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    _hebMap.panTo(latlng); _hebMap.setZoom(15);
    searchNearbyHeb(latlng);
  });
}

// ── Carte À visiter (page dédiée) ──────────────────────────
function initVisiterMap() {
  if (!_googleMapsReady || !window.google || _visiterMap) return;

  var trip = currentTrip();
  var center = { lat: 48.8566, lng: 2.3522 };
  if (trip && trip.infos && trip.infos._hebLat) {
    center = { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) };
  }

  _visiterMap = new google.maps.Map(document.getElementById('visiterGoogleMap'), {
    center: center,
    zoom: trip && trip.infos && trip.infos._hebLat ? 14 : 10,
    mapTypeControl: false, streetViewControl: true, fullscreenControl: true,
    styles: _darkMapStyles()
  });

  // Marqueur hébergement en vert
  if (trip && trip.infos && trip.infos._hebLat) {
    _visiterHebMarker = new google.maps.Marker({
      map: _visiterMap,
      position: center,
      title: trip.infos.infoNomHebergement || 'Hébergement',
      icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
      zIndex: 10
    });
    new google.maps.InfoWindow({ content: '<b>🏨 ' + escHtml(trip.infos.infoNomHebergement || 'Hébergement') + '</b>' })
      .open(_visiterMap, _visiterHebMarker);
  }

  // Marqueurs des lieux déjà sauvés
  _renderVisiterMarkers();

  // Places Autocomplete
  _visiterAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('visiterMapSearch'), { language: 'fr' }
  );
  _visiterAutocomplete.bindTo('bounds', _visiterMap);
  _visiterAutocomplete.addListener('place_changed', function() {
    var place = _visiterAutocomplete.getPlace();
    if (!place.geometry) return;
    _onVisiterPlaceSelected(place);
  });

  // Clic carte → détails du lieu cliqué
  _visiterMap.addListener('click', function(e) {
    _searchPlaceAtClick(e.latLng);
  });
}

function _renderVisiterMarkers() {
  if (!_visiterMap) return;
  // Effacer les anciens marqueurs lieux
  _visiterLieuMarkers.forEach(function(m) { m.setMap(null); });
  _visiterLieuMarkers = [];
  var trip = currentTrip(); if (!trip || !trip.lieux) return;
  trip.lieux.forEach(function(l) {
    if (!l.lat || !l.lon) return;
    var marker = new google.maps.Marker({
      map: _visiterMap,
      position: { lat: parseFloat(l.lat), lng: parseFloat(l.lon) },
      title: l.nom,
      icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
    });
    var iw = new google.maps.InfoWindow({
      content: '<div style="color:#111;font-size:12px"><b>' + escHtml(l.nom) + '</b>'
        + (l.distance ? '<br>📏 ' + escHtml(l.distance) : '')
        + (l.rating   ? '<br>⭐ ' + escHtml(l.rating)   : '') + '</div>'
    });
    marker.addListener('click', function() { iw.open(_visiterMap, marker); });
    _visiterLieuMarkers.push(marker);
  });
}

function _searchPlaceAtClick(latLng) {
  if (!window.google) return;
  var service = new google.maps.places.PlacesService(_visiterMap);
  service.nearbySearch({ location: latLng, radius: 80, language: 'fr' }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
      service.getDetails({
        placeId: results[0].place_id, language: 'fr',
        fields: ['name','formatted_address','formatted_phone_number','website','rating','user_ratings_total','geometry','types','place_id']
      }, function(place, st) {
        if (st === google.maps.places.PlacesServiceStatus.OK) _onVisiterPlaceSelected(place);
      });
    }
  });
}

function _onVisiterPlaceSelected(place) {
  if (!place.geometry) return;
  var lat = place.geometry.location.lat();
  var lng = place.geometry.location.lng();

  // Marqueur temporaire
  if (_visiterMarker) _visiterMarker.setMap(null);
  _visiterMarker = new google.maps.Marker({
    map: _visiterMap, position: { lat: lat, lng: lng },
    title: place.name, animation: google.maps.Animation.DROP,
    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }
  });
  _visiterMap.panTo({ lat: lat, lng: lng });

  // Pré-remplir le modal et l'ouvrir
  var rating = place.rating
    ? '⭐ ' + place.rating + '/5' + (place.user_ratings_total ? ' (' + place.user_ratings_total + ' avis)' : '')
    : '';
  document.getElementById('newLieuNom').value     = place.name || '';
  document.getElementById('newLieuAdresse').value = place.formatted_address || '';
  document.getElementById('newLieuRating').value  = rating;
  document.getElementById('newLieuTel').value     = place.formatted_phone_number || '';
  document.getElementById('newLieuSite').value    = place.website || '';
  document.getElementById('newLieuCoords').value  = lat + ',' + lng;
  document.getElementById('newLieuNotes').value   = '';

  // Distance hébergement
  var distTxt = _computeDist(lat, lng);
  document.getElementById('newLieuDistance').value = distTxt;

  // Catégorie auto
  var cat = guessCategoryFromGoogleTypes(place.types || []);
  document.getElementById('newLieuCategorie').value = cat || 'autre';

  _editingLieuId = null;
  document.getElementById('modalLieuTitle').textContent = '📍 Ajouter ce lieu';
  document.getElementById('btnConfirmLieu').textContent = '＋ Ajouter';
  openModal('modalAddLieu');
}

function locateMeVisiter() {
  if (!navigator.geolocation) { toast('Géolocalisation non supportée', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    if (!_visiterMap) return;
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    _visiterMap.panTo(latlng); _visiterMap.setZoom(15);
    _searchPlaceAtClick(latlng);
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
  var t = types.join(',');
  if (/restaurant|food|cafe|bar|meal/.test(t))         return 'restaurant';
  if (/museum|art_gallery/.test(t))                     return 'musee';
  if (/shopping_mall|store|clothing_store/.test(t))     return 'shopping';
  if (/park|natural_feature|campground|beach/.test(t))  return 'nature';
  if (/tourist_attraction|point_of_interest|church|place_of_worship|stadium/.test(t)) return 'monument';
  return null;
}

function _darkMapStyles() {
  return [
    { featureType:'all',       elementType:'geometry',          stylers:[{color:'#1e2130'}] },
    { featureType:'water',     elementType:'geometry',          stylers:[{color:'#0d1321'}] },
    { featureType:'road',      elementType:'geometry',          stylers:[{color:'#2d3148'}] },
    { featureType:'landscape', elementType:'geometry',          stylers:[{color:'#1a1e2e'}] },
    { featureType:'transit',   elementType:'geometry',          stylers:[{color:'#252840'}] },
    {                          elementType:'labels.text.stroke',stylers:[{color:'#13172a'}] },
    {                          elementType:'labels.text.fill',  stylers:[{color:'#8899bb'}] },
  ];
}

// Fonctions hébergement Maps externes (panneaux de recherche) conservées pour compatibilité
function getMapsDestination() {
  var trip = currentTrip(); if (!trip) return '';
  return [trip.infos && trip.infos.infoVille, trip.infos && trip.infos.infoPays].filter(Boolean).join(', ');
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
var CAT_ICONS  = { monument:'🏛️', restaurant:'🍽️', nature:'🌿', musee:'🖼️', shopping:'🛍️', autre:'📌' };
var CAT_LABELS = { monument:'Monument', restaurant:'Restaurant', nature:'Nature', musee:'Musée', shopping:'Shopping', autre:'Autre' };
var currentLieuFilter = 'tous';

function renderLieux() {
  var trip = currentTrip();
  var container = document.getElementById('lieuxContainer');
  updateMapsSearchDest();
  if (!trip) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun voyage sélectionné</h2></div>';
    return;
  }
  var dest = [trip.infos && trip.infos.infoVille, trip.infos && trip.infos.infoPays].filter(Boolean).join(', ');
  document.getElementById('visiterSubtitle').textContent = dest || 'Planifiez vos visites';

  // Géocoder hébergement en arrière-plan si pas fait
  if (trip.infos && !trip.infos._hebLat && (trip.infos.infoAdresseHebergement || trip.infos.infoNomHebergement)) {
    geocodeHebergement();
  }

  // Init carte visiter si pas encore faite
  if (_googleMapsReady && !_visiterMap) setTimeout(initVisiterMap, 200);
  else if (_visiterMap) { _visiterMap.setCenter(center && trip.infos && trip.infos._hebLat ? { lat: parseFloat(trip.infos._hebLat), lng: parseFloat(trip.infos._hebLon) } : { lat: 48.8566, lng: 2.3522 }); }

  var lieux = (trip.lieux || []).filter(function(l) { return currentLieuFilter === 'tous' || l.cat === currentLieuFilter; });
  if (!lieux.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun lieu' + (currentLieuFilter !== 'tous' ? ' dans cette catégorie' : '') + '</h2><p>Cliquez sur "+ Ajouter un lieu" pour commencer</p></div>';
    return;
  }

  container.innerHTML = lieux.map(function(l) {
    var addrEnc = encodeURIComponent(l.adresse || l.nom);
    var gmUrl = l.lat && l.lon
      ? 'https://www.google.com/maps/search/?api=1&query=' + l.lat + ',' + l.lon
      : 'https://www.google.com/maps/search/?api=1&query=' + addrEnc;
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
}

function triParDistance() {
  var trip = currentTrip(); if (!trip) return;
  trip.lieux.sort(function(a, b) { return (parseFloat(a.distance) || 9999) - (parseFloat(b.distance) || 9999); });
  save(); renderLieux();
  toast('📏 Triés par distance');
}


function _openLieuModal(lieu) {
  document.getElementById('newLieuNom').value      = lieu ? (lieu.nom      || '') : '';
  document.getElementById('newLieuAdresse').value  = lieu ? (lieu.adresse  || '') : '';
  document.getElementById('newLieuDistance').value = lieu ? (lieu.distance || '') : '';
  document.getElementById('newLieuNotes').value    = lieu ? (lieu.notes    || '') : '';
  document.getElementById('newLieuCoords').value   = lieu && lieu.lat ? lieu.lat + ',' + lieu.lon : '';
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

  if (_editingLieuId) {
    for (var i = 0; i < (trip.lieux || []).length; i++) {
      if (trip.lieux[i].id === _editingLieuId) {
        trip.lieux[i].nom      = nom;
        trip.lieux[i].cat      = document.getElementById('newLieuCategorie').value;
        trip.lieux[i].adresse  = document.getElementById('newLieuAdresse').value.trim();
        trip.lieux[i].distance = document.getElementById('newLieuDistance').value.trim();
        trip.lieux[i].notes    = document.getElementById('newLieuNotes').value.trim();
        trip.lieux[i].rating   = document.getElementById('newLieuRating').value.trim();
        trip.lieux[i].lat      = lat;
        trip.lieux[i].lon      = lon;
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
      lat: lat, lon: lon,
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
