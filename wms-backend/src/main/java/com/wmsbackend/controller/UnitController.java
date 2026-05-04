package com.wmsbackend.controller;

import com.wmsbackend.entity.ProductUnit;
import com.wmsbackend.repository.ProductUnitRepository;
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
        return unitRepository.findAllByOrderByNameAsc();
    }

    @PostMapping
    public ResponseEntity<ProductUnit> createUnit(@RequestBody ProductUnit unit) {
        if (unit.getUnitCode() == null || unit.getUnitCode().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (unit.getName() == null || unit.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<ProductUnit> existing = unitRepository.findByUnitCodeIgnoreCase(unit.getUnitCode());
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
        existing.setUnitCode(unit.getUnitCode());
        existing.setName(unit.getName());
        existing.setDescription(unit.getDescription());
        existing.setIsActive(unit.getIsActive());
        return ResponseEntity.ok(unitRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public void deleteUnit(@PathVariable Integer id) {
        unitRepository.deleteById(id);
    }
}
