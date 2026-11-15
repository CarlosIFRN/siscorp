package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Usuario")
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;

    @Column(nullable = false)
    private String nomeUsuario;

    @Column(nullable = false)
    private String emailUsuario;

    @Column(nullable = false)
    private String senhaHash;

    @Column(nullable = false)
    private String telefone;

    private boolean ativo = true;

    @Enumerated(EnumType.STRING)
    private TipoUsuario tipoUsuario;

    public Usuario() {}

}
