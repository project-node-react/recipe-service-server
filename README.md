# Foodies API Server

RESTful API backend service for the **Foodies** culinary web application, built
with Node.js, Express, PostgreSQL, Prisma ORM, and Docker.

**Live Frontend Demo:**  
[https://project-node-react.github.io/recipe-service-app/](https://project-node-react.github.io/recipe-service-app/)

**Frontend Repository:**  
[https://github.com/project-node-react/recipe-service-app](https://github.com/project-node-react/recipe-service-app)

**Deployed API (Render):**  
[https://recipe-service-server.onrender.com/](https://recipe-service-server.onrender.com/)

---

## Step-by-Step Guide

1. Clone the repository:

```bash
git clone [https://github.com/project-node-react/recipe-service-server.git](https://github.com/project-node-react/recipe-service-server.git)
cd recipe-service-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the root directory and configure environment variables:

4. Start PostgreSQL via Docker:

```bash
docker compose up
```

5. Apply Database Migrations:

```bash
npm run prisma:migrate
```

6. Generate Prisma Client:

```bash
npx prisma generate

```

7. Seed Database with Initial Data:

```bash
npm run seed
```

8. Start Development Server:

```bash
npm run dev
```

## Project Structure

```
.
├── prisma/            # Prisma schema, migration files, and seed scripts
├── src/               # Application source code
│   ├── constants/     # # Centralized app constants
│   ├── controllers/   # Request handlers for HTTP endpoints
│   ├── middlewares/   # Auth, error handling, and upload middlewares
│   ├── routes/        # Express route declarations
│   ├── services/      # Business logic and database operations
│   ├── validators/    # Zod schemas for input validation
├── .env.example       # Example environment configuration file
├── .gitignore         # Version control ignore rules
├── app.ts             # Express app initialization and setup
├── docker-compose.yml # Docker Compose configuration for PostgreSQL
├── index.ts           # Application entry point (server listener)
├── LICENSE            # MIT License file
├── package.json       # Project scripts and dependencies
├── prisma.config.ts   # Prisma ORM configuration parameters
├── README.md          # Project documentation
├── requests.http      # REST Client HTTP file for testing API endpoints
└── tsconfig.json      # TypeScript configuration
```

## Created with ❤️ by **Bake-End Devs**:

| Role             | Name                  | GitHub                                                 | Responsibilities                                    |
| ---------------- | --------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| **Team Lead**    | Vitalii Vasylets      | [@Mohara88s](https://github.com/Mohara88s)             | project architecture, code review, deployment, Auth |
| **Scrum Master** | Nataliia Dubikova     | [@Natalka-01](https://github.com/Natalka-01)           | sprint planning, Category, Ingredients              |
| **Developer**    | Andrii Tsylyuryk      | [@AndriiTsylyuryk](https://github.com/AndriiTsylyuryk) | Users                                               |
| **Developer**    | Kostiantyn Talamaniuk | [@antifloodbot](https://github.com/antifloodbot)       | Recipes                                             |
| **Developer**    | Anna Kotenko          | [@AnnaKotenkoInIT](https://github.com/AnnaKotenkoInIT) | Testimonials, Areas                                 |
| **Developer**    | Yevhen Vanchenko      | [@Vanchenko](https://github.com/Vanchenko)             | Recipes, Seeding Database                           |
| **Developer**    | Olha Kyryllova        | [@kirolla](https://github.com/kirolla)                 | Users                                               |
| **Developer**    | Dmytro Beketov        | [@dmytro4308](https://github.com/dmytro4308)           | Consultation                                        |
| **Developer**    | Vadym Andriushchenko  | [@Vademandr](https://github.com/Vademandr)             | Swagger                                             |

## License

MIT License - see [LICENSE](LICENSE) file for details.
