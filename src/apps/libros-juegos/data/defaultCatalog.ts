import { MediaType } from '../../../types';

export interface CatalogItem {
  id: string;
  title: string;
  media_type: MediaType;
  genre: string;
  author_creator: string;
  year: number;
  cover_url: string;
  description: string;
  rating_global: number; // 1-10
  tags: string[];
  platform_or_pages?: string;
}

export const MASTER_CATALOG: CatalogItem[] = [
  // ==========================================
  // LIBROS 📚
  // ==========================================
  {
    id: 'book_dune',
    title: 'Dune',
    media_type: 'book',
    genre: 'Ciencia Ficción / Épica',
    author_creator: 'Frank Herbert',
    year: 1965,
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    description: 'En el desértico planeta Arrakis, Paul Atreides debe vengar la traición a su noble casa y liderar una rebelión profética por el control de la especia.',
    rating_global: 9.4,
    tags: ['Sci-Fi', 'Imperio Galáctico', 'Política', 'Profecía', 'Clásico'],
    platform_or_pages: '704 págs'
  },
  {
    id: 'book_lotr',
    title: 'El Señor de los Anillos: La Comunidad del Anillo',
    media_type: 'book',
    genre: 'Alta Fantasía',
    author_creator: 'J.R.R. Tolkien',
    year: 1954,
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    description: 'El hobbit Frodo Bolsón emprende una peligrosa misión hacia el Monte del Destino para destruir el Anillo Único antes de que caiga en manos de Sauron.',
    rating_global: 9.8,
    tags: ['Fantasía', 'Aventura', 'Tierra Media', 'Magia', 'Clásico'],
    platform_or_pages: '576 págs'
  },
  {
    id: 'book_name_of_wind',
    title: 'El Nombre del Viento (Crónica del Asesino de Reyes)',
    media_type: 'book',
    genre: 'Fantasía / Aventura',
    author_creator: 'Patrick Rothfuss',
    year: 2007,
    cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&q=80',
    description: 'Kvothe narra en primera persona su vida: desde huérfano y músico errante hasta estudiante en la Universidad y mago de leyenda.',
    rating_global: 9.3,
    tags: ['Fantasía', 'Magia', 'Música', 'Leyenda', 'Universidad'],
    platform_or_pages: '880 págs'
  },
  {
    id: 'book_1984',
    title: '1984',
    media_type: 'book',
    genre: 'Distopía / Ficción Filosófica',
    author_creator: 'George Orwell',
    year: 1949,
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    description: 'Winston Smith vive bajo la omnipresente vigilancia del Gran Hermano y la policía del pensamiento en un régimen totalitario asfixiante.',
    rating_global: 9.5,
    tags: ['Distopía', 'Totalitarismo', 'Filosofía', 'Clásico', 'Crítica Social'],
    platform_or_pages: '352 págs'
  },
  {
    id: 'book_atomic_habits',
    title: 'Hábitos Atómicos',
    media_type: 'book',
    genre: 'Desarrollo Personal / Psicología',
    author_creator: 'James Clear',
    year: 2018,
    cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
    description: 'Un método comprobado para desarrollar buenos hábitos, eliminar los malos y conseguir cambios extraordinarios mediante micro-mejoras diarias.',
    rating_global: 9.2,
    tags: ['Productividad', 'Psicología', 'Crecimiento', 'Hábitos', 'No Ficción'],
    platform_or_pages: '336 págs'
  },
  {
    id: 'book_sapiens',
    title: 'Sapiens: De animales a dioses',
    media_type: 'book',
    genre: 'Historia / Divulgación',
    author_creator: 'Yuval Noah Harari',
    year: 2014,
    cover_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
    description: 'Un fascinante recorrido por la historia de la humanidad, desde los primeros homínidos hasta las revoluciones cognitiva, agrícola y científica.',
    rating_global: 9.1,
    tags: ['Historia', 'Antropología', 'Evolución', 'Sociedad', 'No Ficción'],
    platform_or_pages: '496 págs'
  },
  {
    id: 'book_mistborn',
    title: 'Nacidos de la Bruma: El Imperio Final',
    media_type: 'book',
    genre: 'Fantasía / Sistema de Magia',
    author_creator: 'Brandon Sanderson',
    year: 2006,
    cover_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&q=80',
    description: 'En un mundo donde la ceniza cae del cielo y el Lord Legislador gobierna con puño de hierro, una banda de ladrones y alomantes planea un golpe imposible.',
    rating_global: 9.4,
    tags: ['Fantasía', 'Alomancia', 'Rebelión', 'Sanderson', 'Cosmere'],
    platform_or_pages: '672 págs'
  },
  {
    id: 'book_three_body',
    title: 'El Problema de los Tres Cuerpos',
    media_type: 'book',
    genre: 'Ciencia Ficción Hard',
    author_creator: 'Cixin Liu',
    year: 2008,
    cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    description: 'Durante la Revolución Cultural china, un proyecto militar secreto envía señales al espacio exterior contactando con una civilización extraterrestre al borde del colapso.',
    rating_global: 9.0,
    tags: ['Hard Sci-Fi', 'Física', 'Extraterrestres', 'Misterio', 'Trilogía'],
    platform_or_pages: '416 págs'
  },

  // ==========================================
  // VIDEOJUEGOS 🎮
  // ==========================================
  {
    id: 'game_witcher3',
    title: 'The Witcher 3: Wild Hunt',
    media_type: 'game',
    genre: 'RPG de Acción / Fantasía Oscura',
    author_creator: 'CD Projekt RED',
    year: 2015,
    cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
    description: 'Geralt de Rivia, cazador de monstruos a sueldo, emprende la búsqueda de Ciri, la niña de la profecía, perseguida por la temible Cacería Salvaje.',
    rating_global: 9.8,
    tags: ['RPG', 'Mundo Abierto', 'Fantasía', 'Narrativa', 'PC/Consolas'],
    platform_or_pages: '120+ horas'
  },
  {
    id: 'game_elden_ring',
    title: 'Elden Ring',
    media_type: 'game',
    genre: 'Soulslike / Acción RPG',
    author_creator: 'FromSoftware',
    year: 2022,
    cover_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    description: 'En las Tierras Intermedias, álzate como un Sinluz guiado por la gracia para empuñar el poder del Círculo de Elden y convertirte en el Señor del Círculo.',
    rating_global: 9.7,
    tags: ['Soulslike', 'Mundo Abierto', 'Desafío', 'Fantasía Oscura', 'Miyazaki'],
    platform_or_pages: '100+ horas'
  },
  {
    id: 'game_rdr2',
    title: 'Red Dead Redemption 2',
    media_type: 'game',
    genre: 'Acción / Aventura Western',
    author_creator: 'Rockstar Games',
    year: 2018,
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    description: 'América, 1899. Arthur Morgan y la banda de Van der Linde luchan por sobrevivir como forajidos en el ocaso del Salvaje Oeste.',
    rating_global: 9.9,
    tags: ['Western', 'Mundo Abierto', 'Narrativa', 'Inmersión', 'Obra Maestra'],
    platform_or_pages: '80+ horas'
  },
  {
    id: 'game_zelda_botw',
    title: 'The Legend of Zelda: Breath of the Wild',
    media_type: 'game',
    genre: 'Aventura / Mundo Abierto',
    author_creator: 'Nintendo',
    year: 2017,
    cover_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
    description: 'Despierta de un letargo de cien años para explorar las vastas ruinas de Hyrule y derrotar a Ganon el Cataclismo con absoluta libertad.',
    rating_global: 9.7,
    tags: ['Nintendo', 'Exploración', 'Física', 'Aventura', 'Switch'],
    platform_or_pages: '60+ horas'
  },
  {
    id: 'game_god_of_war',
    title: 'God of War Ragnarök',
    media_type: 'game',
    genre: 'Acción / Hack & Slash / Mitología',
    author_creator: 'Santa Monica Studio',
    year: 2022,
    cover_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    description: 'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas asgardianas se preparan para la batalla profetizada.',
    rating_global: 9.5,
    tags: ['Mitología Nórdica', 'Acción', 'Padre e Hijo', 'Cinematográfico', 'PlayStation'],
    platform_or_pages: '45+ horas'
  },
  {
    id: 'game_baldur_gate3',
    title: "Baldur's Gate 3",
    media_type: 'game',
    genre: 'CRPG / Rol por Turnos',
    author_creator: 'Larian Studios',
    year: 2023,
    cover_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    description: 'Reúne a tu grupo y regresa a los Reinos Olvidados en una historia épica de compañerismo y traición basada en las reglas de Dungeons & Dragons.',
    rating_global: 9.9,
    tags: ['Rol', 'D&D', 'Decisiones', 'Turnos', 'GOTY 2023'],
    platform_or_pages: '100+ horas'
  },
  {
    id: 'game_cyberpunk',
    title: 'Cyberpunk 2077: Phantom Liberty',
    media_type: 'game',
    genre: 'RPG de Acción / Cyberpunk',
    author_creator: 'CD Projekt RED',
    year: 2020,
    cover_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80',
    description: 'Como V, un mercenario cibermejorado en Night City, sumérgete en un thriller de espionaje y supervivencia en el peligroso distrito de Dogtown.',
    rating_global: 9.2,
    tags: ['Cyberpunk', 'Futurista', 'RPG', 'Acción', 'Keanu Reeves'],
    platform_or_pages: '50+ horas'
  },
  {
    id: 'game_hollow_knight',
    title: 'Hollow Knight',
    media_type: 'game',
    genre: 'Metroidvania / Indie',
    author_creator: 'Team Cherry',
    year: 2017,
    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    description: 'Desciende a Hallownest, un reino subterráneo en ruinas habitado por insectos y héroes olvidados en busca de secretos ancestrales.',
    rating_global: 9.6,
    tags: ['Metroidvania', 'Indie', 'Música Increíble', 'Desafío', 'Plataformas'],
    platform_or_pages: '40+ horas'
  },

  // ==========================================
  // PELÍCULAS 🎬
  // ==========================================
  {
    id: 'movie_interstellar',
    title: 'Interstellar',
    media_type: 'movie',
    genre: 'Ciencia Ficción / Drama Espacial',
    author_creator: 'Christopher Nolan',
    year: 2014,
    cover_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    description: 'Con la Tierra muriendo por plagas y hambrunas, un grupo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.',
    rating_global: 9.6,
    tags: ['Espacio', 'Relatividad', 'Hans Zimmer', 'Familia', 'Nolan'],
    platform_or_pages: '169 min'
  },
  {
    id: 'movie_oppenheimer',
    title: 'Oppenheimer',
    media_type: 'movie',
    genre: 'Biografía / Drama Histórico',
    author_creator: 'Christopher Nolan',
    year: 2023,
    cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    description: 'La historia del físico J. Robert Oppenheimer y su liderazgo en el Proyecto Manhattan para crear la primera bomba atómica de la historia.',
    rating_global: 9.3,
    tags: ['Historia', 'Física', 'Drama', 'Oscar', 'Tensión'],
    platform_or_pages: '180 min'
  },
  {
    id: 'movie_inception',
    title: 'Inception (Origen)',
    media_type: 'movie',
    genre: 'Ciencia Ficción / Thriller',
    author_creator: 'Christopher Nolan',
    year: 2010,
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    description: 'A un hábil ladrón de secretos corporativos a través del mundo de los sueños se le ofrece la oportunidad de borrar su historial implantando una idea en una mente.',
    rating_global: 9.4,
    tags: ['Sueños', 'Mente', 'Acción', 'Misterio', 'Heist'],
    platform_or_pages: '148 min'
  },
  {
    id: 'movie_godfather',
    title: 'El Padrino (The Godfather)',
    media_type: 'movie',
    genre: 'Crimen / Drama',
    author_creator: 'Francis Ford Coppola',
    year: 1972,
    cover_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
    description: 'El patriarca de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo menor.',
    rating_global: 9.9,
    tags: ['Mafia', 'Familia', 'Clásico', 'Cine de Culto', 'Obra Maestra'],
    platform_or_pages: '175 min'
  },
  {
    id: 'movie_pulp_fiction',
    title: 'Pulp Fiction',
    media_type: 'movie',
    genre: 'Crimen / Comedia Negra',
    author_creator: 'Quentin Tarantino',
    year: 1994,
    cover_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80',
    description: 'Las vidas de dos sicarios, un boxeador, la esposa de un gángster y una pareja de atracadores de poca monta se entrelazan en cuatro historias de violencia y redención.',
    rating_global: 9.5,
    tags: ['Tarantino', 'Diálogos', 'Culto', 'Violencia Estilizada', '90s'],
    platform_or_pages: '154 min'
  },
  {
    id: 'movie_blade_runner_2049',
    title: 'Blade Runner 2049',
    media_type: 'movie',
    genre: 'Ciencia Ficción / Neo-Noir',
    author_creator: 'Denis Villeneuve',
    year: 2017,
    cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    description: 'El oficial K, un replicante de la policía de Los Ángeles, descubre un secreto largamente enterrado que amenaza con sumir en el caos los restos de la sociedad.',
    rating_global: 9.3,
    tags: ['Cyberpunk', 'Visuales Épicos', 'Villeneuve', 'Filosofía', 'Futuro'],
    platform_or_pages: '164 min'
  },
  {
    id: 'movie_matrix',
    title: 'The Matrix',
    media_type: 'movie',
    genre: 'Ciencia Ficción / Acción',
    author_creator: 'Lana & Lilly Wachowski',
    year: 1999,
    cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
    description: 'Un hacker descubre que la realidad que conoce es en realidad una simulación creada por máquinas inteligentes para cultivar la energía biológica humana.',
    rating_global: 9.7,
    tags: ['Cyberpunk', 'Simulación', 'Artes Marciales', 'Clásico', 'Keanu Reeves'],
    platform_or_pages: '136 min'
  },

  // ==========================================
  // SERIES DE TELEVISIÓN 📺
  // ==========================================
  {
    id: 'series_breaking_bad',
    title: 'Breaking Bad',
    media_type: 'series',
    genre: 'Drama Criminal / Suspense',
    author_creator: 'Vince Gilligan',
    year: 2008,
    cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    description: 'Un profesor de química de secundaria diagnosticado con cáncer terminal se alía con un exalumno para fabricar y vender metanfetamina para asegurar el futuro de su familia.',
    rating_global: 9.9,
    tags: ['Crimen', 'Transformación', 'Heisenberg', 'Tensión', '5 Temporadas'],
    platform_or_pages: '5 Temporadas (62 eps)'
  },
  {
    id: 'series_arcane',
    title: 'Arcane: League of Legends',
    media_type: 'series',
    genre: 'Animación / Fantasía Steampunk',
    author_creator: 'Christian Linke & Alex Yee (Fortiche)',
    year: 2021,
    cover_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
    description: 'En medio del creciente conflicto entre la utópica ciudad de Piltover y el oprimido submundo de Zaun, dos hermanas luchan en bandos opuestos de una guerra por tecnologías mágicas.',
    rating_global: 9.8,
    tags: ['Animación Maestra', 'Steampunk', 'Hermanas', 'Emoción', 'Fortiche'],
    platform_or_pages: '2 Temporadas (18 eps)'
  },
  {
    id: 'series_severance',
    title: 'Severance (Separación)',
    media_type: 'series',
    genre: 'Thriller Psicológico / Sci-Fi',
    author_creator: 'Dan Erickson & Ben Stiller',
    year: 2022,
    cover_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
    description: 'Mark lidera un equipo de empleados en Lumon Industries cuyos recuerdos han sido divididos quirúrgicamente entre su vida laboral y su vida personal.',
    rating_global: 9.4,
    tags: ['Misterio', 'Distopía Corporativa', 'Mente', 'Cliffhangers', 'Apple TV+'],
    platform_or_pages: '2 Temporadas'
  },
  {
    id: 'series_shogun',
    title: 'Shōgun',
    media_type: 'series',
    genre: 'Drama Histórico / Épica Samurai',
    author_creator: 'Justin Marks & Rachel Kondo',
    year: 2024,
    cover_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=400&q=80',
    description: 'En el Japón de 1600, Lord Toranaga lucha por su supervivencia mientras un misterioso barco europeo encalla en un pueblo pesquero cercano con secretos decisivos.',
    rating_global: 9.6,
    tags: ['Japón Feudal', 'Samurais', 'Estrategia Política', 'Honor', 'FX / Disney+'],
    platform_or_pages: '1 Temporada (10 eps)'
  },
  {
    id: 'series_dark',
    title: 'Dark',
    media_type: 'series',
    genre: 'Ciencia Ficción / Viajes en el Tiempo',
    author_creator: 'Baran bo Odar & Jantje Friese',
    year: 2017,
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    description: 'La desaparición de dos niños en la ciudad alemana de Winden saca a la luz las relaciones fracturadas y el oscuro pasado de cuatro familias interconectadas a través del tiempo.',
    rating_global: 9.5,
    tags: ['Viajes en el Tiempo', 'Paradojas', 'Misterio Complejo', 'Alemania', '3 Temporadas'],
    platform_or_pages: '3 Temporadas (26 eps)'
  },
  {
    id: 'series_the_wire',
    title: 'The Wire (Bajo Escucha)',
    media_type: 'series',
    genre: 'Drama Policial / Sociología Urbana',
    author_creator: 'David Simon',
    year: 2002,
    cover_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80',
    description: 'Una visión cruda y realista de la escena de las drogas en Baltimore a través de los ojos de los agentes de policía, los traficantes y las instituciones políticas.',
    rating_global: 9.8,
    tags: ['Realismo', 'HBO', 'Policíaco', 'Crítica Social', '5 Temporadas'],
    platform_or_pages: '5 Temporadas (60 eps)'
  },
  {
    id: 'series_chernobyl',
    title: 'Chernobyl',
    media_type: 'series',
    genre: 'Miniserie Histórica / Drama',
    author_creator: 'Craig Mazin',
    year: 2019,
    cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    description: 'En abril de 1986, una explosión en la central nuclear de Chernóbil en la Unión Soviética se convierte en una de las peores catástrofes provocadas por el hombre.',
    rating_global: 9.8,
    tags: ['Historia Real', 'Nuclear', 'Tensión Máxima', 'Miniserie', 'HBO'],
    platform_or_pages: 'Miniserie (5 eps)'
  },
  {
    id: 'series_game_of_thrones',
    title: 'Juego de Tronos (Game of Thrones)',
    media_type: 'series',
    genre: 'Fantasía Oscura / Política Medieval',
    author_creator: 'David Benioff & D.B. Weiss (George R.R. Martin)',
    year: 2011,
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    description: 'Nueve familias nobles luchan por el control de las tierras míticas de Poniente, mientras un antiguo enemigo regresa tras estar latente durante milenios.',
    rating_global: 9.3,
    tags: ['Fantasía', 'Dragones', 'Poniente', 'Traición', 'HBO'],
    platform_or_pages: '8 Temporadas (73 eps)'
  }
];
