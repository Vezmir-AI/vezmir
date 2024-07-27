#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z $SQL_HOST $SQL_PORT; do
  sleep 0.5
done

echo "PostgreSQL started"

# Uncomment below to flush db e.g. after running tests
# Just make sure you really mean it 
# python manage.py flush --no-input

# We have base custom user model so need to makemigrations out of box
python manage.py makemigrations

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py loaddata ./fixtures/sample.json

exec "$@"