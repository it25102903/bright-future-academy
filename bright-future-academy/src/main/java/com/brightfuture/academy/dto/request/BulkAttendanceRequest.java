package com.brightfuture.academy.dto.request;

import com.brightfuture.academy.enums.AttendanceStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAttendanceRequest {

    @NotEmpty(message = "Student statuses map must not be empty")
    private Map<Long, AttendanceStatus> studentStatuses;
}
