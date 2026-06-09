package com.wmsbackend.controller;

import com.wmsbackend.dto.MobileScannerRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scanner")
public class MobileScannerController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<?> receiveScannedData(@RequestBody MobileScannerRequest request) {
        if (request.getSessionId() == null || request.getScannedData() == null) {
            return ResponseEntity.badRequest().body("SessionId and ScannedData are required");
        }

        // Broadcast data to the specific session topic
        String destination = "/topic/scanner/" + request.getSessionId();
        messagingTemplate.convertAndSend(destination, request);

        return ResponseEntity.ok().body("Data sent successfully");
    }
}
