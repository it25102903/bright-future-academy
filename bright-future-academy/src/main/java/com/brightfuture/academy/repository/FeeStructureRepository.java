package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByStatus(String status);
    List<FeeStructure> findByAcademicYearAndStatus(Integer academicYear, String status);
    List<FeeStructure> findByClassEntityIdAndStatus(Long classId, String status);
}
