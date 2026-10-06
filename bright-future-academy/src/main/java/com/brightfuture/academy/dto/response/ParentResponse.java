package com.brightfuture.academy.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentResponse {
    private Long id; // Guardian ID
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
    private List<LinkedChildInfo> linkedChildren;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LinkedChildInfo {
        private Long id;
        private Long userId;
        private String studentIdNumber;
        private String fullName;
        private String email;
        private String currentClass;
        private boolean isPrimary;
    }
}
