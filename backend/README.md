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