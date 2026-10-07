package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordResponse {
    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String status;
    private LocalDateTime checkInTime;
    private String markingMethod;
    private String remarks;
    private String markedByName;
    private LocalDate sessionDate;
    private String subjectName;
    private String className;
    private String teacherName;
}
