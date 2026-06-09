// ===== CustomerService.java =====
package com.wmsbackend.service;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;

import java.util.List;

public interface CustomerService {
    List<CustomerDTO> getAllCustomers();
    List<CustomerDTO> searchCustomers(String keyword);
    Customer createCustomer(Customer customer);
    Customer updateCustomer(Integer id, Customer customer);
    void deleteCustomer(Integer id);
}
 