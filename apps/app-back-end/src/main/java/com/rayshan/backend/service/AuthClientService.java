package com.rayshan.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

@Service
public class AuthClientService {
    private static final Logger log = LoggerFactory.getLogger(AuthClientService.class);
    private final RestClient restClient;

    @Value("${app.config.sso.redirect-url}")
    private String redirectUri;

    public AuthClientService(RestClient restClient) {
        this.restClient = restClient;
    }

    public JsonNode getToken(String code, String state) {
        // Prepare form data
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("code", code);
        formData.add("state", state);
        formData.add("redirect_uri", redirectUri);

        return restClient.post()
                .uri("/oauth2/token")
                .header("Authorization", "Basic " + encodeBasicAuth("oidc-client", "secret"))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getUserInfo(String accessToken) {
        log.info(">> Fetching user info with access token: {}", accessToken);
        return restClient.get()
                .uri("/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(JsonNode.class);
    }

    private String encodeBasicAuth(String username, String password) {
        String auth = username + ":" + password;
        return java.util.Base64.getEncoder().encodeToString(auth.getBytes());
    }
}
