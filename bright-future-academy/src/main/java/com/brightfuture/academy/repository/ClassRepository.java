package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ClassEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {

    @Query("SELECT c FROM ClassEntity c WHERE " +
           "(:search IS NULL OR LOWER(c.className) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.gradeLevel) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:academicYear IS NULL OR c.academicYear = :academicYear)")
    Page<ClassEntity> findAllWithFilters(@Param("search") String search,
                                         @Param("status") String status,
                                         @Param("academicYear") Integer academicYear,
                                         Pageable pageable);

    List<ClassEntity> findByAcademicYearAndStatus(Integer academicYear, String status);

    boolean existsByClassNameAndAcademicYear(String className, Integer academicYear);

    long countByStatus(String status);
}
