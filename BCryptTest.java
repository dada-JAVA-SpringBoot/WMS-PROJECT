import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = "$2a$12$YSNbpfnUMByiNEjxyoqVn.Y4VXHb.Y5J9qYLYCOLQj.FHjVoWXREe";
        String password = "Admin@123";
        boolean result = encoder.matches(password, hash);
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("Matches: " + result);
    }
}
