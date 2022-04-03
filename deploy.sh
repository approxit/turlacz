#!/usr/bin/env bash

docker context use default

docker-compose build
docker-compose push

docker context use turlacz

docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml turlacz

docker context use default