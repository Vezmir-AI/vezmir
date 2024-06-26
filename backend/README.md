## setup DB
```
docker run -d \
  --name vesmir_db \
  -e POSTGRES_DB=vesmir \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=***REMOVED*** \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres
  ```

## setup the app

1. create any environement (conda, pyenv, etc.)
2. `pip install -r requirements.txt`
3. `python manage.py makemigrations`
4. `python manage.py migrate`
5. `python manage.py runserver 0.0.0.0:8000`
