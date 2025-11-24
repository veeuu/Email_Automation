import subprocess
import sys
from datetime import datetime
from config import settings


def backup_database(output_file: str = None):
    """Backup PostgreSQL database"""
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"backup_{timestamp}.sql"
    
    try:
        # Parse database URL
        db_url = settings.database_url
        # postgresql://user:password@host:port/dbname
        parts = db_url.replace("postgresql://", "").split("@")
        creds = parts[0].split(":")
        host_db = parts[1].split("/")
        
        user = creds[0]
        password = creds[1] if len(creds) > 1 else ""
        host = host_db[0].split(":")[0]
        port = host_db[0].split(":")[1] if ":" in host_db[0] else "5432"
        dbname = host_db[1]
        
        env = {"PGPASSWORD": password}
        cmd = [
            "pg_dump",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", dbname,
            "-f", output_file
        ]
        
        subprocess.run(cmd, env=env, check=True)
        print(f"Database backed up to {output_file}")
        return output_file
    except Exception as e:
        print(f"Backup failed: {str(e)}")
        sys.exit(1)


def restore_database(backup_file: str):
    """Restore PostgreSQL database"""
    try:
        db_url = settings.database_url
        parts = db_url.replace("postgresql://", "").split("@")
        creds = parts[0].split(":")
        host_db = parts[1].split("/")
        
        user = creds[0]
        password = creds[1] if len(creds) > 1 else ""
        host = host_db[0].split(":")[0]
        port = host_db[0].split(":")[1] if ":" in host_db[0] else "5432"
        dbname = host_db[1]
        
        env = {"PGPASSWORD": password}
        cmd = [
            "psql",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", dbname,
            "-f", backup_file
        ]
        
        subprocess.run(cmd, env=env, check=True)
        print(f"Database restored from {backup_file}")
    except Exception as e:
        print(f"Restore failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python db_backup.py [backup|restore] [file]")
        sys.exit(1)
    
    action = sys.argv[1]
    file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if action == "backup":
        backup_database(file)
    elif action == "restore":
        if not file:
            print("Restore requires a file argument")
            sys.exit(1)
        restore_database(file)
    else:
        print("Unknown action")
        sys.exit(1)
