#!/bin/bash

# Load environment variables from .env file
set -a
source ../.env
set +a

# Create backup directory if it doesn't exist
BACKUP_DIR="../backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/campus_mind_backup_$TIMESTAMP.sql"

# Extract database URL components using pattern matching
if [[ $DATABASE_URL =~ ^postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$ ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"

    # Create backup
    echo "Creating backup of database..."
    PGPASSWORD="$DB_PASS" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F p \
        -f "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo "Backup created successfully: $BACKUP_FILE"
        # Create a compressed version
        gzip "$BACKUP_FILE"
        echo "Backup compressed: ${BACKUP_FILE}.gz"
    else
        echo "Error creating backup"
        exit 1
    fi
else
    echo "Error: Could not parse DATABASE_URL"
    exit 1
fi 