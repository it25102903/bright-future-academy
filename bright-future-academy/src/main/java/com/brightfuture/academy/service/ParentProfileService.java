package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.ParentProfileUpdateRequest;
import com.brightfuture.academy.dto.response.ParentProfileResponse;
import com.brightfuture.academy.entity.Guardian;
import com.brightfuture.academy.entity.User;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.GuardianRepository;
import com.brightfuture.academy.repository.StudentGuardianRepository;
import com.brightfuture.academy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentProfileService {

    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public ParentProfileResponse getParentProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Guardian guardian = guardianRepository.findByUserId(userId).orElse(null);

        return mapToResponse(user, guardian);
    }

    @Transactional
    public ParentProfileResponse updateParentProfile(Long userId, ParentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update User basic details
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone().trim());
        userRepository.save(user);

        // Update or create Guardian record
        Guardian guardian = guardianRepository.findByUserId(userId)
                .orElseGet(() -> Guardian.builder()
                        .user(user)
                        .relationship("PARENT")
                        .email(user.getEmail())
                        .status("ACTIVE")
                        .build());

        guardian.setFirstName(request.getFirstName().trim());
        guardian.setLastName(request.getLastName().trim());
        guardian.setPhone(request.getPhone().trim());
        guardian.setEmail(user.getEmail());
        guardian.setNicNumber(request.getNicNumber() != null ? request.getNicNumber().trim() : null);
        guardian.setOccupation(request.getOccupation() != null ? request.getOccupation().trim() : null);
        guardian.setAddressLine1(request.getAddressLine1() != null ? request.getAddressLine1().trim() : null);
        guardian.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        guardian.setCity(request.getCity() != null ? request.getCity().trim() : null);
        guardian.setDistrict(request.getDistrict() != null ? request.getDistrict().trim() : null);
        guardian.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);

        guardian = guardianRepository.save(guardian);

        auditLogService.log(user, "UPDATE_PROFILE", "GUARDIAN", guardian.getId(),
                "Parent updated profile details");

        return mapToResponse(user, guardian);
    }

    private ParentProfileResponse mapToResponse(User user, Guardian guardian) {
        int linkedChildrenCount = 0;
        if (guardian != null && guardian.getId() != null) {
            linkedChildrenCount = studentGuardianRepository.findByGuardianId(guardian.getId()).size();
        }

        return ParentProfileResponse.builder()
                .guardianId(guardian != null ? guardian.getId() : null)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .relationship(guardian != null ? guardian.getRelationship() : "PARENT")
                .phone(user.getPhone())
                .nicNumber(guardian != null ? guardian.getNicNumber() : null)
                .occupation(guardian != null ? guardian.getOccupation() : null)
                .addressLine1(guardian != null ? guardian.getAddressLine1() : null)
                .addressLine2(guardian != null ? guardian.getAddressLine2() : null)
                .city(guardian != null ? guardian.getCity() : null)
                .district(guardian != null ? guardian.getDistrict() : null)
                .postalCode(guardian != null ? guardian.getPostalCode() : null)
                .status(guardian != null ? guardian.getStatus() : user.getStatus().name())
                .linkedChildrenCount(linkedChildrenCount)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
