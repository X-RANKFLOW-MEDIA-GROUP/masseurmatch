# Make.com Setup: Google Trends Keyword Collector

## 🎯 Overview

This guide walks you through setting up a Make.com automation scenario that:
- ✅ Runs daily at 2 AM UTC
- ✅ Collects 50+ massage therapy keywords from Google Trends
- ✅ Stores data in Supabase
- ✅ Generates alerts for trending keywords
- ✅ Sends notifications

**Cost**: ~$10-15/month  
**Time to setup**: 15-20 minutes

---

## 📋 Prerequisites

1. ✅ Make.com account (free tier works)
2. ✅ Supabase project with tables created
3. ✅ Supabase service role key (from Settings → API)
4. ✅ Google Trends data accessible (no API key needed)

---

## 🏗️ Architecture

```
Make.com Scenario
    ↓
[Scheduler Trigger] → Daily @ 2 AM UTC
    ↓
[HTTP Request Loop] → Batch keywords (5 at a time)
    ↓
[Google Trends Data] → Via pytrends/custom endpoint
    ↓
[Transform Data] → Calculate aggregates
    ↓
[Supabase Insert] → Store keyword_trends records
    ↓
[Generate Insights] → Detect peaks
    ↓
[Conditional Alerts] → Send if peak detected
```

---

## 🚀 Step-by-Step Setup

### STEP 1: Create New Scenario

1. **Log in** to Make.com
2. **Create** → New Scenario
3. **Name**: "Google Trends Keyword Collector"
4. **Choose a trigger** (see below)

---

### STEP 2: Add Scheduler Trigger

**Module**: Scheduler  
**Trigger**: Schedule a trigger

```
Configuration:
├─ Interval: Daily
├─ Day(s): Every day
├─ Time: 02:00 (2 AM UTC)
└─ Timezone: UTC
```

---

### STEP 3: Add HTTP Module (Get Trends Data)

**Module**: HTTP  
**Type**: Make a request

This step will call an endpoint that returns Google Trends data.

**Option A: Use Python Script Endpoint** (Recommended)
```
URL: https://your-domain.com/api/trends/collect
Method: POST
Headers:
  - Authorization: Bearer {YOUR_API_KEY}
  - Content-Type: application/json

Body (JSON):
{
  "keywords": [
    "gay massage",
    "massage near me",
    "LGBTQ massage",
    "massage therapist",
    "professional massage"
  ],
  "timeframe": "today 1-m"
}
```

**Option B: Use Webhook to Trigger Python Script**
```
URL: https://your-server.com/webhook/trends
Method: POST

Body:
{
  "action": "collect_trends",
  "batch_size": 5
}
```

---

### STEP 4: Parse Response Data

**Module**: JSON  
**Action**: Parse JSON

```
Input: [Response body from HTTP module]

Output will create variables like:
- bundle.response.keyword
- bundle.response.score
- bundle.response.date
```

---

### STEP 5: Insert into Supabase

**Module**: HTTP  
**Type**: Make a request

```
URL: {SUPABASE_URL}/rest/v1/keyword_trends

Method: POST

Headers:
- Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
- apikey: {SUPABASE_SERVICE_ROLE_KEY}
- Content-Type: application/json

Body (JSON):
[
  {
    "keyword": "{{1.keyword}}",
    "score": {{1.score}},
    "date": "{{1.date}}",
    "week_avg": {{1.week_avg}},
    "month_avg": {{1.month_avg}},
    "peak_detected": {{1.peak_detected}},
    "data_source": "google_trends"
  }
]
```

**Repeat for each keyword in batch** (using Array/Loop iterator)

---

### STEP 6: Generate Insights (Optional but Recommended)

**Module**: HTTP  
**Type**: Make a request

```
URL: {SUPABASE_URL}/rest/v1/rpc/generate_keyword_insights
Method: POST

Headers:
- Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
- apikey: {SUPABASE_SERVICE_ROLE_KEY}
- Content-Type: application/json

Body:
{
  "date_from": "{{formatDate(now, "YYYY-MM-DD", -7)}}"
}
```

---

### STEP 7: Send Alert Email (If Peak Detected)

**Module**: Email  
**Action**: Send an email

```
Trigger: Only if peak_detected === true

Configuration:
- To: your-email@masseurmatch.com
- Subject: 🔥 Trending Keyword Alert: {{keyword}}
- Body:
  
  Keyword Peak Detected!
  
  Keyword: {{keyword}}
  Score: {{score}}/100
  Date: {{date}}
  
  Action: Create blog post about "{{keyword}}"
  
  Dashboard: https://masseurmatch.com/admin/dashboard/keyword-trends
```

---

### STEP 8: Send Slack Notification (Optional)

**Module**: Slack  
**Action**: Send a message

```
Channel: #keyword-alerts
Message:
🔥 {{keyword}} is trending!
Score: {{score}}/100
Date: {{date}}

Blog post idea: "Best {{keyword}} services near you"
```

---

## 🔧 Configuration Variables

Store these in Make.com's **Data Store** for easy access:

```
KEY                          | VALUE
─────────────────────────────────────────────────────────
SUPABASE_URL                 | https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY    | ey...
GOOGLE_TRENDS_KEYWORDS       | ["gay massage", "massage near me", ...]
ALERT_EMAIL                  | admin@masseurmatch.com
ALERT_THRESHOLD              | 90 (score)
PEAK_GROWTH_THRESHOLD        | 30 (% WoW)
```

---

## 📊 Full Scenario Flow (Text Format)

```
┌─────────────────────────────────────────────────┐
│ TRIGGER: Scheduler (Daily @ 2 AM UTC)           │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 1: Set Variables                         │
│ ├─ keywords = ["gay massage", "massage...", ...] │
│ ├─ batch_size = 5                               │
│ └─ today = formatDate(now, "YYYY-MM-DD")       │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 2: Batch Iterator (Loop through batches) │
│ └─ Repeat every 5 keywords                      │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 3: HTTP Request (Get Trends Data)        │
│ POST /api/trends/collect                        │
│ Body: { keywords: batch, timeframe: "1-m" }    │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 4: Parse JSON Response                   │
│ Extract: keyword, score, date, week_avg, peak   │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 5: Supabase Insert                       │
│ POST /rest/v1/keyword_trends                    │
│ Insert: [keyword, score, date, aggregates]     │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 6: Generate Insights                     │
│ Call Supabase RPC: generate_keyword_insights    │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ MODULE 7: Conditional - Peak Detected?          │
│ IF peak_detected = true THEN:                   │
│   └─ Send Email Alert                           │
│   └─ Send Slack Message                         │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Testing Your Scenario

### Test 1: Manual Trigger
```
1. In Make.com, click "Run once" (play button)
2. Check Supabase: SELECT * FROM keyword_trends WHERE date = TODAY()
3. Should see 5-10 new records
```

### Test 2: Check Logs
```
1. Make.com → Scenario → Execution history
2. Look for:
   ✅ HTTP requests succeeded (200/201 status)
   ✅ Supabase inserts completed
   ✅ No errors in modules
```

### Test 3: Verify Data
```sql
-- In Supabase SQL Editor:
SELECT keyword, score, date, peak_detected 
FROM keyword_trends 
WHERE date = TODAY()
ORDER BY score DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### ❌ "Authorization failed"
- **Cause**: Wrong Supabase API key
- **Fix**: Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- **Check**: Settings → API → Service Role

### ❌ "No data received from HTTP"
- **Cause**: Trends endpoint not working
- **Fix**: Test endpoint manually with cURL:
  ```bash
  curl -X POST https://your-domain.com/api/trends/collect \
    -H "Content-Type: application/json" \
    -d '{"keywords":["massage"]}'
  ```

### ❌ "400 Bad Request on Supabase insert"
- **Cause**: JSON structure mismatch
- **Fix**: Compare with expected schema in `keyword_trends` table
- **Verify**: All required fields present (keyword, score, date)

### ❌ "Runs but inserts no data"
- **Cause**: Loop/Iterator not configured correctly
- **Fix**: Add "Array Iterator" after HTTP response
- **Set**: Input array = `{{response.body}}`

---

## 📈 Monitoring & Maintenance

### Weekly Checks
```
□ Make.com scenario still active (check status)
□ Data collecting daily (check last record date)
□ No persistent errors in logs
□ Insights generating correctly
```

### Monthly Optimization
```
□ Review keyword list (add/remove based on relevance)
□ Check data quality (missing dates = data gaps)
□ Validate alert thresholds (peaks detected correctly?)
□ Update content based on insights
```

---

## 🔗 Integration Links

- **Dashboard**: https://masseurmatch.com/admin/dashboard/keyword-trends
- **Market Intel**: https://masseurmatch.com/pro/dashboard/market-intelligence
- **Supabase**: https://app.supabase.com
- **Make.com**: https://make.com

---

## 💰 Cost Estimate

```
MONTHLY COSTS:
├─ Make.com: $10-15 (50 ops/day × 30 days = 1,500 ops)
├─ Supabase: $0 (free tier includes 100k rows)
├─ Google Trends: $0 (no official API, free via pytrends)
└─ Email/Slack: $0 (included)

TOTAL: ~$10-15/month
ROI: Pays for itself with 1% traffic increase
```

---

## 📝 Scenario Template (JSON Export)

Save this scenario configuration:

```json
{
  "name": "Google Trends Keyword Collector",
  "trigger": "scheduler",
  "schedule": {
    "interval": "daily",
    "time": "02:00",
    "timezone": "UTC"
  },
  "modules": [
    {
      "id": 1,
      "type": "scheduler"
    },
    {
      "id": 2,
      "type": "http",
      "method": "POST",
      "url": "{{TRENDS_API_URL}}"
    },
    {
      "id": 3,
      "type": "json",
      "action": "parse"
    },
    {
      "id": 4,
      "type": "http",
      "method": "POST",
      "url": "{{SUPABASE_URL}}/rest/v1/keyword_trends"
    },
    {
      "id": 5,
      "type": "email",
      "condition": "peak_detected == true"
    }
  ]
}
```

---

## ✅ Success Checklist

- [ ] Make.com account created
- [ ] Scenario created with scheduler
- [ ] HTTP modules configured
- [ ] Supabase API key added
- [ ] Test run completed
- [ ] Data visible in dashboard
- [ ] Scenario scheduled (enabled)
- [ ] First automated run successful
- [ ] Email alerts working (optional)
- [ ] Slack integration working (optional)

---

## 🎓 Next Steps

1. **Setup complete** → Automate scenario
2. **Data flowing** → Monitor keyword trends
3. **Peaks detected** → Create blog posts
4. **Content ranks** → Track SEO improvements
5. **Scale** → Add 200+ keywords, cities, competitors

---

**Questions?** Check Make.com docs: https://www.make.com/en/help

Happy automating! 🚀
