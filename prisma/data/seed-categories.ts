import fs from 'fs';
import prisma from '../client.ts';

const csvData = fs.readFileSync('prisma/data/2_categories.csv', 'utf-8');

async function main() {
  // Читаємо файл
  const csvData = fs.readFileSync('prisma/data/2_categories.csv', 'utf-8');
  
  // Розбиваємо на рядки та пропускаємо перший рядок (заголовки)
  const rows = csvData.split('\n').slice(1).filter(Boolean);

  const categories = rows.map(row => {
    const [id, name] = row.split(',');
    return { 
      id: id.trim(), 
      name: name.trim(), 
      image: "" // Дефолтне значення
    };
  });

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
  
  console.log("Categories seeded from CSV!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());