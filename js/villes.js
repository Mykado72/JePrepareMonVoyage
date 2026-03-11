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
    'Biarritz','Bayonne','Pau','Annecy','Chambéry','Ajaccio','Bastia','Colmar','Troyes',
    'Limoges','Poitiers','Saint-Malo','Quimper','Lorient','Saint-Nazaire','Le Mans','Laval',
    'Cherbourg','Caen','Évreux','Chartres','Beauvais','Compiègne','Soissons','Valenciennes',
    'Dunkerque','Calais','Arras','Lens','Douai','Roubaix','Tourcoing','Béthune','Maubeuge',
    'Thionville','Forbach','Sarreguemines','Haguenau','Colmar','Sélestat','Saverne',
    'Belfort','Montbéliard','Besançon','Lons-le-Saunier','Bourg-en-Bresse','Mâcon',
    'Chalon-sur-Saône','Auxerre','Sens','Nevers','Bourges','Châteauroux','Blois','Vendôme',
    'Le Havre','Évreux','Alençon','Flers','Vire','Saint-Brieuc','Vannes','Morlaix',
    'Périgueux','Bergerac','Agen','Auch','Montauban','Albi','Castres','Carcassonne','Narbonne',
    'Béziers','Sète','Montpellier','Nîmes','Arles','Aix-en-Provence','Toulon','Fréjus',
    'Saint-Tropez','Menton','Monaco','Antibes','Grasse','Draguignan','Brignoles',
    'Gap','Briançon','Sisteron','Digne-les-Bains','Barcelonnette','Embrun',
    'Valence','Romans-sur-Isère','Vienne','Bourgoin-Jallieu','Voiron',
    'Thonon-les-Bains','Évian-les-Bains','Albertville','Moûtiers','Bourg-Saint-Maurice',
    'Chamonix','Megève','Courchevel','Val d\'Isère','Tignes','Les Deux Alpes','Alpe d\'Huez',
    'Méribel','Val Thorens','Morzine','Les Gets','Flaine'],

  'espagne': ['Madrid','Barcelone','Valence','Séville','Saragosse','Málaga','Murcie',
    'Palma de Majorque','Las Palmas','Bilbao','Alicante','Cordoue','Valladolid','Vigo',
    'Grenade','Cadix','Ibiza','Tenerife','Lanzarote','Fuerteventura','Gran Canaria',
    'Saint-Sébastien','Santander','Salamanque','Tolède','Burgos','Léon','Tarragone','Gérone',
    'Lleida','Oviedo','Gijón','La Corogne','Saint-Jacques-de-Compostelle','Pontevedra',
    'Pamplune','Logroño','Vitoria','Huelva','Almería','Jaén','Albacete','Cuenca',
    'Marbella','Torremolinos','Benidorm','Calpe','Altea','Dénia','Torrevieja',
    'Formentera','Menorca','Mahón','Ciutadella','Sóller','Pollença','Alcudia',
    'Santa Cruz de Tenerife','Puerto de la Cruz','Los Cristianos','Playa de las Américas',
    'Maspalomas','Puerto Rico','Mogán','Arrecife','Puerto del Carmen','Costa del Silencio',
    'Ronda','Nerja','Frigiliana','Antequera','Jerez de la Frontera','El Puerto de Santa María'],

  'italie': ['Rome','Milan','Naples','Turin','Palerme','Gênes','Bologne','Florence','Bari',
    'Catane','Venise','Vérone','Messine','Padoue','Trieste','Tarente','Brescia','Parme',
    'Modène','Cagliari','Ferrare','Bolzano','Pérouse','Sienne','Ravenne','Ancône','Amalfi',
    'Capri','Positano','Portofino','Cinque Terre','Côme','Bellagio','Varenna','Cernobbio',
    'Trente','Merano','Cortina d\'Ampezzo','Courmayeur','Aoste','Stresa','Orta San Giulio',
    'Assise','Orvieto','Todi','Spolète','Gubbio','Montepulciano','Pienza','Montalcino',
    'San Gimignano','Volterra','Lucques','Pise','Livourne','Île d\'Elbe',
    'Taormine','Agrigente','Syracuse','Raguse','Trapani','Cefalù','Palerme',
    'Matera','Alberobello','Lecce','Otrante','Gallipoli','Trani',
    'Sorrente','Ischia','Procida','Pompéi','Herculanum','Caserte','Salerne',
    'Peschiera del Garda','Sirmione','Desenzano del Garda','Malcesine','Bardolino'],

  'portugal': ['Lisbonne','Porto','Braga','Setúbal','Coimbra','Funchal','Faro','Évora',
    'Sintra','Cascais','Albufeira','Lagos','Portimão','Tavira','Nazaré','Óbidos',
    'Aveiro','Guimarães','Viseu','Leiria','Batalha','Alcobaça','Tomar','Santarém',
    'Beja','Portalegre','Castelo Branco','Guarda','Bragance','Vila Real','Viana do Castelo',
    'Ponte de Lima','Barcelos','Peniche','Sesimbra','Setúbal','Palmela',
    'Madère','Ponta Delgada','Terceira','Faial','Pico','São Jorge','Sagres','Vila do Bispo'],

  'grece': ['Athènes','Thessalonique','Héraklion','Patras','Santorin','Mykonos','Rhodes',
    'Corfou','Zakynthos','Skiathos','Paros','Naxos','Kos','La Canée','Rethymnon',
    'Ioannina','Kavala','Volos','Kalamata','Larissa','Olympie','Delphes','Météores',
    'Sparte','Mycènes','Épidaure','Corinthe','Nauplie','Monemvasia',
    'Milos','Sifnos','Folegandros','Ios','Amorgos','Syros','Tinos','Andros',
    'Lesbos','Chios','Samos','Ikaria','Lemnos','Thassos','Samothrace',
    'Skopelos','Alonissos','Céphalonie','Ithaque','Leucade','Paxos','Hydra','Spetses','Égine'],

  'allemagne': ['Berlin','Hambourg','Munich','Cologne','Francfort','Stuttgart','Düsseldorf',
    'Leipzig','Dresde','Hanovre','Nuremberg','Bremen','Bonn','Heidelberg','Karlsruhe',
    'Fribourg-en-Brisgau','Augsbourg','Wiesbaden','Trèves','Constance','Bamberg','Rothenburg',
    'Münster','Dortmund','Essen','Duisbourg','Wuppertal','Bochum','Bielefeld','Mannheim',
    'Kiel','Lübeck','Rostock','Schwerin','Erfurt','Weimar','Iéna','Halle','Magdebourg',
    'Potsdam','Cottbus','Chemnitz','Görlitz','Eisenach','Gotha',
    'Würzburg','Passau','Ratisbonne','Ingolstadt','Kempten','Lindau',
    'Berchtesgaden','Garmisch-Partenkirchen','Füssen','Neuschwanstein',
    'Aix-la-Chapelle','Mönchengladbach','Krefeld','Leverkusen','Solingen',
    'Francfort-sur-le-Main','Mainz','Darmstadt','Kassel','Paderborn','Münster'],

  'royaume-uni': ['Londres','Édimbourg','Manchester','Birmingham','Liverpool','Bristol',
    'Glasgow','Leeds','Cardiff','Belfast','Sheffield','Brighton','Oxford','Cambridge',
    'Bath','York','Chester','Exeter','Inverness','Aberdeen','Dundee','Stirling',
    'Newcastle','Bradford','Leicester','Nottingham','Coventry','Hull','Derby',
    'Southampton','Portsmouth','Plymouth','Bournemouth','Gloucester','Worcester',
    'Stratford-upon-Avon','Windsor','Canterbury','Dover','Salisbury','Winchester',
    'Norwich','Ipswich','Peterborough','Lincoln','Northampton','Milton Keynes',
    'Swansea','Newport','Wrexham','Bangor','Aberystwyth','St Andrews','Oban','Fort William',
    'Isle of Skye','Loch Ness','St Ives','Penzance','Newquay','Padstow','Torquay',
    'Whitby','Scarborough','Harrogate','Keswick','Ambleside','Windermere','Grasmere'],

  'pays-bas': ['Amsterdam','Rotterdam','La Haye','Utrecht','Eindhoven','Groningue',
    'Almere','Breda','Nimègue','Leyde','Delft','Maastricht','Haarlem','Zwolle',
    'Tilburg','Enschede','Apeldoorn','Arnhem','Amersfoort','Den Bosch','Venlo',
    'Alkmaar','Hoorn','Enkhuizen','Volendam','Marken','Gouda','Dordrecht',
    'Middelburg','Vlissingen','Giethoorn','Keukenhof','Kinderdijk'],

  'belgique': ['Bruxelles','Anvers','Gand','Bruges','Liège','Namur','Louvain','Mons',
    'Charleroi','Tournai','Hasselt','Genk','Ostende','Knokke','Dinant','Spa',
    'Durbuy','Bouillon','Han-sur-Lesse','Rochefort','Bastogne','Eupen','Verviers',
    'Aywaille','Stavelot','Vielsalm','Arlon','Virton'],

  'suisse': ['Zurich','Genève','Bâle','Berne','Lausanne','Lucerne','Lugano','Bienne',
    'Thoune','Saint-Gall','Interlaken','Grindelwald','Zermatt','Verbier','Crans-Montana',
    'Montreux','Vevey','Sion','Sierre','Loèche-les-Bains','Saas-Fee','Arosa','Davos',
    'Klosters','Saint-Moritz','Pontresina','Flims','Laax','Andermatt','Engelberg',
    'Schaffhouse','Winterthour','Zoug','Schwyz','Aarau','Soleure','Delémont',
    'Neuchâtel','La Chaux-de-Fonds','Fribourg','Bulle','Yverdon-les-Bains','Nyon',
    'Morges','Aigle','Martigny','Verbier','Champéry','Les Diablerets'],

  'autriche': ['Vienne','Graz','Salzbourg','Innsbruck','Linz','Klagenfurt','Hallstatt',
    'Zell am See','St. Anton','Kitzbühel','Sölden','Mayrhofen','Lech','Ischgl',
    'Kaprun','Saalbach','Bad Gastein','Baden','Eisenstadt','Krems',
    'St. Pölten','Wels','Steyr','Gmunden','Mondsee','Wolfgangsee','Attersee',
    'Schladming','Ramsau','Filzmoos','Bad Aussee','Dachstein'],

  'maroc': ['Casablanca','Marrakech','Fès','Rabat','Tanger','Agadir','Meknès','Oujda',
    'Tétouan','Essaouira','Chefchaouen','Ifrane','Ouarzazate','Merzouga','Dakhla',
    'Laâyoune','Taroudant','Tiznit','Safi','El Jadida','Settat','Beni Mellal',
    'Errachidia','Zagora','Tinghir','Midelt','Azrou','Khénifra','Khouribga',
    'Nador','Al Hoceima','Larache','Asilah','Moulay Idriss','Volubilis',
    'Aït Benhaddou','Skoura','El Kelâa des Mgouna','Boumalne Dadès'],

  'tunisie': ['Tunis','Sfax','Sousse','Monastir','Kairouan','Bizerte','Gabès','Djerba',
    'Hammamet','Nabeul','Mahdia','Tabarka','Ain Draham','Douz','Tozeur','Nefta',
    'Matmata','Kébili','Gafsa','Kasserine','Sidi Bouzid','Jendouba','Kef','Tataouine'],

  'algerie': ['Alger','Oran','Constantine','Annaba','Batna','Sétif','Blida','Tlemcen',
    'Béjaïa','Skikda','Biskra','Ghardaïa','Tamanrasset','Tizi Ouzou','Mostaganem',
    'Médéa','Chlef','Tiaret','El Oued','Laghouat','Touggourt'],

  'egypte': ['Le Caire','Alexandrie','Louxor','Assouan','Hurghada','Charm el-Cheikh',
    'Dahab','Marsa Alam','Taba','El Gouna','Safaga','Port Said','Ismaïlia','Suez',
    'Abou Simbel','Edfou','Kom Ombo','Esna','El Minya','Assiout','Siwa','Farafra'],

  'turquie': ['Istanbul','Ankara','Izmir','Antalya','Bursa','Bodrum','Marmaris','Alanya',
    'Cappadoce','Pamukkale','Göreme','Kaş','Fethiye','Ölüdeniz','Trabzon',
    'Pergame','Éphèse','Didymes','Milet','Aphrodisias','Hierapolis','Troie','Gallipoli',
    'Konya','Gaziantep','Şanlıurfa','Mardin','Diyarbakır','Van','Erzurum',
    'Kayseri','Nevşehir','Uçhisar','Ürgüp','Avanos','Zelve','Derinkuyu',
    'Side','Aspendos','Perge','Termessos','Olympos','Phaselis','Çıralı','Adrasan',
    'Kemer','Belek','Lara','Mahmutlar','Okurcalar','Konakli','Kalkan','Patara'],

  'etats-unis': ['New York','Los Angeles','Chicago','San Francisco','Miami','Las Vegas',
    'Seattle','Boston','Washington','Houston','Phoenix','Denver','Nashville','Atlanta',
    'San Diego','Portland','New Orleans','Austin','Honolulu','Orlando','Tampa',
    'Dallas','Fort Worth','San Antonio','El Paso','Tucson','Albuquerque','Santa Fe',
    'Salt Lake City','Boise','Reno','Sacramento','San Jose','Oakland','Berkeley',
    'Malibu','Santa Monica','Venice Beach','Palm Springs','Joshua Tree','Big Sur',
    'Napa Valley','Sonoma','Lake Tahoe','Yosemite','Death Valley','Monument Valley',
    'Grand Canyon','Sedona','Bryce Canyon','Zion','Arches','Moab','Colorado Springs',
    'Aspen','Vail','Telluride','Steamboat Springs','Breckenridge',
    'Memphis','Louisville','Cincinnati','Columbus','Indianapolis','Detroit','Cleveland',
    'Pittsburgh','Philadelphia','Baltimore','Richmond','Charlotte','Raleigh','Durham',
    'Savannah','Charleston','Jacksonville','Key West','Fort Lauderdale','West Palm Beach',
    'Minneapolis','Milwaukee','Kansas City','St. Louis','Oklahoma City','Tulsa',
    'Anchorage','Juneau','Fairbanks','Maui','Kauai','Oahu','Big Island'],

  'canada': ['Toronto','Montréal','Vancouver','Calgary','Ottawa','Québec','Winnipeg',
    'Halifax','Victoria','Banff','Whistler','Jasper','Edmonton','Saskatoon','Regina',
    'Hamilton','Kitchener','London','Windsor','Kingston','Sudbury','Thunder Bay',
    'Fredericton','Moncton','Saint John','Charlottetown','St. John\'s',
    'Niagara Falls','Kelowna','Kamloops','Prince George','Whitehorse','Yellowknife',
    'Iqaluit','Canmore','Lake Louise','Tofino','Ucluelet'],

  'japon': ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Fukuoka','Kobe',
    'Hiroshima','Nara','Nikko','Hakone','Kamakura','Nagasaki','Okinawa','Kanazawa',
    'Matsumoto','Takayama','Shirakawa-go','Gokayama','Sendai','Akita','Aomori',
    'Hakodate','Asahikawa','Obihiro','Kushiro','Tottori','Matsue','Izumo',
    'Onomichi','Imabari','Matsuyama','Kochi','Tokushima','Takamatsu','Kagawa',
    'Kumamoto','Oita','Beppu','Miyazaki','Kagoshima','Yakushima',
    'Naha','Ishigaki','Miyako','Fujikawaguchiko','Karuizawa','Nozawa Onsen',
    'Kusatsu','Hakuba','Niseko','Rusutsu'],

  'thailande': ['Bangkok','Chiang Mai','Phuket','Pattaya','Koh Samui','Koh Phangan',
    'Kanchanaburi','Hua Hin','Pai','Chiang Rai','Ayutthaya','Sukhothai','Lopburi',
    'Koh Tao','Koh Lanta','Koh Chang','Koh Samet','Koh Phi Phi','Railay','Krabi',
    'Ao Nang','Trang','Hat Yai','Chumphon','Surat Thani','Phetchaburi','Prachuap',
    'Udon Thani','Khon Kaen','Ubon Ratchathani','Korat','Mae Hong Son','Lampang',
    'Phitsanulok','Mae Sai','Chiang Saen','Mukdahan'],

  'vietnam': ['Ho Chi Minh-Ville','Hanoi','Da Nang','Hoi An','Hué','Nha Trang','Ha Long',
    'Sapa','Mũi Né','Phú Quốc','Dalat','Can Tho','Vũng Tàu','Phan Thiet','Quy Nhon',
    'Pleiku','Buon Ma Thuot','Kon Tum','Hà Giang','Cao Bằng','Lạng Sơn','Điện Biên Phủ',
    'Tam Coc','Ninh Binh','Haiphong','Vinh','Dong Ha','Ha Giang'],

  'indonesie': ['Bali','Jakarta','Ubud','Lombok','Yogyakarta','Surabaya','Bandung','Medan',
    'Makassar','Padang','Gili Islands','Labuan Bajo','Flores','Komodo','Raja Ampat',
    'Manado','Toraja','Wakatobi','Bunaken',
    'Seminyak','Kuta','Legian','Canggu','Sanur','Nusa Dua','Jimbaran','Uluwatu',
    'Lovina','Amed','Candidasa','Padangbai','Nusa Penida','Nusa Lembongan',
    'Sumbawa','Sumba','Ende','Maumere','Larantuka'],

  'inde': ['Mumbai','Delhi','Bangalore','Jaipur','Agra','Varanasi','Goa','Kochi',
    'Mysore','Jodhpur','Udaipur','Rishikesh','Dharamsala','Amritsar','Chennai','Kolkata',
    'Hyderabad','Ahmedabad','Surat','Pune','Nagpur','Indore','Bhopal','Visakhapatnam',
    'Coimbatore','Madurai','Thiruvananthapuram','Thrissur','Kozhikode','Mangalore',
    'Hampi','Badami','Pattadakal','Aihole','Belur','Halebidu',
    'Darjeeling','Gangtok','Kalimpong','Shillong','Guwahati','Tawang',
    'Leh','Ladakh','Srinagar','Gulmarg','Pahalgam','Manali','Shimla',
    'Mussoorie','Nainital','Jim Corbett','Ranthambore','Bharatpur','Ajmer','Pushkar',
    'Jaisalmer','Bikaner','Bundi','Chittorgarh','Ranakpur'],

  'chine': ['Pékin','Shanghai','Guangzhou','Shenzhen','Chengdu','Xi\'an','Hangzhou',
    'Guilin','Lijiang','Zhangjiajie','Pingyao','Suzhou','Wuhan','Chongqing','Kunming',
    'Dali','Shangri-La','Lhassa','Jiuzhaigou','Huangshan','Zhouzhuang','Wuzhen',
    'Tianjin','Nanjing','Wuxi','Ningbo','Xiamen','Fuzhou','Wenzhou','Quanzhou',
    'Harbin','Changchun','Shenyang','Dalian','Qingdao','Jinan','Hefei','Zhengzhou',
    'Luoyang','Kaifeng','Datong','Taiyuan','Hohhot','Yinchuan',
    'Kashgar','Turfan','Ürümqi','Dunhuang','Jiayuguan','Zhangye','Wuwei',
    'Hong Kong','Macao','Zhuhai'],

  'australie': ['Sydney','Melbourne','Brisbane','Perth','Adélaïde','Cairns','Darwin',
    'Hobart','Gold Coast','Byron Bay','Alice Springs','Broome','Esperance',
    'Katherine','Kakadu','Litchfield','Margaret River','Fremantle',
    'Geelong','Ballarat','Bendigo','Townsville','Mackay','Rockhampton','Bundaberg',
    'Sunshine Coast','Noosa','Hervey Bay','Airlie Beach','Hamilton Island',
    'Port Stephens','Hunter Valley','Blue Mountains','Snowy Mountains','Kangaroo Island'],

  'nouvelle-zelande': ['Auckland','Wellington','Christchurch','Queenstown','Rotorua',
    'Napier','Hastings','Nelson','Dunedin','Invercargill','Wanaka','Taupo','Paihia',
    'Hokianga','Coromandel','Gisborne','New Plymouth','Whanganui','Palmerston North',
    'Kaikōura','Blenheim','Picton','Greymouth','Franz Josef','Fox Glacier','Tekapo'],

  'bresil': ['Rio de Janeiro','São Paulo','Brasília','Salvador','Fortaleza','Recife',
    'Belo Horizonte','Florianópolis','Foz do Iguaçu','Manaus','Natal','Maceió',
    'Belém','São Luís','Teresina','João Pessoa','Cuiabá','Campo Grande','Porto Alegre',
    'Curitiba','Goiânia','Vitória','Campinas','Santos','Búzios','Paraty','Angra dos Reis',
    'Ilhéus','Porto Seguro','Trancoso','Caraíva','Morro de São Paulo',
    'Fernando de Noronha','Lençóis Maranhenses','Chapada Diamantina','Bonito'],

  'mexique': ['Mexico','Cancún','Playa del Carmen','Tulum','Puerto Vallarta','Los Cabos',
    'Guadalajara','Monterrey','Oaxaca','San Miguel de Allende','Mérida','Chichen Itza',
    'Palenque','San Cristóbal de las Casas','Teotihuacan','Taxco','Cuernavaca',
    'Puebla','Tlaxcala','Veracruz','Colima','Morelia','Guanajuato','Querétaro',
    'Zacatecas','Durango','Chihuahua','Hermosillo','Mazatlán','La Paz',
    'Cabo San Lucas','Ensenada','Tijuana','Acapulco','Zihuatanejo',
    'Huatulco','Puerto Escondido','Manzanillo','Holbox','Cozumel','Isla Mujeres',
    'Bacalar','Valladolid','Uxmal','Campeche'],

  'argentine': ['Buenos Aires','Córdoba','Rosario','Mendoza','Bariloche','Ushuaia',
    'El Calafate','El Chaltén','Salta','San Salvador de Jujuy','San Miguel de Tucumán',
    'Mar del Plata','Neuquén','Santa Fe','La Plata','San Juan','San Luis','Río Gallegos',
    'Puerto Iguazú','Puerto Madryn','Trelew','Comodoro Rivadavia','Tierra de Feu',
    'Mendoza','Tilcara','Humahuaca','Purmamarca'],

  'perou': ['Lima','Cusco','Machu Picchu','Arequipa','Iquitos','Puno','Huaraz','Trujillo',
    'Chiclayo','Piura','Cajamarca','Nazca','Paracas','Ica','Mancora','Huacachina',
    'Aguas Calientes','Ollantaytambo','Pisac','Chinchero','Colca Canyon'],

  'colombie': ['Bogotá','Medellín','Cali','Carthagène','Barranquilla','Santa Marta',
    'Manizales','Pereira','Bucaramanga','Cúcuta','Ibagué','Villavicencio',
    'Pasto','Popayán','Armenia','Palmira','Neiva','Sincelejo','Montería',
    'Tayrona','Leticia','Salento','Guatapé','Jardín','Ciudad Perdida'],

  'cuba': ['La Havane','Varadero','Santiago de Cuba','Trinidad','Cienfuegos','Camagüey',
    'Santa Clara','Holguín','Baracoa','Viñales','Isle de la Jeunesse'],

  'islande': ['Reykjavik','Akureyri','Selfoss','Vik','Hofn','Egilsstadir','Isafjordur',
    'Stykkisholmur','Kirkjubaejarklaustur','Husavik','Myvatn','Skaftafell',
    'Jokulsarlon','Geysir','Gullfoss','Thingvellir','Keflavik'],

  'norvege': ['Oslo','Bergen','Stavanger','Trondheim','Tromsø','Ålesund','Bodø',
    'Kristiansand','Fredrikstad','Drammen','Skien','Sandefjord','Haugesund',
    'Røros','Flåm','Gudvangen','Geiranger','Lofoten','Vesterålen','Svalbard','Longyearbyen'],

  'suede': ['Stockholm','Göteborg','Malmö','Uppsala','Linköping','Örebro','Västerås',
    'Helsingborg','Jönköping','Norrköping','Lund','Umeå','Gävle','Borås',
    'Kalmar','Karlstad','Växjö','Sundsvall','Östersund','Luleå','Kiruna','Abisko'],

  'danemark': ['Copenhague','Aarhus','Odense','Aalborg','Esbjerg','Randers','Kolding',
    'Horsens','Vejle','Roskilde','Helsingør','Frederikshavn','Billund',
    'Skagen','Bornholm','Ærø','Fanø','Ribe','Legoland','Kronborg'],

  'finlande': ['Helsinki','Tampere','Turku','Espoo','Vantaa','Oulu','Jyväskylä',
    'Lahti','Kuopio','Pori','Kouvola','Rovaniemi','Joensuu','Vaasa','Mikkeli',
    'Savonlinna','Hämeenlinna','Seinäjoki','Kotka','Lappeenranta','Imatra','Kemi'],

  'pologne': ['Varsovie','Cracovie','Łódź','Wrocław','Poznań','Gdańsk','Szczecin',
    'Bydgoszcz','Lublin','Katowice','Białystok','Gdynia','Częstochowa','Radom',
    'Sosnowiec','Toruń','Kielce','Rzeszów','Gliwice','Zabrze','Olsztyn',
    'Bielsko-Biała','Rybnik','Opole','Elbląg','Płock','Wałbrzych',
    'Zielona Góra','Włocławek','Tarnów','Koszalin','Kalisz',
    'Wieliczka','Auschwitz-Birkenau','Zakopane','Malbork'],

  'republique tcheque': ['Prague','Brno','Ostrava','Plzeň','Liberec','Olomouc',
    'České Budějovice','Ústí nad Labem','Hradec Králové','Pardubice',
    'Karlovy Vary','Mariánské Lázně','Františkovy Lázně',
    'Český Krumlov','Telč','Třebíč','Znojmo','Mikulov','Lednice','Valtice','Kutná Hora'],

  'hongrie': ['Budapest','Debrecen','Miskolc','Pécs','Győr','Nyíregyháza','Kecskemét',
    'Székesfehérvár','Szombathely','Szolnok','Tatabánya','Kaposvár','Veszprém',
    'Zalaegerszeg','Eger','Sopron','Esztergom','Visegrád','Szentendre','Hévíz',
    'Siófok','Balatonfüred','Tihany','Keszthely','Györ'],

  'roumanie': ['Bucarest','Cluj-Napoca','Timișoara','Iași','Constanța','Craiova','Brașov',
    'Galați','Ploiești','Oradea','Brăila','Arad','Pitești','Sibiu','Bacău',
    'Târgu Mureș','Baia Mare','Buzău','Botoșani','Satu Mare','Râmnicu Vâlcea',
    'Sinaia','Predeal','Poiana Brasov','Sighișoara','Bran','Deva','Alba Iulia',
    'Suceava','Gura Humorului','Voroneț','Moldovița','Sucevița'],

  'bulgarie': ['Sofia','Plovdiv','Varna','Burgas','Ruse','Stara Zagora','Pleven',
    'Sliven','Dobrich','Shumen','Haskovo','Yambol','Pazardzhik','Blagoevgrad',
    'Veliko Tarnovo','Gabrovo','Tryavna','Bansko','Borovets','Pamporovo','Koprivshtitsa'],

  'croatie': ['Zagreb','Split','Dubrovnik','Rijeka','Osijek','Zadar','Pula',
    'Šibenik','Varaždin','Karlovac','Slavonski Brod','Koprivnica',
    'Hvar','Brač','Korčula','Vis','Mljet','Krk','Cres','Rab','Pag',
    'Rovinj','Poreč','Novigrad','Umag','Motovun','Trogir','Makarska','Omiš',
    'Cavtat','Ston','Pelješac','Orebić','Lopud'],

  'serbie': ['Belgrade','Novi Sad','Niš','Kragujevac','Subotica','Zrenjanin','Pančevo',
    'Čačak','Novi Pazar','Kruševac','Kopaonik','Zlatibor','Sokobanja','Vrnjačka Banja'],

  'slovenie': ['Ljubljana','Maribor','Celje','Kranj','Velenje','Koper','Novo Mesto',
    'Bled','Bohinj','Piran','Portorož','Kranjska Gora','Postojna','Škocjan'],

  'slovaquie': ['Bratislava','Košice','Prešov','Žilina','Nitra','Banská Bystrica',
    'Trnava','Martin','Trenčín','Poprad','Tatry','Spišský Hrad','Levoča'],

  'russie': ['Moscou','Saint-Pétersbourg','Novossibirsk','Iekaterinbourg','Kazan',
    'Nijni Novgorod','Vladivostok','Sotchi','Krasnodar','Rostov-sur-le-Don',
    'Voronej','Saratov','Volgograd','Perm','Oufa','Omsk','Samara','Tcheliabinsk',
    'Khabarovsk','Irkoutsk','Oulan-Oudé','Sotchi','Yaroslav','Suzdal','Vladimir'],

  'ukraine': ['Kiev','Lviv','Odessa','Kharkiv','Dnipro','Zaporijjia','Kherson',
    'Mykolaiv','Poltava','Tchernivtsi','Ivano-Frankivsk','Jytomyr','Rivne'],

  'pays baltiques': ['Tallinn','Tartu','Riga','Jūrmala','Vilnius','Kaunas','Klaipėda','Trakai'],
  'estonie': ['Tallinn','Tartu','Narva','Pärnu','Viljandi','Rakvere','Haapsalu'],
  'lettonie': ['Riga','Jūrmala','Daugavpils','Liepāja','Jelgava','Jēkabpils'],
  'lituanie': ['Vilnius','Kaunas','Klaipėda','Trakai','Šiauliai','Panevėžys'],

  'emirats arabes unis': ['Dubai','Abu Dhabi','Sharjah','Ajman','Fujairah','Ras Al Khaimah','Al Ain'],
  'dubai': ['Dubai','Abu Dhabi','Sharjah','Ajman','Fujairah','Ras Al Khaimah','Al Ain'],

  'israel': ['Tel Aviv','Jérusalem','Haïfa','Eilat','Nazareth','Tibériade','Akko','Safed',
    'Be\'er Sheva','Netanya','Herzliya','Ashdod','Ashkelon','Rishon LeZion'],

  'jordanie': ['Amman','Petra','Wadi Rum','Aqaba','Jerash','Madaba','Kerak','Umm Qais','Ajloun'],

  'arabie saoudite': ['Riyad','Djeddah','La Mecque','Médine','Taïf','Abha','Al-Ula','Neom',
    'Dammam','Al Khobar','Dhahran','Tabuk'],

  'singapour': ['Singapour','Marina Bay','Sentosa','Jurong','Orchard','Chinatown','Little India',
    'Clarke Quay','Gardens by the Bay','Changi'],

  'malaisie': ['Kuala Lumpur','Penang','Langkawi','Kota Kinabalu','Kuching','Ipoh',
    'Malacca','Johor Bahru','Cameron Highlands','Perhentian','Tioman','Redang','Cherating',
    'George Town','Miri','Sandakan','Semporna'],

  'coree du sud': ['Séoul','Busan','Incheon','Daegu','Gwangju','Daejeon','Ulsan','Suwon',
    'Jeju','Gyeongju','Jeonju','Sokcho','Gangneung','Chuncheon','Suncheon','Yeosu',
    'Tongyeong','Geoje','Andong','Jinju'],

  'taiwan': ['Taipei','Tainan','Kaohsiung','Taichung','Keelung','Hualien','Taitung',
    'Jiufen','Sun Moon Lake','Alishan','Taroko'],

  'afrique du sud': ['Le Cap','Johannesburg','Durban','Pretoria','Port Elizabeth',
    'Stellenbosch','Franschhoek','Knysna','Oudtshoorn','Hermanus','Plettenberg Bay',
    'George','Mossel Bay','Wilderness','Tsitsikamma','Jeffrey\'s Bay','Graaff-Reinet',
    'Kimberley','Upington','Augrabies','Namaqualand','Springbok',
    'Bloemfontein','Ladysmith','Richards Bay','Umhlanga','Ballito',
    'Hluhluwe','St Lucia','Sodwana Bay','Kruger Park','Hazyview','White River',
    'Barberton','Graskop','Pilgrim\'s Rest','Blyde River Canyon','Sun City'],

  'kenya': ['Nairobi','Mombasa','Malindi','Lamu','Kisumu','Nakuru','Amboseli','Masai Mara',
    'Diani Beach','Watamu','Kilifi','Nyali','Nanyuki','Samburu','Laikipia','Tsavo',
    'Lake Naivasha','Hell\'s Gate','Aberdare','Mount Kenya','Eldoret'],

  'tanzanie': ['Dar es Salaam','Zanzibar','Arusha','Kilimanjaro','Serengeti','Ngorongoro',
    'Stone Town','Nungwi','Kendwa','Paje','Jambiani','Kizimkazi','Pemba','Mafia',
    'Moshi','Mwanza','Dodoma','Iringa','Mikumi','Ruaha','Selous','Gombe','Mahale'],

  'madagascar': ['Antananarivo','Nosy Be','Diego Suarez','Toamasina','Fianarantsoa',
    'Morondava','Tuléar','Isalo','Andasibe','Ranomafana','Marojejy'],

  'senegal': ['Dakar','Saint-Louis','Touba','Kaolack','Thiès','Ziguinchor','Saly','Cap Skirring'],

  'côte d\'ivoire': ['Abidjan','Yamoussoukro','Bouaké','Daloa','Korhogo','San-Pédro','Grand-Bassam'],

  'ghana': ['Accra','Kumasi','Cape Coast','Tamale','Sunyani','Ho','Tema'],

  'ethiopie': ['Addis-Abeba','Lalibela','Aksoum','Gondar','Bahir Dar','Dire Dawa','Hawassa'],

  'cambodge': ['Phnom Penh','Siem Reap','Angkor Wat','Sihanoukville','Kampot','Kep','Battambang'],

  'laos': ['Vientiane','Luang Prabang','Vang Vieng','Pakse','Champasak','Muang Ngoi'],

  'myanmar': ['Rangoun','Mandalay','Bagan','Inle Lake','Ngapali','Hpa-An','Mawlamyine'],

  'sri lanka': ['Colombo','Negombo','Kandy','Galle','Nuwara Eliya','Ella','Trincomalee',
    'Arugam Bay','Dambulla','Sigiriya','Anuradhapura','Polonnaruwa','Mirissa','Hikkaduwa'],

  'nepal': ['Katmandou','Pokhara','Chitwan','Lumbini','Nagarkot','Bhaktapur','Patan',
    'Namche Bazar','Lukla','Base Camp Everest'],

  'sri lanka': ['Colombo','Negombo','Kandy','Galle','Ella','Trincomalee','Arugam Bay',
    'Sigiriya','Anuradhapura','Polonnaruwa','Mirissa','Hikkaduwa'],

  'philippines': ['Manille','Cebu','Boracay','Palawan','Davao','El Nido','Coron',
    'Puerto Princesa','Dumaguete','Siargao','Bohol','Tagaytay','Batangas','Vigan'],

  'maldives': ['Malé','Hulhumalé','Maafushi','Dhigurah','Fuvahmulah','Addu','Raa Atoll',
    'Baa Atoll','Ari Atoll','Faa\'u Atoll'],

  'chili': ['Santiago','Valparaíso','Viña del Mar','San Pedro de Atacama','Torres del Paine',
    'Puerto Natales','Puerto Montt','Castro','Pucón','Villarrica','La Serena','Antofagasta',
    'Iquique','Arica','Temuco','Concepción','Rancagua','Calama','Hanga Roa'],

  'bolivia': ['La Paz','Uyuni','Salar d\'Uyuni','Potosí','Sucre','Santa Cruz','Copacabana',
    'Isla del Sol','Cochabamba','Rurrenabaque','Samaipata'],

  'equateur': ['Quito','Guayaquil','Cuenca','Galápagos','Baños','Otavalo','Mindo',
    'Montañita','Puerto López','Tena','Misahuallí'],

  'venezuela': ['Caracas','Maracaibo','Valencia','Barquisimeto','Ciudad Bolívar',
    'Canaima','Salto Ángel','Isla Margarita','Los Roques','Mérida'],

  'costa rica': ['San José','Manuel Antonio','La Fortuna','Tamarindo','Santa Teresa',
    'Montezuma','Monteverde','Bocas del Toro','Jacó','Puerto Viejo'],

  'panama': ['Panama City','Bocas del Toro','Boquete','El Valle','San Blas','Portobelo'],

  'republique dominicaine': ['Saint-Domingue','Punta Cana','Puerto Plata','Samaná',
    'Las Terrenas','Cabarete','Jarabacoa','Constanza','La Romana'],

  'cuba': ['La Havane','Varadero','Santiago de Cuba','Trinidad','Cienfuegos','Camagüey',
    'Santa Clara','Holguín','Baracoa','Viñales'],

  'haiti': ['Port-au-Prince','Cap-Haïtien','Jacmel','Les Cayes','Pétionville'],

  'jamaique': ['Kingston','Montego Bay','Negril','Ocho Rios','Port Antonio','Treasure Beach'],

  'fidji': ['Suva','Nadi','Savusavu','Lautoka','Yasawa','Mamanuca'],

  'tahiti': ['Papeete','Bora Bora','Moorea','Huahine','Raiatea','Rangiroa','Fakarava'],

  'nouvelle-caledonie': ['Nouméa','Bourail','Koné','Pouembout','Île des Pins','Ouvéa'],
};
