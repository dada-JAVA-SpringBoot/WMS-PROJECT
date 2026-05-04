// ================================================================
// 7. CustomerController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import com.wmsbackend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // GET — OUTBOUND_STAFF cần tra cứu khách hàng để tạo phiếu xuất
    //       MANAGER xem để báo cáo
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF')")
    public List<CustomerDTO> getCustomers(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return customerService.searchCustomers(keyword);
        return customerService.getAllCustomers();
    }

    // POST — chỉ ADMIN
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.createCustomer(customer);
    }

    // PUT — chỉ ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Customer updateCustomer(@PathVariable Integer id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }

    // DELETE — chỉ ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
    }
}