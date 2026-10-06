package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserEmail(String email);

    Optional<Student> findByUserId(Long userId);

    Optional<Student> findByStudentIdNumber(String studentIdNumber);

    boolean existsByStudentIdNumber(String studentIdNumber);

    boolean existsByNicNumber(String nicNumber);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.studentIdNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Student> findAllWithFilters(@Param("search") String search,
                                     @Param("status") String status,
                                     Pageable pageable);

    @Query("SELECT s FROM Student s JOIN StudentEnrollment se ON se.student = s " +
           "WHERE se.classEntity.id = :classId AND se.status = 'ACTIVE'")
    List<Student> findByActiveEnrollmentClassId(@Param("classId") Long classId);

    long countByStatus(String status);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.status = 'ACTIVE'")
    long countActive();

    @Query("SELECT s FROM Student s JOIN StudentGuardian sg ON sg.student = s " +
           "WHERE sg.guardian.user.id = :parentUserId")
    List<Student> findByParentUserId(@Param("parentUserId") Long parentUserId);

    @Query("SELECT MAX(CAST(SUBSTRING(s.studentIdNumber, 10) AS int)) FROM Student s " +
           "WHERE s.studentIdNumber LIKE CONCAT('BFA-', :year, '-%')")
    Integer findMaxSequenceForYear(@Param("year") String year);
}
