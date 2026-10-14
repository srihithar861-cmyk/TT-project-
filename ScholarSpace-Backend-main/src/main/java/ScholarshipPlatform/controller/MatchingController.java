package ScholarshipPlatform.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ScholarshipPlatform.dto.ScholarshipMatchResponse;
import ScholarshipPlatform.service.MatchingService;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin(originPatterns = "*")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/{studentId}")
    public List<ScholarshipMatchResponse> getMatchingScholarships(
            @PathVariable Long studentId) {

        return matchingService.findEligibleScholarships(studentId);
    }
}