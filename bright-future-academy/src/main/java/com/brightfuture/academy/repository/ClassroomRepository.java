package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Classroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    boolean existsByRoomNumber(String roomNumber);

    @Query("SELECT c FROM Classroom c WHERE " +
           "(:search IS NULL OR LOWER(c.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR c.status = :status)")
    Page<Classroom> findAllWithFilters(@Param("search") String search,
                                       @Param("status") String status,
                                       Pageable pageable);
}
