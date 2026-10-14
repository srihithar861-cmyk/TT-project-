
package ScholarshipPlatform.engine;

import org.springframework.stereotype.Component;

import ScholarshipPlatform.model.Scholarship;
import ScholarshipPlatform.model.Student;

@Component
public class ScholarshipMatchingEngine {

    public int calculateMatchScore(
            Student student,
            Scholarship scholarship) {

        if (student == null || scholarship == null) {
            return 0;
        }

        int score = 0;
        int totalCriteria = 6;

        if (student.getCgpa() != null
                && student.getCgpa() >= scholarship.getMinCgpa()) {
            score++;
        }

        if (student.getAnnualIncome() != null
                && student.getAnnualIncome() <= scholarship.getMaxIncome()) {
            score++;
        }

        if (matches(scholarship.getCategory(), student.getCategory())) {
            score++;
        }

        if (matches(scholarship.getGender(), student.getGender())) {
            score++;
        }

        if (matches(scholarship.getCourse(), student.getCourse())) {
            score++;
        }

        if (matchesLocation(
                scholarship.getLocation(), student.getLocation())) {
            score++;
        }

        return (score * 100) / totalCriteria;
    }

    private boolean matches(String required, String actual) {
        return required == null
        || required.equalsIgnoreCase("Any")
        || (actual != null && required.equalsIgnoreCase(actual));
    }

    private boolean matchesLocation(String required, String actual) {
        return required == null
        || required.equalsIgnoreCase("Any")
        || (actual != null
        && actual.toLowerCase().contains(required.toLowerCase()));
}
}
