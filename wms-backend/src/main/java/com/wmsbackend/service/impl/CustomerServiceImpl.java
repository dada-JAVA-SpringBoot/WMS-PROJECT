// ===== CustomerServiceImpl.java =====
package com.wmsbackend.service.impl;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import com.wmsbackend.repository.CustomerRepository;
import com.wmsbackend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAllCustomers();
    }

    @Override
    public List<CustomerDTO> searchCustomers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return customerRepository.findAllCustomers();
        }
        return customerRepository.searchCustomers(keyword.trim());
    }

    @Override
    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Integer id, Customer updated) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với id: " + id));
        existing.setCustomerCode(updated.getCustomerCode());
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        return customerRepository.save(existing);
    }

    @Override
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id);
    }
}