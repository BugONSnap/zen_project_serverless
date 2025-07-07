# Zen Project

A SvelteKit-based learning platform for web development.

## Developing

Once you've created a project and installed dependencies with `bun install`, start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

## Database

This project uses SQLite for local development. The database file is `zen.db` in the project root.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# JWT Configuration
JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV="development"

# Security
SESSION_SECRET="your-session-secret-here"