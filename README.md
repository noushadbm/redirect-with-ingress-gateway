### Flow
[UI] -----> Ingress ----> gateway-service -----> hello-service

### Steps
1) Start hello service (inside folder hello-world)
   ```
       kubectl apply -f deployment.yaml
       kubectl apply -f service.yaml
   ```
2) Start gateway service (inside folder gateway-service)
   ```
       kubectl apply -f deployment.yaml
       kubectl apply -f service.yaml
   ``` 
4) Start ingress (inside folder ingress)
   ```
       kubectl apply -f gateway-forward-prefix.yaml
       kubectl apply -f gateway-rewrite-middleware.yaml
       kubectl apply -f backend-ingress.yaml
   ```
### Debugging
   ```
      kubectl get service -n dev
      kubectl get ingress -n dev
      kubectl logs -f deployment/hello-world -n dev
      kubectl logs -f deployment/gateway-service -n dev
   ```

### Authentication Flow
[UI - app-frond-end] ---(/autherize)---> Ingress ----> gateway-service -----> Auth-Server
[UI - auth-server  ] <-----------------------(302 - login page)-------------- Auth-Server
[UI - auth-server  ] ------(/login)----> Ingress ----> gateway-service -----> Auth-Server
[UI - app-frond-end] <------------------(302 - app-frond-end)---------------- Auth-Server
[UI - app-frond-end] -------------------------------------------------------> app-back-end



