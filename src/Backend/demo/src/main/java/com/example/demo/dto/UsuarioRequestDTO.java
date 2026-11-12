package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;

public record UsuarioRequestDTO(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank(groups = Criacao.class) @Size(min = 8) String senha,
        @Size(max = 20) String telefone
) {
    public interface Criacao extends Default {}
}
