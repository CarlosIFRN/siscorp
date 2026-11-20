import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Não foi possível conectar ao Spring Boot. Verifique se a API está em execução.';
    if (error.status === 401) return 'A API exige autenticação para esta operação. O frontend ainda não envia credenciais.';
    if (error.status === 403) return 'A API negou permissão para esta operação.';
    if (error.status === 404) return 'Registro não encontrado no servidor.';
    if (error.status === 409) return 'Já existe um registro com estes dados ou há conflito com outro registro.';
    if (error.status === 400) return 'Dados inválidos. Confira os campos e tente novamente.';
  }
  return fallback;
}
