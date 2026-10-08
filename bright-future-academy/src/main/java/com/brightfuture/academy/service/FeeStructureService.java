package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.FeeAssignRequest;
import com.brightfuture.academy.dto.request.FeeStructureCreateRequest;
import com.brightfuture.academy.dto.response.FeeStructureResponse;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.FeeStatus;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeStructureService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final StudentFeeAssignmentRepository feeAssignmentRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public FeeStructureResponse createFeeStructure(FeeStructureCreateRequest request, Long createdByUserId) {
        ClassEntity classEntity = null;
        if (request.getClassId() != null) {
            classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        }

        FeeStructure feeStructure = FeeStructure.builder()
                .name(request.getName())
                .description(request.getDescription())
                .feeType(request.getFeeType())
                .amount(request.getAmount())
                .frequency(request.getFrequency())
                .academicYear(request.getAcademicYear())
                .classEntity(classEntity)
                .status("ACTIVE")
                .build();

        feeStructure = feeStructureRepository.save(feeStructure);

        auditLogService.log(createdByUserId, "CREATE_FEE_STRUCTURE", "FEE_STRUCTURE", feeStructure.getId(),
                "Created fee structure: " + feeStructure.getName());

        return mapToResponse(feeStructure);
    }

    @Transactional(readOnly = true)
    public FeeStructureResponse getFeeStructureById(Long id) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeeStructure", "id", id));
        return mapToResponse(feeStructure);
    }

    @Transactional(readOnly = true)
    public List<FeeStructureResponse> getAllFeeStructures() {
        return feeStructureRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeeStructureResponse updateFeeStructure(Long id, FeeStructureCreateRequest request, Long updatedByUserId) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeeStructure", "id", id));

        feeStructure.setName(request.getName());
        feeStructure.setDescription(request.getDescription());
        feeStructure.setFeeType(request.getFeeType());
        feeStructure.setAmount(request.getAmount());
        feeStructure.setFrequency(request.getFrequency());
        feeStructure.setAcademicYear(request.getAcademicYear());

        if (request.getClassId() != null) {
            ClassEntity classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
            feeStructure.setClassEntity(classEntity);
        } else {
            feeStructure.setClassEntity(null);
        }

        feeStructure = feeStructureRepository.save(feeStructure);

        auditLogService.log(updatedByUserId, "UPDATE_FEE_STRUCTURE", "FEE_STRUCTURE", feeStructure.getId(),
                "Updated fee structure: " + feeStructure.getName());

        return mapToResponse(feeStructure);
    }

    @Transactional
    public void deleteFeeStructure(Long id, Long userId) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeeStructure", "id", id));
        feeStructure.setStatus("INACTIVE");
        feeStructureRepository.save(feeStructure);

        auditLogService.log(userId, "DELETE_FEE_STRUCTURE", "FEE_STRUCTURE", id,
                "Soft-deleted fee structure: " + feeStructure.getName());
    }

    @Transactional
    public void assignFeeToStudent(Long feeStructureId, FeeAssignRequest request, Long assignedByUserId) {
        FeeStructure feeStructure = feeStructureRepository.findById(feeStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("FeeStructure", "id", feeStructureId));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        StudentFeeAssignment assignment = StudentFeeAssignment.builder()
                .student(student)
                .feeStructure(feeStructure)
                .assignedAmount(feeStructure.getAmount())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .discountReason(request.getDiscountReason())
                .dueDate(request.getDueDate() != null ? request.getDueDate() : java.time.LocalDate.now().plusDays(30))
                .feeStatus(FeeStatus.UNPAID)
                .totalPaid(BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        feeAssignmentRepository.save(assignment);

        auditLogService.log(assignedByUserId, "ASSIGN_FEE", "STUDENT_FEE_ASSIGNMENT", assignment.getId(),
                "Assigned fee '" + feeStructure.getName() + "' to student " + student.getStudentIdNumber());
    }

    private FeeStructureResponse mapToResponse(FeeStructure feeStructure) {
        return FeeStructureResponse.builder()
                .id(feeStructure.getId())
                .name(feeStructure.getName())
                .description(feeStructure.getDescription())
                .feeType(feeStructure.getFeeType())
                .amount(feeStructure.getAmount())
                .frequency(feeStructure.getFrequency())
                .academicYear(feeStructure.getAcademicYear())
                .classId(feeStructure.getClassEntity() != null ? feeStructure.getClassEntity().getId() : null)
                .className(feeStructure.getClassEntity() != null ? feeStructure.getClassEntity().getClassName() : null)
                .status(feeStructure.getStatus())
                .createdAt(feeStructure.getCreatedAt())
                .updatedAt(feeStructure.getUpdatedAt())
                .build();
    }
}
