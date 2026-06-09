package com.wmsbackend.controller;

import com.wmsbackend.entity.ProductUnit;
import com.wmsbackend.repository.ProductUnitRepository;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/units")
@CrossOrigin("*")
public class UnitController {

    @Autowired
    private ProductUnitRepository unitRepository;

    @GetMapping
    public List<ProductUnit> getUnits() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        return companyId == null
                ? unitRepository.findAllByOrderByNameAsc()
                : unitRepository.findByCompanyIdOrderByNameAsc(companyId);
    }

    @PostMapping
    public ResponseEntity<ProductUnit> createUnit(@RequestBody ProductUnit unit) {
        if (unit.getUnitCode() == null || unit.getUnitCode().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (unit.getName() == null || unit.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (unit.getCompanyId() == null) {
            unit.setCompanyId(companyId);
        } else if (companyId != null && !companyId.equals(unit.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }

        Optional<ProductUnit> existing = companyId == null
                ? unitRepository.findByUnitCodeIgnoreCase(unit.getUnitCode())
                : unitRepository.findByUnitCodeIgnoreCaseAndCompanyId(unit.getUnitCode(), companyId);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        if (unit.getIsActive() == null) {
            unit.setIsActive(true);
        }

        return ResponseEntity.ok(unitRepository.save(unit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductUnit> updateUnit(@PathVariable Integer id, @RequestBody ProductUnit unit) {
        Optional<ProductUnit> existingOpt = unitRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProductUnit existing = existingOpt.get();
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (!WorkspaceContext.isGlobalAdmin() && companyId != null
                && existing.getCompanyId() != null
                && !companyId.equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        existing.setUnitCode(unit.getUnitCode());
        existing.setName(unit.getName());
        existing.setDescription(unit.getDescription());
        existing.setIsActive(unit.getIsActive());
        if (unit.getCompanyId() != null) {
            existing.setCompanyId(unit.getCompanyId());
        }
        return ResponseEntity.ok(unitRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Integer id) {
        ProductUnit existing = unitRepository.findById(id).orElse(null);
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (existing != null && !WorkspaceContext.isGlobalAdmin() && companyId != null
                && existing.getCompanyId() != null
                && !companyId.equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        unitRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
