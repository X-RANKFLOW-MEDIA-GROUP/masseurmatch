#!/bin/bash
# MasseurMatch Migration Runner Setup

echo "🚀 Setting up migration runner..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r scripts/requirements.txt

echo ""
echo "================================"
echo "✨ Setup complete!"
echo "================================"
echo ""
echo "Before running migrations, set your environment variables:"
echo ""
echo "1. Copy your credentials from Supabase dashboard"
echo "2. Run:"
echo ""
echo "   export SUPABASE_URL='https://your-project.supabase.co'"
echo "   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
echo ""
echo "3. Then run migrations:"
echo ""
echo "   python3 scripts/run_migrations.py"
echo ""
