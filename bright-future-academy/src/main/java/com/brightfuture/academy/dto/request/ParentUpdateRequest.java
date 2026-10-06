package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;

    private String relationship;
    private String nicNumber;
    private String occupation;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String postalCode;

    private List<Long> studentIds;
}
