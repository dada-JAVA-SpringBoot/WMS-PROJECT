// ===== SupplierService.java (interface) =====
package com.wmsbackend.service;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;

import java.util.List;

public interface SupplierService {
    List<SupplierDTO> getAllSuppliers();
    List<SupplierDTO> searchSuppliers(String keyword);
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(Integer id, Supplier supplier);
    void deleteSupplier(Integer id);
}