import { SetMetadata } from '@nestjs/common';

export const ALLOW_PASSWORD_CHANGE_PENDING_KEY = 'allowPasswordChangePending';

/**
 * Permite usar a rota mesmo com a troca de senha pendente. Só faz sentido nas rotas
 * necessárias para concluir essa troca (trocar senha, ver o próprio perfil, sair).
 */
export const AllowPasswordChangePending = () => SetMetadata(ALLOW_PASSWORD_CHANGE_PENDING_KEY, true);
