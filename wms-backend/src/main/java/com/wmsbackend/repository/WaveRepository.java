package com.wmsbackend.repository;

import com.wmsbackend.entity.Wave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaveRepository extends JpaRepository<Wave, Long> {
    List<Wave> findByCompanyIdOrderByIdDesc(Integer companyId);
    Optional<Wave> findByIdAndCompanyId(Long id, Integer companyId);
}
