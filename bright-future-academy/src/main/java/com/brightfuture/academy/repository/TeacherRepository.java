package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);

    @Query("SELECT t FROM Teacher t JOIN t.user u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.employeeId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR t.status = :status)")
    Page<Teacher> findAllWithFilters(@Param("search") String search,
                                     @Param("status") String status,
                                     Pageable pageable);

    long countByStatus(String status);
}
