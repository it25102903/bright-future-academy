package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 255, message = "Address Line 1 must not exceed 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address Line 2 must not exceed 255 characters")
    private String addressLine2;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "District must not exceed 100 characters")
    private String district;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @Size(max = 100, message = "Emergency contact name must not exceed 100 characters")
    private String emergencyContactName;

    @Size(max = 20, message = "Emergency contact phone must not exceed 20 characters")
    private String emergencyContactPhone;

    @Size(max = 50, message = "Emergency contact relationship must not exceed 50 characters")
    private String emergencyContactRelationship;

    @Size(max = 10, message = "Blood group must not exceed 10 characters")
    private String bloodGroup;

    private String medicalNotes;
}
