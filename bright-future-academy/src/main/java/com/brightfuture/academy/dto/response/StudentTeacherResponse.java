package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentTeacherResponse {
    private Long teacherId;
    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private String subjectName;
    private String className;
    private String profileImagePath;
}
