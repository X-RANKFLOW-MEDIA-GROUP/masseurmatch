#!/usr/bin/env python3
"""
MasseurMatch Migration Runner - Standalone Version
Executes all SQL migrations using HTTP API directly
"""

import os
import sys
import glob
import json
from pathlib import Path
import urllib.request
import urllib.error
import time

class MigrationRunner:
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize with Supabase credentials"""
        self.supabase_url = supabase_url.rstrip('/')
        self.supabase_key = supabase_key
        self.migrations_dir = Path(__file__).parent.parent / "supabase" / "migrations"
        self.executed = 0
        self.skipped = 0
        self.errors = 0
        self.failed_migrations = []

    def get_migration_files(self):
        """Get all migration files in correct order"""
        migrations = sorted(glob.glob(str(self.migrations_dir / "*.sql")))
        return migrations

    def read_migration(self, filepath):
        """Read migration SQL file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    def execute_migration(self, filepath):
        """Execute a single migration file using Supabase REST API"""
        filename = Path(filepath).name
        
        try:
            sql_content = self.read_migration(filepath)
            
            if not sql_content.strip():
                print(f"⏭️  Skipping {filename} (empty file)")
                self.skipped += 1
                return True
            
            # Execute via Supabase REST API
            url = f"{self.supabase_url}/rest/v1/rpc/exec_sql"
            headers = {
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json',
                'apikey': self.supabase_key
            }
            
            # Split into individual statements
            statements = [s.strip() for s in sql_content.split(';') if s.strip()]
            
            for stmt in statements:
                if not stmt.strip():
                    continue
                    
                data = json.dumps({'sql': stmt}).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers=headers, method='POST')
                
                try:
                    with urllib.request.urlopen(req, timeout=30) as response:
                        result = response.read().decode('utf-8')
                        if response.status not in [200, 201]:
                            print(f"⚠️  Warning in {filename}: {result}")
                except urllib.error.HTTPError as e:
                    error_msg = e.read().decode('utf-8')
                    # Ignore "already exists" errors
                    if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                        print(f"✓ {filename} (already exists - skipped)")
                        self.skipped += 1
                        return True
                    else:
                        print(f"❌ Error in {filename}: {error_msg}")
                        self.errors += 1
                        self.failed_migrations.append(filename)
                        return False
            
            print(f"✓ {filename}")
            self.executed += 1
            return True
            
        except Exception as e:
            print(f"❌ Failed {filename}: {str(e)}")
            self.errors += 1
            self.failed_migrations.append(filename)
            return False

    def run_all(self):
        """Execute all migrations"""
        migrations = self.get_migration_files()
        
        if not migrations:
            print("❌ No migration files found!")
            return False
        
        print(f"Found {len(migrations)} migrations")
        print("=" * 60)
        
        for filepath in migrations:
            self.execute_migration(filepath)
            time.sleep(0.5)  # Rate limiting
        
        print("=" * 60)
        print(f"\n✓ Executed: {self.executed}")
        print(f"⏭️  Skipped: {self.skipped}")
        print(f"❌ Errors: {self.errors}")
        
        if self.failed_migrations:
            print(f"\nFailed migrations:")
            for m in self.failed_migrations:
                print(f"  - {m}")
        
        return self.errors == 0

def main():
    # Get credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables!")
        print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    
    runner = MigrationRunner(supabase_url, supabase_key)
    success = runner.run_all()
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
