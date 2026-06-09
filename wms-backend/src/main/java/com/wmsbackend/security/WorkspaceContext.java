package com.wmsbackend.security;

public final class WorkspaceContext {

    private static final ThreadLocal<Integer> CURRENT_COMPANY_ID = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> GLOBAL_ADMIN = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> CONSOLIDATED_VIEW = new ThreadLocal<>();

    private WorkspaceContext() {
    }

    public static void setCurrentCompanyId(Integer companyId) {
        if (companyId == null) {
            CURRENT_COMPANY_ID.remove();
        } else {
            CURRENT_COMPANY_ID.set(companyId);
        }
    }

    public static Integer getCurrentCompanyId() {
        return CURRENT_COMPANY_ID.get();
    }

    /**
     * Trả về CompanyId dùng để lọc dữ liệu.
     * Nếu là chế độ hợp nhất (HQ hoặc Global Admin chưa chọn cty), trả về null để query toàn bộ.
     */
    public static Integer getFilterCompanyId() {
        // Nếu là HQ hoặc chế độ hợp nhất được kích hoạt, trả về null để query toàn bộ dữ liệu
        if (isConsolidatedView()) {
            return null;
        }
        // Trả về ID công ty hiện tại (có thể là null nếu Global Admin chưa chọn cty)
        return getCurrentCompanyId();
    }

    public static void setGlobalAdmin(boolean globalAdmin) {
        GLOBAL_ADMIN.set(globalAdmin);
    }

    public static boolean isGlobalAdmin() {
        return Boolean.TRUE.equals(GLOBAL_ADMIN.get());
    }

    public static void setConsolidatedView(boolean consolidatedView) {
        CONSOLIDATED_VIEW.set(consolidatedView);
    }

    public static boolean isConsolidatedView() {
        return Boolean.TRUE.equals(CONSOLIDATED_VIEW.get());
    }

    public static void clear() {
        CURRENT_COMPANY_ID.remove();
        GLOBAL_ADMIN.remove();
        CONSOLIDATED_VIEW.remove();
    }
}
