// ===== SupplierServiceImpl.java =====
package com.wmsbackend.service.impl;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;
import com.wmsbackend.repository.SupplierRepository;
import com.wmsbackend.service.SupplierService;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAllSuppliers(WorkspaceContext.getFilterCompanyId());
    }

    @Override
    public List<SupplierDTO> searchSuppliers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllSuppliers();
        }
        return supplierRepository.searchSuppliers(keyword.trim(), WorkspaceContext.getFilterCompanyId());
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        if (supplier.getCompanyId() == null) {
            supplier.setCompanyId(WorkspaceContext.getCurrentCompanyId());
        }
        return supplierRepository.save(supplier);
    }

    @Override
    public Supplier updateSupplier(Integer id, Supplier updated) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với id: " + id));
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null
                && existing.getCompanyId() != null
                && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
            throw new RuntimeException("Không có quyền sửa nhà cung cấp của công ty khác");
        }
        existing.setSupplierCode(updated.getSupplierCode());
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        if (updated.getCompanyId() != null) {
            existing.setCompanyId(updated.getCompanyId());
        }
        return supplierRepository.save(existing);
    }

    @Override
    public void deleteSupplier(Integer id) {
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            Supplier existing = supplierRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với id: " + id));
            if (existing.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
                throw new RuntimeException("Không có quyền xóa nhà cung cấp của công ty khác");
            }
        }
        supplierRepository.deleteById(id);
    }
}
