package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ParentFeedback;
import com.brightfuture.academy.enums.FeedbackAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentFeedbackRepository extends JpaRepository<ParentFeedback, Long> {

    List<ParentFeedback> findByParentUserIdOrderByCreatedAtDesc(Long parentUserId);

    @Query("SELECT pf FROM ParentFeedback pf WHERE pf.targetAudience IN (:audiences) ORDER BY pf.createdAt DESC")
    List<ParentFeedback> findByTargetAudienceInOrderByCreatedAtDesc(@Param("audiences") List<FeedbackAudience> audiences);
}
