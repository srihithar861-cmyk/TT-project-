package ScholarshipPlatform.dto;

import ScholarshipPlatform.model.Scholarship;

public class ScholarshipMatchResponse {

    private Scholarship scholarship;
    private int matchScore;

    public ScholarshipMatchResponse() {
    }

    public ScholarshipMatchResponse(Scholarship scholarship, int matchScore) {
        this.scholarship = scholarship;
        this.matchScore = matchScore;
    }

    public Scholarship getScholarship() {
        return scholarship;
    }

    public void setScholarship(Scholarship scholarship) {
        this.scholarship = scholarship;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }
}