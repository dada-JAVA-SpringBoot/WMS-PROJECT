// ================================================================
// 7. CustomerController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import com.wmsbackend.service.CustomerService;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // GET — Các vai trò vận hành đều cần xem danh sách khách hàng
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF','QUALITY_CONTROL')")
    public ResponseEntity<List<CustomerDTO>> getCustomers(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(customerService.searchCustomers(keyword));
        }
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    // POST — ADMIN & MANAGER
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Customer createCustomer(@RequestBody Customer customer) {
        if (customer.getCompanyId() == null) {
            customer.setCompanyId(WorkspaceContext.getCurrentCompanyId());
        }
        return customerService.createCustomer(customer);
    }

    // PUT — ADMIN & MANAGER
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
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
