package com.example.demo.dto;

import com.example.demo.model.Cargo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(min = 8) String senha,
        @NotNull Cargo cargo,
        @Size(max = 20) String telefone,
        @Size(max = 255) String endereco
) {}
