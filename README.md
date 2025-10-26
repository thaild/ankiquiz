# 📚 AnkiQuiz - Advanced Certification Exam Preparation Tool

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/ankiquiz/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AnkiQuiz is a comprehensive, interactive exam preparation platform designed for certification exams like AWS, PMI-PMP, and other professional certifications. It features auto-loading exam data, progress tracking, authentication, and real-time feedback.

## ✨ Features

### 📚 Exam Management
- **Auto-loading**: Automatically detects and loads exam files from folders
- **Multiple Sources**: Support for Whizlabs, ExamTopics, PMA, and custom exam data
- **Smart Pattern Recognition**: Recognizes common exam file naming patterns
- **Real-time Validation**: Immediate feedback on answers

### 📊 Progress Tracking
- **Database Integration**: PostgreSQL database for persistent results
- **Statistics Dashboard**: View detailed performance analytics
- **Results History**: Track all completed exams over time
- **Auto-save**: Automatic saving every 30 seconds

### 🔐 Authentication
- **Netlify Identity**: Optional user authentication
- **Fallback Support**: Works without authentication
- **Data Migration**: Automatic migration of fallback data on login
- **Secure Operations**: Protected API endpoints

### 🎯 User Experience
- **Auto-feedback**: Immediate feedback on answers
- **Review System**: Star questions for later review
- **Quick Review Modal**: Fast access to exam overview
- **Dark Mode**: Comfortable viewing for extended study sessions
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git
- Netlify account

### Installation

```bash
# Clone the repository
git clone https://github.com/thaild/ankiquiz.git
cd ankiquiz

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Initialize database
npm run reset-db

# Generate exam indexes
npm run generate-indexes

# Start development server
npm start
```

Visit `http://localhost:3000` to see the application.

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get up and running quickly
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Database Integration](./docs/DATABASE_INTEGRATION.md)** - Database setup and usage
- **[Netlify Identity Setup](./docs/NETLIFY_IDENTITY_SETUP.md)** - Authentication configuration
- **[Auto-Loading Guide](./docs/AUTO_LOADING_GUIDE.md)** - Exam data auto-loading
- **[Database Auth Integration](./docs/DATABASE_AUTH_INTEGRATION.md)** - Auth with database
- **[Netlify Deploy Guide](./docs/NETLIFY_DEPLOY_GUIDE.md)** - Netlify deployment

## 🏗️ Architecture

### Frontend
- **HTML/CSS/JavaScript**: Vanilla JS with ES6 modules
- **Bootstrap 5**: UI framework
- **Netlify Identity**: Authentication
- **Auto-loading System**: Dynamic exam data loading

### Backend
- **Netlify Functions**: Serverless API endpoints
- **PostgreSQL**: Database for results and sessions
- **Express**: Optional standalone server

### Key Files
```
ankiquiz/
├── index.html                    # Main application
├── netlify.toml                   # Netlify configuration
├── package.json                   # Dependencies
├── functions/
│   ├── api.cjs                   # API endpoints
│   └── database.cjs              # Database operations
├── public/
│   ├── js/
│   │   ├── auth.js              # Authentication manager
│   │   ├── exam-loader.js        # Auto-loading system
│   │   ├── database-client.js   # Database client
│   │   ├── exam.js              # Exam logic
│   │   └── classes.js           # Core classes
│   └── data/                    # Exam data files
└── server/                       # Optional Express server
```

## 🛠️ Development

### Available Scripts

```bash
npm start              # Start development server
npm run dev-server     # Start with auto-reload (nodemon)
npm run server         # Start Express API server
npm run build          # Build for production
npm run generate-indexes  # Generate exam index files
npm run reset-db       # Reset database tables
npm run clear-cache    # Clear Netlify cache
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

### Adding New Exam Data

1. Add exam files to `public/data/` directory
2. Run `npm run generate-indexes` to update indexes
3. Files are automatically loaded by the system

### Project Structure

```
ankiquiz/
├── docs/                      # Documentation
├── functions/                 # Netlify Functions
│   ├── api.cjs               # API handlers
│   └── database.cjs         # Database operations
├── public/                   # Static files
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript modules
│   └── data/                 # Exam data
├── scripts/                  # Build scripts
├── server/                   # Express server (optional)
├── tools/                    # Development tools
└── package.json             # Project configuration
```

## 🌐 Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set environment variables:
   - `NETLIFY_DATABASE_URL`: PostgreSQL connection string
   - `NODE_ENV`: production
3. Configure Netlify Identity (optional)
4. Deploy!

See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Exam Sources

The application supports multiple exam sources:

- **Whizlabs**: SAP-C01, SAP-C02
- **ExamTopics**: SAA-C03, SAP-C01, SAP-C02, SOA-C02, DBS-C01, DOP-C01, etc.
- **PMA**: Final exams and mock tests
- **Custom**: Add your own exam data

## 🔑 Features in Detail

### Auto-Loading System
- Automatically detects exam files in folders
- Supports multiple naming patterns
- Fallback to traditional loading if needed
- Progress tracking during loading

### Authentication System
- Netlify Identity integration
- Fallback user IDs for unauthenticated users
- Automatic data migration on login
- Secure JWT-based API requests

### Database Integration
- PostgreSQL database
- Automatic table creation
- Index optimization
- Connection pooling
- Health checks

### Exam Features
- Timed exams
- Multiple choice questions
- Review and star questions
- Show answers and discussions
- Save progress automatically
- Results dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Netlify for hosting and functions
- Bootstrap for UI components
- Font Awesome for icons
- All exam content providers

## 📞 Support

- 📖 Read the [documentation](./docs/)
- 🐛 [Report issues](https://github.com/thaild/ankiquiz/issues)
- 💬 [Netlify Community](https://community.netlify.com/)

## 🎯 Roadmap

- [ ] Additional exam types
- [ ] Advanced analytics
- [ ] Social features
- [ ] Mobile app
- [ ] Offline support
- [ ] Export results to PDF

---

**Made with ❤️ for certification exam preparation**

