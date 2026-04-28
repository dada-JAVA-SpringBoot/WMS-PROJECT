package com.wmsbackend.controller;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin("*")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @GetMapping
    public List<StaffDTO> getStaff(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return staffService.searchStaff(keyword);
        return staffService.getAllStaff();
    }

    @PostMapping
    public Staff createStaff(@RequestBody Staff staff) {
        return staffService.createStaff(staff);
    }

    @PutMapping("/{id}")
    public Staff updateStaff(@PathVariable Integer id, @RequestBody Staff staff) {
        return staffService.updateStaff(id, staff);
    }

    @DeleteMapping("/{id}")
    public void deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
    }
}