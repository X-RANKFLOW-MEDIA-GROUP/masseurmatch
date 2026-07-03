# 🚀 Google Trends Keyword Monitor — Complete Setup Guide

**Status**: Ready to deploy  
**Time to complete**: 30 minutes  
**Difficulty**: Intermediate

---

## 📋 What You're Setting Up

A complete **Google Trends monitoring system** that:
- ✅ Tracks 50+ massage therapy keywords daily
- ✅ Detects peaks and trending keywords
- ✅ Generates actionable insights
- ✅ Displays real-time data in dashboards
- ✅ Sends alerts when keywords spike

**Result**: Data-driven content strategy powered by search trends

---

## 🎯 Final Deployment Checklist

### Phase 1: Database Setup (5 minutes)
- [ ] **Step 1A**: Execute Supabase migration
- [ ] **Step 1B**: Verify tables created
- [ ] **Step 1C**: Insert sample data (for testing)

### Phase 2: Data Collection (10 minutes)
- [ ] **Step 2A**: Choose collection method (Python or Make.com)
- [ ] **Step 2B**: Setup collection process
- [ ] **Step 2C**: Test with manual run

### Phase 3: Dashboard Verification (5 minutes)
- [ ] **Step 3A**: View Market Intelligence dashboard
- [ ] **Step 3B**: Access admin dashboard
- [ ] **Step 3C**: Verify data is displaying

### Phase 4: Automation (10 minutes)
- [ ] **Step 4A**: Schedule daily collection
- [ ] **Step 4B**: Setup alerts (optional)
- [ ] **Step 4C**: Monitor first run

---

## 🔧 Phase 1: Database Setup

### Step 1A: Execute Migration in Supabase

**Location**: `supabase/migrations/20260703_create_keyword_trends_tables.sql`

1. **Log in** to https://app.supabase.com
2. **Select** your MasseurMatch project
3. **Go to**: SQL Editor → New query
4. **Copy** all content from migration file
5. **Paste** into editor
6. **Click**: Run (▶️ button)
7. **Wait**: ~2 seconds
8. **Confirm**: Success message appears

```sql
-- Expected output:
-- CREATE TABLE
-- CREATE TABLE
-- CREATE TABLE
-- CREATE TABLE
-- CREATE INDEX
-- ... (multiple indexes)
-- ALTER TABLE
-- ... (RLS policies)
-- GRANT
```

### Step 1B: Verify Tables Created

```sql
-- Run this in SQL Editor to verify:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'keyword_%';

-- Expected results:
-- keyword_trends
-- keyword_insights
-- keyword_alerts
-- keyword_content_map
```

### Step 1C: Insert Sample Data (For Testing)

**Location**: `docs/SAMPLE_DATA.sql`

1. **Open** SQL Editor
2. **New query**
3. **Copy** all from SAMPLE_DATA.sql
4. **Run** it
5. **Verify**: 40+ records inserted

```sql
-- Check in SQL Editor:
SELECT COUNT(*) as total_records FROM keyword_trends;
-- Expected: 40+

SELECT COUNT(*) as insights FROM keyword_insights;
-- Expected: 6
```

---

## 📡 Phase 2: Data Collection Setup

### Option A: Make.com Automation (Recommended for Always-On)

**Location**: `docs/MAKE_COM_SETUP.md`

**Follow the guide**: Step-by-step Make.com scenario setup

**Timeline**: 10-15 minutes

**Benefits**:
- ✅ No server needed
- ✅ Built-in error handling
- ✅ Email/Slack alerts included
- ✅ ~$10-15/month

**Result**: Daily 2 AM collection automated forever

---

### Option B: Python Script (Recommended for Control)

**Location**: `scripts/collect_google_trends.py`

#### B1: Install Dependencies

```bash
cd /home/user/masseurmatch

pip install pytrends requests python-dotenv

# Or with requirements.txt
pip install -r requirements.txt
```

#### B2: Setup Environment Variables

```bash
# Add to .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Get from: Supabase Dashboard → Settings → API → Service Role Key
```

#### B3: Test Run Manually

```bash
python scripts/collect_google_trends.py

# Expected output:
# 🚀 Starting Google Trends Keyword Collection
# 📊 Keywords to track: 50
# ✅ Fetched trends for: ['gay massage', 'massage near me', ...]
# 💾 Inserting into Supabase...
# ✅ Inserted 50 records into Supabase
# ✅ All data successfully stored!
```

#### B4: Schedule Daily Collection

**Option B1: Windows Task Scheduler** (if running on Windows)

1. **Open**: Task Scheduler
2. **Create Basic Task** → "Google Trends Collector"
3. **Trigger**: Daily at 2:00 AM
4. **Action**: 
   ```
   Program: python.exe
   Arguments: C:\path\to\scripts\collect_google_trends.py
   Start in: C:\path\to\masseurmatch
   ```
5. **Save** and enable

**Option B2: Linux/Mac Cron Job**

```bash
# Edit crontab:
crontab -e

# Add this line (2 AM UTC daily):
0 2 * * * cd /home/user/masseurmatch && python scripts/collect_google_trends.py >> logs/trends.log 2>&1
```

**Option B3: GitHub Actions** (Recommended)

Create `.github/workflows/collect-trends.yml`:

```yaml
name: Collect Google Trends

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install pytrends requests
      - run: python scripts/collect_google_trends.py
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
```

Add secrets to GitHub:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

#### B5: Verify Collection Working

```sql
-- In Supabase SQL Editor:
SELECT DATE(created_at) as date, COUNT(*) as records
FROM keyword_trends
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 10;

-- Should show records from today
```

---

## 📊 Phase 3: Dashboard Verification

### Step 3A: View Market Intelligence Dashboard

1. **Go to**: https://yoursite.com/pro/dashboard/market-intelligence
2. **Login** as therapist with paid subscription
3. **Scroll to**: "Google Trends Monitor" section (near bottom)
4. **Verify**:
   - ✅ Chart displays with sample data
   - ✅ Keywords show on legend
   - ✅ KPI cards show values
   - ✅ Insights list shows entries

### Step 3B: Access Admin Dashboard

1. **Go to**: https://yoursite.com/admin/dashboard/keyword-trends
2. **Login** with admin account
3. **Verify**:
   - ✅ Full dashboard loads
   - ✅ Date range selector works
   - ✅ Chart interactive
   - ✅ Insights display correctly
   - ✅ Setup instructions visible

### Step 3C: Test Interactive Features

```
Dashboard Testing Checklist:
□ Click keywords to toggle on/off
□ Hover on chart to see tooltips
□ Change date range (7d/30d/90d)
□ Click "Refresh" button
□ Verify KPI cards update
□ Check insight cards display correctly
□ Test responsive on mobile
```

---

## ⚙️ Phase 4: Automation & Monitoring

### Step 4A: Enable Scheduled Collection

**If using Make.com**:
1. Go to Make.com → Your scenario
2. **Scheduling** → Enable
3. **Timezone**: UTC
4. **Time**: 02:00 (2 AM)
5. **Frequency**: Daily
6. **Save**

**If using Python/GitHub Actions**:
- Already scheduled in workflow YAML
- Actions will run automatically at 2 AM UTC

### Step 4B: Setup Alerts (Optional but Recommended)

#### Email Alerts

**Make.com**: Add Email module (see MAKE_COM_SETUP.md)

**Python Script**: Modify to send email on peak detection

```python
# Add to collect_google_trends.py:
import smtplib
from email.mime.text import MIMEText

def send_alert(keyword, score):
    """Send email alert for keyword peaks"""
    msg = MIMEText(f"Peak detected: {keyword} at {score}/100")
    msg['Subject'] = f"🔥 Trending: {keyword}"
    msg['From'] = "alerts@masseurmatch.com"
    msg['To'] = "your-email@example.com"
    
    # Send via SMTP
    # ...
```

#### Slack Alerts

**Option 1**: Make.com Slack module (recommended, easiest)

**Option 2**: Python webhook to Slack

```python
import requests

def send_slack_alert(keyword, score):
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    requests.post(webhook, json={
        "text": f"🔥 Keyword Peak: {keyword}",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{keyword}* peaked at *{score}/100*\n_Click to create content_"
                }
            }
        ]
    })
```

### Step 4C: Monitor First Automated Run

**Tomorrow at 2 AM**:

1. **Check** Supabase for new records
   ```sql
   SELECT COUNT(*) FROM keyword_trends WHERE date = TODAY();
   ```

2. **Check** Make.com/GitHub Actions logs
   - Should show "SUCCESS" or "✅ Completed"

3. **Verify** dashboard updated with new data

4. **Check** email/Slack alerts (if enabled)

---

## 🧪 Testing Checklist

```
FUNCTIONALITY:
□ Dashboard loads without errors
□ Chart renders with data
□ Keywords display correctly
□ Date range selector works
□ Insights show with correct priority
□ Mobile view responsive

DATA QUALITY:
□ Sample data visible after insertion
□ Database queries return results
□ No NULL values in required fields
□ Dates formatted correctly (YYYY-MM-DD)

AUTOMATION:
□ Manual collection run successful
□ Data inserted correctly
□ No error logs in console
□ Scheduled jobs enabled
□ First automated run completed

INTEGRATION:
□ Market Intelligence dashboard shows data
□ Admin dashboard fully functional
□ Both dashboards pull same data
□ Updates happen daily at 2 AM
```

---

## 📍 File Locations Reference

| File | Purpose | When to Use |
|------|---------|------------|
| `supabase/migrations/20260703_create_keyword_trends_tables.sql` | Database schema | Phase 1 - Execute once |
| `docs/SAMPLE_DATA.sql` | Test data | Phase 1 - Testing |
| `docs/MAKE_COM_SETUP.md` | Make.com guide | Phase 2 - Option A |
| `scripts/collect_google_trends.py` | Python collector | Phase 2 - Option B |
| `.github/workflows/collect-trends.yml` | GitHub Actions | Phase 2 - Option B3 |
| `src/components/dashboards/KeywordTrendsDashboard.tsx` | React component | Already integrated |
| `src/app/pro/dashboard/market-intelligence/page.tsx` | Market Intel page | Already integrated |
| `src/app/admin/dashboard/keyword-trends/page.tsx` | Admin page | Already integrated |
| `src/app/_lib/keyword-trends-aggregation.ts` | Data processing | Already integrated |

---

## 🆘 Troubleshooting

### ❌ "Migration failed"
```
Cause: Syntax error in SQL
Fix: Copy entire migration file again, check for typos
Verify: Run individual CREATE TABLE statements
```

### ❌ "No data in dashboard"
```
Cause: Sample data not inserted
Fix: Run SAMPLE_DATA.sql again
Check: SELECT COUNT(*) FROM keyword_trends;
Result: Should return 40+
```

### ❌ "Collection script fails"
```
Cause: Missing dependencies or API key
Fix: pip install pytrends requests
Verify: Check SUPABASE_SERVICE_ROLE_KEY in .env.local
Run: python scripts/collect_google_trends.py
```

### ❌ "Make.com scenario doesn't run"
```
Cause: Trigger not enabled or misconfigured
Fix: Check scenario status is "Active"
Verify: Test run works manually (click play button)
Fix: Check schedule timezone is UTC
```

### ❌ "Chart shows no data"
```
Cause: Component can't reach Supabase
Fix: Check Supabase URL and key in .env
Verify: RLS policies allow authenticated reads
Test: Open browser console, check errors
```

---

## 📈 Success Indicators

✅ **Setup is complete when**:

1. **Database**: Tables exist in Supabase
2. **Sample Data**: Dashboard displays test keywords
3. **Collection**: Python script runs successfully
4. **Scheduling**: Automation runs at 2 AM (daily)
5. **Dashboard**: Both admin and market intel show trends
6. **Quality**: Data updates daily with new scores

---

## 🎓 Next Steps (After Setup)

### Week 1: Monitor & Validate
- Check daily data collection
- Monitor alert accuracy
- Review insight quality

### Week 2: Content Creation
- Identify highest-scoring keywords
- Write blog posts for peaks
- Update city pages with trending keywords

### Week 3: Optimization
- Refine keyword list (add/remove)
- Adjust alert thresholds
- Test content impact on rankings

### Month 2+: Scale
- Expand to 200+ keywords
- Add city-specific tracking
- Implement predictive analytics
- Auto-generate blog posts

---

## 💬 Support Resources

- **Make.com Docs**: https://www.make.com/en/help
- **Supabase Docs**: https://supabase.com/docs
- **Google Trends**: https://trends.google.com
- **pytrends**: https://github.com/GeneralMills/pytrends

---

## ✅ Final Checklist

Before declaring "DONE":

- [ ] Supabase migration executed
- [ ] Sample data inserted and visible
- [ ] Dashboard displays data without errors
- [ ] Collection method chosen (Make.com OR Python)
- [ ] Collection tested manually (success)
- [ ] Automation scheduled (daily 2 AM)
- [ ] Admin dashboard accessible
- [ ] Market Intelligence dashboard updated
- [ ] First automated collection completed
- [ ] Alerts working (optional but recommended)
- [ ] Documentation reviewed
- [ ] Team notified of new dashboard

---

## 🎉 Congratulations!

Your Google Trends keyword monitoring system is live and collecting data daily. 

**Next**: Start creating content based on trending keywords to capture organic search traffic!

---

**Questions?** Check the troubleshooting section or review the specific setup guides (MAKE_COM_SETUP.md or Python script).

**Ready to go?** Start with Phase 1!
