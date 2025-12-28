package com.rayshan.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.rayshan.backend.config.AppConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthClientService {
    private static final Logger log = LoggerFactory.getLogger(AuthClientService.class);
    private final RestClient restClient;

    @Autowired
    private AppConfig appConfig;

    public AuthClientService(RestClient restClient) {
        this.restClient = restClient;
    }

    public JsonNode getToken(String code, String state) {
        // Prepare form data
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("code", code);
        formData.add("state", state);
        formData.add("redirect_uri", appConfig.getRedirectUri());

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

    /**
     * Build OIDC RP-Initiated Logout URL
     * Frontend will redirect user to this URL
     */
    public String buildLogoutUrl(String idToken, String postLogoutRedirectUri) {
        return UriComponentsBuilder
                .fromHttpUrl(appConfig.getOidcLogoutEndpoint())
                .queryParam("id_token_hint", idToken)
                .queryParam("client_id", appConfig.getClientId())
                .queryParam("post_logout_redirect_uri", postLogoutRedirectUri)
                .queryParam("state", generateState())
                .toUriString();
    }

    /**
     * Alternative: Server-side token revocation
     * Call this if you want to revoke tokens without user interaction
     */
    private void revokeTokensServerSide(String idToken, String authorization) {
        try {
            // Extract access token from Authorization header
            String accessToken = authorization.replace("Bearer ", "");

            // Revoke access token
            revokeToken(accessToken, "access_token");

            // Optionally revoke refresh token if you have it
            // revokeToken(refreshToken, "refresh_token");

            // Call OIDC logout endpoint programmatically
            callOidcLogoutEndpoint(idToken);

        } catch (Exception e) {
            throw new RuntimeException("Token revocation failed", e);
        }
    }

    /**
     * Revoke a specific token
     */
    private void revokeToken(String token, String tokenTypeHint) {
        String revokeEndpoint = appConfig.getOidcLogoutEndpoint().replace("/logout", "/revoke");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(appConfig.getClientId(), appConfig.getClientSecret());

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("token", token);
        body.add("token_type_hint", tokenTypeHint);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        restClient.post()
                .uri(revokeEndpoint)
                .header("Authorization", "Basic " + encodeBasicAuth(appConfig.getClientId(), appConfig.getClientSecret()))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(String.class);
        //restTemplate.postForEntity(revokeEndpoint, request, String.class);
    }

    /**
     * Call OIDC logout endpoint programmatically
     */
    private void callOidcLogoutEndpoint(String idToken) {
        String logoutUrl = UriComponentsBuilder
                .fromHttpUrl(appConfig.getOidcLogoutEndpoint())
                .queryParam("id_token_hint", idToken)
                .queryParam("client_id", appConfig.getClientId())
                .toUriString();

        // Make GET request to logout endpoint
        //restTemplate.getForEntity(logoutUrl, String.class);
        restClient.get()
                .uri(logoutUrl)
                .retrieve()
                .body(String.class);
    }

    /**
     * Generate random state parameter
     */
    private String generateState() {
        return java.util.UUID.randomUUID().toString();
    }
}
