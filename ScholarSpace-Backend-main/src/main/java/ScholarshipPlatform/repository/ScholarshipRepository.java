package ScholarshipPlatform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ScholarshipPlatform.model.Scholarship;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {
}