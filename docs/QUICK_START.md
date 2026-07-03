# ⚡ Google Trends Monitor — Quick Start (5 Minutes)

**Just want to get it running? Follow this.**

---

## 🎯 Fastest Path to Live Dashboard

### Step 1: Database (2 minutes)

```bash
# A. Go to Supabase Dashboard
# https://app.supabase.com → Your Project → SQL Editor

# B. New Query → Copy this file:
# supabase/migrations/20260703_create_keyword_trends_tables.sql

# C. Paste → Run (▶️)
# Done ✅
```

### Step 2: Sample Data (1 minute)

```bash
# A. SQL Editor → New Query

# B. Copy this file:
# docs/SAMPLE_DATA.sql

# C. Paste → Run (▶️)
# Done ✅
```

### Step 3: View Dashboard (1 minute)

**Option A: Market Intelligence**
```
URL: https://yoursite.com/pro/dashboard/market-intelligence
(Scroll down for "Google Trends Monitor" section)
```

**Option B: Admin Dashboard**
```
URL: https://yoursite.com/admin/dashboard/keyword-trends
(Full dedicated dashboard)
```

✅ **You now have a working dashboard with sample data!**

---

## 🤖 Setup Automation (Choose One)

### Option 1: Make.com (Easiest - No coding)

1. **Read**: `docs/MAKE_COM_SETUP.md`
2. **Follow**: Step-by-step scenario setup
3. **Enable**: Schedule daily at 2 AM UTC
4. **Done** ✅

**Time**: 15 minutes  
**Cost**: $10-15/month

---

### Option 2: Python Script (Full control)

```bash
# 1. Install dependencies
pip install -r requirements-trends.txt

# 2. Add environment variables to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# 3. Test run manually
python scripts/collect_google_trends.py

# 4. If successful, schedule:

# Windows Task Scheduler:
# - New Task
# - Trigger: Daily at 2:00 AM
# - Action: python.exe scripts/collect_google_trends.py
# - Save & Enable

# Linux/Mac Cron:
# crontab -e
# Add: 0 2 * * * cd /path && python scripts/collect_google_trends.py

# GitHub Actions (Easiest):
# Create .github/workflows/collect-trends.yml
# (See KEYWORD_TRENDS_SETUP_GUIDE.md for code)
```

**Time**: 10 minutes  
**Cost**: Free (if using GitHub Actions)

---

### Option 3: GitHub Actions (Recommended - Set & Forget)

```bash
# 1. Create file: .github/workflows/collect-trends.yml
# Content:
name: Collect Google Trends
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements-trends.txt
      - run: python scripts/collect_google_trends.py
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}

# 2. Add secrets to GitHub
# Settings → Secrets and variables → Actions
# Add: SUPABASE_URL, SUPABASE_KEY

# 3. Done! Runs daily automatically at 2 AM UTC ✅
```

**Time**: 5 minutes  
**Cost**: Free

---

## ✅ Verification Checklist

After setup:

```
□ Dashboard loads: /admin/dashboard/keyword-trends
□ Sample data visible: 40+ records showing
□ Chart renders: Multi-line graph with keywords
□ Insights display: "Recent Insights" section populated
□ Date range works: Can select 7d/30d/90d
□ Data updates: Trends visible after collection runs
```

---

## 🚨 Troubleshooting (2 minutes)

### Dashboard shows no data
```sql
-- Check in Supabase SQL Editor:
SELECT COUNT(*) FROM keyword_trends;
-- Should return 40+ (from sample data)
-- If 0: Run SAMPLE_DATA.sql again
```

### Python script fails
```bash
# Check dependencies
pip list | grep pytrends
# Should see: pytrends

# If missing: pip install -r requirements-trends.txt

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
# Should show your URL

# Run with verbose output
python scripts/collect_google_trends.py
# Read error message
```

### Make.com scenario won't run
```
1. Check: Is scenario "Active"? (toggle enabled)
2. Check: Scheduler set to "Daily" at "02:00"?
3. Test: Click run button manually
4. Check: Execution history for errors
```

---

## 📊 What's Working Now

✅ **Live Dashboard**
- Real-time data display
- Interactive charts
- Multiple keywords tracked
- Insights generation

✅ **Sample Data**
- 40+ test records
- 6 sample insights
- Ready for visual testing

✅ **Automation Ready**
- Python script tested
- Make.com template ready
- GitHub Actions template ready

---

## 🎓 Next Steps

1. **Today**: Get dashboard running (5 min)
2. **This week**: Setup automation (10-15 min)
3. **Next week**: Monitor incoming data
4. **Following week**: Create content based on trends

---

## 📚 Full Documentation

For detailed setup:
- **Complete Guide**: `docs/KEYWORD_TRENDS_SETUP_GUIDE.md`
- **Make.com Setup**: `docs/MAKE_COM_SETUP.md`
- **Python Script**: `scripts/collect_google_trends.py`

---

## ⏱️ Time Breakdown

| Task | Time | Complexity |
|------|------|-----------|
| Database migration | 2 min | Easy |
| Insert sample data | 1 min | Easy |
| View dashboard | 1 min | Easy |
| **Subtotal (MVP)** | **4 min** | **Easy** |
| Setup Make.com | 15 min | Medium |
| Setup Python+Cron | 10 min | Medium |
| Setup GitHub Actions | 5 min | Medium |
| **Total (Automated)** | **9-19 min** | **Easy-Medium** |

---

**That's it! You're done.** 🎉

Go to `/admin/dashboard/keyword-trends` and watch your trends live!
