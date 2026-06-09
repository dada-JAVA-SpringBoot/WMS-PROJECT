package com.wmsbackend.repository;

import com.wmsbackend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT SUM(l.capacity) FROM Location l")
    Long sumTotalCapacity();
}