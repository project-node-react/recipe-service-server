## Встановлення

1. Встановіть залежності:

```bash
npm install
```

2. Налаштуйте `.env`:

3. Запустіть бд на docker:

```bash
docker compose up
```

3. Застосуйте міграцію:

```bash
npm run prisma:migrate
```

4. Застосуйте генерацію:

```bash
npx prisma generate

```

5. Запустіть скрипт наповнення бази даних:

```bash
npm run seed
```

5. Запустіть проект:

```bash
npm run dev
```
