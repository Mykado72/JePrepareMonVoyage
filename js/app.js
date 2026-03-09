/* ============================================================
   JE PRÉPARE MON VOYAGE – app.js
   ============================================================ */

// ── STATE ──────────────────────────────────────────────────
let state = {
  trips: [],          // [{id, name, infos:{}, checklist:[], bagages:[], lieux:[], depenses:[]}]
  currentTripId: null,
  currentPage: 'infos',
};

// ── HELPERS ────────────────────────────────────────────────
function save() {
  localStorage.setItem('jpmv_state', JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem('jpmv_state');
  if (raw) {
    try { state = Object.assign(state, JSON.parse(raw)); } catch(e) {}
  }
}

function currentTrip() {
  return state.trips.find(t => t.id === state.currentTripId) || null;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast${type ? ' ' + type : ''}`;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function showEl(id) { const e = document.getElementById(id); if(e) e.style.display = ''; }
function hideEl(id) { const e = document.getElementById(id); if(e) e.style.display = 'none'; }

// ── TRIPS ──────────────────────────────────────────────────
function newTrip() {
  closeDropdown();
  document.getElementById('newTripName').value = '';
  openModal('modalNewTrip');
  setTimeout(() => document.getElementById('newTripName').focus(), 100);
}

function confirmNewTrip() {
  const name = document.getElementById('newTripName').value.trim();
  if (!name) { toast('Donnez un nom au voyage', 'error'); return; }
  const trip = {
    id: genId(), name,
    infos: {}, checklist: [], bagages: defaultBagages(), lieux: [], depenses: []
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
  if (!confirm('Supprimer ce voyage ?')) return;
  state.trips = state.trips.filter(t => t.id !== id);
  if (state.currentTripId === id) state.currentTripId = state.trips[0]?.id || null;
  save();
  renderTripSelector();
  loadCurrentTrip();
}

function toggleTripDropdown() {
  const dd = document.getElementById('tripDropdown');
  dd.classList.toggle('hidden');
  if (!dd.classList.contains('hidden')) renderTripList();
}

function closeDropdown() {
  document.getElementById('tripDropdown').classList.add('hidden');
}

function renderTripList() {
  const container = document.getElementById('tripList');
  if (state.trips.length === 0) {
    container.innerHTML = '<div style="padding:10px 14px;font-size:0.85rem;color:var(--text3)">Aucun voyage</div>';
    return;
  }
  container.innerHTML = state.trips.map(t => `
    <div class="trip-option${t.id === state.currentTripId ? ' active' : ''}" onclick="selectTrip('${t.id}')">
      <span>✈️ ${escHtml(t.name)}</span>
      <span class="trip-option-del" onclick="deleteTrip('${t.id}',event)">✕</span>
    </div>
  `).join('');
}

function renderTripSelector() {
  const trip = currentTrip();
  document.getElementById('tripCurrentLabel').textContent = trip ? trip.name : 'Aucun voyage';
}

// ── NAVIGATION ─────────────────────────────────────────────
const PAGE_TITLES = {
  infos: '🗺️ Infos voyage', checklist: '✅ Checklist',
  bagages: '🧳 Bagages', documents: '📄 Documents',
  visiter: '📍 À visiter', budget: '💶 Budget'
};

function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  document.getElementById('mobileTitle').textContent = PAGE_TITLES[page] || page;
  closeSidebar();

  if (page === 'checklist') refreshChecklist();
  if (page === 'bagages') renderBagages();
  if (page === 'documents') renderDocuments();
  if (page === 'visiter') renderLieux();
  if (page === 'budget') renderBudget();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb.classList.toggle('open');
  ov.classList.toggle('hidden', !sb.classList.contains('open'));
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
}

// ── INFOS ──────────────────────────────────────────────────
const INFO_FIELDS = [
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
  const trip = currentTrip();
  if (!trip) { toast('Créez d\'abord un voyage', 'error'); return; }
  INFO_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) trip.infos[id] = el.value;
  });
  save();
  updateSubtitle();
  updateBadges();
  toast('💾 Informations enregistrées', 'success');
}

function loadCurrentTrip() {
  const trip = currentTrip();
  INFO_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = trip ? (trip.infos[id] || '') : '';
  });
  updateSubtitle();
  if (state.currentPage === 'checklist') refreshChecklist();
  if (state.currentPage === 'bagages') renderBagages();
  if (state.currentPage === 'documents') renderDocuments();
  if (state.currentPage === 'visiter') renderLieux();
  if (state.currentPage === 'budget') renderBudget();
  updateBadges();
}

function updateSubtitle() {
  const trip = currentTrip();
  const el = document.getElementById('infosSubtitle');
  if (!trip) { el.textContent = 'Créez un voyage pour commencer'; return; }
  const pays = trip.infos.infoPays || '';
  const ville = trip.infos.infoVille || '';
  const d1 = trip.infos.infoDateDepart ? formatDate(trip.infos.infoDateDepart) : '';
  const d2 = trip.infos.infoDateRetour ? formatDate(trip.infos.infoDateRetour) : '';
  let txt = [ville, pays].filter(Boolean).join(', ');
  if (d1) txt += (txt ? ' · ' : '') + d1 + (d2 ? ' → ' + d2 : '');
  el.textContent = txt || 'Renseignez les informations de votre voyage';
}

function updateChecklistOnChange() { /* will re-gen on navigate */ }
function updateHebergementUI() {}
function updateTransportUI(dir) {}

function updateBadges() {
  const trip = currentTrip();
  if (!trip) { hideBadge('badgeChecklist'); hideBadge('badgeBagages'); return; }
  const clTodo = (trip.checklist || []).filter(i => !i.done).length;
  const bgTodo = (trip.bagages || []).filter(i => !i.packed).length;
  setBadge('badgeChecklist', clTodo);
  setBadge('badgeBagages', bgTodo);
}
function setBadge(id, n) {
  const el = document.getElementById(id);
  if (!el) return;
  if (n > 0) { el.textContent = n; el.classList.add('visible'); }
  else el.classList.remove('visible');
}
function hideBadge(id) { document.getElementById(id)?.classList.remove('visible'); }

// ── CHECKLIST ──────────────────────────────────────────────
function buildChecklist(infos) {
  infos = infos || {};
  const pays = (infos.infoPays || '').toLowerCase();
  const transportAller = infos.infoTransportAller || '';
  const locationVoiture = infos.infoLocationVoiture || 'non';
  const parking = infos.infoParkingReserve || 'non';
  const bagCabine = infos.infoBagageCabine || 'aucun';
  const bagSoute = infos.infoBagageSoute || 'aucun';

  // Detect if Schengen (simplified list of EU/Schengen countries)
  const schengen = ['france','espagne','italie','allemagne','portugal','pays-bas','belgique','autriche','suisse','grèce','pologne','tchéquie','hongrie','slovaquie','slovénie','croatie','estonie','lettonie','lituanie','luxembourg','malte','danemark','suède','finlande','norvège','islande','liechtenstein','andorre','monaco'];
  const isSchengen = schengen.some(p => pays.includes(p));
  const needsPassport = !isSchengen && pays !== '';

  const groups = [
    {
      id: 'docs', icon: '📄', title: 'Documents & Identité', items: [
        { id: 'id_doc', text: needsPassport ? '🛂 Passeport valide (min. 6 mois de validité)' : '🪪 Carte d\'identité ou passeport valide', priority: 'high' },
        ...(needsPassport ? [{ id: 'visa', text: '📋 Vérifier si visa requis pour ' + (infos.infoPays || 'ce pays'), priority: 'high' }] : []),
        { id: 'copies_id', text: '📸 Copie/photo des documents d\'identité', priority: 'medium' },
        ...(locationVoiture === 'oui' ? [{ id: 'permis', text: '🚗 Permis de conduire (original)', priority: 'high' }] : []),
      ]
    },
    {
      id: 'transport', icon: '✈️', title: 'Transport & Billets', items: [
        ...(transportAller === 'avion' ? [
          { id: 'billet_avion', text: '🎫 Billets d\'avion aller imprimés / sur téléphone', priority: 'high' },
          { id: 'carte_embarquement', text: '🗂️ Carte d\'embarquement (check-in en ligne)', priority: 'high' },
          { id: 'liquides', text: '💧 Liquides en cabine : contenants ≤100ml en sac zip', priority: 'medium' },
          { id: 'aeroport_heure', text: '⏰ Arrivée à l\'aéroport 2h avant le départ', priority: 'high' },
        ] : []),
        ...(transportAller === 'train' ? [
          { id: 'billet_train', text: '🎫 Billets de train téléchargés / imprimés', priority: 'high' },
        ] : []),
        { id: 'billet_retour', text: '🔁 Billets retour vérifiés', priority: 'medium' },
      ]
    },
    {
      id: 'hebergement', icon: '🏨', title: 'Hébergement', items: [
        { id: 'resa_hotel', text: '🏨 Confirmation de réservation hébergement', priority: 'high' },
        { id: 'adresse_hotel', text: '📍 Adresse hébergement notée / enregistrée', priority: 'medium' },
        { id: 'check_in', text: '🔑 Horaires check-in / check-out vérifiés', priority: 'low' },
      ]
    },
    {
      id: 'parking_section', icon: '🅿️', title: 'Parking & Transfert', items: [
        ...(parking === 'oui' ? [{ id: 'parking_resa', text: '🅿️ Réservation parking confirmée', priority: 'high' }] : []),
        ...(parking !== 'non' ? [{ id: 'transfert', text: '🚌 Transfert / navette aéroport organisé', priority: 'medium' }] : []),
        { id: 'trajet_aeroport', text: '🗺️ Itinéraire vers l\'aéroport planifié', priority: 'medium' },
      ]
    },
    {
      id: 'location_section', icon: '🚗', title: 'Location de véhicule', items: locationVoiture === 'oui' ? [
        { id: 'location_resa', text: '🚗 Réservation location de voiture confirmée', priority: 'high' },
        { id: 'location_assurance', text: '🛡️ Assurance véhicule de location vérifiée', priority: 'high' },
        { id: 'gps', text: '📱 GPS / carte hors ligne téléchargés', priority: 'medium' },
      ] : []
    },
    {
      id: 'bagages_section', icon: '🧳', title: 'Préparation des bagages', items: [
        ...(bagSoute !== 'aucun' ? [{ id: 'poids_soute', text: `⚖️ Poids valise soute vérifié (max ${bagSoute})`, priority: 'high' }] : []),
        ...(bagCabine !== 'aucun' ? [{ id: 'poids_cabine', text: '⚖️ Poids bagage cabine vérifié', priority: 'high' }] : []),
        { id: 'bagages_prepares', text: '🧳 Bagages préparés et vérifiés', priority: 'high' },
        { id: 'cadenas', text: '🔒 Cadenas TSA sur valise (si soute)', priority: 'low' },
        { id: 'etiquette', text: '🏷️ Étiquette bagage avec coordonnées', priority: 'medium' },
      ]
    },
    {
      id: 'sante', icon: '🏥', title: 'Santé & Assurance', items: [
        { id: 'assurance', text: '🛡️ Assurance voyage souscrite / carte bleue vérifiée', priority: 'high' },
        { id: 'carte_vitale', text: '💳 Carte Vitale / CEAM (si Europe)', priority: 'medium' },
        { id: 'pharmacie', text: '💊 Trousse à pharmacie préparée', priority: 'medium' },
        { id: 'ordonnances', text: '📋 Ordonnances médicaments en quantité suffisante', priority: needsPassport ? 'high' : 'medium' },
      ]
    },
    {
      id: 'pratique', icon: '📱', title: 'Divers & Pratique', items: [
        { id: 'monnaie', text: '💵 Change ou carte acceptée à destination', priority: 'medium' },
        { id: 'roaming', text: '📶 Forfait téléphone / roaming activé', priority: 'medium' },
        { id: 'chargeurs', text: '🔌 Chargeurs & adaptateur électrique', priority: 'medium' },
        { id: 'photos_maison', text: '📸 Photos maison / appartement en ordre', priority: 'low' },
        { id: 'voisin_plantes', text: '🌿 Voisin prévenu (plantes, courrier, animaux)', priority: 'low' },
        { id: 'urgences_locales', text: '☎️ Numéros d\'urgence locaux notés', priority: 'medium' },
      ]
    },
  ].filter(g => g.items.length > 0);

  return groups;
}

function refreshChecklist() {
  const trip = currentTrip();
  if (!trip) {
    document.getElementById('checklistContainer').innerHTML = `<div class="empty-state"><div class="empty-state-icon">✈️</div><h2>Aucun voyage sélectionné</h2><p>Créez ou sélectionnez un voyage</p></div>`;
    return;
  }

  const groups = buildChecklist(trip.infos || {});
  const existingMap = {};
  (trip.checklist || []).forEach(i => existingMap[i.id] = i.done);

  // Merge: preserve done status for existing, add new
  const merged = [];
  groups.forEach(g => {
    g.items.forEach(item => {
      merged.push({ id: item.id, text: item.text, priority: item.priority, group: g.id, done: existingMap[item.id] || false });
    });
  });
  trip.checklist = merged;
  save();

  renderChecklist(trip, groups);
  updateBadges();
}

function renderChecklist(trip, groups) {
  const allItems = trip.checklist || [];
  const itemMap = {};
  allItems.forEach(i => itemMap[i.id] = i);

  const done = allItems.filter(i => i.done).length;
  const total = allItems.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('checklistProgressLabel').textContent = `${done} / ${total} tâches complétées`;
  document.getElementById('checklistProgressPct').textContent = pct + '%';
  document.getElementById('checklistProgressFill').style.width = pct + '%';

  const html = groups.map(g => {
    const gItems = g.items.filter(it => itemMap[it.id]);
    if (!gItems.length) return '';
    const gDone = gItems.filter(it => itemMap[it.id]?.done).length;
    return `
      <div class="checklist-group">
        <div class="checklist-group-header">
          <span class="checklist-group-icon">${g.icon}</span>
          <span>${g.title}</span>
          <span style="margin-left:auto;font-size:0.8rem;color:var(--text3);font-weight:400">${gDone}/${gItems.length}</span>
        </div>
        ${gItems.map(it => {
          const item = itemMap[it.id];
          return `
            <div class="checklist-item${item.done ? ' done' : ''}" onclick="toggleChecklist('${item.id}')">
              <div class="checklist-cb">${item.done ? '✓' : ''}</div>
              <span class="checklist-text">${item.text}</span>
              <span class="checklist-priority priority-${item.priority}">${item.priority === 'high' ? 'Urgent' : item.priority === 'medium' ? 'Important' : 'Normal'}</span>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  document.getElementById('checklistContainer').innerHTML = html || '<div class="empty-state"><div class="empty-state-icon">✅</div><h2>Renseignez d\'abord les infos du voyage</h2><p>La checklist se génère automatiquement</p></div>';
}

function toggleChecklist(id) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.checklist.find(i => i.id === id);
  if (item) { item.done = !item.done; save(); }
  const groups = buildChecklist(trip.infos || {});
  renderChecklist(trip, groups);
  updateBadges();
}

function resetChecklist() {
  const trip = currentTrip();
  if (!trip || !confirm('Réinitialiser toute la checklist ?')) return;
  trip.checklist.forEach(i => i.done = false);
  save();
  refreshChecklist();
  toast('↺ Checklist réinitialisée');
}

// ── BAGAGES ────────────────────────────────────────────────
function defaultBagages() {
  return [
    { id: genId(), cat: 'Documents', nom: 'Passeport / Carte d\'identité', packed: false },
    { id: genId(), cat: 'Documents', nom: 'Billets / Confirmations', packed: false },
    { id: genId(), cat: 'Documents', nom: 'Assurance voyage', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'T-shirts', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Pantalons / Shorts', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Veste / Pull', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Sous-vêtements', packed: false },
    { id: genId(), cat: 'Vêtements', nom: 'Chaussures de rechange', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Brosse à dents + dentifrice', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Shampoing / gel douche', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Déodorant', packed: false },
    { id: genId(), cat: 'Hygiène', nom: 'Crème solaire', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Téléphone + chargeur', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Adaptateur électrique', packed: false },
    { id: genId(), cat: 'Électronique', nom: 'Batterie externe', packed: false },
    { id: genId(), cat: 'Médicaments', nom: 'Médicaments habituels', packed: false },
    { id: genId(), cat: 'Médicaments', nom: 'Antidouleurs / antihistaminiques', packed: false },
  ];
}

const BAG_ICONS = { Documents: '📄', Vêtements: '👔', Hygiène: '🧴', Électronique: '🔌', Médicaments: '💊', Loisirs: '🎮', Divers: '📦' };

function renderBagages() {
  const trip = currentTrip();
  if (!trip) { document.getElementById('bagagesContainer').innerHTML = `<div class="empty-state"><div class="empty-state-icon">🧳</div><h2>Aucun voyage sélectionné</h2></div>`; return; }

  const items = trip.bagages || [];
  const packed = items.filter(i => i.packed).length;
  const total = items.length;
  const pct = total ? Math.round(packed / total * 100) : 0;
  document.getElementById('bagageProgressLabel').textContent = `${packed} / ${total} articles préparés`;
  document.getElementById('bagageProgressPct').textContent = pct + '%';
  document.getElementById('bagageProgressFill').style.width = pct + '%';

  const byCat = {};
  items.forEach(i => { if (!byCat[i.cat]) byCat[i.cat] = []; byCat[i.cat].push(i); });

  const html = Object.entries(byCat).map(([cat, items]) => {
    const catPacked = items.filter(i => i.packed).length;
    return `
      <div class="bagage-group">
        <div class="bagage-group-header">
          <span class="bagage-group-title">${BAG_ICONS[cat] || '📦'} ${cat}</span>
          <span class="bagage-group-count">${catPacked}/${items.length}</span>
        </div>
        ${items.map(item => `
          <div class="bagage-item${item.packed ? ' packed' : ''}" onclick="toggleBagage('${item.id}')">
            <div class="bagage-cb">${item.packed ? '✓' : ''}</div>
            <span class="bagage-text">${escHtml(item.nom)}</span>
            <button class="btn-icon" onclick="deleteBagage('${item.id}',event)" title="Supprimer">🗑️</button>
          </div>`).join('')}
      </div>`;
  }).join('') || '<div class="empty-state"><div class="empty-state-icon">🧳</div><h2>Aucun article</h2><p>Cliquez sur "+ Ajouter" pour commencer</p></div>';

  document.getElementById('bagagesContainer').innerHTML = html;
  updateBadges();
}

function toggleBagage(id) {
  const trip = currentTrip(); if (!trip) return;
  const item = trip.bagages.find(i => i.id === id);
  if (item) { item.packed = !item.packed; save(); renderBagages(); }
}

function deleteBagage(id, e) {
  e.stopPropagation();
  const trip = currentTrip(); if (!trip) return;
  trip.bagages = trip.bagages.filter(i => i.id !== id);
  save(); renderBagages();
}

function addBagage() {
  document.getElementById('addBagageBar').style.display = 'flex';
  document.getElementById('newBagageNom').focus();
}
function cancelAddBagage() { document.getElementById('addBagageBar').style.display = 'none'; }
function confirmAddBagage() {
  const trip = currentTrip(); if (!trip) return;
  const nom = document.getElementById('newBagageNom').value.trim();
  const cat = document.getElementById('newBagageCategorie').value;
  if (!nom) { toast('Entrez un nom', 'error'); return; }
  trip.bagages.push({ id: genId(), cat, nom, packed: false });
  save(); renderBagages();
  document.getElementById('newBagageNom').value = '';
  document.getElementById('addBagageBar').style.display = 'none';
  toast('✓ Article ajouté', 'success');
}

function resetBagages() {
  const trip = currentTrip();
  if (!trip || !confirm('Réinitialiser la liste de bagages ?')) return;
  trip.bagages = defaultBagages();
  save(); renderBagages();
  toast('↺ Bagages réinitialisés');
}

// ── DOCUMENTS ──────────────────────────────────────────────
function renderDocuments() {
  const trip = currentTrip();
  const container = document.getElementById('documentsContainer');
  if (!trip) { container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📄</div><h2>Aucun voyage sélectionné</h2></div>`; return; }

  const i = trip.infos || {};
  const f = (val, fallback = '—') => val ? escHtml(val) : `<span class="empty">${fallback}</span>`;
  const fLink = (val) => val ? `<span class="link"><a href="${escHtml(val)}" target="_blank" rel="noopener">🔗 Ouvrir</a></span>` : `<span class="empty">—</span>`;

  const missingKeys = ['infoPays','infoTypeHebergement','infoTransportAller'].filter(k => !i[k]);
  const missingHtml = missingKeys.length > 0 ? `<div class="info-missing">⚠️ Complétez les infos du voyage pour un résumé complet</div>` : '';

  container.innerHTML = missingHtml + `
    <div class="doc-card">
      <div class="doc-card-header"><span>🌍</span><span class="doc-card-title">Destination</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Pays</span><span class="doc-field-value">${f(i.infoPays)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Ville / Région</span><span class="doc-field-value">${f(i.infoVille)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Départ</span><span class="doc-field-value">${i.infoDateDepart ? formatDate(i.infoDateDepart) : '<span class="empty">—</span>'}</span></div>
        <div class="doc-field"><span class="doc-field-label">Retour</span><span class="doc-field-value">${i.infoDateRetour ? formatDate(i.infoDateRetour) : '<span class="empty">—</span>'}</span></div>
        <div class="doc-field"><span class="doc-field-label">Voyageurs</span><span class="doc-field-value">${f(i.infoNbVoyageurs)}</span></div>
        ${i.infoDateDepart && i.infoDateRetour ? `<div class="doc-field"><span class="doc-field-label">Durée</span><span class="doc-field-value">${nbNuits(i.infoDateDepart, i.infoDateRetour)} nuits</span></div>` : ''}
      </div>
    </div>

    <div class="doc-card">
      <div class="doc-card-header"><span>🏨</span><span class="doc-card-title">Hébergement</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Type</span><span class="doc-field-value">${f(i.infoTypeHebergement)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Nom</span><span class="doc-field-value">${f(i.infoNomHebergement)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Téléphone</span><span class="doc-field-value">${f(i.infoTelHebergement)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Référence</span><span class="doc-field-value">${f(i.infoRefHebergement)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Adresse</span><span class="doc-field-value">${f(i.infoAdresseHebergement)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Lien réservation</span><span class="doc-field-value link">${fLink(i.infoLienHebergement)}</span></div>
      </div>
    </div>

    <div class="doc-card">
      <div class="doc-card-header"><span>✈️</span><span class="doc-card-title">Transport aller</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Type</span><span class="doc-field-value">${f(i.infoTransportAller)}</span></div>
        <div class="doc-field"><span class="doc-field-label">N° vol / train</span><span class="doc-field-value">${f(i.infoNumVolAller)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Aéroport départ</span><span class="doc-field-value">${f(i.infoAeroportDepart)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Aéroport arrivée</span><span class="doc-field-value">${f(i.infoAeroportArrivee)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Heure départ</span><span class="doc-field-value">${f(i.infoHeureDepart)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Heure arrivée</span><span class="doc-field-value">${f(i.infoHeureArrivee)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Référence / PNR</span><span class="doc-field-value">${f(i.infoPNRAller)}</span></div>
      </div>
    </div>

    <div class="doc-card">
      <div class="doc-card-header"><span>🛬</span><span class="doc-card-title">Transport retour</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Type</span><span class="doc-field-value">${f(i.infoTransportRetour)}</span></div>
        <div class="doc-field"><span class="doc-field-label">N° vol / train</span><span class="doc-field-value">${f(i.infoNumVolRetour)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Heure départ</span><span class="doc-field-value">${f(i.infoHeureDepartRetour)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Référence / PNR</span><span class="doc-field-value">${f(i.infoPNRRetour)}</span></div>
      </div>
    </div>

    <div class="doc-card">
      <div class="doc-card-header"><span>🅿️</span><span class="doc-card-title">Parking &amp; Location</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Parking</span><span class="doc-field-value">${f(i.infoParkingNom)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Référence parking</span><span class="doc-field-value">${f(i.infoParkingRef)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Location voiture</span><span class="doc-field-value">${f(i.infoLocationSociete)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Référence location</span><span class="doc-field-value">${f(i.infoLocationRef)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Lieu prise en charge</span><span class="doc-field-value">${f(i.infoLocationLieu)}</span></div>
      </div>
    </div>

    <div class="doc-card">
      <div class="doc-card-header"><span>🏥</span><span class="doc-card-title">Santé &amp; Urgences</span></div>
      <div class="doc-grid">
        <div class="doc-field"><span class="doc-field-label">Assurance</span><span class="doc-field-value">${f(i.infoAssurance)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Urgence assurance</span><span class="doc-field-value">${f(i.infoAssuranceTel)}</span></div>
        <div class="doc-field"><span class="doc-field-label">Groupe sanguin</span><span class="doc-field-value">${f(i.infoGroupeSanguin)}</span></div>
        <div class="doc-field" style="grid-column:1/-1"><span class="doc-field-label">Notes médicales</span><span class="doc-field-value">${f(i.infoMedicaments)}</span></div>
      </div>
    </div>
  `;
}

// ── À VISITER ──────────────────────────────────────────────
const CAT_ICONS = { monument: '🏛️', restaurant: '🍽️', nature: '🌿', musee: '🖼️', shopping: '🛍️', autre: '📌' };
const CAT_LABELS = { monument: 'Monument', restaurant: 'Restaurant', nature: 'Nature', musee: 'Musée', shopping: 'Shopping', autre: 'Autre' };

let currentLieuFilter = 'tous';

function renderLieux() {
  const trip = currentTrip();
  const container = document.getElementById('lieuxContainer');
  if (!trip) { container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun voyage sélectionné</h2></div>`; return; }

  // Update subtitle
  const pays = trip.infos?.infoPays || ''; const ville = trip.infos?.infoVille || '';
  document.getElementById('visiterSubtitle').textContent = [ville, pays].filter(Boolean).join(', ') || 'Planifiez vos visites';

  const lieux = (trip.lieux || []).filter(l => currentLieuFilter === 'tous' || l.cat === currentLieuFilter);

  if (lieux.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📍</div><h2>Aucun lieu${currentLieuFilter !== 'tous' ? ' dans cette catégorie' : ''}</h2><p>Cliquez sur "+ Ajouter un lieu" pour commencer</p></div>`;
    return;
  }

  container.innerHTML = lieux.map(l => {
    const addr = l.adresse ? encodeURIComponent(l.adresse) : encodeURIComponent(l.nom);
    return `
      <div class="lieu-card" id="lieu-${l.id}">
        <div class="lieu-header">
          <span class="lieu-title">${CAT_ICONS[l.cat] || '📌'} ${escHtml(l.nom)}</span>
          <span class="lieu-cat-badge">${CAT_LABELS[l.cat] || l.cat}</span>
        </div>
        <div class="lieu-meta">
          ${l.adresse ? `<span>📍 ${escHtml(l.adresse)}</span>` : ''}
          ${l.distance ? `<span>📏 ${escHtml(l.distance)}</span>` : ''}
        </div>
        ${l.notes ? `<div class="lieu-notes">💬 ${escHtml(l.notes)}</div>` : ''}
        <div class="lieu-actions">
          <a class="btn-maps" href="https://www.google.com/maps/search/?api=1&query=${addr}" target="_blank" rel="noopener">🗺️ Google Maps</a>
          <a class="btn-maps plans" href="https://maps.apple.com/?q=${addr}" target="_blank" rel="noopener">🍎 Plans</a>
          <a class="btn-maps waze" href="https://waze.com/ul?q=${addr}" target="_blank" rel="noopener">🚗 Waze</a>
          <button class="btn-danger" onclick="deleteLieu('${l.id}')">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function filterLieux(filter, btn) {
  currentLieuFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
  renderLieux();
}

function triParDistance() {
  const trip = currentTrip(); if (!trip) return;
  trip.lieux.sort((a, b) => {
    const da = parseFloat(a.distance) || 9999;
    const db = parseFloat(b.distance) || 9999;
    return da - db;
  });
  save(); renderLieux();
  toast('📏 Lieux triés par distance');
}

function showAddLieu() {
  ['newLieuNom','newLieuAdresse','newLieuDistance','newLieuNotes'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  openModal('modalAddLieu');
}

function confirmAddLieu() {
  const trip = currentTrip(); if (!trip) return;
  const nom = document.getElementById('newLieuNom').value.trim();
  if (!nom) { toast('Entrez un nom', 'error'); return; }
  const lieu = {
    id: genId(), nom,
    cat: document.getElementById('newLieuCategorie').value,
    adresse: document.getElementById('newLieuAdresse').value.trim(),
    distance: document.getElementById('newLieuDistance').value.trim(),
    notes: document.getElementById('newLieuNotes').value.trim(),
  };
  if (!trip.lieux) trip.lieux = [];
  trip.lieux.push(lieu);
  save(); closeModal('modalAddLieu'); renderLieux();
  toast('📍 Lieu ajouté', 'success');
}

function deleteLieu(id) {
  const trip = currentTrip(); if (!trip) return;
  trip.lieux = trip.lieux.filter(l => l.id !== id);
  save(); renderLieux();
}

// ── BUDGET ─────────────────────────────────────────────────
const DEP_ICONS = { transport: '✈️', hebergement: '🏨', restauration: '🍽️', activites: '🎡', shopping: '🛍️', sante: '💊', autre: '📦' };
const DEP_LABELS = { transport: 'Transport', hebergement: 'Hébergement', restauration: 'Restauration', activites: 'Activités', shopping: 'Shopping', sante: 'Santé', autre: 'Divers' };

function renderBudget() {
  const trip = currentTrip();
  if (!trip) {
    document.getElementById('budgetSummary').innerHTML = '';
    document.getElementById('budgetContainer').innerHTML = `<div class="empty-state"><div class="empty-state-icon">💶</div><h2>Aucun voyage sélectionné</h2></div>`;
    return;
  }

  const deps = trip.depenses || [];
  const totalPrevu = deps.filter(d => d.type === 'prevu').reduce((s, d) => s + d.montant, 0);
  const totalReel = deps.filter(d => d.type === 'reel').reduce((s, d) => s + d.montant, 0);
  const total = totalPrevu + totalReel;

  document.getElementById('budgetSummary').innerHTML = `
    <div class="budget-kpi"><div class="budget-kpi-label">Total</div><div class="budget-kpi-value total">${fmt(total)} €</div></div>
    <div class="budget-kpi"><div class="budget-kpi-label">Prévu</div><div class="budget-kpi-value prevu">${fmt(totalPrevu)} €</div></div>
    <div class="budget-kpi"><div class="budget-kpi-label">Dépensé</div><div class="budget-kpi-value reel">${fmt(totalReel)} €</div></div>
    <div class="budget-kpi"><div class="budget-kpi-label">Nb dépenses</div><div class="budget-kpi-value total">${deps.length}</div></div>
  `;

  if (deps.length === 0) {
    document.getElementById('budgetContainer').innerHTML = `<div class="empty-state"><div class="empty-state-icon">💶</div><h2>Aucune dépense</h2><p>Ajoutez vos dépenses prévues ou réelles</p></div>`;
    return;
  }

  const byCat = {};
  deps.forEach(d => { if (!byCat[d.cat]) byCat[d.cat] = []; byCat[d.cat].push(d); });

  document.getElementById('budgetContainer').innerHTML = Object.entries(byCat).map(([cat, items]) => {
    const catTotal = items.reduce((s, d) => s + d.montant, 0);
    return `
      <div class="budget-group">
        <div class="budget-group-header">
          <span>${DEP_ICONS[cat] || '📦'} ${DEP_LABELS[cat] || cat}</span>
          <span>${fmt(catTotal)} €</span>
        </div>
        ${items.map(d => `
          <div class="budget-item">
            <span class="budget-item-desc">${escHtml(d.desc)}</span>
            <div class="budget-item-right">
              <span class="budget-item-type ${d.type === 'prevu' ? 'type-prevu' : 'type-reel'}">${d.type === 'prevu' ? 'Prévu' : 'Réel'}</span>
              <span class="budget-item-amount">${fmt(d.montant)} €</span>
              <button class="btn-icon" onclick="deleteDepense('${d.id}')">🗑️</button>
            </div>
          </div>`).join('')}
      </div>`;
  }).join('');
}

function showAddDepense() {
  document.getElementById('newDepenseDesc').value = '';
  document.getElementById('newDepenseMontant').value = '';
  openModal('modalAddDepense');
}

function confirmAddDepense() {
  const trip = currentTrip(); if (!trip) return;
  const desc = document.getElementById('newDepenseDesc').value.trim();
  const montant = parseFloat(document.getElementById('newDepenseMontant').value);
  if (!desc || isNaN(montant)) { toast('Remplissez tous les champs', 'error'); return; }
  const dep = {
    id: genId(), cat: document.getElementById('newDepenseCat').value,
    desc, montant, type: document.getElementById('newDepenseType').value
  };
  if (!trip.depenses) trip.depenses = [];
  trip.depenses.push(dep);
  save(); closeModal('modalAddDepense'); renderBudget();
  toast('💶 Dépense ajoutée', 'success');
}

function deleteDepense(id) {
  const trip = currentTrip(); if (!trip) return;
  trip.depenses = trip.depenses.filter(d => d.id !== id);
  save(); renderBudget();
}

// ── MODALS ─────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
});

// ── UTILS ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function nbNuits(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return Math.max(0, Math.round((b - a) / 86400000));
}

function fmt(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();
  renderTripSelector();
  renderTripList();

  if (state.trips.length === 0) {
    // Welcome state
    document.getElementById('infosSubtitle').textContent = 'Créez votre premier voyage pour commencer';
  } else {
    if (!state.currentTripId) state.currentTripId = state.trips[0].id;
    loadCurrentTrip();
  }

  navigate(state.currentPage || 'infos');

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    const dd = document.getElementById('tripDropdown');
    const btn = document.getElementById('tripCurrentBtn');
    if (!dd.classList.contains('hidden') && !dd.contains(e.target) && !btn.contains(e.target)) closeDropdown();
  });
});
