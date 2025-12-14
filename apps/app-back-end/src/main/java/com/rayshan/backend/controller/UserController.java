package com.rayshan.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rayshan.backend.modal.ApiResponse;
import com.rayshan.backend.service.AuthClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private AuthClientService clientService;

    @GetMapping("/userinfo")
    public ApiResponse<String> getUserInfo(@RequestHeader("Authorization") String authorizationHeader) {
        log.info(">> getUserInfo endpoint was called with Authorization header: {}", authorizationHeader);
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7); // Remove "Bearer "
        }
        JsonNode result = clientService.getUserInfo(token);
        ApiResponse response = new ApiResponse(200, "Success", result);
        return response;
    }
}
