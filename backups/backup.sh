#!/bin/sh
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="deyaanat"
DB_USER="deyaanat"
DB_PASSWORD="deyaanat_password"
DB_HOST="postgres"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete

echo "Backup completed: ${DB_NAME}_${TIMESTAMP}.dump"
