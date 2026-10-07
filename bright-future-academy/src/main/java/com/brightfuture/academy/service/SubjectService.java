package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.SubjectCreateRequest;
import com.brightfuture.academy.dto.response.SubjectResponse;
import com.brightfuture.academy.entity.Subject;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public SubjectResponse createSubject(SubjectCreateRequest request, Long createdByUserId) {
        if (subjectRepository.existsBySubjectCode(request.getSubjectCode())) {
            throw new ConflictException("A subject with code '" + request.getSubjectCode() + "' already exists");
        }

        Subject subject = Subject.builder()
                .subjectCode(request.getSubjectCode())
                .name(request.getName())
                .description(request.getDescription())
                .credits(request.getCredits())
                .status("ACTIVE")
                .build();

        subject = subjectRepository.save(subject);

        auditLogService.log(createdByUserId, "CREATE_SUBJECT", "SUBJECT", subject.getId(),
                "Created subject " + subject.getSubjectCode() + " - " + subject.getName());

        return mapToResponse(subject);
    }

    @Transactional(readOnly = true)
    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        return mapToResponse(subject);
    }

    @Transactional(readOnly = true)
    public Page<SubjectResponse> getAllSubjects(String search, String status, Pageable pageable) {
        return subjectRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectCreateRequest request, Long updatedByUserId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        subject.setSubjectCode(request.getSubjectCode());
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject.setCredits(request.getCredits());

        subject = subjectRepository.save(subject);

        auditLogService.log(updatedByUserId, "UPDATE_SUBJECT", "SUBJECT", subject.getId(),
                "Updated subject " + subject.getSubjectCode());

        return mapToResponse(subject);
    }

    @Transactional
    public void deleteSubject(Long id, Long userId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        subject.setStatus("INACTIVE");
        subjectRepository.save(subject);

        auditLogService.log(userId, "DELETE_SUBJECT", "SUBJECT", id,
                "Soft-deleted subject " + subject.getSubjectCode());
    }

    private SubjectResponse mapToResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .subjectCode(subject.getSubjectCode())
                .name(subject.getName())
                .description(subject.getDescription())
                .credits(subject.getCredits())
                .status(subject.getStatus())
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }
}
