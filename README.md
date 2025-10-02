# Helpdesk Pro - Ticket Maintenance System

A modern, React-based helpdesk ticket management system inspired by Jira, built with the latest frontend technologies for optimal developer experience and minimal code complexity.

## 🚀 Features

### Core Functionality
- **Role-based Authentication** (L1, L2, L3, Admin)
- **Ticket Management** with full CRUD operations
- **Escalation Workflow** (L1 → L2 → L3)
- **Priority & Critical Value Assignment**
- **Activity Logging** with detailed audit trail

### User Roles & Permissions

#### 🔹 Helpdesk Agent (L1)
- Create new tickets
- Start work and resolve tickets at L1 level
- Update status: New, Attending, Completed
- Escalate unresolved tickets to L2

#### 🔹 Technical Support (L2)
- Start work and resolve tickets at L1, L2, and L3 levels
- View escalated tickets and L3 tickets they assigned
- Assign Critical Values (C1, C2, C3)
- Add action logs
- Escalate critical issues to L3

#### 🔹 Advanced Support (L3)
- Start work and resolve tickets at all levels (L1, L2, L3)
- Handle escalated critical tickets (C1-C2)
- Add resolutions
- Close tickets

## 🛠 Tech Stack

### Frontend (Optimized for Minimal Code)
- **React 19** with **Vite** for lightning-fast development
- **TypeScript** for type safety
- **Tailwind CSS** for rapid UI development
- **React Router DOM** for client-side routing

### State Management & Data Fetching
- **Redux Toolkit (@reduxjs/toolkit) + React-Redux** - Centralized client state (auth session, UI state) with concise slices
- **@tanstack/react-query** - Server state fetching & caching (tickets, auth profile)

### Forms & Validation
- **react-hook-form** - Performant forms with minimal re-renders
- **@hookform/resolvers** + **zod** - Type-safe form validation

### UI Components
- **@headlessui/react** - Unstyled, accessible UI primitives
- **lucide-react** - Beautiful SVG icons
- **clsx** - Conditional CSS classes utility

### Testing
- **Vitest** - Vite-native test runner
- **@testing-library/react** - Simple and complete testing utilities
- **@testing-library/jest-dom** - Custom jest matchers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Accounts

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | `admin` | `password` | Full system access |
| L1 Agent | `agent1` | `password` | Create and manage tickets |
| L2 Tech | `tech1` | `password` | Handle escalated tickets |
| L3 Expert | `expert1` | `password` | Resolve critical issues |

## 📦 Package Selection Rationale

Each package was chosen to **minimize code complexity** and **maximize developer productivity**:

1. **@tanstack/react-query** - Eliminates complex state management for server data
2. **@tanstack/react-table** - Provides enterprise-grade table features out of the box
3. **react-hook-form + zod** - Type-safe forms with minimal boilerplate
4. **@headlessui/react** - Accessible components without design constraints
5. **lucide-react** - Comprehensive icon library with tree-shaking
6. **Tailwind CSS** - Rapid prototyping and consistent design system

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Full test documentation:
- **Frontend tests overview:** [`TESTS_README.md`](./TESTS_README.md)

## 🏗 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
