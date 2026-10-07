package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.StudentFeedbackRequest;
import com.brightfuture.academy.dto.response.StudentFeedbackResponse;
import com.brightfuture.academy.entity.StudentFeedback;
import com.brightfuture.academy.entity.User;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.StudentFeedbackRepository;
import com.brightfuture.academy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentFeedbackService {

    private final StudentFeedbackRepository studentFeedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public StudentFeedbackResponse createFeedback(Long studentUserId, StudentFeedbackRequest request) {
        User studentUser = userRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentUserId));

        User teacherUser = null;
        if (request.getTeacherUserId() != null) {
            teacherUser = userRepository.findById(request.getTeacherUserId())
                    .orElse(null);
        }

        StudentFeedback feedback = StudentFeedback.builder()
                .studentUser(studentUser)
                .teacherUser(teacherUser)
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .status("SUBMITTED")
                .build();

        StudentFeedback saved = studentFeedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentFeedbackResponse> getStudentFeedbacks(Long studentUserId) {
        return studentFeedbackRepository.findByStudentUserIdOrderByCreatedAtDesc(studentUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentFeedbackResponse> getTeacherFeedbacks(Long teacherUserId) {
        return studentFeedbackRepository.findForTeacherOrderByCreatedAtDesc(teacherUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFeedback(Long studentUserId, Long feedbackId) {
        StudentFeedback feedback = studentFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentFeedback", "id", feedbackId));

        if (!feedback.getStudentUser().getId().equals(studentUserId)) {
            throw new ForbiddenException("You are not authorized to delete this feedback.");
        }

        studentFeedbackRepository.delete(feedback);
    }

    private StudentFeedbackResponse mapToResponse(StudentFeedback feedback) {
        String studentName = feedback.getStudentUser() != null
                ? feedback.getStudentUser().getFirstName() + " " + feedback.getStudentUser().getLastName()
                : "Student";
        String studentEmail = feedback.getStudentUser() != null
                ? feedback.getStudentUser().getEmail()
                : "";

        String teacherName = "All Faculty & Teachers";
        if (feedback.getTeacherUser() != null) {
            teacherName = feedback.getTeacherUser().getFirstName() + " " + feedback.getTeacherUser().getLastName();
        }

        return StudentFeedbackResponse.builder()
                .id(feedback.getId())
                .studentUserId(feedback.getStudentUser().getId())
                .studentName(studentName)
                .studentEmail(studentEmail)
                .teacherUserId(feedback.getTeacherUser() != null ? feedback.getTeacherUser().getId() : null)
                .teacherName(teacherName)
                .subject(feedback.getSubject())
                .message(feedback.getMessage())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
