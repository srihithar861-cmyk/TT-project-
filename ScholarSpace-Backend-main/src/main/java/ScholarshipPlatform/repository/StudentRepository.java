package ScholarshipPlatform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ScholarshipPlatform.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);
}