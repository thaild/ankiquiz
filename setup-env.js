#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AnkiQuiz Environment Setup');
console.log('=============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('📋 Please edit the .env file with your configuration.');
  } else {
    console.log('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check for required directories
const requiredDirs = ['public', 'server'];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    console.log(`❌ Required directory '${dir}' not found!`);
    process.exit(1);
  }
});

console.log('\n📋 Next Steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Install dependencies: npm install');
console.log('3. Start development server: npm run dev');
console.log('4. For production: Follow DEPLOYMENT_GUIDE.md');

console.log('\n🔧 Available commands:');
console.log('- npm run dev: Start development server');
console.log('- npm run server: Start API server');
console.log('- npm run build: Build for production');
console.log('- npm run reset-db: Reset database');

console.log('\n📚 Documentation:');
console.log('- DEPLOYMENT_GUIDE.md: Complete deployment guide');
console.log('- README.md: Project overview');

console.log('\n✨ Setup complete!'); 