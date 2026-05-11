package com.wmsbackend.repository;

import com.wmsbackend.entity.Wave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaveRepository extends JpaRepository<Wave, Long> {
}
