package com.rayshan.backend.controller;

import com.rayshan.backend.service.AuthClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class LogoutController {
    @Autowired
    private AuthClientService clientService;

    /**
     * Logout endpoint - Called by frontend
     * Performs RP-Initiated Logout with OIDC server
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, String> logoutRequest) {

        try {
            String idToken = logoutRequest.get("id_token");
            String postLogoutRedirectUri = logoutRequest.get("post_logout_redirect_uri");

            if (idToken == null || idToken.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "id_token is required"));
            }

            // Option 1: Redirect URL approach (return URL to frontend)
            String logoutUrl = clientService.buildLogoutUrl(idToken, postLogoutRedirectUri);
            return ResponseEntity.ok(Map.of(
                    "logout_url", logoutUrl,
                    "message", "Logout initiated"
            ));

            // Option 2: Server-side revocation (uncomment if preferred)
            // revokeTokensServerSide(idToken, authorization);
            // return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Logout failed: " + e.getMessage()));
        }
    }
}
