package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private Long userId;
    private String studentIdNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String nicNumber;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String postalCode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String bloodGroup;
    private String medicalNotes;
    private LocalDate admissionDate;
    private String status;
    private List<GuardianInfo> guardians;
    private List<EnrollmentInfo> enrollments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuardianInfo {
        private Long id;
        private String fullName;
        private String relationship;
        private String phone;
        private String email;
        private boolean isPrimary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentInfo {
        private Long id;
        private Long classId;
        private String className;
        private Integer academicYear;
        private LocalDate enrollmentDate;
        private String status;
    }
}
