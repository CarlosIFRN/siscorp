package com.example.demo.dto;

import com.example.demo.model.Cliente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClienteResponseDTO(
        @NotNull Integer idCliente,
        @NotBlank @Size(max = 100) String nomeCliente,
        @NotBlank @Email @Size(max = 100) String emailCliente,
        @NotBlank @Size(max = 20) String telefoneCliente
) {
    public static ClienteResponseDTO de(Cliente cliente) {
        return new ClienteResponseDTO(
                cliente.getIdCliente(),
                cliente.getNomeCliente(),
                cliente.getEmailCliente(),
                cliente.getTelefoneCliente()
        );
    }
}
