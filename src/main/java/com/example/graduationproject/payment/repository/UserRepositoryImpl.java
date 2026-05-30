package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.util.List;
import java.util.Optional;

public class UserRepositoryImpl implements UserRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    @Lazy
    private RoleRepository roleRepository;

    @Override
    public Page<User> searchAdminUsers(String keyword, UserStatus status, RoleName roleName, Pageable pageable) {
        String roleId = roleRepository.findByName(roleName)
                .map(Role::getId)
                .orElse("");

        Query query = new Query();
        Criteria criteria = Criteria.where("roles").is(roleId);
        if (status != null) {
            criteria.and("status").is(status);
        }
        if (keyword != null && !keyword.isBlank()) {
            criteria.orOperator(
                Criteria.where("fullName").regex(keyword, "i"),
                Criteria.where("email").regex(keyword, "i"),
                Criteria.where("phoneNumber").regex(keyword, "i")
            );
        }
        query.addCriteria(criteria);
        
        long total = mongoTemplate.count(query, User.class);
        query.with(pageable);
        List<User> list = mongoTemplate.find(query, User.class);
        return new PageImpl<>(list, pageable, total);
    }

    @Override
    public Optional<User> findAdminUserById(String id, RoleName roleName) {
        String roleId = roleRepository.findByName(roleName)
                .map(Role::getId)
                .orElse("");

        Query query = new Query();
        query.addCriteria(Criteria.where("id").is(id).and("roles").is(roleId));
        return Optional.ofNullable(mongoTemplate.findOne(query, User.class));
    }
}
