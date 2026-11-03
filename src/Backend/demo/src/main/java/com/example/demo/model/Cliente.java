package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente", nullable = false, unique = true)
    private Integer idCliente;

    @Column(name = "nome_cliente", nullable = false)
    private String nomeCliente;

    @Column(name = "email_cliente", nullable = false)
    private String emailCliente;

    @Column(name = "telefone_cliente", nullable = false)
    private String telefoneCliente;

    public Cliente(){
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idClente) {
        this.idCliente = idClente;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getTelefoneCliente() {
        return telefoneCliente;
    }

    public void setTelefoneCliente(String telefoneCleinte) {
        this.telefoneCliente = telefoneCleinte;
    }
}
