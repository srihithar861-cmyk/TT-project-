package ScholarshipPlatform.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ScholarshipPlatform.model.Scholarship;
import ScholarshipPlatform.repository.ScholarshipRepository;

@RestController
@RequestMapping("/api/scholarships")
@CrossOrigin(originPatterns = "*")
public class ScholarshipController {

    private final ScholarshipRepository scholarshipRepository;

    public ScholarshipController(ScholarshipRepository scholarshipRepository) {
        this.scholarshipRepository = scholarshipRepository;
    }

    @GetMapping
    public List<Scholarship> getAllScholarships() {
        return scholarshipRepository.findAll();
    }

    @GetMapping("/{id}")
    public Scholarship getScholarshipById(@PathVariable Long id) {
        return scholarshipRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Scholarship addScholarship(@RequestBody Scholarship scholarship) {
        return scholarshipRepository.save(scholarship);
    }

    @PutMapping("/{id}")
    public Scholarship updateScholarship(
            @PathVariable Long id,
            @RequestBody Scholarship scholarship) {

        Scholarship existing = scholarshipRepository
                .findById(id)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setName(scholarship.getName());
        existing.setProvider(scholarship.getProvider());
        existing.setDescription(scholarship.getDescription());
        existing.setMinCgpa(scholarship.getMinCgpa());
        existing.setMaxIncome(scholarship.getMaxIncome());
        existing.setCategory(scholarship.getCategory());
        existing.setGender(scholarship.getGender());
        existing.setLocation(scholarship.getLocation());
        existing.setCourse(scholarship.getCourse());
        existing.setDeadline(scholarship.getDeadline());

        return scholarshipRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteScholarship(@PathVariable Long id) {

        scholarshipRepository.deleteById(id);

        return "Scholarship deleted successfully";
    }
}