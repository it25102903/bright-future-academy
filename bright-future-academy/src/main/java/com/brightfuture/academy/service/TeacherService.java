package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.TeacherCreateRequest;
import com.brightfuture.academy.dto.request.TeacherProfileUpdateRequest;
import com.brightfuture.academy.dto.response.StudentTeacherResponse;
import com.brightfuture.academy.dto.response.TeacherResponse;
import com.brightfuture.academy.entity.*;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final TimetableRepository timetableRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request, Long createdByUserId) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("A user with email " + request.getEmail() + " already exists");
        }

        // Validate NIC uniqueness
        if (request.getNicNumber() != null && teacherRepository.findAll().stream()
                .anyMatch(t -> request.getNicNumber().equals(t.getNicNumber()))) {
            throw new ConflictException("A teacher with NIC number " + request.getNicNumber() + " already exists");
        }

        // Create User
        String password = request.getPassword() != null ? request.getPassword() : "abcd123";
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(password))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .build();

        Role teacherRole = roleRepository.findByName("TEACHER")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "TEACHER"));
        user.setRoles(new HashSet<>(Collections.singleton(teacherRole)));
        user = userRepository.save(user);

        // Generate employee ID
        String employeeId = generateEmployeeId();

        // Create Teacher
        Teacher teacher = Teacher.builder()
                .user(user)
                .employeeId(employeeId)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .nicNumber(request.getNicNumber())
                .qualification(request.getQualification())
                .specialization(request.getSpecialization())
                .hireDate(request.getHireDate())
                .employmentStatus(request.getEmploymentStatus() != null ? request.getEmploymentStatus() : "FULL_TIME")
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .district(request.getDistrict())
                .postalCode(request.getPostalCode())
                .status("ACTIVE")
                .build();

        teacher = teacherRepository.save(teacher);

        auditLogService.log(createdByUserId, "CREATE_TEACHER", "TEACHER", teacher.getId(),
                "Created teacher " + employeeId + " - " + user.getFullName());

        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public Page<TeacherResponse> getAllTeachers(String search, String status, Pageable pageable) {
        return teacherRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherCreateRequest request, Long updatedByUserId) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));

        User user = teacher.getUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        teacher.setDateOfBirth(request.getDateOfBirth());
        teacher.setGender(request.getGender());
        teacher.setNicNumber(request.getNicNumber());
        teacher.setQualification(request.getQualification());
        teacher.setSpecialization(request.getSpecialization());
        teacher.setHireDate(request.getHireDate());
        if (request.getEmploymentStatus() != null) {
            teacher.setEmploymentStatus(request.getEmploymentStatus());
        }
        teacher.setAddressLine1(request.getAddressLine1());
        teacher.setAddressLine2(request.getAddressLine2());
        teacher.setCity(request.getCity());
        teacher.setDistrict(request.getDistrict());
        teacher.setPostalCode(request.getPostalCode());

        teacher = teacherRepository.save(teacher);

        auditLogService.log(updatedByUserId, "UPDATE_TEACHER", "TEACHER", teacher.getId(),
                "Updated teacher " + teacher.getEmployeeId());

        return mapToResponse(teacher);
    }

    @Transactional
    public void updateTeacherStatus(Long id, String newStatus, Long updatedByUserId) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));

        String oldStatus = teacher.getStatus();
        teacher.setStatus(newStatus);
        teacher.getUser().setStatus("ACTIVE".equals(newStatus) ? UserStatus.ACTIVE : UserStatus.INACTIVE);

        teacherRepository.save(teacher);
        userRepository.save(teacher.getUser());

        auditLogService.log(updatedByUserId, "UPDATE_TEACHER", "TEACHER", teacher.getId(),
                "Changed teacher status from " + oldStatus + " to " + newStatus);
    }

    @Transactional(readOnly = true)
    public TeacherResponse getMyProfile(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user id: " + userId));
        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse updateMyProfile(Long userId, TeacherProfileUpdateRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user id: " + userId));

        User user = teacher.getUser();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        if (request.getQualification() != null) teacher.setQualification(request.getQualification().trim());
        if (request.getSpecialization() != null) teacher.setSpecialization(request.getSpecialization().trim());
        if (request.getAddressLine1() != null) teacher.setAddressLine1(request.getAddressLine1().trim());
        if (request.getAddressLine2() != null) teacher.setAddressLine2(request.getAddressLine2().trim());
        if (request.getCity() != null) teacher.setCity(request.getCity().trim());
        if (request.getDistrict() != null) teacher.setDistrict(request.getDistrict().trim());
        if (request.getPostalCode() != null) teacher.setPostalCode(request.getPostalCode().trim());

        teacher = teacherRepository.save(teacher);

        auditLogService.log(userId, "UPDATE_PROFILE", "TEACHER", teacher.getId(),
                "Teacher updated own profile: " + teacher.getEmployeeId());

        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse updateProfilePhoto(Long userId, MultipartFile file) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user id: " + userId));

        User user = teacher.getUser();
        String oldPhoto = user.getProfileImagePath();

        String newPhotoUrl = fileStorageService.storeProfilePhoto(file, userId);
        user.setProfileImagePath(newPhotoUrl);
        userRepository.save(user);

        if (oldPhoto != null && !oldPhoto.equals(newPhotoUrl)) {
            fileStorageService.deleteFile(oldPhoto);
        }

        auditLogService.log(userId, "UPDATE_PROFILE_PHOTO", "TEACHER", teacher.getId(),
                "Teacher updated profile photo");

        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse deleteProfilePhoto(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user id: " + userId));

        User user = teacher.getUser();
        String oldPhoto = user.getProfileImagePath();
        if (oldPhoto != null) {
            fileStorageService.deleteFile(oldPhoto);
            user.setProfileImagePath(null);
            userRepository.save(user);

            auditLogService.log(userId, "DELETE_PROFILE_PHOTO", "TEACHER", teacher.getId(),
                    "Teacher removed profile photo");
        }

        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public List<StudentTeacherResponse> getTeachersForStudent(Long studentId, UserPrincipal currentUser) {
        // IDOR Authorization checks
        if (currentUser.hasRole("PARENT")) {
            List<Student> linkedStudents = studentRepository.findByParentUserId(currentUser.getId());
            boolean isLinked = linkedStudents.stream().anyMatch(s -> s.getId().equals(studentId));
            if (!isLinked) {
                throw new ForbiddenException("You are not authorized to view teachers for this student");
            }
        } else if (currentUser.hasRole("STUDENT")) {
            Student student = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + currentUser.getId()));
            if (!student.getId().equals(studentId)) {
                throw new ForbiddenException("You are not authorized to view teachers for another student");
            }
        }

        List<Timetable> timetables = timetableRepository.findByStudentId(studentId);

        // Map distinct instructors by teacherId and subjectName
        Map<String, StudentTeacherResponse> uniqueMap = new LinkedHashMap<>();
        for (Timetable t : timetables) {
            Teacher teacher = t.getTeacher();
            if (teacher == null || !"ACTIVE".equals(teacher.getStatus())) continue;

            String key = teacher.getId() + "-" + t.getSubject().getName();
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, StudentTeacherResponse.builder()
                        .teacherId(teacher.getId())
                        .employeeId(teacher.getEmployeeId())
                        .fullName(teacher.getUser().getFullName())
                        .email(teacher.getUser().getEmail())
                        .phone(teacher.getUser().getPhone())
                        .specialization(teacher.getSpecialization())
                        .qualification(teacher.getQualification())
                        .subjectName(t.getSubject().getName())
                        .className(t.getClassEntity().getClassName())
                        .profileImagePath(teacher.getUser().getProfileImagePath())
                        .build());
            }
        }

        return new ArrayList<>(uniqueMap.values());
    }

    private String generateEmployeeId() {
        String year = String.valueOf(Year.now().getValue());
        long count = teacherRepository.count() + 1;
        return String.format("EMP-%s-%04d", year, count);
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        User user = teacher.getUser();
        return TeacherResponse.builder()
                .id(teacher.getId())
                .userId(user.getId())
                .employeeId(teacher.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImagePath(user.getProfileImagePath())
                .dateOfBirth(teacher.getDateOfBirth())
                .gender(teacher.getGender())
                .nicNumber(teacher.getNicNumber())
                .qualification(teacher.getQualification())
                .specialization(teacher.getSpecialization())
                .hireDate(teacher.getHireDate())
                .employmentStatus(teacher.getEmploymentStatus())
                .addressLine1(teacher.getAddressLine1())
                .addressLine2(teacher.getAddressLine2())
                .city(teacher.getCity())
                .district(teacher.getDistrict())
                .postalCode(teacher.getPostalCode())
                .status(teacher.getStatus())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .build();
    }
}
