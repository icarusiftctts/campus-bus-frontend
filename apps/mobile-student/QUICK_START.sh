#!/bin/bash
# Quick Start Script for API Integration

echo "=========================================="
echo "Campus Bus Booking - API Integration Setup"
echo "=========================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Installing required dependency: AsyncStorage..."
npm install @react-native-async-storage/async-storage

echo ""
echo "✅ Installation complete!"
echo ""
echo "⚠️  IMPORTANT: Before running the app, update the API URL:"
echo "   Edit: src/services/api.config.ts"
echo "   Replace: 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev'"
echo "   With your actual API Gateway URL from AWS Console"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - INSTALLATION.md"
echo "   - API_INTEGRATION.md"
echo "   - CHANGES_SUMMARY.md"
echo ""
echo "🚀 To start the app:"
echo "   npm start"
echo ""
