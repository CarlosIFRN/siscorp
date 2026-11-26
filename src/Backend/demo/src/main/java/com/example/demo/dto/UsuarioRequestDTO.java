package com.example.demo.dto;

import com.example.demo.model.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;

public record UsuarioRequestDTO(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank(groups = Criacao.class) @Size(min = 8) String senha,
        @NotBlank @Size(max = 20) String telefone,
        TipoUsuario tipoUsuario,
        @NotNull(groups = Criacao.class) Integer idEmpresa
) {
    public interface Criacao extends Default {}

    public UsuarioRequestDTO(String nome, String email, String senha, String telefone, TipoUsuario tipoUsuario) {
        this(nome, email, senha, telefone, tipoUsuario, null);
    }
}
