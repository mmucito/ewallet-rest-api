#!/bin/bash
docker build -t mmucito/ewallet-rest-api .
docker push mmucito/ewallet-rest-api

ssh deploy@$DEPLOY_SERVER << EOF
docker pull mmucito/ewallet-rest-api
docker stop api-ewallet || true
docker rm api-ewallet || true
docker rmi mmucito/ewallet-rest-api:current || true
docker tag mmucito/ewallet-rest-api:latest mmucito/ewallet-rest-api:current
docker run -d --restart always --name api-ewallet -p 3000:3000 mmucito/ewallet-rest-api:current
EOF
