package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.*;
import com.brightfuture.academy.dto.response.*;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.ExamAttemptStatus;
import com.brightfuture.academy.enums.ExamStatus;
import com.brightfuture.academy.exception.BadRequestException;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository questionRepository;
    private final ExamAssignmentRepository assignmentRepository;
    private final ExamAttemptRepository attemptRepository;
    private final ExamAttemptAnswerRepository attemptAnswerRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ClassRepository classRepository;
    private final StudentEnrollmentRepository enrollmentRepository;

    // =========================================================================
    // TEACHER: EXAM CRUD & OWNERSHIP
    // =========================================================================

    @Transactional
    public ExamResponse createExam(ExamCreateRequest request, Long userId) {
        Teacher teacher = getTeacherForUser(userId);

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new BadRequestException("Exam end time must be after start time");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        ClassEntity classEntity = null;
        if (request.getClassId() != null) {
            classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        }

        Exam exam = Exam.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .subject(subject)
                .teacher(teacher)
                .classEntity(classEntity)
                .durationMinutes(request.getDurationMinutes())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ExamStatus.DRAFT)
                .totalMarks(0)
                .passingMarks(request.getPassingMarks())
                .instructions(request.getInstructions())
                .externalResourceUrl(request.getExternalResourceUrl())
                .build();

        Exam saved = examRepository.save(exam);

        // If a class was provided, automatically assign enrolled students to the exam
        if (classEntity != null) {
            assignClassEnrollments(saved, classEntity.getId());
        }

        return mapToExamResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getTeacherExams(Long userId, ExamStatus status, String search) {
        Teacher teacher = getTeacherForUser(userId);
        List<Exam> exams = examRepository.findTeacherExamsWithFilters(teacher.getId(), status, search);
        return exams.stream().map(this::mapToExamResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long examId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);
        return mapToExamResponse(exam);
    }

    @Transactional
    public ExamResponse updateExam(Long examId, ExamCreateRequest request, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new BadRequestException("Exam end time must be after start time");
        }

        long submittedAttempts = attemptRepository.countByExamIdAndStatus(examId, ExamAttemptStatus.SUBMITTED);
        if (submittedAttempts > 0 && !exam.getDurationMinutes().equals(request.getDurationMinutes())) {
            throw new BadRequestException("Cannot change duration for an exam that has already received submissions");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        ClassEntity classEntity = null;
        if (request.getClassId() != null) {
            classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        }

        exam.setTitle(request.getTitle().trim());
        exam.setDescription(request.getDescription());
        exam.setSubject(subject);
        exam.setClassEntity(classEntity);
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setInstructions(request.getInstructions());
        exam.setExternalResourceUrl(request.getExternalResourceUrl());

        Exam updated = examRepository.save(exam);
        return mapToExamResponse(updated);
    }

    @Transactional
    public void deleteExam(Long examId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        long submittedAttempts = attemptRepository.countByExamIdAndStatus(examId, ExamAttemptStatus.SUBMITTED);
        if (submittedAttempts > 0) {
            throw new BadRequestException("Cannot delete exam because student submissions have already been recorded. You may close or archive the exam instead.");
        }

        examRepository.delete(exam);
    }

    // =========================================================================
    // TEACHER: QUESTION BUILDER (EXACTLY 4 OPTIONS, 1 CORRECT)
    // =========================================================================

    @Transactional
    public ExamQuestionResponse addQuestion(Long examId, ExamQuestionRequest request, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        validateQuestionRequest(request);

        Integer order = request.getQuestionOrder();
        if (order == null || order <= 0) {
            order = (int) questionRepository.countByExamId(examId) + 1;
        }

        ExamQuestion question = ExamQuestion.builder()
                .exam(exam)
                .questionText(request.getQuestionText().trim())
                .questionOrder(order)
                .optionA(request.getOptionA().trim())
                .optionB(request.getOptionB().trim())
                .optionC(request.getOptionC().trim())
                .optionD(request.getOptionD().trim())
                .correctOption(request.getCorrectOption().toUpperCase())
                .marks(request.getMarks() != null && request.getMarks() > 0 ? request.getMarks() : 1)
                .explanation(request.getExplanation())
                .build();

        ExamQuestion saved = questionRepository.save(question);

        // Recalculate total marks for the exam
        recalculateTotalMarks(exam);

        return mapToQuestionResponse(saved);
    }

    @Transactional
    public ExamQuestionResponse updateQuestion(Long examId, Long questionId, ExamQuestionRequest request, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        ExamQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamQuestion", "id", questionId));

        if (!question.getExam().getId().equals(exam.getId())) {
            throw new BadRequestException("Question does not belong to the specified exam");
        }

        validateQuestionRequest(request);

        question.setQuestionText(request.getQuestionText().trim());
        if (request.getQuestionOrder() != null && request.getQuestionOrder() > 0) {
            question.setQuestionOrder(request.getQuestionOrder());
        }
        question.setOptionA(request.getOptionA().trim());
        question.setOptionB(request.getOptionB().trim());
        question.setOptionC(request.getOptionC().trim());
        question.setOptionD(request.getOptionD().trim());
        question.setCorrectOption(request.getCorrectOption().toUpperCase());
        question.setMarks(request.getMarks() != null && request.getMarks() > 0 ? request.getMarks() : 1);
        question.setExplanation(request.getExplanation());

        ExamQuestion updated = questionRepository.save(question);
        recalculateTotalMarks(exam);

        return mapToQuestionResponse(updated);
    }

    @Transactional
    public void deleteQuestion(Long examId, Long questionId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        ExamQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamQuestion", "id", questionId));

        if (!question.getExam().getId().equals(exam.getId())) {
            throw new BadRequestException("Question does not belong to the specified exam");
        }

        long submittedAttempts = attemptRepository.countByExamIdAndStatus(examId, ExamAttemptStatus.SUBMITTED);
        if (submittedAttempts > 0) {
            throw new BadRequestException("Cannot delete question from an exam that students have already attempted");
        }

        questionRepository.delete(question);
        recalculateTotalMarks(exam);
    }

    // =========================================================================
    // TEACHER: ASSIGNMENT & PUBLISHING
    // =========================================================================

    @Transactional
    public ExamResponse assignExam(Long examId, ExamAssignRequest request, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        if (request.getClassId() != null) {
            ClassEntity classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
            exam.setClassEntity(classEntity);
            assignClassEnrollments(exam, classEntity.getId());
        }

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            for (Long studentId : request.getStudentIds()) {
                if (!assignmentRepository.existsByExamIdAndStudentId(examId, studentId)) {
                    Student student = studentRepository.findById(studentId).orElse(null);
                    if (student != null) {
                        assignmentRepository.save(ExamAssignment.builder()
                                .exam(exam)
                                .student(student)
                                .assignedAt(LocalDateTime.now())
                                .build());
                    }
                }
            }
        }

        examRepository.save(exam);
        return mapToExamResponse(exam);
    }

    @Transactional
    public ExamResponse publishExam(Long examId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        if (questions.isEmpty()) {
            throw new BadRequestException("Exam cannot be published: At least 1 question must be added before publishing.");
        }

        for (ExamQuestion q : questions) {
            if (q.getOptionA().isBlank() || q.getOptionB().isBlank() ||
                q.getOptionC().isBlank() || q.getOptionD().isBlank()) {
                throw new BadRequestException("Exam cannot be published: Question #" + q.getQuestionOrder() + " is missing one or more answer options.");
            }
            if (q.getCorrectOption() == null || !q.getCorrectOption().matches("^[ABCD]$")) {
                throw new BadRequestException("Exam cannot be published: Question #" + q.getQuestionOrder() + " does not have a valid correct answer choice.");
            }
        }

        long assignedCount = assignmentRepository.countByExamId(examId);
        if (assignedCount == 0) {
            throw new BadRequestException("Exam cannot be published: You must assign the exam to at least one class or student.");
        }

        if (exam.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Exam cannot be published: Exam end time is already in the past.");
        }

        exam.setStatus(ExamStatus.PUBLISHED);
        Exam published = examRepository.save(exam);
        return mapToExamResponse(published);
    }

    @Transactional
    public ExamResponse closeExam(Long examId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        exam.setStatus(ExamStatus.CLOSED);
        Exam closed = examRepository.save(exam);
        return mapToExamResponse(closed);
    }

    // =========================================================================
    // STUDENT: DISCOVERY, ATTEMPT, AND AUTO-SCORING
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ExamStudentResponse> getStudentExams(Long userId) {
        Student student = getStudentForUser(userId);
        List<Exam> assignedExams = examRepository.findExamsAssignedToStudent(student.getId());
        LocalDateTime now = LocalDateTime.now();

        List<ExamStudentResponse> result = new ArrayList<>();
        for (Exam exam : assignedExams) {
            if (exam.getStatus() == ExamStatus.DRAFT) {
                // Drafts are completely invisible to students
                continue;
            }

            Optional<ExamAttempt> attemptOpt = attemptRepository.findByExamIdAndStudentId(exam.getId(), student.getId());
            String studentStatus;
            Long attemptId = null;
            String attemptStatus = null;
            Integer score = null;
            BigDecimal percentage = null;
            Boolean passed = null;
            LocalDateTime submittedAt = null;

            if (attemptOpt.isPresent()) {
                ExamAttempt attempt = attemptOpt.get();
                attemptId = attempt.getId();
                attemptStatus = attempt.getStatus().name();
                score = attempt.getScore();
                percentage = attempt.getPercentage();
                passed = attempt.getPassed();
                submittedAt = attempt.getSubmittedAt();

                if (attempt.getStatus() == ExamAttemptStatus.SUBMITTED) {
                    studentStatus = "COMPLETED";
                } else if (attempt.getStatus() == ExamAttemptStatus.IN_PROGRESS) {
                    // Check if time has expired
                    long elapsedSeconds = Duration.between(attempt.getStartTime(), now).getSeconds();
                    long maxSeconds = exam.getDurationMinutes() * 60L;
                    if (elapsedSeconds > maxSeconds || now.isAfter(exam.getEndTime())) {
                        studentStatus = "COMPLETED"; // Expired
                    } else {
                        studentStatus = "IN_PROGRESS";
                    }
                } else {
                    studentStatus = "COMPLETED";
                }
            } else {
                if (exam.getStatus() == ExamStatus.CLOSED) {
                    studentStatus = "MISSED";
                } else if (now.isBefore(exam.getStartTime())) {
                    studentStatus = "UPCOMING";
                } else if (now.isAfter(exam.getEndTime())) {
                    studentStatus = "MISSED";
                } else {
                    studentStatus = "AVAILABLE";
                }
            }

            result.add(ExamStudentResponse.builder()
                    .id(exam.getId())
                    .title(exam.getTitle())
                    .description(exam.getDescription())
                    .subjectName(exam.getSubject().getName())
                    .teacherName(exam.getTeacher().getUser().getFullName())
                    .className(exam.getClassEntity() != null ? exam.getClassEntity().getClassName() : "Individual Enrollment")
                    .durationMinutes(exam.getDurationMinutes())
                    .startTime(exam.getStartTime())
                    .endTime(exam.getEndTime())
                    .totalMarks(exam.getTotalMarks())
                    .passingMarks(exam.getPassingMarks())
                    .questionCount((int) questionRepository.countByExamId(exam.getId()))
                    .instructions(exam.getInstructions())
                    .externalResourceUrl(exam.getExternalResourceUrl())
                    .studentExamStatus(studentStatus)
                    .attemptId(attemptId)
                    .attemptStatus(attemptStatus)
                    .score(score)
                    .percentage(percentage)
                    .passed(passed)
                    .submittedAt(submittedAt)
                    .build());
        }

        return result;
    }

    @Transactional
    public ExamTakeResponse startExam(Long examId, Long userId) {
        Student student = getStudentForUser(userId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Exam is not active or available for taking");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Exam has not started yet. Available at: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Exam availability period has ended");
        }

        if (!assignmentRepository.existsByExamIdAndStudentId(examId, student.getId())) {
            throw new ForbiddenException("You are not assigned to take this examination");
        }

        Optional<ExamAttempt> existingOpt = attemptRepository.findByExamIdAndStudentId(examId, student.getId());
        ExamAttempt attempt;

        if (existingOpt.isPresent()) {
            attempt = existingOpt.get();
            if (attempt.getStatus() == ExamAttemptStatus.SUBMITTED) {
                throw new BadRequestException("You have already submitted this examination");
            }
        } else {
            attempt = ExamAttempt.builder()
                    .exam(exam)
                    .student(student)
                    .startTime(now)
                    .status(ExamAttemptStatus.IN_PROGRESS)
                    .score(0)
                    .totalMarks(exam.getTotalMarks())
                    .percentage(BigDecimal.ZERO)
                    .build();
            attempt = attemptRepository.save(attempt);
        }

        // Calculate remaining seconds based on server start time
        long elapsedSeconds = Duration.between(attempt.getStartTime(), now).getSeconds();
        long maxSeconds = exam.getDurationMinutes() * 60L;
        long remainingSeconds = Math.max(0, maxSeconds - elapsedSeconds);

        // Fetch questions and previously saved answers if any
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        Map<Long, String> savedAnswers = attemptAnswerRepository.findByAttemptId(attempt.getId())
                .stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), ExamAttemptAnswer::getSelectedOption));

        // Sanitize questions: DO NOT leak correct answers or explanations!
        List<ExamTakeResponse.QuestionItem> sanitizedQuestions = questions.stream()
                .map(q -> ExamTakeResponse.QuestionItem.builder()
                        .id(q.getId())
                        .questionOrder(q.getQuestionOrder())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .marks(q.getMarks())
                        .savedAnswer(savedAnswers.get(q.getId()))
                        .build())
                .collect(Collectors.toList());

        return ExamTakeResponse.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .subjectName(exam.getSubject().getName())
                .teacherName(exam.getTeacher().getUser().getFullName())
                .durationMinutes(exam.getDurationMinutes())
                .remainingSeconds(remainingSeconds)
                .startTime(attempt.getStartTime())
                .endTime(exam.getEndTime())
                .totalMarks(exam.getTotalMarks())
                .questionCount(sanitizedQuestions.size())
                .instructions(exam.getInstructions())
                .externalResourceUrl(exam.getExternalResourceUrl())
                .questions(sanitizedQuestions)
                .build();
    }

    @Transactional
    public ExamResultResponse submitExam(Long examId, ExamSubmitRequest request, Long userId) {
        Student student = getStudentForUser(userId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        ExamAttempt attempt = attemptRepository.findByExamIdAndStudentId(examId, student.getId())
                .orElseThrow(() -> new BadRequestException("No active attempt found for this exam"));

        if (attempt.getStatus() == ExamAttemptStatus.SUBMITTED) {
            return buildResultResponse(attempt, exam);
        }

        LocalDateTime now = LocalDateTime.now();
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        Map<Long, ExamQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

        Map<Long, String> submittedAnswers = new HashMap<>();
        if (request != null && request.getAnswers() != null) {
            for (ExamSubmitRequest.AnswerItem item : request.getAnswers()) {
                if (item.getQuestionId() != null) {
                    submittedAnswers.put(item.getQuestionId(), item.getSelectedOption());
                }
            }
        }

        int totalScore = 0;
        int maxTotalMarks = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;

        for (ExamQuestion q : questions) {
            maxTotalMarks += q.getMarks();
            String selected = submittedAnswers.get(q.getId());

            boolean isCorrect = false;
            int marksAwarded = 0;

            if (selected == null || selected.isBlank()) {
                unansweredCount++;
            } else {
                selected = selected.trim().toUpperCase();
                if (q.getCorrectOption().equalsIgnoreCase(selected)) {
                    isCorrect = true;
                    marksAwarded = q.getMarks();
                    totalScore += marksAwarded;
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            }

            // Upsert attempt answer record
            Optional<ExamAttemptAnswer> answerOpt = attemptAnswerRepository.findByAttemptIdAndQuestionId(attempt.getId(), q.getId());
            ExamAttemptAnswer answer = answerOpt.orElseGet(() -> ExamAttemptAnswer.builder()
                    .attempt(attempt)
                    .question(q)
                    .build());

            answer.setSelectedOption(selected);
            answer.setCorrect(isCorrect);
            answer.setMarksAwarded(marksAwarded);
            attemptAnswerRepository.save(answer);
        }

        BigDecimal percentage = BigDecimal.ZERO;
        if (maxTotalMarks > 0) {
            percentage = BigDecimal.valueOf(totalScore)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(maxTotalMarks), 2, RoundingMode.HALF_UP);
        }

        Boolean passed = null;
        if (exam.getPassingMarks() != null) {
            passed = totalScore >= exam.getPassingMarks();
        }

        attempt.setScore(totalScore);
        attempt.setTotalMarks(maxTotalMarks);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        attempt.setStatus(ExamAttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(now);

        attemptRepository.save(attempt);

        return buildResultResponse(attempt, exam);
    }

    @Transactional(readOnly = true)
    public ExamResultResponse getStudentResult(Long examId, Long userId) {
        Student student = getStudentForUser(userId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        ExamAttempt attempt = attemptRepository.findByExamIdAndStudentId(examId, student.getId())
                .orElseThrow(() -> new BadRequestException("No submission recorded for this exam"));

        return buildResultResponse(attempt, exam);
    }

    // =========================================================================
    // TEACHER: RESULTS & ANALYTICS
    // =========================================================================

    @Transactional(readOnly = true)
    public ExamAnalyticsResponse getExamAnalytics(Long examId, Long userId) {
        Teacher teacher = getTeacherForUser(userId);
        Exam exam = findExamWithOwnership(examId, teacher);

        List<ExamAssignment> assignments = assignmentRepository.findByExamId(examId);
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderBySubmittedAtDesc(examId);
        Map<Long, ExamAttempt> attemptMap = attempts.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        List<ExamAnalyticsResponse.StudentSubmissionItem> submissions = new ArrayList<>();
        int submittedCount = 0;
        int passedCount = 0;
        int failedCount = 0;

        for (ExamAssignment assignment : assignments) {
            Student student = assignment.getStudent();
            ExamAttempt attempt = attemptMap.get(student.getId());

            String status = "NOT_ATTEMPTED";
            Integer score = null;
            BigDecimal percentage = null;
            Boolean passed = null;
            LocalDateTime submittedAt = null;
            Long attemptId = null;

            if (attempt != null) {
                attemptId = attempt.getId();
                status = attempt.getStatus().name();
                if (attempt.getStatus() == ExamAttemptStatus.SUBMITTED) {
                    submittedCount++;
                    score = attempt.getScore();
                    percentage = attempt.getPercentage();
                    passed = attempt.getPassed();
                    submittedAt = attempt.getSubmittedAt();
                    if (passed != null) {
                        if (passed) passedCount++;
                        else failedCount++;
                    }
                }
            }

            submissions.add(ExamAnalyticsResponse.StudentSubmissionItem.builder()
                    .attemptId(attemptId)
                    .studentId(student.getId())
                    .studentName(student.getUser().getFullName())
                    .studentIdNumber(student.getStudentIdNumber())
                    .className(exam.getClassEntity() != null ? exam.getClassEntity().getClassName() : "Assigned Cohort")
                    .score(score)
                    .totalMarks(exam.getTotalMarks())
                    .percentage(percentage)
                    .passed(passed)
                    .status(status)
                    .submittedAt(submittedAt)
                    .build());
        }

        int totalAssigned = assignments.size();
        BigDecimal completionRate = totalAssigned > 0
                ? BigDecimal.valueOf(submittedCount).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(totalAssigned), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Double averagePercentage = attemptRepository.calculateAveragePercentage(examId);
        Integer highestScore = attemptRepository.findHighestScore(examId);
        Integer lowestScore = attemptRepository.findLowestScore(examId);

        // Question level accuracy analytics
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        List<ExamAnalyticsResponse.QuestionAccuracyItem> questionAnalytics = new ArrayList<>();

        for (ExamQuestion q : questions) {
            long totalResponses = attemptAnswerRepository.countTotalAnswersByQuestionId(q.getId());
            long correctResponses = attemptAnswerRepository.countCorrectAnswersByQuestionId(q.getId());
            double accuracy = totalResponses > 0
                    ? Math.round((correctResponses * 100.0 / totalResponses) * 10.0) / 10.0
                    : 0.0;

            questionAnalytics.add(ExamAnalyticsResponse.QuestionAccuracyItem.builder()
                    .questionId(q.getId())
                    .questionOrder(q.getQuestionOrder())
                    .questionText(q.getQuestionText())
                    .correctOption(q.getCorrectOption())
                    .totalResponses((int) totalResponses)
                    .correctResponses((int) correctResponses)
                    .accuracyPercentage(accuracy)
                    .build());
        }

        return ExamAnalyticsResponse.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .totalAssigned(totalAssigned)
                .totalAttempted(attempts.size())
                .totalSubmitted(submittedCount)
                .totalNotAttempted(Math.max(0, totalAssigned - attempts.size()))
                .completionRate(completionRate)
                .averagePercentage(averagePercentage != null ? Math.round(averagePercentage * 10.0) / 10.0 : 0.0)
                .highestScore(highestScore != null ? highestScore : 0)
                .lowestScore(lowestScore != null ? lowestScore : 0)
                .totalMarks(exam.getTotalMarks())
                .passingMarks(exam.getPassingMarks())
                .passedCount(passedCount)
                .failedCount(failedCount)
                .submissions(submissions)
                .questionAnalytics(questionAnalytics)
                .build();
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private Teacher getTeacherForUser(Long userId) {
        return teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not an academic instructor"));
    }

    private Student getStudentForUser(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not an enrolled student"));
    }

    private Exam findExamWithOwnership(Long examId, Teacher teacher) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        if (!exam.getTeacher().getId().equals(teacher.getId())) {
            throw new ForbiddenException("You are not authorized to manage this examination (IDOR protection)");
        }

        return exam;
    }

    private void validateQuestionRequest(ExamQuestionRequest req) {
        if (req.getOptionA().isBlank() || req.getOptionB().isBlank() ||
            req.getOptionC().isBlank() || req.getOptionD().isBlank()) {
            throw new BadRequestException("All 4 answer options (A, B, C, D) must be non-empty");
        }
        if (req.getCorrectOption() == null || !req.getCorrectOption().toUpperCase().matches("^[ABCD]$")) {
            throw new BadRequestException("Correct answer choice must be exactly one of: A, B, C, or D");
        }
    }

    private void recalculateTotalMarks(Exam exam) {
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        int sum = questions.stream().mapToInt(ExamQuestion::getMarks).sum();
        exam.setTotalMarks(sum);
        examRepository.save(exam);
    }

    private void assignClassEnrollments(Exam exam, Long classId) {
        List<StudentEnrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, "ACTIVE");
        for (StudentEnrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            if (!assignmentRepository.existsByExamIdAndStudentId(exam.getId(), student.getId())) {
                assignmentRepository.save(ExamAssignment.builder()
                        .exam(exam)
                        .student(student)
                        .assignedAt(LocalDateTime.now())
                        .build());
            }
        }
    }

    private ExamResponse mapToExamResponse(Exam exam) {
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<Long> assignedStudentIds = assignmentRepository.findAssignedStudentIds(exam.getId());
        long submissionCount = attemptRepository.countByExamIdAndStatus(exam.getId(), ExamAttemptStatus.SUBMITTED);

        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .subjectId(exam.getSubject().getId())
                .subjectName(exam.getSubject().getName())
                .subjectCode(exam.getSubject().getSubjectCode())
                .teacherId(exam.getTeacher().getId())
                .teacherName(exam.getTeacher().getUser().getFullName())
                .classId(exam.getClassEntity() != null ? exam.getClassEntity().getId() : null)
                .className(exam.getClassEntity() != null ? exam.getClassEntity().getClassName() : null)
                .durationMinutes(exam.getDurationMinutes())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .status(exam.getStatus())
                .totalMarks(exam.getTotalMarks())
                .passingMarks(exam.getPassingMarks())
                .instructions(exam.getInstructions())
                .externalResourceUrl(exam.getExternalResourceUrl())
                .questionCount(questions.size())
                .assignedCount(assignedStudentIds.size())
                .submissionCount((int) submissionCount)
                .questions(questions.stream().map(this::mapToQuestionResponse).collect(Collectors.toList()))
                .assignedStudentIds(assignedStudentIds)
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }

    private ExamQuestionResponse mapToQuestionResponse(ExamQuestion q) {
        return ExamQuestionResponse.builder()
                .id(q.getId())
                .examId(q.getExam().getId())
                .questionText(q.getQuestionText())
                .questionOrder(q.getQuestionOrder())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .marks(q.getMarks())
                .explanation(q.getExplanation())
                .createdAt(q.getCreatedAt())
                .build();
    }

    private ExamResultResponse buildResultResponse(ExamAttempt attempt, Exam exam) {
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<ExamAttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attempt.getId());
        Map<Long, ExamAttemptAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        long timeSpent = attempt.getSubmittedAt() != null
                ? Duration.between(attempt.getStartTime(), attempt.getSubmittedAt()).getSeconds()
                : 0;

        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;

        List<ExamResultResponse.AnswerResultItem> items = new ArrayList<>();
        for (ExamQuestion q : questions) {
            ExamAttemptAnswer ans = answerMap.get(q.getId());
            String selected = ans != null ? ans.getSelectedOption() : null;
            boolean isCorrect = ans != null && ans.isCorrect();
            int awarded = ans != null ? ans.getMarksAwarded() : 0;

            if (selected == null || selected.isBlank()) {
                unansweredCount++;
            } else if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }

            items.add(ExamResultResponse.AnswerResultItem.builder()
                    .questionId(q.getId())
                    .questionOrder(q.getQuestionOrder())
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .selectedOption(selected)
                    .correctOption(q.getCorrectOption())
                    .isCorrect(isCorrect)
                    .marksAwarded(awarded)
                    .maxMarks(q.getMarks())
                    .explanation(q.getExplanation())
                    .build());
        }

        return ExamResultResponse.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .subjectName(exam.getSubject().getName())
                .studentName(attempt.getStudent().getUser().getFullName())
                .studentIdNumber(attempt.getStudent().getStudentIdNumber())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .passingMarks(exam.getPassingMarks())
                .startTime(attempt.getStartTime())
                .submittedAt(attempt.getSubmittedAt())
                .timeSpentSeconds(timeSpent)
                .totalQuestions(questions.size())
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .unansweredCount(unansweredCount)
                .answers(items)
                .build();
    }
}
