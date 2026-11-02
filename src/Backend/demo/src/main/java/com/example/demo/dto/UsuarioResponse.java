package com.example.demo.dto;

import com.example.demo.model.Usuario;

public record UsuarioResponse(
        Integer id, String nome, String email, String telefone, boolean ativo
) {
    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNomeUsuario(),
                usuario.getEmailUsuario(),
                usuario.getTelefone(),
                usuario.isAtivo()
        );
    }
}
