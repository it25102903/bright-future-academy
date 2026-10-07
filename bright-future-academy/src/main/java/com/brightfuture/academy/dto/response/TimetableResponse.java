package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponse {
    private Long id;
    private Long classId;
    private String className;
    private Long subjectId;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private Long classroomId;
    private String classroomName;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer academicYear;
    private String semester;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
