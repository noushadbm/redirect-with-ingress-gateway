docker build -t gateway-service .
docker tag gateway-service noushadbm/gateway-service:latest
docker push noushadbm/gateway-service:latest