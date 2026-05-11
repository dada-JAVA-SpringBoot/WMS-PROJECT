package com.wmsbackend.service.impl;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Role;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.RoleRepository;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired private StaffRepository staffRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> searchStaff(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return getAllStaff();
        return staffRepository.findAll().stream()
                .filter(s -> (s.getFullName() != null && s.getFullName().toLowerCase().contains(keyword.toLowerCase())) ||
                             (s.getEmployeeCode() != null && s.getEmployeeCode().toLowerCase().contains(keyword.toLowerCase())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StaffDTO convertToDTO(Staff s) {
        List<String> roleNames = s.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        String start = s.getShiftStartTime() != null ? s.getShiftStartTime().toString() : null;
        String end   = s.getShiftEndTime() != null ? s.getShiftEndTime().toString() : null;

        return new StaffDTO(
                s.getId(), s.getEmployeeCode(), s.getFullName(), s.getGender(),
                s.getDateOfBirth(), s.getPhone(), s.getEmail(), s.getHireDate(),
                s.getContractType(), s.getWarehouseRole(), s.getWorkStatus(), s.getNotes(),
                s.getUsername(), s.getEnabled(), s.getAvatar(), roleNames,
                start, end, s.getLastActiveAt()
        );
    }
    @Override
    @Transactional
    public Staff createStaff(Staff staff) {
        if (staffRepository.existsByUsername(staff.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (staffRepository.existsByEmployeeCode(staff.getEmployeeCode())) {
            throw new RuntimeException("Mã nhân viên đã tồn tại");
        }

        // Mã hóa mật khẩu nếu có
        if (staff.getPassword() != null && !staff.getPassword().isEmpty()) {
            staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        } else {
            // Mật khẩu mặc định nếu không nhập
            staff.setPassword(passwordEncoder.encode("Staff@123"));
        }

        // Tự động gán Role dựa trên warehouseRole
        assignRolesBasedOnWarehouseRole(staff);

        staff.setEnabled(true);
        return staffRepository.save(staff);
    }

    @Override
    @Transactional
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
        
        // Nếu thay đổi warehouseRole, cập nhật lại Roles thực tế
        if (!existing.getWarehouseRole().equals(updated.getWarehouseRole())) {
            existing.setWarehouseRole(updated.getWarehouseRole());
            assignRolesBasedOnWarehouseRole(existing);
        }
        
        existing.setWorkStatus(updated.getWorkStatus());
        existing.setNotes(updated.getNotes());
        existing.setShiftStartTime(updated.getShiftStartTime());
        existing.setShiftEndTime(updated.getShiftEndTime());
        
        // Không cho phép đổi username qua đây để tránh lỗi logic
        // Nếu muốn đổi username nên có method riêng hoặc kiểm tra kỹ
        
        if (updated.getEnabled() != null) {
            existing.setEnabled(updated.getEnabled());
        }

        return staffRepository.save(existing);
    }

    private void assignRolesBasedOnWarehouseRole(Staff staff) {
        Set<Role> roles = new HashSet<>();
        String wRole = staff.getWarehouseRole();
        
        // Mapping từ warehouseRole sang RoleName trong DB
        // warehouseRole có các giá trị: WAREHOUSE_MANAGER, WAREHOUSE_KEEPER, INBOUND_STAFF, OUTBOUND_STAFF, INVENTORY_CHECKER
        
        if ("WAREHOUSE_MANAGER".equals(wRole)) {
            roleRepository.findByRoleName("ADMIN").ifPresent(roles::add);
            roleRepository.findByRoleName("MANAGER").ifPresent(roles::add);
        } else if ("WAREHOUSE_KEEPER".equals(wRole)) {
            roleRepository.findByRoleName("STOREKEEPER").ifPresent(roles::add);
        } else if ("INBOUND_STAFF".equals(wRole)) {
            roleRepository.findByRoleName("INBOUND_STAFF").ifPresent(roles::add);
        } else if ("OUTBOUND_STAFF".equals(wRole)) {
            roleRepository.findByRoleName("OUTBOUND_STAFF").ifPresent(roles::add);
        } else if ("INVENTORY_CHECKER".equals(wRole)) {
            roleRepository.findByRoleName("CHECKER").ifPresent(roles::add);
        } else if ("HANDLER".equals(wRole)) {
            roleRepository.findByRoleName("HANDLER").ifPresent(roles::add);
        } else if ("ACCOUNTANT".equals(wRole)) {
            roleRepository.findByRoleName("ACCOUNTANT").ifPresent(roles::add);
        } else if ("INTERN".equals(wRole)) {
            roleRepository.findByRoleName("INTERN").ifPresent(roles::add);
        }
        
        // Mặc định ít nhất có 1 quyền
        if (roles.isEmpty()) {
            roleRepository.findByRoleName("INBOUND_STAFF").ifPresent(roles::add);
        }
        
        staff.setRoles(roles);
    }

    @Override
    public void updateAvatar(Integer id, String avatar) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staff.setAvatar(avatar);
        staffRepository.save(staff);
    }

    @Override
    public void deleteStaff(Integer id) {
        staffRepository.deleteById(id);
    }
}