package com.rayshan.backend.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Data
public class AppConfig {
    @Value("${app.config.sso.redirect-url}")
    private String redirectUri;

    @Value("${app.config.sso.server.logout-endpoint}")
    private String oidcLogoutEndpoint; // http://auth-server/oauth2/logout or /connect/endsession

    @Value("${app.config.sso.server.client-id}")
    private String clientId;

    @Value("${app.config.sso.server.client-secret}")
    private String clientSecret;
}
