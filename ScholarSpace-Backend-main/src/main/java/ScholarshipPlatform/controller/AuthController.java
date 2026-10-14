package ScholarshipPlatform.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ScholarshipPlatform.model.User;
import ScholarshipPlatform.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // Check whether email is already registered
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Email already registered"
                    ));
        }

        // Encrypt the password before saving
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        // Set default role
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        }

        // Save user to database
        User savedUser = userRepository.save(user);

        // Return user details without password
        return ResponseEntity.ok(
                Map.of(
                        "id", savedUser.getId(),
                        "name", savedUser.getName(),
                        "email", savedUser.getEmail(),
                        "role", savedUser.getRole()
                )
        );
    }
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody User loginRequest) {

    User user = userRepository
            .findByEmail(loginRequest.getEmail())
            .orElse(null);

    if (user == null) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "Invalid email or password"
                ));
    }

    if (!passwordEncoder.matches(
            loginRequest.getPassword(),
            user.getPassword())) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "Invalid email or password"
                ));
    }

    return ResponseEntity.ok(
            Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
            )
    );
}
}
