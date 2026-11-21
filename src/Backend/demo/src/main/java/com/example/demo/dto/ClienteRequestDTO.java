package com.example.demo.dto;

import com.example.demo.model.Cliente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequestDTO(
        @NotBlank @Size(max = 100) String nomeCliente,
        @NotBlank @Email @Size(max = 100) String emailCliente,
        @NotBlank @Size(max = 20) String telefoneCliente
) {
    public Cliente toEntity() {
        Cliente cliente = new Cliente();
        cliente.setNomeCliente(nomeCliente.trim());
        cliente.setEmailCliente(emailCliente.trim());
        cliente.setTelefoneCliente(telefoneCliente.trim());
        return cliente;
    }
}
