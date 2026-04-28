package com.wmsbackend.controller;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import com.wmsbackend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin("*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // 1. Lấy danh sách (hỗ trợ tìm kiếm qua query param ?keyword=...)
    @GetMapping
    public List<CustomerDTO> getCustomers(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return customerService.searchCustomers(keyword);
        }
        return customerService.getAllCustomers();
    }

    // 2. Thêm mới
    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.createCustomer(customer);
    }

    // 3. Cập nhật
    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Integer id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }

    // 4. Xóa
    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
    }
}