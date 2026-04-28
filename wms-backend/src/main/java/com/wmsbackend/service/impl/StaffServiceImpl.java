package com.wmsbackend.service.impl;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAllStaff();
    }

    @Override
    public List<StaffDTO> searchStaff(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return staffRepository.findAllStaff();
        return staffRepository.searchStaff(keyword.trim());
    }

    @Override
    public Staff createStaff(Staff staff) {
        return staffRepository.save(staff);
    }

    @Override
    public Staff updateStaff(Integer id, Staff updated) {
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + id));
        existing.setEmployeeCode(updated.getEmployeeCode());
        existing.setFullName(updated.getFullName());
        existing.setGender(updated.getGender());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setHireDate(updated.getHireDate());
        existing.setContractType(updated.getContractType());
        existing.setWarehouseRole(updated.getWarehouseRole());
        existing.setWorkStatus(updated.getWorkStatus());
        existing.setNotes(updated.getNotes());
        return staffRepository.save(existing);
    }

    @Override
    public void deleteStaff(Integer id) {
        staffRepository.deleteById(id);
    }
}
