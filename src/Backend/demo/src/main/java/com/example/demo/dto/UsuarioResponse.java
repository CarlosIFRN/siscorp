package com.example.demo.dto;

import com.example.demo.model.Cargo;
import com.example.demo.model.Usuario;

public record UsuarioResponse(
        Integer id, String nome, String email, Cargo cargo,
        String telefone, String endereco, boolean ativo
) {
    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(), usuario.getNomeUsuario(),
                usuario.getEmailUsuario(), usuario.getCargo(),
                usuario.getTelefone(), usuario.getEndereco(), usuario.isAtivo()
        );
    }
}
