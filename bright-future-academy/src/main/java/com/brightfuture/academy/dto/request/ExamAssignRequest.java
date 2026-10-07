package com.brightfuture.academy.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamAssignRequest {

    private Long classId;
    private List<Long> studentIds;
}
