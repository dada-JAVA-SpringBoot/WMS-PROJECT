package com.wmsbackend.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class TimeUtils {
    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }
}
