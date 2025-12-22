docker build -t oidc-client-api:latest .
docker tag oidc-client-api:latest noushadbm/oidc-client-api:latest
docker push noushadbm/oidc-client-api:latest