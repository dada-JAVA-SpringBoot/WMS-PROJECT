package com.wmsbackend.service;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;

import java.util.List;

public interface StaffService {
    List<StaffDTO> getAllStaff();
    List<StaffDTO> searchStaff(String keyword);
    Staff createStaff(Staff staff);
    Staff updateStaff(Integer id, Staff staff);
    void deleteStaff(Integer id);
}
