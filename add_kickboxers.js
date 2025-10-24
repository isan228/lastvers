const fetch = require('node-fetch');

const fighters = Array.from({ length: 16 }).map((_, i) => ({
  name: `Кикбоксер Тест ${i + 1}`,
  height: 175 + (i % 5),
  weight: 70,
  age: 20 + (i % 8),
  wins: Math.floor(Math.random() * 10),
  losses: Math.floor(Math.random() * 5),
  draws: Math.floor(Math.random() * 2),
  photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  sport: 'Кикбоксинг',
  gender: 'мужской',
  coach: `Тренер ${1 + (i % 5)}`,
  club: `Клуб ${1 + (i % 4)}`
}));

(async () => {
  for (const fighter of fighters) {
    const res = await fetch('http://localhost:3000/api/fighters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fighter)
    });
    const data = await res.json();
    console.log(data);
  }
})(); 