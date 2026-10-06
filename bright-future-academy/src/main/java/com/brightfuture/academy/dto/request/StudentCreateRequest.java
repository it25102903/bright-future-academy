package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCreateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    private String phone;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
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

    // Guardian info (optional — can link existing guardian or create new)
    private Long guardianId;
    private String guardianFirstName;
    private String guardianLastName;
    private String guardianRelationship;
    private String guardianPhone;
    private String guardianEmail;
}
