package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ExamAttempt;
import com.brightfuture.academy.enums.ExamAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    Optional<ExamAttempt> findByExamIdAndStudentId(Long examId, Long studentId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    List<ExamAttempt> findByExamIdOrderBySubmittedAtDesc(Long examId);

    List<ExamAttempt> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<ExamAttempt> findByStudentIdAndStatus(Long studentId, ExamAttemptStatus status);

    long countByExamId(Long examId);

    long countByExamIdAndStatus(Long examId, ExamAttemptStatus status);

    @Query("SELECT AVG(ea.percentage) FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.status = 'SUBMITTED'")
    Double calculateAveragePercentage(@Param("examId") Long examId);

    @Query("SELECT MAX(ea.score) FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.status = 'SUBMITTED'")
    Integer findHighestScore(@Param("examId") Long examId);

    @Query("SELECT MIN(ea.score) FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.status = 'SUBMITTED'")
    Integer findLowestScore(@Param("examId") Long examId);
}
