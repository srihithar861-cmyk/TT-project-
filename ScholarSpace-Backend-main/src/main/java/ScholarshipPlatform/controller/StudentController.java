package ScholarshipPlatform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ScholarshipPlatform.model.Student;
import ScholarshipPlatform.repository.StudentRepository;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(originPatterns = "*")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // ==========================================
    // Get all students
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {

        return ResponseEntity.ok(
                studentRepository.findAll()
        );
    }

    // ==========================================
    // Get student by student ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @PathVariable Long id) {

        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ==========================================
    // Get student profile by user ID
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<Student> getStudentByUserId(
            @PathVariable Long userId) {

        return studentRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ==========================================
    // Add or update student profile
    // ==========================================

    @PostMapping
    public ResponseEntity<Student> addStudent(
            @RequestBody Student student) {

        if (student.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Student existingStudent =
                studentRepository.findByUserId(student.getUserId())
                        .orElse(null);

        if (existingStudent != null) {

            existingStudent.setAnnualIncome(
                    student.getAnnualIncome()
            );

            existingStudent.setCategory(
                    student.getCategory()
            );

            existingStudent.setCgpa(
                    student.getCgpa()
            );

            existingStudent.setCollege(
                    student.getCollege()
            );

            existingStudent.setCourse(
                    student.getCourse()
            );

            existingStudent.setGender(
                    student.getGender()
            );

            existingStudent.setLocation(
                    student.getLocation()
            );

            existingStudent.setYear(
                    student.getYear()
            );

            return ResponseEntity.ok(
                    studentRepository.save(existingStudent)
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentRepository.save(student));
    }

    // ==========================================
    // Update student by student ID
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student) {

        Student existingStudent =
                studentRepository.findById(id)
                        .orElse(null);

        if (existingStudent == null) {
            return ResponseEntity.notFound().build();
        }

        existingStudent.setAnnualIncome(
                student.getAnnualIncome()
        );

        existingStudent.setCategory(
                student.getCategory()
        );

        existingStudent.setCgpa(
                student.getCgpa()
        );

        existingStudent.setCollege(
                student.getCollege()
        );

        existingStudent.setCourse(
                student.getCourse()
        );

        existingStudent.setGender(
                student.getGender()
        );

        existingStudent.setLocation(
                student.getLocation()
        );

        existingStudent.setYear(
                student.getYear()
        );

        // We intentionally do NOT update userId here.
        // The student remains associated with the
        // original user.

        return ResponseEntity.ok(
                studentRepository.save(existingStudent)
        );
    }

    // ==========================================
    // Delete student
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable Long id) {

        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        studentRepository.deleteById(id);

        return ResponseEntity.ok(
                "Student deleted successfully"
        );
    }
}