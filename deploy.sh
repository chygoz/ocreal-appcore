#!/bin/bash

git pull origin main --no-ff

docker-compose up -d --build 

exit