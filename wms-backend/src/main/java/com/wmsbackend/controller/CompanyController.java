package com.wmsbackend.controller;

import com.wmsbackend.entity.Company;
import com.wmsbackend.repository.CompanyRepository;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin("*")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Company> getCompanies() {
        return companyRepository.findAllByActiveTrueOrderByCompanyNameAsc();
    }

    @GetMapping("/manage")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Company> getCompaniesForManagement() {
        return companyRepository.findAllByOrderByActiveDescCompanyNameAsc();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Company> getCompanyById(@PathVariable Integer id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentCompany() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (companyId == null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("companyId", null);
            payload.put("company", null);
            return ResponseEntity.ok(payload);
        }
        return companyRepository.findById(companyId)
                .map(company -> {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("companyId", companyId);
                    payload.put("company", company);
                    return ResponseEntity.ok(payload);
                })
                .orElseGet(() -> {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("companyId", companyId);
                    payload.put("company", null);
                    return ResponseEntity.ok(payload);
                });
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        String validationError = validateCompanyPayload(company, null);
        if (validationError != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("message", validationError);
            return ResponseEntity.badRequest().body(payload);
        }
        company.setCompanyCode(company.getCompanyCode().trim());
        company.setCompanyName(company.getCompanyName().trim());
        company.setTaxCode(normalizeText(company.getTaxCode()));
        company.setAddress(normalizeText(company.getAddress()));
        if (company.getActive() == null) {
            company.setActive(true);
        }
        return ResponseEntity.ok(companyRepository.save(company));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCompany(@PathVariable Integer id, @RequestBody Company company) {
        Optional<Company> existingOpt = companyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String validationError = validateCompanyPayload(company, id);
        if (validationError != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("message", validationError);
            return ResponseEntity.badRequest().body(payload);
        }

        Company existing = existingOpt.get();
        existing.setCompanyCode(company.getCompanyCode().trim());
        existing.setCompanyName(company.getCompanyName().trim());
        existing.setTaxCode(normalizeText(company.getTaxCode()));
        existing.setAddress(normalizeText(company.getAddress()));
        existing.setParentCompanyId(company.getParentCompanyId());
        existing.setActive(company.getActive() != null ? company.getActive() : existing.getActive());

        return ResponseEntity.ok(companyRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCompany(@PathVariable Integer id) {
        Optional<Company> existingOpt = companyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Company existing = existingOpt.get();
        existing.setActive(false);
        return ResponseEntity.ok(companyRepository.save(existing));
    }

    private String validateCompanyPayload(Company company, Integer currentId) {
        if (company == null) {
            return "Dữ liệu công ty không hợp lệ.";
        }

        String companyCode = normalizeRequiredText(company.getCompanyCode());
        String companyName = normalizeRequiredText(company.getCompanyName());
        if (companyCode == null) {
            return "Vui lòng nhập mã công ty.";
        }
        if (companyName == null) {
            return "Vui lòng nhập tên công ty.";
        }

        Optional<Company> existingByCode = companyRepository.findByCompanyCodeIgnoreCase(companyCode);
        if (existingByCode.isPresent() && (currentId == null || !existingByCode.get().getId().equals(currentId))) {
            return "Mã công ty đã tồn tại.";
        }

        Integer parentCompanyId = company.getParentCompanyId();
        if (parentCompanyId != null) {
            if (currentId != null && parentCompanyId.equals(currentId)) {
                return "Công ty không thể làm công ty cha của chính mình.";
            }

            Optional<Company> parentOpt = companyRepository.findById(parentCompanyId);
            if (parentOpt.isEmpty()) {
                return "Công ty cha không tồn tại.";
            }

            if (currentId != null && isDescendant(parentCompanyId, currentId)) {
                return "Không thể gán công ty cha nằm trong nhánh con hiện tại.";
            }
        }

        return null;
    }

    private boolean isDescendant(Integer candidateParentId, Integer targetId) {
        Integer cursorId = candidateParentId;
        int safety = 0;
        while (cursorId != null && safety++ < 50) {
            if (cursorId.equals(targetId)) {
                return true;
            }
            Optional<Company> cursor = companyRepository.findById(cursorId);
            if (cursor.isEmpty()) {
                return false;
            }
            cursorId = cursor.get().getParentCompanyId();
        }
        return false;
    }

    private String normalizeRequiredText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
