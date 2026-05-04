package com.wmsbackend.controller;

import com.wmsbackend.entity.ProductCategory;
import com.wmsbackend.repository.ProductCategoryRepository;
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
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @PostMapping
    public ResponseEntity<ProductCategory> createCategory(@RequestBody ProductCategory category) {
        if (category.getCategoryCode() == null || category.getCategoryCode().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (category.getName() == null || category.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<ProductCategory> existing = categoryRepository.findByCategoryCodeIgnoreCase(category.getCategoryCode());
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
        existing.setCategoryCode(category.getCategoryCode());
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setIsActive(category.getIsActive());
        return ResponseEntity.ok(categoryRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Integer id) {
        categoryRepository.deleteById(id);
    }
}
