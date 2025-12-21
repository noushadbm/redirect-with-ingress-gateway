docker build -t sso-ui-app .
docker tag sso-ui-app noushadbm/sso-ui-app:latest
docker push noushadbm/sso-ui-app:latest