package com.example.demo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "usuarios")
public class Usuario {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_usuario")
private Integer idUsuario;

@Column(name = "nome_usuario", nullable = false, length = 100)
private String nomeUsuario;

@Column(name = "email_usuario", nullable = false, unique = true, length = 100)
private String emailUsuario;

@Column(name = "senha_usuario", nullable = false)
private String senhaUsuario;

@Enumerated(EnumType.STRING)
@Column(name = "cargo", length = 30, nullable = false)
private Cargo cargo;

@Column(name = "telefone_usuario", length = 20)
private String telefone;

public Usuario() {
}

public Integer getIdUsuario() {
    return idUsuario;
}

public void setIdUsuario(Integer idUsuario) {
    this.idUsuario = idUsuario;
}

public String getNomeUsuario() {
    return nomeUsuario;
}

public void setNomeUsuario(String nomeUsuario) {
    this.nomeUsuario = nomeUsuario;
}

public String getEmailUsuario() {
    return emailUsuario;
}

public void setEmailUsuario(String emailUsuario) {
    this.emailUsuario = emailUsuario;
}

public String getSenhaUsuario() {
    return senhaUsuario;
}

public void setSenhaUsuario(String senhaUsuario) {
    this.senhaUsuario = senhaUsuario;
}

public Cargo getCargo() {
    return cargo;
}

public void setCargo(Cargo cargo) {
    this.cargo = cargo;
}

public String getTelefone() {
    return telefone;
}

public void setTelefone(String telefone) {
    this.telefone = telefone;
}
}
