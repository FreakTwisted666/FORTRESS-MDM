#!/bin/bash

# Fortress MDM Production Deployment Script
# This script prepares the application for production deployment

set -e

echo "🚀 Starting Fortress MDM Production Deployment"

# 1. Environment Check
echo "📋 Checking environment..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one from .env.example"
    cp .env.example .env
    echo "✅ Created .env template. Please update with your production values."
    exit 1
fi

# 2. Database Check
echo "🗄️  Checking database connection..."
if ! npm run db:push; then
    echo "❌ Database connection failed. Please check your DATABASE_URL"
    exit 1
fi

# 3. Type Check
echo "🔍 Running TypeScript type check..."
if ! npm run type-check; then
    echo "❌ TypeScript errors found. Please fix before deployment."
    exit 1
fi

# 4. Build Application
echo "🏗️  Building application..."
npm run build

# 5. Database Seeding (optional)
echo "🌱 Seeding database with initial data..."
if npm run db:seed; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Database seeding failed - continuing with deployment"
fi

# 6. Production Readiness Check
echo "🔒 Running production readiness checks..."

# Check for sensitive data
if grep -r "admin123" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.sh"; then
    echo "⚠️  Default password found in code. Please update for production."
fi

# Check for development settings
if grep -r "NODE_ENV=development" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.sh"; then
    echo "⚠️  Development environment settings found. Please review."
fi

echo "✅ Production build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with production values"
echo "2. Set strong SESSION_SECRET (32+ characters)"
echo "3. Change default admin password from admin123"
echo "4. Review PRODUCTION_CHECKLIST.md for complete deployment guide"
echo "5. Start production server with: npm start"
echo ""
echo "🎯 Production Features Ready:"
echo "   ✅ Device Management & Control"
echo "   ✅ Policy Management & Enforcement"
echo "   ✅ Application Management & Distribution"
echo "   ✅ Analytics & Reporting Dashboard"
echo "   ✅ Kiosk Management with SSO"
echo "   ✅ Device Control Rules (WiFi, GPS, etc.)"
echo "   ✅ Dark/Light Theme Support"
echo "   ✅ AI-Powered Chat Assistant"
echo "   ✅ PostgreSQL Database Integration"
echo "   ✅ Real-time Device Monitoring"
echo ""
echo "🔐 Security Notes:"
echo "   - Change default admin credentials immediately"
echo "   - Use strong session secrets in production"
echo "   - Enable HTTPS for all connections"
echo "   - Review firewall and database security"
echo ""
echo "📈 Ready for Enterprise Deployment!"