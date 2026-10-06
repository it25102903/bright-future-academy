package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.StudentCreateRequest;
import com.brightfuture.academy.dto.request.StudentProfileUpdateRequest;
import com.brightfuture.academy.dto.response.StudentResponse;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.Gender;
import com.brightfuture.academy.enums.UserStatus;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import com.brightfuture.academy.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GuardianRepository guardianRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request, Long createdByUserId) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("A user with email " + request.getEmail() + " already exists");
        }

        // Validate NIC uniqueness
        if (request.getNicNumber() != null && studentRepository.existsByNicNumber(request.getNicNumber())) {
            throw new ConflictException("A student with NIC number " + request.getNicNumber() + " already exists");
        }

        // Create User
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "Password@123";
        if (rawPassword.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .passwordChangedAt(null)
                .build();

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "STUDENT"));
        user.setRoles(new HashSet<>(Collections.singleton(studentRole)));
        user = userRepository.save(user);

        // Generate student ID
        String studentIdNumber = generateStudentId();

        // Create Student
        Student student = Student.builder()
                .user(user)
                .studentIdNumber(studentIdNumber)
                .dateOfBirth(request.getDateOfBirth())
                .gender(Gender.valueOf(request.getGender().toUpperCase()))
                .nicNumber(request.getNicNumber())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .district(request.getDistrict())
                .postalCode(request.getPostalCode())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelationship(request.getEmergencyContactRelationship())
                .bloodGroup(request.getBloodGroup())
                .medicalNotes(request.getMedicalNotes())
                .admissionDate(LocalDate.now())
                .status("ACTIVE")
                .build();

        student = studentRepository.save(student);

        // Link guardian if provided
        if (request.getGuardianId() != null) {
            Guardian guardian = guardianRepository.findById(request.getGuardianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", request.getGuardianId()));
            linkGuardian(student, guardian, true);
        } else if (request.getGuardianFirstName() != null && request.getGuardianPhone() != null) {
            Guardian guardian = Guardian.builder()
                    .firstName(request.getGuardianFirstName())
                    .lastName(request.getGuardianLastName() != null ? request.getGuardianLastName() : "")
                    .relationship(request.getGuardianRelationship() != null ? request.getGuardianRelationship() : "GUARDIAN")
                    .phone(request.getGuardianPhone())
                    .email(request.getGuardianEmail())
                    .status("ACTIVE")
                    .build();
            guardian = guardianRepository.save(guardian);
            linkGuardian(student, guardian, true);
        }

        auditLogService.log(createdByUserId, "CREATE_STUDENT", "STUDENT", student.getId(),
                "Created student " + studentIdNumber + " - " + user.getFullName());

        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id, UserPrincipal currentUser) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // IDOR prevention: students can only view their own profile
        if (currentUser.hasRole("STUDENT") && !student.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view this student's profile");
        }

        // Parents can only view linked children
        if (currentUser.hasRole("PARENT")) {
            List<Student> linkedStudents = studentRepository.findByParentUserId(currentUser.getId());
            boolean isLinked = linkedStudents.stream().anyMatch(s -> s.getId().equals(id));
            if (!isLinked) {
                throw new ForbiddenException("You are not authorized to view this student's profile");
            }
        }

        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse updateStudentProfile(Long userId, StudentProfileUpdateRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));

        User user = student.getUser();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        if (request.getAddressLine1() != null) student.setAddressLine1(request.getAddressLine1().trim());
        if (request.getAddressLine2() != null) student.setAddressLine2(request.getAddressLine2().trim());
        if (request.getCity() != null) student.setCity(request.getCity().trim());
        if (request.getDistrict() != null) student.setDistrict(request.getDistrict().trim());
        if (request.getPostalCode() != null) student.setPostalCode(request.getPostalCode().trim());
        if (request.getEmergencyContactName() != null) student.setEmergencyContactName(request.getEmergencyContactName().trim());
        if (request.getEmergencyContactPhone() != null) student.setEmergencyContactPhone(request.getEmergencyContactPhone().trim());
        if (request.getEmergencyContactRelationship() != null) student.setEmergencyContactRelationship(request.getEmergencyContactRelationship().trim());
        if (request.getBloodGroup() != null) student.setBloodGroup(request.getBloodGroup().trim());
        if (request.getMedicalNotes() != null) student.setMedicalNotes(request.getMedicalNotes().trim());

        student = studentRepository.save(student);

        auditLogService.log(userId, "UPDATE_PROFILE", "STUDENT", student.getId(),
                "Student updated own profile: " + student.getStudentIdNumber());

        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public Page<StudentResponse> getAllStudents(String search, String status, Pageable pageable) {
        return studentRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentCreateRequest request, Long updatedByUserId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        User user = student.getUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        student.setNicNumber(request.getNicNumber());
        student.setAddressLine1(request.getAddressLine1());
        student.setAddressLine2(request.getAddressLine2());
        student.setCity(request.getCity());
        student.setDistrict(request.getDistrict());
        student.setPostalCode(request.getPostalCode());
        student.setEmergencyContactName(request.getEmergencyContactName());
        student.setEmergencyContactPhone(request.getEmergencyContactPhone());
        student.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        student.setBloodGroup(request.getBloodGroup());
        student.setMedicalNotes(request.getMedicalNotes());

        student = studentRepository.save(student);

        auditLogService.log(updatedByUserId, "UPDATE_STUDENT", "STUDENT", student.getId(),
                "Updated student " + student.getStudentIdNumber());

        return mapToResponse(student);
    }

    @Transactional
    public void updateStudentStatus(Long id, String newStatus, Long updatedByUserId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        String oldStatus = student.getStatus();
        student.setStatus(newStatus);
        student.getUser().setStatus("ACTIVE".equals(newStatus) ? UserStatus.ACTIVE : UserStatus.INACTIVE);

        studentRepository.save(student);
        userRepository.save(student.getUser());

        auditLogService.log(updatedByUserId, "UPDATE_STUDENT", "STUDENT", student.getId(),
                "Changed student status from " + oldStatus + " to " + newStatus);
    }

    @Transactional
    public void enrollStudent(Long studentId, Long classId, Integer academicYear, Long enrolledByUserId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (!"ACTIVE".equals(student.getStatus())) {
            throw new BusinessRuleException("Cannot enroll inactive student");
        }

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));

        if (!"ACTIVE".equals(classEntity.getStatus())) {
            throw new BusinessRuleException("Cannot enroll in inactive class");
        }

        // Check duplicate enrollment
        if (enrollmentRepository.existsByStudentIdAndClassEntityIdAndStatus(studentId, classId, "ACTIVE")) {
            throw new ConflictException("Student is already enrolled in this class");
        }

        // Check capacity
        long currentEnrolled = enrollmentRepository.countActiveByClassId(classId);
        if (currentEnrolled >= classEntity.getCapacity()) {
            throw new BusinessRuleException("Class has reached maximum capacity of " + classEntity.getCapacity());
        }

        StudentEnrollment enrollment = StudentEnrollment.builder()
                .student(student)
                .classEntity(classEntity)
                .academicYear(academicYear != null ? academicYear : Year.now().getValue())
                .enrollmentDate(LocalDate.now())
                .status("ACTIVE")
                .build();

        enrollmentRepository.save(enrollment);

        auditLogService.log(enrolledByUserId, "ENROLL_STUDENT", "STUDENT_ENROLLMENT", enrollment.getId(),
                "Enrolled student " + student.getStudentIdNumber() + " in " + classEntity.getClassName());
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getLinkedChildren(Long parentUserId) {
        List<Student> students = studentRepository.findByParentUserId(parentUserId);
        return students.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private String generateStudentId() {
        String year = String.valueOf(Year.now().getValue());
        Integer maxSeq = studentRepository.findMaxSequenceForYear(year);
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        return String.format("BFA-%s-%04d", year, nextSeq);
    }

    private void linkGuardian(Student student, Guardian guardian, boolean isPrimary) {
        if (!studentGuardianRepository.existsByStudentIdAndGuardianId(student.getId(), guardian.getId())) {
            StudentGuardian sg = StudentGuardian.builder()
                    .student(student)
                    .guardian(guardian)
                    .isPrimary(isPrimary)
                    .build();
            studentGuardianRepository.save(sg);
        }
    }

    private StudentResponse mapToResponse(Student student) {
        User user = student.getUser();

        // Get guardians
        List<StudentGuardian> guardianLinks = studentGuardianRepository.findByStudentId(student.getId());
        List<StudentResponse.GuardianInfo> guardianInfos = guardianLinks.stream()
                .map(sg -> StudentResponse.GuardianInfo.builder()
                        .id(sg.getGuardian().getId())
                        .fullName(sg.getGuardian().getFullName())
                        .relationship(sg.getGuardian().getRelationship())
                        .phone(sg.getGuardian().getPhone())
                        .email(sg.getGuardian().getEmail())
                        .isPrimary(sg.getIsPrimary())
                        .build())
                .collect(Collectors.toList());

        // Get enrollments
        List<StudentEnrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        List<StudentResponse.EnrollmentInfo> enrollmentInfos = enrollments.stream()
                .map(e -> StudentResponse.EnrollmentInfo.builder()
                        .id(e.getId())
                        .classId(e.getClassEntity().getId())
                        .className(e.getClassEntity().getClassName())
                        .academicYear(e.getAcademicYear())
                        .enrollmentDate(e.getEnrollmentDate())
                        .status(e.getStatus())
                        .build())
                .collect(Collectors.toList());

        return StudentResponse.builder()
                .id(student.getId())
                .userId(user.getId())
                .studentIdNumber(student.getStudentIdNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender().name())
                .nicNumber(student.getNicNumber())
                .addressLine1(student.getAddressLine1())
                .addressLine2(student.getAddressLine2())
                .city(student.getCity())
                .district(student.getDistrict())
                .postalCode(student.getPostalCode())
                .emergencyContactName(student.getEmergencyContactName())
                .emergencyContactPhone(student.getEmergencyContactPhone())
                .emergencyContactRelationship(student.getEmergencyContactRelationship())
                .bloodGroup(student.getBloodGroup())
                .medicalNotes(student.getMedicalNotes())
                .admissionDate(student.getAdmissionDate())
                .status(student.getStatus())
                .guardians(guardianInfos)
                .enrollments(enrollmentInfos)
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
