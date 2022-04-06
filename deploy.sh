#!/usr/bin/env bash

docker context use default

docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml push

docker context use turlacz

docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml --with-registry-auth turlacz

docker context use default