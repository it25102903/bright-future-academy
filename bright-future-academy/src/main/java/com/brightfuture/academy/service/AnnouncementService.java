package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.AnnouncementCreateRequest;
import com.brightfuture.academy.dto.response.AnnouncementResponse;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementCreateRequest request, Long createdByUserId) {
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));

        ClassEntity targetClass = null;
        if (request.getTargetClassId() != null) {
            targetClass = classRepository.findById(request.getTargetClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getTargetClassId()));
        }

        boolean publish = request.getPublishImmediately() == null
                || Boolean.TRUE.equals(request.getPublishImmediately())
                || "PUBLISHED".equalsIgnoreCase(request.getStatus());

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .createdBy(createdBy)
                .targetAudience(request.getTargetAudience())
                .targetClass(targetClass)
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .status(publish ? "PUBLISHED" : "DRAFT")
                .publishedAt(publish ? LocalDateTime.now() : null)
                .expiresAt(request.getExpiresAt())
                .build();

        announcement = announcementRepository.save(announcement);

        auditLogService.log(createdByUserId, "CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.getId(),
                "Created announcement: " + announcement.getTitle());

        return mapToResponse(announcement);
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        return mapToResponse(announcement);
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAllAnnouncements(Pageable pageable) {
        return announcementRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getPublishedAnnouncements(String audience, Long classId, Pageable pageable) {
        return announcementRepository.findPublishedForAudience(audience, classId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAnnouncementsForTeacher(Long teacherUserId, Pageable pageable) {
        return announcementRepository.findPublishedOrCreatedBy(teacherUserId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementCreateRequest request, Long updatedByUserId) {
        return updateAnnouncement(id, request, updatedByUserId, true);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementCreateRequest request, Long updatedByUserId, boolean isAdmin) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));

        if (!isAdmin && (announcement.getCreatedBy() == null || !announcement.getCreatedBy().getId().equals(updatedByUserId))) {
            throw new ForbiddenException("You can only modify your own announcements");
        }

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setTargetAudience(request.getTargetAudience());
        if (request.getPriority() != null) {
            announcement.setPriority(request.getPriority());
        }
        announcement.setExpiresAt(request.getExpiresAt());

        if (request.getTargetClassId() != null) {
            ClassEntity targetClass = classRepository.findById(request.getTargetClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getTargetClassId()));
            announcement.setTargetClass(targetClass);
        } else {
            announcement.setTargetClass(null);
        }

        announcement = announcementRepository.save(announcement);

        auditLogService.log(updatedByUserId, "UPDATE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.getId(),
                "Updated announcement: " + announcement.getTitle());

        return mapToResponse(announcement);
    }

    @Transactional
    public AnnouncementResponse publishAnnouncement(Long id, Long userId) {
        return publishAnnouncement(id, userId, true);
    }

    @Transactional
    public AnnouncementResponse publishAnnouncement(Long id, Long userId, boolean isAdmin) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));

        if (!isAdmin && (announcement.getCreatedBy() == null || !announcement.getCreatedBy().getId().equals(userId))) {
            throw new ForbiddenException("You can only publish your own announcements");
        }

        if ("PUBLISHED".equals(announcement.getStatus())) {
            throw new BusinessRuleException("Announcement is already published");
        }

        announcement.setStatus("PUBLISHED");
        announcement.setPublishedAt(LocalDateTime.now());
        announcement = announcementRepository.save(announcement);

        auditLogService.log(userId, "PUBLISH_ANNOUNCEMENT", "ANNOUNCEMENT", id,
                "Published announcement: " + announcement.getTitle());

        return mapToResponse(announcement);
    }

    @Transactional
    public void archiveAnnouncement(Long id, Long userId) {
        archiveAnnouncement(id, userId, true);
    }

    @Transactional
    public void archiveAnnouncement(Long id, Long userId, boolean isAdmin) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));

        if (!isAdmin && (announcement.getCreatedBy() == null || !announcement.getCreatedBy().getId().equals(userId))) {
            throw new ForbiddenException("You can only archive your own announcements");
        }

        announcement.setStatus("ARCHIVED");
        announcementRepository.save(announcement);

        auditLogService.log(userId, "ARCHIVE_ANNOUNCEMENT", "ANNOUNCEMENT", id,
                "Archived announcement: " + announcement.getTitle());
    }

    private AnnouncementResponse mapToResponse(Announcement announcement) {
        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdById(announcement.getCreatedBy() != null ? announcement.getCreatedBy().getId() : null)
                .createdByName(announcement.getCreatedBy() != null ? announcement.getCreatedBy().getFullName() : null)
                .targetAudience(announcement.getTargetAudience())
                .targetClassId(announcement.getTargetClass() != null ? announcement.getTargetClass().getId() : null)
                .targetClassName(announcement.getTargetClass() != null ? announcement.getTargetClass().getClassName() : null)
                .priority(announcement.getPriority())
                .status(announcement.getStatus())
                .publishedAt(announcement.getPublishedAt())
                .expiresAt(announcement.getExpiresAt())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }
}
