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

        BigDecimal cogsVal = BigDecimal.ZERO;
        List<Object[]> outboundByProd = txRepo.sumOutboundByProductInPeriod(start, end);
        for (Object[] row : outboundByProd) {
            Integer pId = ((Number) row[0]).intValue();
            BigDecimal qty = toBigDecimal(row[1]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            cogsVal = cogsVal.add(qty.multiply(p));
        }

        return new FinancialSummaryDTO(cost, revenue, totalLoss, cogsVal);
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

        Map<String, BigDecimal> cogsDayMap = new HashMap<>();
        List<Object[]> outboundQtyByDay = txRepo.sumOutboundQtyGroupByDay(start, end);
        for (Object[] row : outboundQtyByDay) {
            String dateStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            cogsDayMap.put(dateStr, cogsDayMap.getOrDefault(dateStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }

        List<String>     labels  = new ArrayList<>();
        List<BigDecimal> costs   = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> losses = new ArrayList<>();
        List<BigDecimal> profits = new ArrayList<>();
        List<BigDecimal> cogss   = new ArrayList<>();
        List<BigDecimal> actualProfits = new ArrayList<>();

        long days = java.time.temporal.ChronoUnit.DAYS.between(from, to);

        if (days <= 31) {
            DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd");
            LocalDate cursor = from;
            while (!cursor.isAfter(to)) {
                labels.add(cursor.format(labelFmt));
                String lookupKey = cursor.toString();
                BigDecimal c = costMap.getOrDefault(lookupKey, BigDecimal.ZERO);
                BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
                BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
                BigDecimal cogs = cogsDayMap.getOrDefault(lookupKey, BigDecimal.ZERO);
                costs.add(c);
                revenues.add(r);
                losses.add(l);
                profits.add(r.subtract(c).subtract(l));
                cogss.add(cogs);
                actualProfits.add(r.subtract(cogs).subtract(l));
                cursor = cursor.plusDays(1);
            }
        } else if (days <= 180) {
            LocalDate cursor = from;
            while (!cursor.isAfter(to)) {
                LocalDate weekStart = cursor;
                LocalDate weekEnd = cursor.plusDays(6);
                if (weekEnd.isAfter(to)) weekEnd = to;

                labels.add(weekStart.format(DateTimeFormatter.ofPattern("dd/MM")));

                BigDecimal cSum = BigDecimal.ZERO;
                BigDecimal rSum = BigDecimal.ZERO;
                BigDecimal lSum = BigDecimal.ZERO;
                BigDecimal cogsSum = BigDecimal.ZERO;

                LocalDate day = weekStart;
                while (!day.isAfter(weekEnd)) {
                    String lookupKey = day.toString();
                    cSum = cSum.add(costMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    rSum = rSum.add(revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    lSum = lSum.add(lossMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    cogsSum = cogsSum.add(cogsDayMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    day = day.plusDays(1);
                }

                costs.add(cSum);
                revenues.add(rSum);
                losses.add(lSum);
                profits.add(rSum.subtract(cSum).subtract(lSum));
                cogss.add(cogsSum);
                actualProfits.add(rSum.subtract(cogsSum).subtract(lSum));

                cursor = weekEnd.plusDays(1);
            }
        } else {
            LocalDate cursor = from;
            while (!cursor.isAfter(to)) {
                LocalDate monthStart = cursor;
                LocalDate monthEnd = cursor.plusDays(cursor.lengthOfMonth() - cursor.getDayOfMonth());
                if (monthEnd.isAfter(to)) monthEnd = to;

                labels.add("T" + monthStart.getMonthValue() + "/" + (monthStart.getYear() % 100));

                BigDecimal cSum = BigDecimal.ZERO;
                BigDecimal rSum = BigDecimal.ZERO;
                BigDecimal lSum = BigDecimal.ZERO;
                BigDecimal cogsSum = BigDecimal.ZERO;

                LocalDate day = monthStart;
                while (!day.isAfter(monthEnd)) {
                    String lookupKey = day.toString();
                    cSum = cSum.add(costMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    rSum = rSum.add(revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    lSum = lSum.add(lossMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    cogsSum = cogsSum.add(cogsDayMap.getOrDefault(lookupKey, BigDecimal.ZERO));
                    day = day.plusDays(1);
                }

                costs.add(cSum);
                revenues.add(rSum);
                losses.add(lSum);
                profits.add(rSum.subtract(cSum).subtract(lSum));
                cogss.add(cogsSum);
                actualProfits.add(rSum.subtract(cogsSum).subtract(lSum));

                cursor = monthEnd.plusDays(1);
            }
        }

        return new FinancialDetailDTO(labels, costs, revenues, losses, profits, cogss, actualProfits);
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

        Map<String, BigDecimal> cogsMonthMap = new HashMap<>();
        List<Object[]> outboundQtyByMonth = txRepo.sumOutboundQtyGroupByMonthInYear(year);
        for (Object[] row : outboundQtyByMonth) {
            String mStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs();
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            cogsMonthMap.put(mStr, cogsMonthMap.getOrDefault(mStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }

        List<String>     labels   = new ArrayList<>();
        List<BigDecimal> costs    = new ArrayList<>();
        List<BigDecimal> revenues = new ArrayList<>();
        List<BigDecimal> losses   = new ArrayList<>();
        List<BigDecimal> profits  = new ArrayList<>();
        List<BigDecimal> cogss    = new ArrayList<>();
        List<BigDecimal> actualProfits = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            labels.add("Tháng " + m);
            String lookupKey = String.valueOf(m);
            BigDecimal c = costMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal cogs = cogsMonthMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            costs.add(c);
            revenues.add(r);
            losses.add(l);
            profits.add(r.subtract(c).subtract(l));
            cogss.add(cogs);
            actualProfits.add(r.subtract(cogs).subtract(l));
        }

        return new FinancialDetailDTO(labels, costs, revenues, losses, profits, cogss, actualProfits);
    }

    // ── 4. Chi tiết theo NĂM ────────────────────────────

    public FinancialDetailDTO getByYear(int fromYear, int toYear) {
        Map<String, BigDecimal> revenueMap = toNormalizedMap(outboundRepo.sumRevenueGroupByYear(fromYear, toYear));
        Map<Integer, BigDecimal> priceMap = getAveragePriceMap();

        // Tính COGS theo năm (Số lượng xuất * Giá nhập trung bình)
        Map<String, BigDecimal> cogsMap = new HashMap<>();
        List<Object[]> outboundQtyRows = txRepo.sumOutboundQtyGroupByYear(fromYear, toYear);
        for (Object[] row : outboundQtyRows) {
            String yStr = row[0].toString();
            Integer pId = ((Number) row[1]).intValue();
            BigDecimal qty = toBigDecimal(row[2]).abs(); // Số lượng xuất (đã negate trong DB nên lấy abs)
            BigDecimal p = priceMap.getOrDefault(pId, BigDecimal.ZERO);
            cogsMap.put(yStr, cogsMap.getOrDefault(yStr, BigDecimal.ZERO).add(qty.multiply(p)));
        }

        Map<String, BigDecimal> lossMap = new HashMap<>();
        List<Object[]> adjLossRows = txRepo.findNegativeAdjustmentsByYear(fromYear, toYear);
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
        List<BigDecimal> costData = new ArrayList<>(); // Đây sẽ là COGS
        List<BigDecimal> revenueData = new ArrayList<>();
        List<BigDecimal> lossData   = new ArrayList<>();
        List<BigDecimal> profitData  = new ArrayList<>();

        for (int y = fromYear; y <= toYear; y++) {
            labels.add("Năm " + y);
            String lookupKey = String.valueOf(y);
            BigDecimal cogs = cogsMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal r = revenueMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            BigDecimal l = lossMap.getOrDefault(lookupKey, BigDecimal.ZERO);
            
            costData.add(cogs);
            revenueData.add(r);
            lossData.add(l);
            profitData.add(r.subtract(cogs).subtract(l));
        }

        return new FinancialDetailDTO(labels, costData, revenueData, lossData, profitData, costData, profitData);
    }
}