package com.rayshan.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rayshan.backend.modal.ApiResponse;
import com.rayshan.backend.service.AuthClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/token")
public class TokenController {
    private static final Logger log = LoggerFactory.getLogger(TokenController.class);

    @Autowired
    private AuthClientService clientService;
    @PostMapping(value = "/exchange", consumes = "application/x-www-form-urlencoded")
    public ApiResponse<JsonNode> getToken(@RequestBody MultiValueMap<String, String> formData) {
        log.info(">> Token exchange endpoint was called");

        String code = formData.getFirst("code");
        String state = formData.getFirst("state");

        log.info("Received code: {}, state: {}", code, state);
        JsonNode remoteResponse = clientService.getToken(code, state);
        log.info("Received token response from auth server: {}", remoteResponse.toString());
        ApiResponse<JsonNode> response = new ApiResponse(200, "Success", remoteResponse);
        return response;
    }
}
