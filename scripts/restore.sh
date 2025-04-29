#!/bin/bash

# Load environment variables from .env file
set -a
source ../.env
set +a

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    echo "Example: ./restore.sh ../backups/campus_mind_backup_20240220_123456.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Extract database URL components using pattern matching
if [[ $DATABASE_URL =~ ^postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$ ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"

    # If file is gzipped, uncompress it first
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        echo "Uncompressing backup file..."
        gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASS" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME"
    else
        # Restore from the backup
        echo "Restoring from backup..."
        PGPASSWORD="$DB_PASS" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -f "$BACKUP_FILE"
    fi

    if [ $? -eq 0 ]; then
        echo "Restore completed successfully"
    else
        echo "Error restoring backup"
        exit 1
    fi
else
    echo "Error: Could not parse DATABASE_URL"
    exit 1
fi 