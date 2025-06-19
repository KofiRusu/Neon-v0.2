# Neon0.2 - Production-Ready Monorepo

[![CI/CD Pipeline](https://github.com/your-org/neon0.2/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/neon0.2/actions/workflows/ci.yml)
[![Coverage Status](https://codecov.io/gh/your-org/neon0.2/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/neon0.2)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A curated, production-ready monorepo built with modern TypeScript tooling, comprehensive testing, and automated CI/CD. This project demonstrates best practices for scalable application architecture.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/neon0.2.git
cd neon0.2

# Install dependencies
npm install

# Run development workflow
npm run dev

# Run all quality checks
npm run ci
```

## 🤖 InsightAgent - Real-Time KPI Monitoring

The **InsightAgent** is a sophisticated AI-powered system for real-time campaign performance monitoring and optimization. It automatically detects anomalies, identifies performance issues, and generates actionable recommendations.

### Key Features

- **Real-time Performance Analysis**: Monitors CTR, CPA, ROI, ROAS, and other key metrics
- **Anomaly Detection**: Uses statistical analysis to identify performance drops and spikes
- **Intelligent Insights**: Automatically flags low CTR, high CPA, and low ROI scenarios
- **Optimization Recommendations**: Provides actionable suggestions for campaign improvement
- **Health Scoring**: Calculates overall campaign health scores with trend analysis
- **Comprehensive Logging**: Detailed logging for monitoring and debugging

### Quick Example

```typescript
import { InsightAgent } from '@neon/core-agents';

// Initialize the agent
const context = {
  logger: console,
  config: {
    environment: 'production',
    enableLogging: true,
    enableMetrics: true
  }
};

const agent = new InsightAgent(context);
await agent.initialize();

// Analyze campaign performance
const analysis = await agent.analyzeCampaignPerformance('campaign_123');
if (analysis.success) {
  console.log(`Found ${analysis.data.insights.length} insights`);
  console.log(`Health Score: ${analysis.data.summary.healthScore}/100`);
}

// Get optimization recommendations
const recommendations = await agent.recommendOptimization('campaign_123');
if (recommendations.success) {
  recommendations.data.forEach(rec => {
    console.log(`${rec.title} (${rec.priority} priority)`);
    console.log(`Expected Impact: ${rec.expectedImpact}`);
  });
}
```

### Supported Anomaly Detection

- **Low CTR Detection**: Identifies when click-through rates fall below acceptable thresholds
- **High CPA Alerts**: Flags when cost-per-acquisition exceeds target levels
- **Low ROI Warnings**: Detects declining return on investment
- **Performance Drop Analysis**: Statistical anomaly detection for unusual performance patterns
- **Budget Efficiency Monitoring**: Tracks spend efficiency and suggests budget adjustments

### Optimization Recommendations

The InsightAgent generates specific, actionable recommendations:

- **Creative Optimization**: When CTR is low, suggests new creative testing
- **Bidding Strategy**: For high CPA, recommends bid adjustments and automation
- **Budget Scaling**: For profitable campaigns, suggests budget increases
- **Targeting Refinement**: Based on anomalies, recommends audience adjustments

## 📁 Project Structure

```
Neon0.2/
├── packages/                 # Workspace packages
│   ├── core-agents/         # AI agents (InsightAgent, etc.)
│   ├── data-model/          # Prisma schema and database models
│   ├── utils/               # Shared utilities  
│   ├── types/               # TypeScript definitions
│   └── reasoning-engine/    # AI reasoning and decision engine
├── apps/                    # Applications
│   └── api/                # tRPC API server
├── tests/e2e/               # End-to-end tests
├── docs/                    # Documentation
├── .github/workflows/       # CI/CD pipelines
└── coverage/                # Test coverage reports
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Build and test (development workflow)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove build artifacts

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Validate TypeScript types

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

### Database (Data Model)
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### CI/CD
- `npm run ci` - Run complete CI pipeline locally

## 🏗️ Architecture

### Monorepo Structure
This project uses npm workspaces to manage multiple packages within a single repository. Each package in `packages/` is independently versioned and can be published separately.

### InsightAgent Architecture
- **Agent Pattern**: Implements a clean agent interface with lifecycle management
- **Dependency Injection**: Uses context-based dependency injection for testability
- **Database Integration**: Built on Prisma for type-safe database operations
- **Statistical Analysis**: Implements anomaly detection using statistical methods
- **Recommendation Engine**: Rule-based system for generating optimization suggestions

### TypeScript Configuration
- **Strict mode enabled** with advanced compiler options
- **Path mapping** for clean imports across packages
- **Composite builds** for efficient incremental compilation
- **Zero tolerance** for `any` types in production code

### Testing Strategy
- **Unit tests** with Jest (80%+ coverage requirement)
- **Integration tests** for database operations
- **E2E tests** with Playwright across multiple browsers
- **Coverage thresholds** enforced in CI/CD
- **Test utilities** and fixtures for consistent testing

### Code Quality
- **ESLint** with TypeScript-specific rules
- **Prettier** for consistent code formatting
- **Pre-commit hooks** (if configured)
- **Automated fixes** in CI/CD pipeline

## 📊 Quality Standards

- ✅ **80%+ test coverage** across all packages
- ✅ **Zero TypeScript errors** with strict mode
- ✅ **ESLint compliance** with error-level enforcement
- ✅ **Prettier formatting** applied consistently
- ✅ **No `any` types** in production code
- ✅ **E2E test coverage** for critical user flows

## 🔄 CI/CD Pipeline

Our GitHub Actions workflow includes:

1. **Code Quality Checks** - Linting, formatting, type checking
2. **Unit Testing** - Jest with coverage reporting
3. **Build Validation** - TypeScript compilation
4. **E2E Testing** - Playwright across browsers
5. **Security Audit** - npm audit for vulnerabilities
6. **Deployment** - Automated deployment on main branch

## 🚦 Development Workflow

1. **Create feature branch** from `main`
2. **Implement changes** following code standards
3. **Write tests** for new functionality
4. **Run quality checks** locally
5. **Submit pull request** with detailed description
6. **Code review** and automated testing
7. **Merge** after approval and passing tests

## 📚 Package Documentation

### Core Agents (`@neon/core-agents`)
Contains the InsightAgent and other AI agents for campaign optimization:
- `InsightAgent` - Real-time KPI monitoring and anomaly detection
- Utility functions for metric calculations and trend analysis
- Comprehensive test suite with mocking

### Data Model (`@neon/data-model`)
Prisma-based data layer with:
- Campaign and metric models
- Insight and recommendation storage
- Type-safe database operations
- Migration management

### Types (`@neon/types`)
Shared TypeScript definitions:
- Base interfaces and utility types
- API response types
- Error handling types
- Logger interfaces

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm workspaces support

### Database Setup
```bash
# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open database studio
npm run db:studio
```

### Running Examples
```bash
# Run InsightAgent example
cd packages/core-agents
npm run example
```

## 📈 Performance Monitoring

The InsightAgent provides comprehensive performance tracking:

- **Metrics Collection**: Automated collection of campaign performance data
- **Real-time Analysis**: Continuous monitoring with configurable thresholds
- **Trend Analysis**: Historical performance tracking and trend identification
- **Alert System**: Automated notifications for critical performance issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Run tests: `npm run test`
5. Run quality checks: `npm run ci`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Roadmap

- [ ] **Enhanced AI Agents** - Additional agents for different optimization scenarios
- [ ] **Machine Learning Integration** - Predictive analytics and advanced anomaly detection
- [ ] **Real-time Dashboard** - Web interface for monitoring and insights
- [ ] **API Documentation** - OpenAPI/Swagger documentation
- [ ] **Performance Benchmarks** - Automated performance testing and benchmarking

## 📞 Support

For questions and support:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` directory
- Review the example implementations in `packages/core-agents/src/example.ts`

---

**Commit**: `feat(agent): add InsightAgent with performance analyzer and recommender`

Built with ❤️ by the Neon team 