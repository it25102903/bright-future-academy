package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.ClassCreateRequest;
import com.brightfuture.academy.dto.response.ClassResponse;
import com.brightfuture.academy.entity.ClassEntity;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassService {

    private final ClassRepository classRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public ClassResponse createClass(ClassCreateRequest request, Long createdByUserId) {
        if (classRepository.existsByClassNameAndAcademicYear(request.getClassName(), request.getAcademicYear())) {
            throw new ConflictException("A class with name '" + request.getClassName() +
                    "' already exists for academic year " + request.getAcademicYear());
        }

        ClassEntity classEntity = ClassEntity.builder()
                .className(request.getClassName())
                .gradeLevel(request.getGradeLevel())
                .section(request.getSection())
                .academicYear(request.getAcademicYear())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 40)
                .description(request.getDescription())
                .status("ACTIVE")
                .build();

        classEntity = classRepository.save(classEntity);

        auditLogService.log(createdByUserId, "CREATE_CLASS", "CLASS", classEntity.getId(),
                "Created class " + classEntity.getClassName());

        return mapToResponse(classEntity);
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        return mapToResponse(classEntity);
    }

    @Transactional(readOnly = true)
    public Page<ClassResponse> getAllClasses(String search, String status, Integer academicYear, Pageable pageable) {
        return classRepository.findAllWithFilters(search, status, academicYear, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ClassResponse updateClass(Long id, ClassCreateRequest request, Long updatedByUserId) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));

        classEntity.setClassName(request.getClassName());
        classEntity.setGradeLevel(request.getGradeLevel());
        classEntity.setSection(request.getSection());
        classEntity.setAcademicYear(request.getAcademicYear());
        if (request.getCapacity() != null) {
            classEntity.setCapacity(request.getCapacity());
        }
        classEntity.setDescription(request.getDescription());

        classEntity = classRepository.save(classEntity);

        auditLogService.log(updatedByUserId, "UPDATE_CLASS", "CLASS", classEntity.getId(),
                "Updated class " + classEntity.getClassName());

        return mapToResponse(classEntity);
    }

    @Transactional
    public void deleteClass(Long id, Long userId) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        classEntity.setStatus("INACTIVE");
        classRepository.save(classEntity);

        auditLogService.log(userId, "DELETE_CLASS", "CLASS", id,
                "Soft-deleted class " + classEntity.getClassName());
    }

    private ClassResponse mapToResponse(ClassEntity classEntity) {
        long enrolledCount = enrollmentRepository.countActiveByClassId(classEntity.getId());
        return ClassResponse.builder()
                .id(classEntity.getId())
                .className(classEntity.getClassName())
                .gradeLevel(classEntity.getGradeLevel())
                .section(classEntity.getSection())
                .academicYear(classEntity.getAcademicYear())
                .capacity(classEntity.getCapacity())
                .description(classEntity.getDescription())
                .status(classEntity.getStatus())
                .enrolledCount(enrolledCount)
                .createdAt(classEntity.getCreatedAt())
                .updatedAt(classEntity.getUpdatedAt())
                .build();
    }
}
