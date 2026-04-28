// ===== SupplierServiceImpl.java =====
package com.wmsbackend.service.impl;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;
import com.wmsbackend.repository.SupplierRepository;
import com.wmsbackend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAllSuppliers();
    }

    @Override
    public List<SupplierDTO> searchSuppliers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return supplierRepository.findAllSuppliers();
        }
        return supplierRepository.searchSuppliers(keyword.trim());
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Override
    public Supplier updateSupplier(Integer id, Supplier updated) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với id: " + id));
        existing.setSupplierCode(updated.getSupplierCode());
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        return supplierRepository.save(existing);
    }

    @Override
    public void deleteSupplier(Integer id) {
        supplierRepository.deleteById(id);
    }
}