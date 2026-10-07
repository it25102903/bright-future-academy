package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {

    List<ExamQuestion> findByExamIdOrderByQuestionOrderAsc(Long examId);

    long countByExamId(Long examId);

    void deleteByExamId(Long examId);
}
