// Régions par pays — chargé avant app.js
// Utilisé conjointement avec VILLES_PAR_PAYS (villes.js) dans getVillesList()
var REGIONS_PAR_PAYS = {

  'france': [
    // Régions administratives
    'Île-de-France','Provence-Alpes-Côte d\'Azur','Occitanie','Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine','Bretagne','Normandie','Hauts-de-France','Grand Est',
    'Pays de la Loire','Centre-Val de Loire','Bourgogne-Franche-Comté','Corse',
    // Anciennes régions / territoires touristiques
    'Alsace','Lorraine','Champagne-Ardenne','Picardie','Nord-Pas-de-Calais',
    'Haute-Normandie','Basse-Normandie','Languedoc-Roussillon','Midi-Pyrénées',
    'Poitou-Charentes','Limousin','Franche-Comté','Rhône-Alpes','Dauphiné',
    'Savoie','Haute-Savoie','Périgord','Dordogne','Gascogne','Béarn','Pays Basque français',
    'Roussillon','Camargue','Luberon','Verdon','Vercors','Chartreuse','Beaujolais',
    'Côte d\'Azur','Riviera française','Côte Atlantique','Côte Fleurie','Côte d\'Opale',
    'Côte de Granit Rose','Côte Sauvage','Presqu\'île de Guérande',
    'Mont-Saint-Michel (région)','Gorges du Verdon','Calanques de Marseille',
    'Baie de Somme','Marais Poitevin','Landes','Gers','Lot','Aveyron','Hérault',
    'Ardèche','Cévennes','Massif Central','Jura','Vosges','Forêt Noire française',
    'Alpes du Nord','Alpes du Sud','Pyrénées françaises','Côte d\'Émeraude',
    'Finistère','Morbihan','Loire-Atlantique','Vendée',
    // DOM-TOM
    'Guadeloupe','Martinique','La Réunion','Guyane','Mayotte',
    'Polynésie française','Nouvelle-Calédonie','Saint-Barthélemy','Saint-Martin'],

  'espagne': [
    // Communautés autonomes
    'Andalousie','Catalogne','Communauté de Madrid','Communauté valencienne',
    'Castille-et-León','Galice','Pays basque','Castille-La Manche','Aragon',
    'Estrémadure','Asturies','Navarre','La Rioja','Cantabrie',
    'Îles Baléares','Îles Canaries','Murcie',
    // Régions touristiques et côtes
    'Costa del Sol','Costa Brava','Costa Blanca','Costa Dorada','Costa de la Luz',
    'Costa Verde','Costa Vasca','Costa Cálida','Rías Baixas','Rías Altas',
    'Sierra Nevada','Sierra Morena','Cordillère Cantabrique','Pyrénées aragonaises',
    'Picos de Europa','Parc national des Doñana',
    // Sous-régions d\'Andalousie
    'Séville (province)','Grenade (province)','Malaga (province)','Cadix (province)',
    'Cordoue (province)','Huelva (province)','Jaén (province)','Almería (province)',
    // Autres
    'Valence (région)','Alicante (province)','Îles Canaries orientales',
    'Îles Canaries occidentales','Lanzarote (île)','Tenerife (île)','Gran Canaria (île)',
    'Fuerteventura (île)','Majorque','Minorque','Ibiza','Formentera'],

  'italie': [
    // Régions administratives
    'Toscane','Lombardie','Sicile','Sardaigne','Vénétie','Ligurie','Piémont',
    'Campanie','Pouilles','Calabre','Émilie-Romagne','Marches','Ombrie',
    'Latium','Abruzzes','Molise','Basilicate','Vallée d\'Aoste',
    'Trentin-Haut-Adige','Frioul-Vénétie Julienne',
    // Régions touristiques
    'Côte Amalfitaine','Riviera Ligure','Riviera italienne',
    'Lac de Côme','Lac Majeur','Lac de Garde','Lac d\'Orta','Lac de Lugano',
    'Chianti','Val d\'Orcia','Dolomites','Maremme','Maremme toscane',
    'Cinque Terre (région)','Îles Éoliennes','Île d\'Elbe','Côte de la Maremme',
    'Vénétie (campagne)','Frioul','Haut-Adige','Tyrol du Sud',
    'Calabre ionienne','Calabre tyrrhénienne','Côte des Dieux',
    'Salento','Murge','Pouilles (Trulli)','Basilicate (Sassi)',
    'Val d\'Aoste','Piémont (vignes)','Langhe','Monferrat'],

  'portugal': [
    // Régions administratives
    'Norte','Centro','Área Metropolitana de Lisboa','Alentejo','Algarve',
    'Açores','Madère',
    // Régions touristiques
    'Minho','Douro','Trás-os-Montes','Beira Alta','Beira Baixa',
    'Beira Litoral','Ribatejo','Estremadura',
    // Zones géographiques
    'Serra da Estrela','Vallée du Douro','Costa Vicentina','Costa de Prata',
    'Costa de Lisboa','Costa Alentejana','Serra de Sintra',
    'Ilha de São Miguel','Ilha Terceira','Ilha do Pico','Ilha do Faial',
    'Ilha de São Jorge','Ilha das Flores','Ilha do Corvo','Ilha Graciosa','Ilha de Santa Maria',
    'Côte de l\'Algarve','Algarve intérieur','Barlavento','Sotavento'],

  'grece': [
    // Régions administratives
    'Attique','Macédoine centrale','Macédoine orientale et Thrace','Épire',
    'Thessalie','Grèce centrale','Péloponnèse','Grèce occidentale',
    'Îles Ioniennes','Crète','Égée méridionale','Égée septentrionale',
    // Groupes d\'îles
    'Cyclades','Dodécanèse','Sporades','Îles Ioniennes','Îles du Dodécanèse',
    'Îles du Nord-Est de la Mer Égée',
    // Régions touristiques
    'Argolide','Laconie','Messénie','Arcadie','Élide','Béotie','Phocide',
    'Chalcidique','Mont Athos','Épire (côte)','Acarnanie',
    'Crète orientale','Crète centrale','Crète occidentale',
    'Îles Saroniques','Île d\'Eubée'],

  'allemagne': [
    // Länder
    'Bavière','Bade-Wurtemberg','Rhénanie-du-Nord-Westphalie','Brandebourg',
    'Saxe','Thuringe','Rhénanie-Palatinat','Hesse','Schleswig-Holstein',
    'Mecklembourg-Poméranie','Saxe-Anhalt','Basse-Saxe','Sarre',
    'Hambourg (Land)','Berlin (Land)','Brême (Land)',
    // Régions touristiques
    'Forêt-Noire','Bavière du Sud','Allgäu','Ruhr','Rhénanie','Westphalie',
    'Route Romantique','Lac de Constance','Île de Rügen','Côte de la Mer Baltique',
    'Côte de la Mer du Nord','Vallée du Rhin','Vallée de la Moselle',
    'Eifel','Hunsrück','Odenwald','Spessart','Franconie','Souabe',
    'Berchtesgadener Land','Chiemgau','Ammersee','Starnberger See',
    'Lüneburger Heide','Harz','Sauerland','Bergisches Land','Münsterland',
    'Bodenseeregion','Schwäbische Alb','Fränkische Schweiz'],

  'royaume-uni': [
    // Nations
    'Angleterre','Écosse','Pays de Galles','Irlande du Nord',
    // Régions anglaises
    'Grand Londres','South East','South West','East of England',
    'East Midlands','West Midlands','Yorkshire and the Humber',
    'North West','North East',
    // Régions touristiques
    'Cornouailles','Devon','Lake District','Yorkshire Dales','Yorkshire Moors',
    'Peak District','Cotswolds','Highlands écossais','Îles Hébrides',
    'Îles Orcades','Îles Shetland','Northumberland','East Anglia','Kent',
    'Sussex','Dorset','Somerset','Exmoor','Dartmoor',
    'Vallée de la Wye','Pembrokeshire','Snowdonia','Brecon Beacons',
    'Île de Skye','Côte d\'Argyll','Côte Est d\'Écosse','Scottish Borders',
    'Stirlingshire','Perthshire','Grampian','Speyside','Île de Man',
    'Norfolk Broads','Chilterns','Surrey Hills','New Forest'],

  'pays-bas': [
    // Provinces
    'Hollande-du-Nord','Hollande-du-Sud','Zélande','Utrecht',
    'Overijssel','Gueldre','Frise','Drenthe','Groningue',
    'Noord-Brabant','Limbourg néerlandais','Flevoland',
    // Régions touristiques
    'Zaanse Schans','Champs de tulipes','Wadden (îles)','Île de Texel',
    'Île de Vlieland','Île de Terschelling','Côte de la mer du Nord',
    'Veluwe','Biesbosch','Twente','Achterhoek'],

  'belgique': [
    // Régions et communautés
    'Flandre','Wallonie','Bruxelles-Capitale',
    'Flandre occidentale','Flandre orientale','Anvers (province)','Limbourg belge',
    'Brabant flamand','Brabant wallon','Liège (province)',
    'Namur (province)','Hainaut','Luxembourg belge',
    // Régions touristiques
    'Ardennes belges','Côte belge','Campine','Polders',
    'Pays de Liège','Condroz','Famenne','Gaume','Botte du Hainaut',
    'Hautes Fagnes','Vallée de la Meuse belge','Vallée de la Semois'],

  'suisse': [
    // Cantons
    'Zurich (canton)','Berne (canton)','Vaud','Genève (canton)','Valais',
    'Fribourg (canton)','Neuchâtel (canton)','Jura suisse','Soleure',
    'Bâle-Ville','Bâle-Campagne','Argovie','Thurgovie','Saint-Gall (canton)',
    'Grisons','Glaris','Schaffhouse','Appenzell Rhodes-Extérieures',
    'Appenzell Rhodes-Intérieures','Schwyz','Uri','Unterwald',
    'Zoug','Lucerne (canton)','Nidwald','Obwald','Tessin',
    // Régions géographiques
    'Suisse romande','Suisse alémanique','Suisse italienne',
    'Oberland bernois','Jura bernois','Emmental','Engadine',
    'Val Bregaglia','Pays de Fribourg','Gruyères','Lavaux',
    'Lac Léman','Lac de Zurich','Lac des Quatre-Cantons','Lac de Thoune',
    'Lac de Brienz','Lac de Constance (côté suisse)','Lac Majeur (côté suisse)',
    'Alpes bernoises','Alpes valaisannes','Alpes grisonnes','Préalpes'],

  'autriche': [
    // Länder
    'Vienne (Land)','Basse-Autriche','Haute-Autriche','Styrie',
    'Carinthie','Salzbourg (Land)','Tyrol','Vorarlberg','Burgenland',
    // Régions touristiques
    'Salzkammergut','Zillertal','Ötztal','Stubaital','Pitztal','Paznaun',
    'Wachau','Kamptal','Weinviertel','Mühlviertel','Waldviertel',
    'Bregenzerwald','Montafon','Arlberg','Tyrol oriental','Tyrol occidental',
    'Pinzgau','Pongau','Lungau','Tennengau','Flachgau',
    'Carinthie orientale','Carinthie occidentale','Gail','Lavant',
    'Styrie verte','Styrie thermale','Schilcherland'],

  'maroc': [
    // Régions administratives
    'Tanger-Tétouan-Al Hoceïma','Oriental','Fès-Meknès',
    'Rabat-Salé-Kénitra','Béni Mellal-Khénifra','Casablanca-Settat',
    'Marrakech-Safi','Drâa-Tafilalet','Souss-Massa',
    'Guelmim-Oued Noun','Laâyoune-Sakia El Hamra','Dakhla-Oued Ed-Dahab',
    // Régions touristiques
    'Rif','Moyen Atlas','Haut Atlas','Anti-Atlas','Jbel Toubkal (massif)',
    'Vallée du Drâa','Vallée du Dadès','Vallée du Todra','Gorges du Todra',
    'Gorges du Dadès','Merzouga (dunes)','Erg Chebbi','Désert de Zagora',
    'Côte Atlantique marocaine','Côte Méditerranéenne marocaine',
    'Presqu\'île du Cap Spartel','Région de Ouarzazate','Souss-Massa (côte)',
    'Siroua','Plateau des Phosphates','Tafilalet'],

  'tunisie': [
    'Cap Bon','Sahel tunisien','Tunisie du Sud','Tunisie du Nord',
    'Dorsale tunisienne','Tell tunisien',
    'Île de Djerba','Île de Kerkennah',
    'Golfe de Hammamet','Golfe de Gabès','Golfe de Tunis',
    'Région de Tabarka','Région de Tozeur','Chott el-Jérid',
    'Dahar','Matmata (région)','Tataouine (région)'],

  'algerie': [
    // Grandes régions
    'Tell algérien','Hauts Plateaux algériens','Atlas saharien','Sahara algérien',
    'Kabylie','Grande Kabylie','Petite Kabylie','Aurès','Nemencha',
    'Tassili n\'Ajjer','Hoggar','Tamanrasset (région)','Adrar (région)',
    'Vallée du Mzab','Région d\'Alger','Oran (région)','Constantine (région)',
    'Bejaia (région)','Annaba (région)'],

  'egypte': [
    'Delta du Nil','Vallée du Nil','Haute-Égypte','Basse-Égypte',
    'Sinaï','Péninsule du Sinaï','Mer Rouge (côte)','Méditerranée égyptienne',
    'Désert occidental','Désert oriental','Oasis de Siwa',
    'Région de Louxor','Région d\'Assouan','Abou Simbel (région)',
    'Région du Caire','Alexandrie (région)','Hurghada (région)'],

  'turquie': [
    // Régions
    'Marmara','Égée turque','Méditerranée turque (Riviera)','Mer Noire (côte)',
    'Anatolie centrale','Anatolie orientale','Anatolie du Sud-Est',
    // Régions touristiques
    'Péninsule de Bodrum','Péninsule de Datça','Baie de Göcek','Côte lycienne',
    'Côte de la turquoise','Vallée de Cappadoce','Région de Pamukkale',
    'Région d\'Éphèse','Côte égéenne nord','Côte égéenne sud',
    'Région du Pont','Région de l\'Ararat','Lacs de l\'Est',
    'Région d\'Isparta (roses)','Vallée de l\'Euphrate'],

  'etats-unis': [
    // États
    'Californie','Texas','Floride','New York (État)','Pennsylvanie',
    'Illinois','Ohio','Géorgie','Caroline du Nord','Michigan',
    'New Jersey','Virginie','Washington (État)','Arizona','Massachusetts',
    'Tennessee','Indiana','Missouri','Maryland','Wisconsin','Colorado',
    'Minnesota','Caroline du Sud','Alabama','Louisiana','Kentucky',
    'Oregon','Oklahoma','Connecticut','Utah','Iowa','Nevada','Arkansas',
    'Mississippi','Kansas','Nouveau-Mexique','Nebraska','Virginie-Occidentale',
    'Idaho','Hawaï','New Hampshire','Maine','Montana','Rhode Island',
    'Delaware','Dakota du Sud','Dakota du Nord','Alaska','Vermont','Wyoming',
    // Régions
    'Nouvelle-Angleterre','Côte Est','Côte Ouest','Mid-Ouest','Grand Sud',
    'Rocheuses','Pacifique Nord-Ouest','Grand Bassin','Grandes Plaines',
    'Grands Lacs','Appalachiens','Blue Ridge','Ozarks',
    // Parcs et zones touristiques
    'Parcs nationaux de l\'Ouest américain','Route 66','Monument Valley',
    'Grand Canyon (région)','Yellowstone (région)','Yosemite (région)',
    'Great Smoky Mountains','Everglades','Keys de Floride','Cape Cod',
    'Napa et Sonoma','Silicon Valley','Hollywood','Hamptons','Catskills',
    'Finger Lakes','Door County','Texas Hill Country','Sedona (région)'],

  'canada': [
    // Provinces et territoires
    'Ontario','Québec (province)','Colombie-Britannique','Alberta',
    'Saskatchewan','Manitoba','Nouvelle-Écosse','Nouveau-Brunswick',
    'Terre-Neuve-et-Labrador','Île-du-Prince-Édouard',
    'Yukon','Territoires du Nord-Ouest','Nunavut',
    // Régions touristiques
    'Rocheuses canadiennes','Île de Vancouver','Péninsule du Niagara',
    'Laurentides','Cantons-de-l\'Est','Gaspésie','Charlevoix',
    'Côte-Nord','Saguenay','Lac-Saint-Jean','Baie Georgienne',
    'Muskoka','Algonquin','Okanagan','Kootenays','Thompson-Cariboo',
    'Vallée du Fraser','Sunshine Coast','Haida Gwaii','Grands Lacs canadiens'],

  'japon': [
    // Régions (chihō)
    'Hokkaido','Tohoku','Kanto','Chubu','Kansai','Chugoku','Shikoku','Kyushu',
    'Okinawa (préfecture)',
    // Sous-régions
    'Région du Mont Fuji','Alpes japonaises','Alpes centrales','Alpes du Sud',
    'Côte de la mer du Japon','Mer intérieure de Seto','Côte Pacifique',
    'Région de Tokyo','Région d\'Osaka-Kobe-Kyoto (Keihanshin)',
    'Région de Nagoya (Chūkyō)','Hokuriku','San\'in','San\'yō',
    'Région du Kinki','Nankai','Région du Tōhoku',
    // Archipels
    'Île de Honshu','Île de Kyushu','Île de Shikoku','Île d\'Hokkaido',
    'Îles Ryukyu','Îles Amami','Îles Kerama','Île d\'Ishigaki'],

  'thailande': [
    // Régions
    'Thaïlande du Nord','Thaïlande du Nord-Est (Isan)','Thaïlande centrale',
    'Thaïlande de l\'Est','Thaïlande du Sud (Golfe)','Thaïlande du Sud (Andaman)',
    // Zones touristiques
    'Triangle d\'or','Golfe de Thaïlande','Mer d\'Andaman',
    'Côte Ouest (Andaman)','Côte Est (Golfe)','Région de Phuket',
    'Région de Krabi','Région de Koh Samui','Région de Chiang Mai',
    'Région de Kanchanaburi','Plaine centrale','Delta du Chao Phraya',
    'Plateau de Khorat','Vallée de la rivière Kwai'],

  'vietnam': [
    // Régions
    'Vietnam du Nord','Vietnam central','Vietnam du Sud',
    // Zones
    'Baie d\'Halong (région)','Delta du Fleuve Rouge','Hauts plateaux du centre',
    'Delta du Mékong','Côte centrale','Côte du Sud','Région de Hanoi',
    'Région de Hô Chi Minh-Ville','Région de Hoi An','Région de Hué',
    'Sapa (région)','Région de Ha Giang','Nord-Ouest du Vietnam',
    'Région de Ninh Binh','Presqu\'île de Son Tra'],

  'indonesie': [
    // Grandes îles / régions
    'Bali (île)','Java','Sumatra','Kalimantan','Sulawesi','Papouasie occidentale',
    'Petites Îles de la Sonde','Moluques','Nusa Tenggara',
    // Bali détail
    'Ubud (région)','Sud de Bali','Nord de Bali','Bali Est',
    'Côte de Seminyak','Côte de Canggu','Péninsule de Bukit',
    // Autres
    'Lombok (île)','Îles Gili','Flores (île)','Komodo (région)',
    'Raja Ampat (région)','Sulawesi du Nord','Sulawesi du Sud',
    'Sumatra du Nord','Sumatra de l\'Ouest','Java Centre','Java Est','Java Ouest'],

  'inde': [
    // États touristiques
    'Rajasthan','Kerala','Goa','Tamil Nadu','Karnataka','Maharashtra',
    'Uttar Pradesh','Bengale-Occidental','Himachal Pradesh','Uttarakhand',
    'Gujarat','Odisha','Télangana','Andhra Pradesh','Madhya Pradesh',
    'Assam','Sikkim','Arunachal Pradesh','Meghalaya','Manipur','Mizoram',
    'Nagaland','Tripura','Chhattisgarh','Jharkhand','Bihar','Jammu-et-Cachemire',
    'Ladakh','Pendjab','Haryana',
    // Régions touristiques
    'Triangle d\'or (Inde)','Côte de Malabar','Côte de Coromandel',
    'Himalaya indien','Vallée de Kullu','Vallée de Spiti','Vallée de Nubra',
    'Désert du Thar','Ghats occidentaux','Ghats orientaux',
    'Sundarbans','Backwaters du Kerala','Côte de Goa',
    'Région de Hampi','Circuit des temples du Tamil Nadu',
    'Corbett (région)','Ranthambore (région)','Kaziranga (région)'],

  'chine': [
    // Provinces et régions
    'Pékin (municipalité)','Shanghai (municipalité)','Guangdong','Zhejiang',
    'Jiangsu','Sichuan','Yunnan','Henan','Hunan','Hubei',
    'Shandong','Shaanxi','Liaoning','Fujian','Jiangxi','Anhui',
    'Guizhou','Guangxi','Hainan','Shanxi','Heilongjiang','Jilin',
    'Inner Mongolie','Ningxia','Xinjiang','Tibet','Gansu','Qinghai',
    'Hong Kong (RAS)','Macao (RAS)',
    // Régions touristiques
    'Guilin et Yangshuo (région)','Zhangjiajie (région)',
    'Jiuzhaigou (région)','Vallée de Lijiang','Région de Dali',
    'Tibet central','Route de la Soie (Xinjiang)','Vallée du Yangtze',
    'Région du Karst','Hainan (île)','Côte du Fujian'],

  'australie': [
    // États et territoires
    'Nouvelle-Galles du Sud','Victoria','Queensland','Australie-Occidentale',
    'Australie-Méridionale','Tasmanie','Territoire du Nord',
    'Territoire de la capitale australienne',
    // Régions touristiques
    'Great Barrier Reef (région)','Red Centre','Kimberley','Pilbara',
    'Arnhem Land','Cape York','Whitsundays','Gold Coast (région)',
    'Sunshine Coast (région)','Margaret River (région)','Barossa Valley',
    'Hunter Valley','Yarra Valley','Mornington Peninsula',
    'Great Ocean Road','Blue Mountains (région)','Snowy Mountains (région)',
    'Kangaroo Island (île)','Eyre Peninsula','Flinders Ranges'],

  'nouvelle-zelande': [
    // Régions administratives
    'Auckland (région)','Waikato','Bay of Plenty','Gisborne',
    'Hawke\'s Bay','Taranaki','Manawatū-Whanganui','Wellington (région)',
    'Tasman','Nelson','Marlborough','Côte Ouest','Canterbury',
    'Otago','Southland',
    // Touristique
    'Île du Nord','Île du Sud',
    'Fiordland','Queenstown Lakes','Mackenzie (région)',
    'Abel Tasman (région)','Marlborough Sounds','Coromandel',
    'Rotorua Lakes','Northland','Bay of Islands'],

  'bresil': [
    // États
    'São Paulo (État)','Rio de Janeiro (État)','Minas Gerais','Bahia',
    'Paraná','Rio Grande do Sul','Santa Catarina','Pernambuco',
    'Ceará','Pará','Maranhão','Goiás','Amazonas','Mato Grosso',
    'Mato Grosso do Sul','Espírito Santo','Rio Grande do Norte',
    'Piauí','Alagoas','Sergipe','Rondônia','Tocantins',
    'Acre','Roraima','Amapá',
    // Régions touristiques
    'Amazonie','Pantanal','Nordeste brésilien','Côte du Bahia',
    'Côte Rio-Búzios','Serra Gaúcha','Ilha Grande','Chapada Diamantina',
    'Lençóis Maranhenses (région)','Fernando de Noronha (région)',
    'Bonito (région)','Iguaçu (région)'],

  'mexique': [
    // États
    'Jalisco','Quintana Roo','Oaxaca (État)','Chiapas','Yucatan (État)',
    'Veracruz (État)','Colima','Morelia (Michoacán)','Guanajuato (État)',
    'Querétaro (État)','Zacatecas (État)','Durango (État)',
    'Chihuahua (État)','Sonora (État)','Baja California','Baja California Sur',
    'Sinaloa','Nayarit','Guerrero','Campeche (État)','Tabasco',
    // Régions touristiques
    'Riviera Maya','Yucatan (péninsule)','Baja California (péninsule)',
    'Côte Pacifique mexicaine','Côte du Golfe','Oaxaca (région)',
    'Chiapas highlands','Sierra Madre Occidentale','Sierra Madre Orientale',
    'Los Cabos (région)','Puerto Vallarta (région)','Huatulco (région)',
    'Circuit colonial (Bajío)'],

  'argentine': [
    // Provinces
    'Buenos Aires (province)','Córdoba (province)','Santa Fe','Mendoza (province)',
    'Tucumán','Entre Ríos','Salta (province)','Chaco','Misiones',
    'Corrientes','Santiago del Estero','San Juan (province)','Jujuy',
    'Río Negro','Neuquén','Formosa','Chubut','San Luis','La Pampa',
    'Santa Cruz','Tierra del Fuego',
    // Régions touristiques
    'Patagonie','Patagonie andine','Patagonie atlantique','Puna argentine',
    'Quebrada de Humahuaca','Vallée de Calchaquí','Mendoza (vignes)',
    'Lac Nahuel Huapi','Lac Perito Moreno','Glacier Perito Moreno',
    'El Bolsón (région)','San Martín de los Andes (région)',
    'Péninsule de Valdés','Iguazú (région)','Delta du Paraná',
    'Côte atlantique argentine','Sierras de Córdoba'],

  'perou': [
    // Régions administratives
    'Lima (métropole)','Cusco (région)','Arequipa (région)','Puno (région)',
    'Loreto','Piura','La Libertad','Junín','Cajamarca (région)',
    'Ica (région)','Lambayeque','Áncash','San Martín',
    // Touristique
    'Circuit Inca','Vallée Sacrée','Vallée de Colca','Amazonie péruvienne',
    'Circuit nord du Pérou','Côte péruvienne','Altiplano péruvien',
    'Région de Machu Picchu','Titicaca (région)'],

  'colombie': [
    // Départements touristiques
    'Bogotá D.C.','Antioquia','Valle del Cauca','Bolívar','Atlántico',
    'Magdalena','Nariño','Risaralda','Quindío','Caldas','Santander',
    'Norte de Santander','Huila','Tolima','Cauca','Chocó',
    // Régions touristiques
    'Eje Cafetero','Côte Caraïbes','Côte Pacifique colombienne',
    'Amazonie colombienne','Llanos orientaux','Région Andine colombienne',
    'Sierra Nevada de Santa Marta','Parc Tayrona (région)',
    'Guajira','Archipel San Andrés'],

};
