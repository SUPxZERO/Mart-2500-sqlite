#!/bin/bash
set -e

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache configuration for production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Run migrations and seed data (Force is needed for production environments)
# This will create tables in the Neon PostgreSQL database and populate initial data
php artisan migrate --force --seed

# Execute the main container command (start Apache)
exec apache2-foreground
