package com.example.demo.dto;

import com.example.demo.model.Usuario;
import com.example.demo.model.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioResponseDTO(
        @NotNull Integer id,
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 20) String telefone,
        boolean ativo,
        TipoUsuario tipoUsuario,
        Integer idEmpresa
) {
    public static UsuarioResponseDTO de(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getIdUsuario(),
                usuario.getNomeUsuario(),
                usuario.getEmailUsuario(),
                usuario.getTelefone(),
                usuario.isAtivo(),
                usuario.getTipoUsuario(),
                usuario.getEmpresa() == null ? null : usuario.getEmpresa().getIdEmpresa()
        );
    }
}
