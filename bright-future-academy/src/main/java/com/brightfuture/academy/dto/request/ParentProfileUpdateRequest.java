package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ParentProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;

    @Size(max = 20, message = "NIC number cannot exceed 20 characters")
    private String nicNumber;

    @Size(max = 100, message = "Occupation cannot exceed 100 characters")
    private String occupation;

    @Size(max = 255, message = "Address Line 1 cannot exceed 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address Line 2 cannot exceed 255 characters")
    private String addressLine2;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 100, message = "District cannot exceed 100 characters")
    private String district;

    @Size(max = 10, message = "Postal code cannot exceed 10 characters")
    private String postalCode;
}
