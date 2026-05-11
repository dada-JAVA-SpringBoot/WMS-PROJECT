package com.wmsbackend.service;

import com.wmsbackend.dto.FinancialDetailDTO;
import com.wmsbackend.dto.FinancialSummaryDTO;
import com.wmsbackend.repository.InboundOrderDetailRepository;
import com.wmsbackend.repository.InboundOrderRepository;
import com.wmsbackend.repository.InventoryTransactionRepository;
import com.wmsbackend.repository.OutboundOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FinancialService {

    private final InboundOrderRepository  inboundRepo;
    private final OutboundOrderRepository outboundRepo;
    private final InventoryTransactionRepository txRepo;
    private final InboundOrderDetailRepository detailRepo;

    public FinancialService(InboundOrderRepository inboundRepo,
                            OutboundOrderRepository outboundRepo,
                            InventoryTransactionRepository txRepo,
                            InboundOrderDetailRepository detailRepo) {
        this.inboundRepo  = inboundRepo;
        this.outboundRepo = outboundRepo;
        this.txRepo = txRepo;
        this.detailRepo = detailRepo;
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private static BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal) return (BigDecimal) v;
        if (v instanceof Number) return BigDecimal.valueOf(((Number) v).doubleValue());
        return BigDecimal.ZERO;
    }

    private static LocalDate toLocalDate(Object v) {
        if (v == null) return null;
        if (v instanceof LocalDate) return (LocalDate) v;
        if (v instanceof java.sql.Date) return ((java.sql.Date) v).toLocalDate();
        if (v instanceof java.util.Date) return ((java.util.Date) v).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return null;
    }

    /** Chuyển List<Object[]> {key, value} thành Map và chuẩn hóa kiểu dữ liệu của Key */
    private static Map<String, BigDecimal> toNormalizedMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            Object keyObj = row[0];
            String keyStr = keyObj != null ? keyObj.toString() : "null";
            map.put(keyStr, toBigDecimal(row[1]));
        }
        return map;
    }

    /** Lấy bản đồ giá trung bình của từng sản phẩm */
    private Map<Integer, BigDecimal> getAveragePriceMap() {
        Map<Integer, BigDecimal> map = new HashMap<>();
        List<Object[]> rows = detailRepo.getAveragePricesByProduct();
        for (Object[] row : rows) {
            map.put(((Number) row[0]).intValue(), toBigDecimal(row[1]));
        }
        return map;
    }

    /** Tính số tiền thất thoát từ danh sách giao dịch âm (ADJUSTMENT) */
    private BigDecimal calculateAdjustmentLoss(List<Object[]> txRows, Map<Integer, BigDecimal> priceMap) {
        BigDecimal total = BigDecimal.ZERO;
        for (Object[] row : txRows) {
            Integer productId = ((Number) row[0]).intValue(); 
            BigDecimal qty = toBigDecimal(row[1]);
            BigDecimal price = priceMap.getOrDefault(productId, BigDecimal.ZERO);
            total = total.add(qty.abs().multiply(price));
        }
        return total;
    }

    // ── 1. Tổng hợp theo khoảng ngày ────────────

    public FinancialSummaryDTO getSummary(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.plusDays(1).atStartOfDay();
        
        BigDecimal cost    = toBigDecimal(inboundRepo.sumCostByDateRange(start, end));
        BigDecimal revenue = toBigDecimal(outboundRepo.sumRevenueByDateRange(start, end));
        
        Map<Integer, BigDecimal> priceMap = getAveragePriceMap();
        BigDecimal adjLoss = calculateAdjustmentLoss(txRepo.findNegativeAdjustmentsByProduct(start, end), priceMap);
        BigDecimal qcLoss  = toBigDecimal(detailRepo.sumDamagedValueByDateRange(start, end));
        BigDecimal totalLoss = adjLoss.add(qcLoss);

        return new FinancialSummaryDTO(cost, revenue, totalLoss);
    }

    // ── 2. Chi tiết theo NGÀY ──────────────────────────

    public FinancialDetailDTO getByDay(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.plusDays(1).atStartOfDay();

        Map<String, BigDecimal> costMap    = toNormalizedMap(inboundRepo.sumCostGroupByDayInRange(start, end));
        Map<String, BigDecimal> revenueMap = toNormalizedMap(outboundRepo.sumRevenueGroupByDayInRange(start, end));
        
        Map<Integer, BigDecimal> priceMap = getAveragePriceMap();
        List<Object[]> adjLossRows = txRepo.findNegativeAdjustmentsByDay(start, end);
        Map<String, BigDecimal> lossMap = new HashMap<>();
        for (Object[] row : adjLossRows) {
            String dateStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            lossMap.put(dateStr, lossMap.getOrDefault(dateStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }
        
        Map<String, BigDecimal> qcLossMap = toNormalizedMap(detailRepo.sumDamagedValueGroupByDayInRange(start, end));
        for (Map.Entry<String, BigDecimal> entry : qcLossMap.entrySet()) {
            lossMap.put(entry.getKey(), lossMap.getOrDefault(entry.getKey(), BigDecimal.ZERO).add(entry.getValue()));
        }

        List<String>     labels  = new ArrayList<>();
        List<BigDecimal> costs   = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> losses = new ArrayList<>();
        List<BigDecimal> profits = new ArrayList<>();

        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd/MM");
        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            labels.add(cursor.format(labelFmt));
            String lookupKey = cursor.toString();
            BigDecimal c = costMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            costs.add(c);
            revenues.add(r);
            losses.add(l);
            profits.add(r.subtract(c).subtract(l));
            cursor = cursor.plusDays(1);
        }

        return new FinancialDetailDTO(labels, costs, revenues, losses, profits);
    }

    // ── 3. Chi tiết theo THÁNG ─────────────────────────────────

    public FinancialDetailDTO getByMonth(int year) {
        Map<String, BigDecimal> costMap    = toNormalizedMap(inboundRepo.sumCostGroupByMonthInYear(year));
        Map<String, BigDecimal> revenueMap = toNormalizedMap(outboundRepo.sumRevenueGroupByMonthInYear(year));

        Map<Integer, BigDecimal> priceMap = getAveragePriceMap();
        List<Object[]> adjLossRows = txRepo.findNegativeAdjustmentsByMonth(year);
        Map<String, BigDecimal> lossMap = new HashMap<>();
        for (Object[] row : adjLossRows) {
            String mStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            lossMap.put(mStr, lossMap.getOrDefault(mStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }
        
        Map<String, BigDecimal> qcLossMap = toNormalizedMap(detailRepo.sumDamagedValueGroupByMonthInYear(year));
        for (Map.Entry<String, BigDecimal> entry : qcLossMap.entrySet()) {
            lossMap.put(entry.getKey(), lossMap.getOrDefault(entry.getKey(), BigDecimal.ZERO).add(entry.getValue()));
        }

        List<String>     labels   = new ArrayList<>();
        List<BigDecimal> costs    = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> losses   = new ArrayList<>();
        List<BigDecimal> profits  = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            labels.add("Tháng " + m);
            String lookupKey = String.valueOf(m);
            BigDecimal c = costMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            costs.add(c);
            revenues.add(r);
            losses.add(l);
            profits.add(r.subtract(c).subtract(l));
        }

        return new FinancialDetailDTO(labels, costs, revenues, losses, profits);
    }

    // ── 4. Chi tiết theo NĂM ────────────────────────────

    public FinancialDetailDTO getByYear(int fromYear, int toYear) {
        Map<String, BigDecimal> costMap    = toNormalizedMap(inboundRepo.sumCostGroupByYear(fromYear, toYear));
        Map<String, BigDecimal> revenueMap = toNormalizedMap(outboundRepo.sumRevenueGroupByYear(fromYear, toYear));

        Map<Integer, BigDecimal> priceMap = getAveragePriceMap();
        List<Object[]> adjLossRows = txRepo.findNegativeAdjustmentsByYear(fromYear, toYear);
        Map<String, BigDecimal> lossMap = new HashMap<>();
        for (Object[] row : adjLossRows) {
            String yStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            lossMap.put(yStr, lossMap.getOrDefault(yStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }
        
        Map<String, BigDecimal> qcLossMap = toNormalizedMap(detailRepo.sumDamagedValueGroupByYear(fromYear, toYear));
        for (Map.Entry<String, BigDecimal> entry : qcLossMap.entrySet()) {
            lossMap.put(entry.getKey(), lossMap.getOrDefault(entry.getKey(), BigDecimal.ZERO).add(entry.getValue()));
        }

        List<String>     labels   = new ArrayList<>();
        List<BigDecimal> costs    = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> losses   = new ArrayList<>();
        List<BigDecimal> profits  = new ArrayList<>();

        for (int y = fromYear; y <= toYear; y++) {
            labels.add("Năm " + y);
            String lookupKey = String.valueOf(y);
            BigDecimal c = costMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            costs.add(c);
            revenues.add(r);
            losses.add(l);
            profits.add(r.subtract(c).subtract(l));
        }

        return new FinancialDetailDTO(labels, costs, revenues, losses, profits);
    }
}