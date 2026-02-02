# Sport Betting App - Turbo Repo

This is a [Turborepo](https://turbo.build/repo) monorepo.

## What's inside?

This turborepo uses [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `apps/http-backend`: Express.js backend server
- `apps/frontend`: Next.js frontend application
- `packages/database`: Shared Prisma database package
- `packages/typescript-config`: Shared TypeScript configurations
- `packages/eslint-config`: Shared ESLint configurations
- `packages/ui`: Shared UI components

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Build all apps and packages

```bash
pnpm build
```

### Run development servers

```bash
pnpm dev
```

This will start all development servers in parallel.

### Run specific app

```bash
cd apps/http-backend
pnpm dev
```

Or:

```bash
cd apps/frontend
pnpm dev
```

## Learn More

To learn more about the tools used in this turborepo, take a look at the following resources:

- [Turborepo Documentation](https://turbo.build/repo/docs) - learn about Turborepo features and API.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
