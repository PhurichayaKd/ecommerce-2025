# E-commerce 2025

A modern, responsive e-commerce application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful UI components
- **Performance Optimized**: Fast loading times and smooth user experience
- **Accessibility**: WCAG compliant components
- **SEO Friendly**: Optimized for search engines
- **Type Safe**: Full TypeScript support
- **Component Library**: Reusable UI components
- **Dark Mode**: Built-in theme switching
- **CI/CD**: Automated testing and deployment

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom component library
- **State Management**: React Context API
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Project Structure

```
ecommerce-2025/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── products/         # Product-related components
│   ├── providers/        # Context providers
│   └── ui/              # UI components
├── lib/                  # Utility functions
│   ├── api.ts           # API functions
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── public/              # Static assets
│   └── data/           # Mock data
├── styles/             # Additional styles
│   └── tokens.css     # Design tokens
└── .github/           # GitHub workflows
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecommerce-2025.git
cd ecommerce-2025
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## UI Components

The project includes a comprehensive set of reusable UI components:

- **Button** - Various styles and sizes
- **Input** - Form inputs with validation
- **Select** - Dropdown selections
- **Badge** - Status indicators
- **Card** - Content containers
- **Skeleton** - Loading states
- **EmptyState** - Empty content placeholders
- **Pagination** - Navigation controls

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Tailwind CSS

The project uses a custom Tailwind configuration with design tokens defined in `styles/tokens.css`.

## Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push to main

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

This project follows strict code style guidelines:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type safety
- **Conventional Commits**: For commit messages

## Bug Reports

If you find a bug, please create an issue using the bug report template.

## Feature Requests

For feature requests, please use the feature request template.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for hosting and deployment

## Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/yourusername/ecommerce-2025/issues)
3. Create a new issue if needed

---
