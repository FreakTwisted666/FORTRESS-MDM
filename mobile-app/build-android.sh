
#!/bin/bash

# Fortress MDM Android Build Script
set -e

echo "🔧 Building Fortress MDM Android App..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Generate Android project if not exists
if [ ! -d "android" ]; then
    echo "🏗️ Generating Android project..."
    npx react-native init FortressMDM --template react-native-template-typescript
    cp -r FortressMDM/android ./
    rm -rf FortressMDM
fi

# 3. Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew clean
./gradlew assembleDebug
cd ..

# 4. Build release APK (for production)
echo "🚀 Building release APK..."
cd android
./gradlew assembleRelease
cd ..

# 5. Production readiness checks
echo "🔍 Running production checks..."
if grep -r "FORTRESS-MDM-2025" ../src --exclude-dir=node_modules; then
    echo "⚠️  Default enrollment code found. Update for production!"
fi

if grep -r "YOUR_SERVER_URL" ../src --exclude-dir=node_modules; then
    echo "⚠️  Default server URL found. Update for production!"
fi

echo "✅ Android build completed!"
echo ""
echo "📱 APK Files Generated:"
echo "   Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
echo "   Release APK: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""
echo "📋 Next Steps:"
echo "1. Sign the release APK for production distribution"
echo "2. Test the debug APK on Android devices"
echo "3. Configure enrollment server URL in production"
echo "4. Update enrollment code from default 'FORTRESS-MDM-2025'"
