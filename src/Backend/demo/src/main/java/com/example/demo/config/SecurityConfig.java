package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Define os usuários de teste e seus cargos
    @Bean
    public InMemoryUserDetailsManager usuarios() {

        PasswordEncoder encoder = passwordEncoder();

        UserDetails admin = User.builder()
                .username("admin")
                .password(encoder.encode("Admin123!"))
                .roles("ADMIN")
                .build();

        UserDetails funcionario = User.builder()
                .username("funcionario")
                .password(encoder.encode("Func123!"))
                .roles("FUNCIONARIO")
                .build();

        return new InMemoryUserDetailsManager(
                admin,
                funcionario
        );
    }

    // Define como as senhas serão criptografadas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Define as regras de acesso às rotas
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // O catálogo de serviços ativos é público
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/servicos/ativos/**"
                        ).permitAll()

                        // Consultar todos os serviços exige ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/servicos/empresa/**"
                        ).hasRole("ADMIN")

                        // Cadastrar serviços exige ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/servicos"
                        ).hasRole("ADMIN")

                        // Alterar serviços exige ADMIN
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/servicos/**"
                        ).hasRole("ADMIN")

                        // Desativar serviços exige ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/servicos/**"
                        ).hasRole("ADMIN")

                        // Qualquer outra rota exige autenticação
                        .anyRequest().authenticated()
                )

                // Ativa autenticação HTTP Basic
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}