const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');
const bcrypt = require('bcrypt');

// Настройка подключения к БД
const sequelize = new Sequelize('fff', 'postgres', 'Enigma10', {
  host: 'localhost',
  dialect: 'postgres',
});

// Модель пользователя
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Модель бойца
const Fighter = sequelize.define('Fighter', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  wins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  draws: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sport: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ММА',
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'мужской',
  },
  coach: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  club: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Модель тренера
const Coach = sequelize.define('Coach', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sport: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  club: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'мужской',
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

const Sport = sequelize.define('Sport', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: { // Ударный, Борьба, Смешанный, С оружием
    type: DataTypes.STRING,
    allowNull: true,
  },
  origin: { // Азия, Европа, Америка, СССР/Россия
    type: DataTypes.STRING,
    allowNull: true,
  },
  isOlympic: { // true/false
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  // Новые поля для стилизации
  mainPhoto: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#e10600',
  },
  secondaryColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#181818',
  },
  textColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#ffffff',
  },
});

const News = sequelize.define('News', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

const Tournament = sequelize.define('Tournament', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

const Bracket = sequelize.define('Bracket', {
  tournamentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sport: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fighters: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  bracket: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'init',
  },
});

// Модель истории боев
const FightHistory = sequelize.define('FightHistory', {
  fighterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  opponentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tournamentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fightDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  result: {
    type: DataTypes.ENUM('win', 'loss', 'draw'),
    allowNull: false,
  },
  round: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sport: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Синхронизация моделей с БД и добавление тестовых бойцов и тренеров
sequelize.sync({ force: false })
  .then(async () => {
    console.log('База данных синхронизирована');

    // 1. Убедимся, что все 30+ видов спорта существуют в БД
    const combatSports = [
        // Ударные
        { name: 'Бокс', description: 'Контактный вид спорта, в котором спортсмены наносят друг другу удары кулаками в специальных перчатках.', type: 'Ударный', origin: 'Европа', isOlympic: true },
        { name: 'Тхэквондо', description: 'Корейское боевое искусство, характеризующееся активным использованием ног для ударов и блоков.', type: 'Ударный', origin: 'Азия', isOlympic: true },
        { name: 'Каратэ', description: 'Японское боевое искусство, система защиты и нападения. Акцент на нокаутирующие удары.', type: 'Ударный', origin: 'Азия', isOlympic: true },
        { name: 'Кикбоксинг', description: 'Спортивное единоборство, в котором разрешены удары руками и ногами. В экипировке используются боксёрские перчатки.', type: 'Ударный', origin: 'Америка', isOlympic: false },
        { name: 'Муай-тай', description: 'Тайский бокс, боевое искусство Таиланда. Удары наносятся кулаками, ступнями, голенями, локтями и коленями.', type: 'Ударный', origin: 'Азия', isOlympic: false },
        { name: 'Капоэйра', description: 'Бразильское национальное боевое искусство, сочетающее в себе элементы танца, акробатики, игры.', type: 'Ударный', origin: 'Америка', isOlympic: false },
        { name: 'Сават', description: 'Французский бокс, в котором используются удары руками и ногами в обуви.', type: 'Ударный', origin: 'Европа', isOlympic: false },
        
        // Борьба
        { name: 'Дзюдо', description: 'Японское боевое искусство, философия и спортивное единоборство без оружия. Основа — броски, болевые приёмы, удержания и удушения.', type: 'Борьба', origin: 'Азия', isOlympic: true },
        { name: 'Самбо', description: 'Советский, а с 1966 года — международный вид спортивного и прикладного единоборства, разработанный в СССР.', type: 'Борьба', origin: 'СССР/Россия', isOlympic: false },
        { name: 'Джиу-джитсу', description: 'Бразильское боевое искусство, сфокусированное на борьбе в партере, болевых и удушающих приёмах.', type: 'Борьба', origin: 'Америка', isOlympic: false },
        { name: 'Грэпплинг', description: 'Вид спортивной борьбы, совмещающий технику всех борцовских дисциплин, с минимальными ограничениями по использованию болевых и удушающих приёмов.', type: 'Борьба', origin: 'Америка', isOlympic: false },
        { name: 'Вольная борьба', description: 'Олимпийский вид спорта, единоборство двух спортсменов с применением различных приёмов (захватов, бросков, переворотов, подсечек).', type: 'Борьба', origin: 'Европа', isOlympic: true },
        { name: 'Греко-римская борьба', description: 'Европейский вид единоборства, в котором, в отличие от вольной, запрещены технические действия ногами.', type: 'Борьба', origin: 'Европа', isOlympic: true },
        { name: 'Шуайцзяо', description: 'Древнейший вид китайской национальной борьбы с применением бросков, захватов и подножек.', type: 'Борьба', origin: 'Азия', isOlympic: false },
        { name: 'Сумо', description: 'Японская национальная борьба, в которой два борца выявляют сильнейшего на круглой площадке.', type: 'Борьба', origin: 'Азия', isOlympic: false },
        { name: 'Армрестлинг', description: 'Силовое единоборство на руках, вид борьбы на руках между двумя участниками.', type: 'Борьба', origin: 'Америка', isOlympic: false },
        { name: 'Куреш', description: 'Традиционный вид борьбы у тюркских народов. Борьба ведется на поясах.', type: 'Борьба', origin: 'Азия', isOlympic: false },
        { name: 'Алыш', description: 'Кыргызская национальная борьба на поясах, входящая в состав Всемирной федерации борьбы.', type: 'Борьба', origin: 'Азия', isOlympic: false },
    
        // Смешанные
        { name: 'ММА', description: 'Смешанные боевые искусства (Mixed Martial Arts) — полноконтактный бой с применением ударной техники и борьбы как в стойке, так и на полу.', type: 'Смешанный', origin: 'Америка', isOlympic: false },
        { name: 'Ушу Саньда', description: 'Современное китайское искусство рукопашного боя и вид спортивного единоборства. Сочетает удары и броски.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
        { name: 'Кудо', description: 'Современное полноконтактное боевое единоборство, созданное в 1981 году в Японии. Отличительная черта — использование защитного шлема.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
        { name: 'Панкратион', description: 'Возрождённый древнегреческий вид единоборств, сочетающий элементы борьбы и кулачного боя.', type: 'Смешанный', origin: 'Европа', isOlympic: false },
        { name: 'Боевое самбо', description: 'Спортивное единоборство и комплексная система самообороны, разработанная в СССР. Включает удары руками и ногами.', type: 'Смешанный', origin: 'СССР/Россия', isOlympic: false },
        { name: 'Крав-мага', description: 'Израильская тактическая система самообороны, известная своей эффективностью в реальных условиях.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
        { name: 'Хапкидо', description: 'Корейское боевое искусство, направленное на самооборону. Включает удары, броски, болевые приемы.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
        { name: 'Шуто', description: 'Японское профессиональное смешанное единоборство. Является одной из старейших организаций MMA.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
        { name: 'Санда', description: 'Китайский вид спорта, который представляет собой полноконтактный поединок.', type: 'Смешанный', origin: 'Азия', isOlympic: false },
    
        // С оружием
        { name: 'Фехтование', description: 'Система приёмов владения ручным холодным оружием в рукопашном бою, нанесения и отражения ударов. Олимпийский вид спорта.', type: 'С оружием', origin: 'Европа', isOlympic: true },
        { name: 'Кендо', description: 'Японское искусство фехтования на бамбуковых мечах (синай).', type: 'С оружием', origin: 'Азия', isOlympic: false },
        { name: 'Айкидо', description: 'Японское боевое искусство, созданное Морихэем Уэсибой. Акцент на слиянии с атакой противника и перенаправлении его энергии.', type: 'С оружием', origin: 'Азия', isOlympic: false },
    ];
    for (const sport of combatSports) {
      await Sport.findOrCreate({ where: { name: sport.name }, defaults: sport });
    }
    const allSports = await Sport.findAll();

    // 2. Очистка старых данных бойцов и тренеров
    await Fighter.destroy({ where: {} });
    await Coach.destroy({ where: {} });
    console.log('Старые бойцы и тренеры удалены.');

    // 3. Подготовка базовых данных
    const silhouette = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    const clubs = [
      'Balykchy Top Team', 'Naryn Fighters', 'Talas Eagles', 'Osh Muay Thai',
      'Jalal-Abad Boxing', 'Batken Warriors', 'Issyk-Kul Grappling',
      'Bishkek Lions', 'Kant Air Force', 'Tokmok Bears'
    ];
    
    // 4. Создаем 10 тренеров
    const coachesData = [];
    for (let i = 0; i < 10; i++) {
      coachesData.push({
        name: `Тренер ${i + 1}`,
        sport: allSports[i % allSports.length].name,
        club: clubs[i],
        photo: silhouette,
        gender: i % 3 === 0 ? 'женский' : 'мужской',
        experience: 5 + (i % 10),
      });
    }
    await Coach.bulkCreate(coachesData);
    const allCoaches = await Coach.findAll();
    console.log('10 тестовых тренеров добавлены.');

    // 5. Создаем по 5 бойцов для каждого вида спорта
    const fightersToAdd = [];
    for (const sport of allSports) {
      for (let i = 0; i < 5; i++) {
        fightersToAdd.push({
          name: `Боец ${sport.name} #${i + 1}`,
          height: 170 + (i * 5),
          weight: 65 + (i * 5),
          age: 20 + i,
          wins: i * 2,
          losses: i,
          draws: 0,
          photo: silhouette,
          sport: sport.name,
          gender: i % 2 === 0 ? 'мужской' : 'женский',
          coach: allCoaches[i % allCoaches.length].name,
          club: clubs[i % clubs.length],
        });
      }
    }
    await Fighter.bulkCreate(fightersToAdd);
    console.log(`${fightersToAdd.length} тестовых бойцов добавлены.`);

    // Добавить тестовый турнир, если его нет
    const testTournament = await Tournament.findOne({ where: { name: 'Тестовый турнир' } });
    if (!testTournament) {
      await Tournament.create({ name: 'Тестовый турнир', date: new Date(), location: 'Бишкек', description: 'Тестовый турнир для проверки функционала', image: '' });
      console.log('Тестовый турнир добавлен');
    }

    // Создать админа, если его нет
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        email: 'admin@sherdoc.kg'
      });
      console.log('Админ создан: логин - admin, пароль - 1234');
    }
  })
  .catch((err) => {
    console.error('Ошибка синхронизации:', err);
  });

// Пример API: создать пользователя
app.post('/users', async (req, res) => {
  try {
    const user = await User.create({ username: req.body.username });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Пример API: получить всех пользователей
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: аутентификация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    res.json({ 
      username: user.username, 
      role: user.role,
      message: 'Успешный вход в систему' 
    });
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// API: получить всех бойцов с фильтрацией
app.get('/api/fighters', async (req, res) => {
  const { sport, weight, gender, coach } = req.query;
  console.log('Query parameters:', { sport, weight, gender, coach });
  const where = {};
  if (sport) where.sport = sport;
  if (weight) {
    // Фильтр по весу: ищем бойцов с весом в диапазоне ±5 кг (включая точное значение)
    const targetWeight = Number(weight);
    where.weight = {
      [Op.between]: [targetWeight - 5, targetWeight + 5]
    };
    console.log(`Фильтр по весу: ${weight} кг, диапазон: ${targetWeight - 5} - ${targetWeight + 5} кг`);
  }
  if (gender) {
    // Исправляем проблему с кодировкой кириллических символов
    const decodedGender = decodeURIComponent(gender);
    where.gender = decodedGender;
  }
  if (coach) where.coach = coach;
  console.log('Where clause:', where);
  const fighters = await Fighter.findAll({ where });
  console.log(`Найдено бойцов: ${fighters.length}`);
  res.json(fighters);
});

// API: поиск бойца по имени (query param)
app.get('/api/fighter', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Укажите имя бойца' });
  const fighter = await Fighter.findOne({ where: { name } });
  if (!fighter) return res.status(404).json({ error: 'Боец не найден' });
  res.json(fighter);
});

// API: получить всех тренеров с фильтрацией по виду спорта и имени
app.get('/api/coaches', async (req, res) => {
  const { sport, name } = req.query;
  const where = {};
  if (sport) where.sport = sport;
  if (name) where.name = name;
  const coaches = await Coach.findAll({ where });
  res.json(coaches);
});

app.post('/api/fighters', async (req, res) => {
  try {
    const fighter = await Fighter.create(req.body);
    res.json(fighter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/fighters/:id', async (req, res) => {
  try {
    const fighter = await Fighter.findByPk(req.params.id);
    if (!fighter) return res.status(404).json({ error: 'Боец не найден' });
    await fighter.update(req.body);
    res.json(fighter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/fighters/:id', async (req, res) => {
  try {
    const fighter = await Fighter.findByPk(req.params.id);
    if (!fighter) return res.status(404).json({ error: 'Боец не найден' });
    await fighter.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coaches', async (req, res) => {
  try {
    const coach = await Coach.create(req.body);
    res.json(coach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/coaches/:id', async (req, res) => {
  try {
    const coach = await Coach.findByPk(req.params.id);
    if (!coach) return res.status(404).json({ error: 'Тренер не найден' });
    await coach.update(req.body);
    res.json(coach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coaches/:id', async (req, res) => {
  try {
    const coach = await Coach.findByPk(req.params.id);
    if (!coach) return res.status(404).json({ error: 'Тренер не найден' });
    await coach.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить все виды спорта
app.get('/api/sports', async (req, res) => {
  const { type, origin, isOlympic, name } = req.query;
  const where = {};
  if (type) where.type = type;
  if (origin) where.origin = origin;
  if (isOlympic) where.isOlympic = isOlympic === 'true';
  if (name) where.name = { [Sequelize.Op.iLike]: `%${name}%` };

  const sports = await Sport.findAll({ where });
  res.json(sports);
});

// API: добавить вид спорта
app.post('/api/sports', async (req, res) => {
  try {
    const sport = await Sport.create(req.body);
    res.json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: обновить вид спорта
app.put('/api/sports/:id', async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.id);
    if (!sport) return res.status(404).json({ error: 'Вид спорта не найден' });
    await sport.update(req.body);
    res.json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: обновить стили вида спорта
app.put('/api/sports/:id/styles', async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.id);
    if (!sport) return res.status(404).json({ error: 'Вид спорта не найден' });
    
    const { mainPhoto, primaryColor, secondaryColor, textColor } = req.body;
    await sport.update({
      mainPhoto,
      primaryColor,
      secondaryColor,
      textColor
    });
    
    res.json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: удалить вид спорта
app.delete('/api/sports/:id', async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.id);
    if (!sport) return res.status(404).json({ error: 'Вид спорта не найден' });
    await sport.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить все новости
app.get('/api/news', async (req, res) => {
  const news = await News.findAll({ order: [['date', 'DESC']] });
  res.json(news);
});

// API: добавить новость
app.post('/api/news', async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: редактировать новость
app.put('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ error: 'Новость не найдена' });
    await news.update(req.body);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: удалить новость
app.delete('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ error: 'Новость не найдена' });
    await news.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить все турниры
app.get('/api/tournaments', async (req, res) => {
  const tournaments = await Tournament.findAll({ order: [['date', 'DESC']] });
  res.json(tournaments);
});

// API: добавить турнир
app.post('/api/tournaments', async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: редактировать турнир
app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Турнир не найден' });
    await tournament.update(req.body);
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: удалить турнир
app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Турнир не найден' });
    await tournament.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить все сетки для турнира
app.get('/api/brackets', async (req, res) => {
  const { tournamentId } = req.query;
  const where = {};
  if (tournamentId) where.tournamentId = tournamentId;
  const brackets = await Bracket.findAll({ where });
  res.json(brackets);
});

// API: создать сетку
app.post('/api/brackets', async (req, res) => {
  try {
    const bracket = await Bracket.create(req.body);
    res.json(bracket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: обновить сетку
app.put('/api/brackets/:id', async (req, res) => {
  try {
    const bracket = await Bracket.findByPk(req.params.id);
    if (!bracket) return res.status(404).json({ error: 'Сетка не найдена' });
    await bracket.update(req.body);
    res.json(bracket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: сгенерировать сетку с учётом клубов
app.post('/api/brackets/generate', async (req, res) => {
  try {
    const { fighters } = req.body;
    // fighters: [{id, name, club, ...}]
    // Группируем по клубам
    const byClub = {};
    fighters.forEach(f => {
      if (!byClub[f.club]) byClub[f.club] = [];
      byClub[f.club].push(f);
    });
    // Алгоритм: по кругу берём по одному из каждого клуба, чтобы не было пар из одного клуба
    let pool = [...fighters];
    let pairs = [];
    while (pool.length > 1) {
      let f1 = pool.shift();
      let idx = pool.findIndex(f => f.club !== f1.club);
      if (idx === -1) idx = 0; // если все из одного клуба
      let f2 = pool.splice(idx, 1)[0];
      pairs.push([f1, f2]);
    }
    if (pool.length === 1) pairs.push([pool[0]]); // если нечетное число
    // Формируем bracket-структуру
    const bracket = { round1: pairs };
    res.json(bracket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: применить результаты сетки и обновить статистику бойцов
app.post('/api/brackets/apply-results', async (req, res) => {
  try {
    const { bracket } = req.body;
    if (!bracket || !bracket.round1) return res.status(400).json({ error: 'Нет данных о сетке' });
    for (const pair of bracket.round1) {
      if (pair.length < 2) continue; // пропуск если не пара
      const winnerIdx = pair.winner;
      if (winnerIdx === undefined || winnerIdx === "") continue;
      const winner = pair[winnerIdx];
      const loser = pair[1 - winnerIdx];
      if (winner && winner.id) {
        const f = await Fighter.findByPk(winner.id);
        if (f) await f.update({ wins: f.wins + 1 });
      }
      if (loser && loser.id) {
        const f = await Fighter.findByPk(loser.id);
        if (f) await f.update({ losses: f.losses + 1 });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: обновить рекорды бойцов при продвижении на следующий этап
app.post('/api/fighters/update-records', async (req, res) => {
  try {
    const { winnerId, loserId, fightDate, tournamentName, sport, weight, round } = req.body;
    
    if (winnerId && loserId) {
      const winner = await Fighter.findByPk(winnerId);
      const loser = await Fighter.findByPk(loserId);
      
      if (winner && loser) {
        // Обновляем рекорды
        await winner.update({ wins: winner.wins + 1 });
        await loser.update({ losses: loser.losses + 1 });
        
        // Сохраняем историю боев для победителя
        await FightHistory.create({
          fighterId: winnerId,
          opponentId: loserId,
          tournamentName: tournamentName || 'Турнир',
          fightDate: fightDate || new Date(),
          result: 'win',
          round: round || '1/8',
          sport: sport || 'Бокс',
          weight: weight || 70
        });
        
        // Сохраняем историю боев для проигравшего
        await FightHistory.create({
          fighterId: loserId,
          opponentId: winnerId,
          tournamentName: tournamentName || 'Турнир',
          fightDate: fightDate || new Date(),
          result: 'loss',
          round: round || '1/8',
          sport: sport || 'Бокс',
          weight: weight || 70
        });
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить историю боев бойца
app.get('/api/fighters/:id/history', async (req, res) => {
  try {
    const fighterId = req.params.id;
    const history = await FightHistory.findAll({
      where: { fighterId },
      order: [['fightDate', 'DESC']]
    });
    
    // Получаем информацию о соперниках
    const historyWithOpponents = await Promise.all(history.map(async (fight) => {
      const opponent = await Fighter.findByPk(fight.opponentId);
      return {
        id: fight.id,
        opponentName: opponent ? opponent.name : 'Неизвестный',
        opponentClub: opponent ? opponent.club : '',
        tournamentName: fight.tournamentName,
        fightDate: fight.fightDate,
        result: fight.result,
        round: fight.round,
        sport: fight.sport,
        weight: fight.weight
      };
    }));
    
    res.json(historyWithOpponents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Перенаправление с корневого пути на страницу выбора видов спорта
app.get('/', (req, res) => {
  res.redirect('/sport-selection.html');
});

// Также перенаправляем с /index.html на страницу выбора видов спорта
app.get('/index.html', (req, res) => {
  res.redirect('/sport-selection.html');
});

// Маршрут для главной страницы с фильтрацией по виду спорта
app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Главная страница - перенаправление на выбор видов спорта
app.get('/', (req, res) => {
  res.redirect('/sport-selection.html');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 