docker compose down -v
docker volume rm vesmir_postgres_data
if [ "$1" = "-b" ]; then
    docker compose up --build -d
else
    docker compose up -d
fi
