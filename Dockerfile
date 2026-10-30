# Використовуємо легку офіційну версію Node.js
FROM node:20-alpine

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /app

# Копіюємо файл залежностей та схему Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності
RUN npm install

# Копіюємо решту вихідного коду застосунку
COPY . .

# Генеруємо Prisma Client
RUN npx prisma generate

# Відкриваємо порт, на якому працює Express-сервер
EXPOSE 5000

# Команда для старту сервера
CMD ["npm", "start"]