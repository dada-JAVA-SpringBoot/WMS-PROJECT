// ===== CustomerServiceImpl.java =====
package com.wmsbackend.service.impl;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import com.wmsbackend.repository.CustomerRepository;
import com.wmsbackend.service.CustomerService;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAllCustomers(WorkspaceContext.getFilterCompanyId());
    }

    @Override
    public List<CustomerDTO> searchCustomers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(keyword.trim(), WorkspaceContext.getFilterCompanyId());
    }

    @Override
    public Customer createCustomer(Customer customer) {
        if (customer.getCompanyId() == null) {
            customer.setCompanyId(WorkspaceContext.getCurrentCompanyId());
        }
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Integer id, Customer updated) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với id: " + id));
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null
                && existing.getCompanyId() != null
                && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
            throw new RuntimeException("Không có quyền sửa khách hàng của công ty khác");
        }
        existing.setCustomerCode(updated.getCustomerCode());
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        if (updated.getCompanyId() != null) {
            existing.setCompanyId(updated.getCompanyId());
        }
        return customerRepository.save(existing);
    }

    @Override
    public void deleteCustomer(Integer id) {
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            Customer existing = customerRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với id: " + id));
            if (existing.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
                throw new RuntimeException("Không có quyền xóa khách hàng của công ty khác");
            }
        }
        customerRepository.deleteById(id);
    }
}
