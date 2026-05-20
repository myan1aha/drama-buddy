#!/bin/bash
# 构建 TV 前端并复制到 Android assets 目录
set -e

echo "🔨 Building TV frontend..."
pnpm build

echo "📦 Copying to Android assets..."
rm -rf android/app/src/main/assets
cp -r dist android/app/src/main/assets

echo "✅ Done! Now open android/ in Android Studio and build APK."
echo "   Or run: cd android && ./gradlew assembleDebug"
