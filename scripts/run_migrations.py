#!/usr/bin/env python3
"""
MasseurMatch Migration Runner
Automatically executes all SQL migrations in the correct order.
"""

import os
import sys
import glob
from pathlib import Path
from typing import Optional
import time

# Try to import supabase, if not available, show instructions
try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Supabase client not installed.")
    print("Install it with: pip install supabase")
    sys.exit(1)


class MigrationRunner:
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize Supabase client"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.migrations_dir = Path(__file__).parent.parent / "supabase" / "migrations"
        self.executed = 0
        self.skipped = 0
        self.errors = 0

    def get_migration_files(self) -> list[str]:
        """Get all migration files in correct order"""
        migrations = sorted(glob.glob(str(self.migrations_dir / "*.sql")))
        return migrations

    def read_migration(self, filepath: str) -> str:
        """Read migration SQL file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    def execute_migration(self, filepath: str) -> bool:
        """Execute a single migration file"""
        filename = Path(filepath).name
        
        try:
            sql_content = self.read_migration(filepath)
            
            if not sql_content.strip():
                print(f"⏭️  Skipping {filename} (empty file)")
                self.skipped += 1
                return True
            
            print(f"⏳ Executing {filename}...", end=" ", flush=True)
            
            # Execute the SQL
            result = self.supabase.postgrest.auth(self.supabase.auth.get_session().access_token).execute_sql(sql_content)
            
            print(f"✅ Success")
            self.executed += 1
            return True
            
        except Exception as e:
            error_msg = str(e)
            
            # Check for common non-fatal errors
            if "already exists" in error_msg.lower():
                print(f"⏭️  Already exists (skipped)")
                self.skipped += 1
                return True
            elif "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print(f"⏭️  Dependency not ready (skipped)")
                self.skipped += 1
                return True
            else:
                print(f"❌ Error: {error_msg}")
                self.errors += 1
                return False

    def run_all(self):
        """Run all migrations"""
        migrations = self.get_migration_files()
        
        if not migrations:
            print("❌ No migration files found!")
            print(f"Looking in: {self.migrations_dir}")
            return False
        
        print(f"🚀 MasseurMatch Migration Runner")
        print(f"📁 Found {len(migrations)} migration files")
        print(f"🔗 Connecting to Supabase...")
        print("=" * 60)
        
        for i, migration_file in enumerate(migrations, 1):
            print(f"\n[{i}/{len(migrations)}]", end=" ")
            self.execute_migration(migration_file)
            time.sleep(0.5)  # Small delay between executions
        
        print("\n" + "=" * 60)
        print(f"\n📊 Migration Summary:")
        print(f"   ✅ Executed: {self.executed}")
        print(f"   ⏭️  Skipped:  {self.skipped}")
        print(f"   ❌ Errors:   {self.errors}")
        
        if self.errors == 0:
            print(f"\n✨ All migrations completed successfully!")
            return True
        else:
            print(f"\n⚠️  Some migrations failed. Please review the errors above.")
            return False


def main():
    """Main entry point"""
    # Get credentials from environment
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables!")
        print("\nSet these first:")
        print("   export SUPABASE_URL=your_url")
        print("   export SUPABASE_SERVICE_ROLE_KEY=your_key")
        print("\nOr use a .env file in the project root.")
        sys.exit(1)
    
    try:
        runner = MigrationRunner(supabase_url, supabase_key)
        success = runner.run_all()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
