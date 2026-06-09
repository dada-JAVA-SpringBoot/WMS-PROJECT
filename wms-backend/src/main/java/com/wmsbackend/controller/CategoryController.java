package com.wmsbackend.controller;

import com.wmsbackend.entity.ProductCategory;
import com.wmsbackend.repository.ProductCategoryRepository;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class CategoryController {

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @GetMapping
    public List<ProductCategory> getCategories() {
        Integer filterId = WorkspaceContext.getFilterCompanyId();
        return filterId == null
                ? categoryRepository.findAllByOrderByNameAsc()
                : categoryRepository.findByCompanyIdOrderByNameAsc(filterId);
    }

    @PostMapping
    public ResponseEntity<ProductCategory> createCategory(@RequestBody ProductCategory category) {
        if (category.getCategoryCode() == null || category.getCategoryCode().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (category.getName() == null || category.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (category.getCompanyId() == null) {
            category.setCompanyId(companyId);
        } else if (companyId != null && !companyId.equals(category.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }

        Optional<ProductCategory> existing = companyId == null
                ? categoryRepository.findByCategoryCodeIgnoreCase(category.getCategoryCode())
                : categoryRepository.findByCategoryCodeIgnoreCaseAndCompanyId(category.getCategoryCode(), companyId);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategory> updateCategory(@PathVariable Integer id, @RequestBody ProductCategory category) {
        Optional<ProductCategory> existingOpt = categoryRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProductCategory existing = existingOpt.get();
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (!WorkspaceContext.isGlobalAdmin() && companyId != null
                && existing.getCompanyId() != null
                && !companyId.equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        existing.setCategoryCode(category.getCategoryCode());
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setIsActive(category.getIsActive());
        if (category.getCompanyId() != null) {
            existing.setCompanyId(category.getCompanyId());
        }
        return ResponseEntity.ok(categoryRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        ProductCategory existing = categoryRepository.findById(id).orElse(null);
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (existing != null && !WorkspaceContext.isGlobalAdmin() && companyId != null
                && existing.getCompanyId() != null
                && !companyId.equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
