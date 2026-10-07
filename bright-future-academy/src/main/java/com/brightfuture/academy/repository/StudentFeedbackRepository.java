package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.StudentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentFeedbackRepository extends JpaRepository<StudentFeedback, Long> {

    List<StudentFeedback> findByStudentUserIdOrderByCreatedAtDesc(Long studentUserId);

    @Query("SELECT sf FROM StudentFeedback sf WHERE sf.teacherUser.id = :teacherUserId OR sf.teacherUser IS NULL ORDER BY sf.createdAt DESC")
    List<StudentFeedback> findForTeacherOrderByCreatedAtDesc(@Param("teacherUserId") Long teacherUserId);
}
