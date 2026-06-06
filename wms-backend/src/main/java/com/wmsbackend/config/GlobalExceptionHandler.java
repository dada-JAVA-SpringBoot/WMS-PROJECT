package com.wmsbackend.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Bạn không có quyền thực hiện hành động này (Access Denied)");
        errorResponse.put("status", "error");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Log lỗi ra console để debug trên VPS
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Lỗi hệ thống (RuntimeException): " + ex.getMessage());
        errorResponse.put("status", "error");
        // Chuyển về 500 thay vì 400 để phân biệt với lỗi Client
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        ex.printStackTrace(); // Log lỗi ra console để debug trên VPS
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Lỗi hệ thống không xác định: " + ex.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
