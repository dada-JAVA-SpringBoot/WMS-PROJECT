package com.wmsbackend.service;

import com.wmsbackend.dto.FinancialDetailDTO;
import com.wmsbackend.dto.FinancialSummaryDTO;
import com.wmsbackend.repository.InboundOrderRepository;
import com.wmsbackend.repository.OutboundOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FinancialService {

    private final InboundOrderRepository  inboundRepo;
    private final OutboundOrderRepository outboundRepo;

    public FinancialService(InboundOrderRepository inboundRepo,
                            OutboundOrderRepository outboundRepo) {
        this.inboundRepo  = inboundRepo;
        this.outboundRepo = outboundRepo;
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private static BigDecimal safe(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    /** Chuyển List<Object[]> {key, value} thành Map để lookup nhanh */
    private static Map<Object, BigDecimal> toMap(List<Object[]> rows) {
        Map<Object, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put(row[0], safe((BigDecimal) row[1]));
        }
        return map;
    }

    // ── 1. Tổng hợp theo khoảng ngày (dùng cho summary cards) ────────────

    public FinancialSummaryDTO getSummary(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.plusDays(1).atStartOfDay();
        BigDecimal cost    = safe(inboundRepo.sumCostByDateRange(start, end));
        BigDecimal revenue = safe(outboundRepo.sumRevenueByDateRange(start, end));
        return new FinancialSummaryDTO(cost, revenue);
    }

    // ── 2. Chi tiết theo NGÀY trong khoảng ngày ──────────────────────────

    public FinancialDetailDTO getByDay(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.plusDays(1).atStartOfDay();

        Map<Object, BigDecimal> costMap    = toMap(inboundRepo.sumCostGroupByDayInRange(start, end));
        Map<Object, BigDecimal> revenueMap = toMap(outboundRepo.sumRevenueGroupByDayInRange(start, end));

        List<String>     labels  = new ArrayList<>();
        List<BigDecimal> costs   = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> profits = new ArrayList<>();

        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd/MM");
        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            labels.add(cursor.format(labelFmt));
            BigDecimal c = safe(costMap.get(cursor));
            BigDecimal r = safe(revenueMap.get(cursor));
            costs.add(c);
            revenues.add(r);
            profits.add(r.subtract(c));
            cursor = cursor.plusDays(1);
        }

        return new FinancialDetailDTO(labels, costs, revenues, profits);
    }

    // ── 3. Chi tiết theo THÁNG trong năm ─────────────────────────────────

    public FinancialDetailDTO getByMonth(int year) {
        Map<Object, BigDecimal> costMap    = toMap(inboundRepo.sumCostGroupByMonthInYear(year));
        Map<Object, BigDecimal> revenueMap = toMap(outboundRepo.sumRevenueGroupByMonthInYear(year));

        List<String>     labels   = new ArrayList<>();
        List<BigDecimal> costs    = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> profits  = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            labels.add("Tháng " + m);
            BigDecimal c = safe(costMap.get(m));
            BigDecimal r = safe(revenueMap.get(m));
            costs.add(c);
            revenues.add(r);
            profits.add(r.subtract(c));
        }

        return new FinancialDetailDTO(labels, costs, revenues, profits);
    }

    // ── 4. Chi tiết theo NĂM trong khoảng năm ────────────────────────────

    public FinancialDetailDTO getByYear(int fromYear, int toYear) {
        Map<Object, BigDecimal> costMap    = toMap(inboundRepo.sumCostGroupByYear(fromYear, toYear));
        Map<Object, BigDecimal> revenueMap = toMap(outboundRepo.sumRevenueGroupByYear(fromYear, toYear));

        List<String>     labels   = new ArrayList<>();
        List<BigDecimal> costs    = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> profits  = new ArrayList<>();

        for (int y = fromYear; y <= toYear; y++) {
            labels.add("Năm " + y);
            BigDecimal c = safe(costMap.get(y));
            BigDecimal r = safe(revenueMap.get(y));
            costs.add(c);
            revenues.add(r);
            profits.add(r.subtract(c));
        }

        return new FinancialDetailDTO(labels, costs, revenues, profits);
    }
}