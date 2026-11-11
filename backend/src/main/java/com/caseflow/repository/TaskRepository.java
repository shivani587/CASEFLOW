package com.caseflow.repository;

import com.caseflow.entity.Task;
import com.caseflow.entity.enums.PriorityLevel;
import com.caseflow.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedAdvocateIdOrderByDueDateAsc(Long advocateId);
    List<Task> findByLegalCaseIdOrderByDueDateAsc(Long caseId);
    List<Task> findByAssignedAdvocateIdAndStatusNotOrderByDueDateAsc(Long advocateId, TaskStatus excludedStatus);
    List<Task> findByAssignedAdvocateIdAndPriorityInAndStatusNotOrderByDueDateAsc(
            Long advocateId, List<PriorityLevel> priorities, TaskStatus excludedStatus);
    List<Task> findByDueDateBeforeAndStatusNotIn(LocalDate date, List<TaskStatus> statuses);
}
