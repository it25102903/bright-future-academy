package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ExamAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptAnswerRepository extends JpaRepository<ExamAttemptAnswer, Long> {

    List<ExamAttemptAnswer> findByAttemptId(Long attemptId);

    Optional<ExamAttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);

    @Query("SELECT COUNT(a) FROM ExamAttemptAnswer a WHERE a.question.id = :questionId AND a.isCorrect = true")
    long countCorrectAnswersByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT COUNT(a) FROM ExamAttemptAnswer a WHERE a.question.id = :questionId")
    long countTotalAnswersByQuestionId(@Param("questionId") Long questionId);
}
