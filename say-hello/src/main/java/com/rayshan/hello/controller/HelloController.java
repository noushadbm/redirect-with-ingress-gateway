package com.rayshan.hello.controller;

import com.rayshan.hello.modal.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;

@RestController
@RequestMapping("/hello")
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);
    @GetMapping("/world")
    public ApiResponse<String> helloWorld(HttpServletRequest request) {
        Collections.list(request.getHeaderNames()).forEach(h ->
                log.info("Header: {} = {}", h, request.getHeader(h))
        );

        log.info(">> Hello endpoint was called");

        ApiResponse response = new ApiResponse(200, "Success", "Hello, World!");
        return response;
    }

    @GetMapping("/redirect")
    public ResponseEntity<Void> redirectToExternalUrl(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        // Ensure the URL has a scheme (http:// or https://) for external redirects
        //headers.setLocation(URI.create("/hello/world"));

        Collections.list(request.getHeaderNames()).forEach(h ->
            log.info("Header: {} = {}", h, request.getHeader(h))
        );

        log.info(">> Redirect endpoint was called");

        URI redirectUri = ServletUriComponentsBuilder
                .fromRequest(request)
                .replacePath(request.getContextPath() + "/hello/world")
                .build()
                .toUri();

        log.info("Redirecting to: {}", redirectUri.toString());
        // Return 302 Found or 303 See Other (POST to GET redirect)
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(redirectUri)
                .build();
    }
}
