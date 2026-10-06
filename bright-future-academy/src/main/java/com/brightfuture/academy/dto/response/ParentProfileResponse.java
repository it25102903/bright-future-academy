package com.brightfuture.academy.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ParentProfileResponse {
    private Long guardianId;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String relationship;
    private String phone;
    private String nicNumber;
    private String occupation;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String postalCode;
    private String status;
    private int linkedChildrenCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
