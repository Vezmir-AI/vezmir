#!/bin/bash

remove_volume=false
build_images=false
prune=false

# Parse flags
while getopts "rbp" opt; do
  case $opt in
    r) remove_volume=true ;;
    b) build_images=true ;;
    p) prune=true ;;
    *) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
  esac
done

# Remove containers and networks, but not volumes by default
docker compose down

# Confirm and remove the vezmir_postgres_data volume if -r flag is present
if $remove_volume; then
    read -p "Are you sure you want to remove the vezmir_postgres_data volume? (y/N) " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        docker volume rm vezmir_postgres_data
        echo "Volume vezmir_postgres_data removed."
    else
        echo "Volume removal cancelled."
    fi
fi

if $prune; then
    read -p "Are you sure you want to prune all unused Docker resources? This will remove unused images, containers, networks, and cache. (Y/n) " confirm
    if [[ ! $confirm =~ ^[Nn]$ ]]; then
        docker system prune -a
        echo "Docker system pruned."
    else
        echo "Pruning cancelled."
    fi
fi

# Build and start or just start the containers
if $build_images; then
    docker compose up --build -d
else
    docker compose up -d
fi
