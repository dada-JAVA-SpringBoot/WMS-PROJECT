package com.wmsbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Tuyệt vời! Backend của WMS đã kết nối và hoạt động trơn tru!";
    }
}