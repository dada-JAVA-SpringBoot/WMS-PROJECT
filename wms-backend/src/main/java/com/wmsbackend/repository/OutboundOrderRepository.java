package com.wmsbackend.repository;

import com.wmsbackend.entity.OutboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {
}