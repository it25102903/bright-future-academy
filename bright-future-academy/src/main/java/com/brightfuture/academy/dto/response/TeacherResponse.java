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
public class TeacherResponse {
    private Long id;
    private Long userId;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String profileImagePath;
    private LocalDate dateOfBirth;
    private String gender;
    private String nicNumber;
    private String qualification;
    private String specialization;
    private LocalDate hireDate;
    private String employmentStatus;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String postalCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
