import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../client.ts';

async function main() {
  const results: any[] = [];
  fs.createReadStream('prisma/data/3_ingredients.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      await prisma.ingredient.createMany({
        data: results.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          img: r.img
        })),
        skipDuplicates: true,
      });
      console.log('Ingredients seeded!');
    });
}
main();