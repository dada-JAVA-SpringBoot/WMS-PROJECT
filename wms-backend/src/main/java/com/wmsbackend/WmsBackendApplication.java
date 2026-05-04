package com.wmsbackend;

import com.wmsbackend.entity.ProductCategory;
import com.wmsbackend.entity.ProductUnit;
import com.wmsbackend.repository.ProductCategoryRepository;
import com.wmsbackend.repository.ProductUnitRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class WmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WmsBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner seedCategories(ProductCategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() > 0) {
                return;
            }

            createCategory(categoryRepository, "CAT-SUA", "Sữa & đồ uống dinh dưỡng", "Sữa tươi, sữa hộp, đồ uống dinh dưỡng");
            createCategory(categoryRepository, "CAT-GIAVI", "Gia vị & thực phẩm chế biến", "Nước mắm, gia vị, đồ ăn chế biến");
            createCategory(categoryRepository, "CAT-DT", "Điện tử", "Smartphone, TV, thiết bị điện tử");
            createCategory(categoryRepository, "CAT-TUOI", "Thịt, trứng & hàng tươi", "Hàng tươi, thịt, trứng, thực phẩm lạnh");
            createCategory(categoryRepository, "CAT-KHO", "Mì & đồ khô", "Mì gói, thực phẩm khô, nguyên liệu đóng gói");
            createCategory(categoryRepository, "CAT-DH", "Đồ hộp & hải sản", "Đồ hộp, cá ngừ, thực phẩm đóng hộp");
        };
    }

    @Bean
    CommandLineRunner seedUnits(ProductUnitRepository unitRepository) {
        return args -> {
            if (unitRepository.count() > 0) {
                return;
            }

            createUnit(unitRepository, "UNIT-HOP", "Hộp", "Đơn vị đóng gói cơ bản");
            createUnit(unitRepository, "UNIT-CHAI", "Chai", "Đơn vị cho hàng dạng lỏng");
            createUnit(unitRepository, "UNIT-CAI", "Cái", "Đơn vị đếm theo chiếc");
            createUnit(unitRepository, "UNIT-KHAY", "Khay", "Đơn vị cho khay/hộp khay");
            createUnit(unitRepository, "UNIT-LOC", "Lốc", "Đơn vị pack nhỏ");
            createUnit(unitRepository, "UNIT-THUNG", "Thùng", "Đơn vị kiện lớn");
            createUnit(unitRepository, "UNIT-VI", "Vỉ", "Đơn vị dạng vỉ");
            createUnit(unitRepository, "UNIT-GOI", "Gói", "Đơn vị bao gói");
            createUnit(unitRepository, "UNIT-KG", "Kg", "Đơn vị khối lượng");
            createUnit(unitRepository, "UNIT-PALLET", "Pallet", "Đơn vị kiện pallet");
        };
    }

    private void createCategory(ProductCategoryRepository repository, String code, String name, String description) {
        ProductCategory category = new ProductCategory();
        category.setCategoryCode(code);
        category.setName(name);
        category.setDescription(description);
        category.setIsActive(true);
        repository.save(category);
    }

    private void createUnit(ProductUnitRepository repository, String code, String name, String description) {
        ProductUnit unit = new ProductUnit();
        unit.setUnitCode(code);
        unit.setName(name);
        unit.setDescription(description);
        unit.setIsActive(true);
        repository.save(unit);
    }

}
