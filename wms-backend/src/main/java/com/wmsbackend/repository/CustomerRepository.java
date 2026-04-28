package com.wmsbackend.repository;

import com.wmsbackend.dto.CustomerDTO;
import com.wmsbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    // Lấy tất cả dưới dạng DTO
    @Query("SELECT new com.wmsbackend.dto.CustomerDTO(c.id, c.customerCode, c.name, c.phone, c.address) FROM Customer c ORDER BY c.id DESC")
    List<CustomerDTO> findAllCustomers();

    // Tìm kiếm theo nhiều tiêu chí (tên, mã, SĐT, địa chỉ)
    @Query("SELECT new com.wmsbackend.dto.CustomerDTO(c.id, c.customerCode, c.name, c.phone, c.address) FROM Customer c " +
            "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY c.id DESC")
    List<CustomerDTO> searchCustomers(@Param("keyword") String keyword);

    boolean existsByCustomerCode(String customerCode);
}