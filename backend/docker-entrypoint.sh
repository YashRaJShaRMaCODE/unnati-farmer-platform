#!/bin/sh
set -e

python manage.py migrate --noinput

if [ "$RUN_SEED_DEMO_DATA" = "true" ]; then
  python manage.py seed_demo_data || true
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
