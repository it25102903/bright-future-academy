package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.ParentFeedbackRequest;
import com.brightfuture.academy.dto.response.ParentFeedbackResponse;
import com.brightfuture.academy.entity.ParentFeedback;
import com.brightfuture.academy.entity.User;
import com.brightfuture.academy.enums.FeedbackAudience;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.ParentFeedbackRepository;
import com.brightfuture.academy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentFeedbackService {

    private final ParentFeedbackRepository parentFeedbackRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public ParentFeedbackResponse createFeedback(Long parentUserId, ParentFeedbackRequest request) {
        User user = userRepository.findById(parentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", parentUserId));

        ParentFeedback feedback = ParentFeedback.builder()
                .parentUser(user)
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .targetAudience(request.getTargetAudience())
                .status("SUBMITTED")
                .build();

        feedback = parentFeedbackRepository.save(feedback);
        auditLogService.log(user, "CREATE_FEEDBACK", "PARENT_FEEDBACK", feedback.getId(),
                "Parent submitted feedback titled: " + feedback.getSubject());

        return mapToResponse(feedback);
    }

    @Transactional(readOnly = true)
    public List<ParentFeedbackResponse> getFeedbacksForParent(Long parentUserId) {
        return parentFeedbackRepository.findByParentUserIdOrderByCreatedAtDesc(parentUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFeedback(Long parentUserId, Long feedbackId) {
        ParentFeedback feedback = parentFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("ParentFeedback", "id", feedbackId));

        if (!feedback.getParentUser().getId().equals(parentUserId)) {
            log.warn("IDOR attempt: User ID {} attempted to delete ParentFeedback ID {} belonging to User ID {}",
                    parentUserId, feedbackId, feedback.getParentUser().getId());
            throw new ForbiddenException("You are not authorized to delete this feedback");
        }

        parentFeedbackRepository.delete(feedback);
        User user = userRepository.findById(parentUserId).orElse(null);
        if (user != null) {
            auditLogService.log(user, "DELETE_FEEDBACK", "PARENT_FEEDBACK", feedbackId,
                    "Parent deleted feedback ID: " + feedbackId);
        }
    }

    @Transactional(readOnly = true)
    public List<ParentFeedbackResponse> getFeedbacksForTeachers() {
        List<FeedbackAudience> teacherAudiences = Arrays.asList(
                FeedbackAudience.TEACHERS,
                FeedbackAudience.TEACHERS_AND_ADMINISTRATORS
        );
        return parentFeedbackRepository.findByTargetAudienceInOrderByCreatedAtDesc(teacherAudiences)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParentFeedbackResponse> getFeedbacksForAdministrators() {
        List<FeedbackAudience> adminAudiences = Arrays.asList(
                FeedbackAudience.ADMINISTRATORS,
                FeedbackAudience.TEACHERS_AND_ADMINISTRATORS
        );
        return parentFeedbackRepository.findByTargetAudienceInOrderByCreatedAtDesc(adminAudiences)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ParentFeedbackResponse mapToResponse(ParentFeedback feedback) {
        User user = feedback.getParentUser();
        return ParentFeedbackResponse.builder()
                .id(feedback.getId())
                .parentUserId(user.getId())
                .parentName(user.getFullName())
                .parentEmail(user.getEmail())
                .parentPhone(user.getPhone())
                .subject(feedback.getSubject())
                .message(feedback.getMessage())
                .targetAudience(feedback.getTargetAudience())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
