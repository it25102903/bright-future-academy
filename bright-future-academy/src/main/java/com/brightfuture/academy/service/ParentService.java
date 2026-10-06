package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.ParentCreateRequest;
import com.brightfuture.academy.dto.request.ParentUpdateRequest;
import com.brightfuture.academy.dto.response.ParentResponse;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.UserStatus;
import com.brightfuture.academy.exception.BadRequestException;
import com.brightfuture.academy.exception.ConflictException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentService {

    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional
    public ParentResponse createParent(ParentCreateRequest request, Long adminUserId) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // 1. Validate email uniqueness across all users
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with email " + request.getEmail() + " already exists");
        }

        // 2. Validate selected students if provided
        List<Student> selectedStudents = new ArrayList<>();
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            Set<Long> uniqueStudentIds = new LinkedHashSet<>(request.getStudentIds());
            for (Long studentId : uniqueStudentIds) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
                selectedStudents.add(student);
            }
        }

        // 3. Password handling
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "Password@123";
        if (rawPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        // 4. Create User entity with ROLE_PARENT
        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone().trim())
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();

        Role parentRole = roleRepository.findByName("PARENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "PARENT"));
        user.setRoles(new HashSet<>(Collections.singleton(parentRole)));
        user = userRepository.save(user);

        // 5. Create Guardian profile linked to the User
        String relationship = (request.getRelationship() != null && !request.getRelationship().trim().isEmpty())
                ? request.getRelationship().trim().toUpperCase()
                : "PARENT";

        Guardian guardian = Guardian.builder()
                .user(user)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .relationship(relationship)
                .phone(request.getPhone().trim())
                .email(normalizedEmail)
                .nicNumber(request.getNicNumber() != null ? request.getNicNumber().trim() : null)
                .occupation(request.getOccupation() != null ? request.getOccupation().trim() : null)
                .addressLine1(request.getAddressLine1() != null ? request.getAddressLine1().trim() : null)
                .addressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .district(request.getDistrict() != null ? request.getDistrict().trim() : null)
                .postalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null)
                .status("ACTIVE")
                .build();

        guardian = guardianRepository.save(guardian);

        // 6. Link parent to selected student children
        boolean isFirst = true;
        for (Student student : selectedStudents) {
            if (!studentGuardianRepository.existsByStudentIdAndGuardianId(student.getId(), guardian.getId())) {
                StudentGuardian studentGuardian = StudentGuardian.builder()
                        .student(student)
                        .guardian(guardian)
                        .isPrimary(isFirst)
                        .build();
                studentGuardianRepository.save(studentGuardian);
                isFirst = false;
            }
        }

        // 7. Audit log
        auditLogService.log(adminUserId, "CREATE_PARENT", "GUARDIAN", guardian.getId(),
                "Admin created parent " + user.getFullName() + " (" + user.getEmail() + ") with "
                        + selectedStudents.size() + " linked child(ren)");

        return mapToResponse(guardian);
    }

    @Transactional(readOnly = true)
    public Page<ParentResponse> listParents(String search, String status, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim().toUpperCase() : null;

        Page<Guardian> guardians = guardianRepository.findAllWithFilters(cleanSearch, cleanStatus, pageable);
        return guardians.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ParentResponse getParentById(Long id) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent / Guardian", "id", id));
        return mapToResponse(guardian);
    }

    @Transactional
    public ParentResponse updateParent(Long id, ParentUpdateRequest request, Long adminUserId) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent / Guardian", "id", id));

        guardian.setFirstName(request.getFirstName().trim());
        guardian.setLastName(request.getLastName().trim());
        guardian.setPhone(request.getPhone().trim());
        if (request.getRelationship() != null && !request.getRelationship().trim().isEmpty()) {
            guardian.setRelationship(request.getRelationship().trim().toUpperCase());
        }
        guardian.setNicNumber(request.getNicNumber() != null ? request.getNicNumber().trim() : null);
        guardian.setOccupation(request.getOccupation() != null ? request.getOccupation().trim() : null);
        guardian.setAddressLine1(request.getAddressLine1() != null ? request.getAddressLine1().trim() : null);
        guardian.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        guardian.setCity(request.getCity() != null ? request.getCity().trim() : null);
        guardian.setDistrict(request.getDistrict() != null ? request.getDistrict().trim() : null);
        guardian.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);

        // Also sync basic details to User if present
        if (guardian.getUser() != null) {
            User user = guardian.getUser();
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setPhone(request.getPhone().trim());
            userRepository.save(user);
        }

        guardian = guardianRepository.save(guardian);

        // Optionally update child relationships if studentIds list is provided
        if (request.getStudentIds() != null) {
            Set<Long> targetStudentIds = new HashSet<>(request.getStudentIds());
            List<StudentGuardian> existingLinks = studentGuardianRepository.findByGuardianId(guardian.getId());

            // Remove unselected links (deletes ONLY junction record, never deletes students!)
            for (StudentGuardian link : existingLinks) {
                if (!targetStudentIds.contains(link.getStudent().getId())) {
                    studentGuardianRepository.delete(link);
                }
            }

            // Add new links
            Set<Long> existingStudentIds = existingLinks.stream()
                    .map(l -> l.getStudent().getId())
                    .collect(Collectors.toSet());

            for (Long targetStudentId : targetStudentIds) {
                if (!existingStudentIds.contains(targetStudentId)) {
                    Student student = studentRepository.findById(targetStudentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", targetStudentId));
                    StudentGuardian newLink = StudentGuardian.builder()
                            .student(student)
                            .guardian(guardian)
                            .isPrimary(existingLinks.isEmpty())
                            .build();
                    studentGuardianRepository.save(newLink);
                }
            }
        }

        auditLogService.log(adminUserId, "UPDATE_PARENT", "GUARDIAN", guardian.getId(),
                "Admin updated parent details for " + guardian.getFullName());

        return mapToResponse(guardian);
    }

    @Transactional
    public void updateParentStatus(Long id, String status, Long adminUserId) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent / Guardian", "id", id));

        String newStatus = status.toUpperCase();
        guardian.setStatus(newStatus);
        if (guardian.getUser() != null) {
            try {
                guardian.getUser().setStatus(UserStatus.valueOf(newStatus));
                userRepository.save(guardian.getUser());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid user status: {}", newStatus);
            }
        }
        guardianRepository.save(guardian);

        auditLogService.log(adminUserId, "UPDATE_PARENT_STATUS", "GUARDIAN", guardian.getId(),
                "Admin changed parent status to " + newStatus);
    }

    @Transactional
    public ParentResponse linkChild(Long parentId, Long studentId, Long adminUserId) {
        Guardian guardian = guardianRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent / Guardian", "id", parentId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (studentGuardianRepository.existsByStudentIdAndGuardianId(studentId, parentId)) {
            throw new ConflictException("Student " + student.getUser().getFullName() + " is already linked to this parent");
        }

        List<StudentGuardian> existingLinks = studentGuardianRepository.findByGuardianId(parentId);
        boolean isPrimary = existingLinks.isEmpty();

        StudentGuardian link = StudentGuardian.builder()
                .student(student)
                .guardian(guardian)
                .isPrimary(isPrimary)
                .build();
        studentGuardianRepository.save(link);

        auditLogService.log(adminUserId, "LINK_CHILD", "GUARDIAN", parentId,
                "Linked student " + student.getUser().getFullName() + " (" + student.getStudentIdNumber()
                        + ") to parent " + guardian.getFullName());

        return mapToResponse(guardian);
    }

    @Transactional
    public ParentResponse unlinkChild(Long parentId, Long studentId, Long adminUserId) {
        Guardian guardian = guardianRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent / Guardian", "id", parentId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        StudentGuardian link = studentGuardianRepository.findByStudentIdAndGuardianId(studentId, parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent-Student link not found for student ID " + studentId));

        // CRITICAL: Delete only the junction link! Never delete the student!
        studentGuardianRepository.delete(link);

        auditLogService.log(adminUserId, "UNLINK_CHILD", "GUARDIAN", parentId,
                "Unlinked student " + student.getUser().getFullName() + " from parent " + guardian.getFullName());

        return mapToResponse(guardian);
    }

    private ParentResponse mapToResponse(Guardian guardian) {
        List<StudentGuardian> links = studentGuardianRepository.findByGuardianId(guardian.getId());

        List<ParentResponse.LinkedChildInfo> linkedChildren = links.stream().map(link -> {
            Student s = link.getStudent();
            String currentClass = null;
            try {
                List<StudentEnrollment> enrollments = studentEnrollmentRepository.findActiveByStudentId(s.getId());
                if (!enrollments.isEmpty() && enrollments.get(0).getClassEntity() != null) {
                    currentClass = enrollments.get(0).getClassEntity().getClassName();
                }
            } catch (Exception e) {
                // Ignore class resolution failure
            }

            return ParentResponse.LinkedChildInfo.builder()
                    .id(s.getId())
                    .userId(s.getUser() != null ? s.getUser().getId() : null)
                    .studentIdNumber(s.getStudentIdNumber())
                    .fullName(s.getUser() != null ? s.getUser().getFullName() : "")
                    .email(s.getUser() != null ? s.getUser().getEmail() : "")
                    .currentClass(currentClass)
                    .isPrimary(Boolean.TRUE.equals(link.getIsPrimary()))
                    .build();
        }).collect(Collectors.toList());

        User user = guardian.getUser();

        return ParentResponse.builder()
                .id(guardian.getId())
                .userId(user != null ? user.getId() : null)
                .email(user != null ? user.getEmail() : guardian.getEmail())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .fullName(guardian.getFullName())
                .relationship(guardian.getRelationship())
                .phone(guardian.getPhone())
                .nicNumber(guardian.getNicNumber())
                .occupation(guardian.getOccupation())
                .addressLine1(guardian.getAddressLine1())
                .addressLine2(guardian.getAddressLine2())
                .city(guardian.getCity())
                .district(guardian.getDistrict())
                .postalCode(guardian.getPostalCode())
                .status(guardian.getStatus())
                .linkedChildrenCount(linkedChildren.size())
                .linkedChildren(linkedChildren)
                .createdAt(guardian.getCreatedAt())
                .updatedAt(guardian.getUpdatedAt())
                .build();
    }
}
