package ScholarshipPlatform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import ScholarshipPlatform.dto.ScholarshipMatchResponse;
import ScholarshipPlatform.engine.ScholarshipMatchingEngine;
import ScholarshipPlatform.model.Scholarship;
import ScholarshipPlatform.model.Student;
import ScholarshipPlatform.repository.ScholarshipRepository;
import ScholarshipPlatform.repository.StudentRepository;

@Service
public class MatchingService {

    private final StudentRepository studentRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipMatchingEngine matchingEngine;

    public MatchingService(
            StudentRepository studentRepository,
            ScholarshipRepository scholarshipRepository,
            ScholarshipMatchingEngine matchingEngine) {

        this.studentRepository = studentRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.matchingEngine = matchingEngine;
    }

    public List<ScholarshipMatchResponse> findEligibleScholarships(
            Long studentId) {

        Student student = studentRepository
                .findById(studentId)
                .orElse(null);

        if (student == null) {
            return new ArrayList<>();
        }

        List<Scholarship> scholarships =
                scholarshipRepository.findAll();

        List<ScholarshipMatchResponse> eligibleScholarships =
                new ArrayList<>();

        for (Scholarship scholarship : scholarships) {

            int matchScore =
                    matchingEngine.calculateMatchScore(
                            student,
                            scholarship);

            /*
             * A scholarship is considered eligible only when
             * all mandatory criteria are satisfied.
             *
             * The score is calculated separately so that
             * eligible scholarships can be ranked later.
             */

            boolean cgpaMatch =
                    student.getCgpa() >= scholarship.getMinCgpa();

            boolean incomeMatch =
                    student.getAnnualIncome()
                            <= scholarship.getMaxIncome();

            boolean categoryMatch =
                    scholarship.getCategory()
                            .equalsIgnoreCase("Any")
                    || scholarship.getCategory()
                            .equalsIgnoreCase(student.getCategory());

            boolean genderMatch =
                    scholarship.getGender()
                            .equalsIgnoreCase("Any")
                    || scholarship.getGender()
                            .equalsIgnoreCase(student.getGender());

            boolean courseMatch =
                    scholarship.getCourse()
                            .equalsIgnoreCase("Any")
                    || scholarship.getCourse()
                            .equalsIgnoreCase(student.getCourse());

            boolean locationMatch =
                    scholarship.getLocation()
                            .equalsIgnoreCase("Any")
                    || student.getLocation()
                            .toLowerCase()
                            .contains(
                                    scholarship.getLocation()
                                            .toLowerCase());

            if (cgpaMatch
                    && incomeMatch
                    && categoryMatch
                    && genderMatch
                    && courseMatch
                    && locationMatch) {

                eligibleScholarships.add(
                        new ScholarshipMatchResponse(
                                scholarship,
                                matchScore));
            }
        }

        return eligibleScholarships;
    }
}