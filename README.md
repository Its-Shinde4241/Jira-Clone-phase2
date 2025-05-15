
# 📄 Quick Access Docs:
[Architecture](ARCHITECTURAL_DECISIONS.md) | [Database Schema](DATABASE_SCHEMA.md) | [RLS Policies](RLS_POLICIES.md)
<br>

# Project structure 🏗

There are two special root folders in `src`: `App` and `shared` (described below). All other root folders in `src` (in our case only two: `Auth` and `Project`) should follow the structure of the routes. We can call these folders modules.

The main rule to follow: **Files from one module can only import from ancestor folders within the same module or from `src/shared`.** This makes the codebase easier to understand, and if you're fiddling with code in one module, you will never introduce a bug in another module.

<br>

| File or folder   | Description                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.jsx`  | The entry file. This is where we import babel polyfills and render the App into the root DOM node.                                                                                                   |
| `src/index.html` | The only HTML file in our App. All scripts and styles will be injected here by Webpack.                                                                                                              |
| `src/App`        | Main application routes, components that need to be mounted at all times regardless of current route, global css styles, fonts, etc. Basically anything considered global / ancestor of all modules. |
| `src/Auth`       | Authentication module                                                                                                                                                                                |
| `src/config`     | Supabase client module                                                                                                                                                                               |
| `src/Project`    | Project module                                                                                                                                                                                       |
| `src/shared`     | Components, constants, utils, hooks, styles etc. that can be used anywhere in the codebase. Any module is allowed to import from shared.                                                             |

# Database Schema

<br>

# Deployment Instructions – Jira Clone Phase 2

## 1. Supabase Setup

### Create Supabase Project

- Go to [Supabase Dashboard](https://app.supabase.com/) and create a new project.
- Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings.

### Database Schema

- Use the SQL Editor in Supabase Studio to create your tables (`users`, `projects`, `issues`, `comments`).
- Apply Row-Level Security (RLS) policies on your tables to enforce multi-tenancy.

## 2. Frontend Setup and Deployment

### Environment Variables

- Create a `.env` file in the frontend project root.
- Add your Supabase credentials:

  ```bash
  VITE_SUPABASE_URL=your_supabase_url_here
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
  ```

### Local Development

- install dependencies

  ```bash
  npm install
  ```

- start development server

  ```bash
  npm start
  ```

### Build for production

- Run build command

  ```bash
  npm run build
  ```

### Deploy Frontend

- Deploy the generated dist folder to a static hosting provider such as
  - Netlify
  - Vercel
  - GitHub Pages
  - Or any static file host/CDN
