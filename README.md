# forenSIS (beta)

App para o exame pericial: fotografias e ditado no mesmo registro, enviados direto do celular de serviço para o Google Drive, com conferência de integridade (SHA-256), e um hub no computador para revisar e editar.

**Estado:** fase 2 — captura com câmera no app (foco por toque, exposição, disparo com espera), ditado ligado à foto, transcrição com dicionário e contexto por seção, envio verificado ao Drive com `caso.json` e `transcricao.txt`. Usar apenas dados fictícios. A página da fase 0 continua em `diagnostico.html`.

## Isolamento do beta

- Endereço próprio; o app de ditado atual (`transcricao-forense`) não é alterado.
- Permissão restrita do Drive (`drive.file`): o app só enxerga as pastas e arquivos que ele mesmo criou. Ele cria `DPT_BETA/Morto/2026/` e não consegue ver nem alterar `DPT/`.
- Casos fictícios numerados de `2026 9000` a `2026 9999`.

## Configuração do Google Cloud (uma vez)

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto chamado `forenSIS`.
2. Em **APIs e serviços → Biblioteca**, ative a **Google Drive API**.
3. Em **Google Auth Platform** (tela de consentimento OAuth):
   - **Branding:** nome do app `forenSIS` e seu e-mail de suporte.
   - **Público:** tipo **Externo**, status **Em teste**; em **Usuários de teste**, adicione o seu e-mail.
   - **Acesso a dados:** adicione o escopo `.../auth/drive.file`.
4. Em **Clientes**, crie um cliente do tipo **Aplicativo da Web**:
   - **Origens JavaScript autorizadas:** `https://gabrielzlisboa-gif.github.io`
   - Não é preciso URI de redirecionamento.
5. Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`) e cole no passo 1 do app. O ID não é secreto; não crie nem use "chave secreta do cliente".

## Fases

| Fase | Conteúdo |
|---|---|
| 0 | Login, pastas de teste, envio com SHA-256, diagnóstico da câmera |
| 1 | Câmera no app, fila sem sinal, cópia em Downloads |
| 2 | Ditado ligado à foto, seções |
| 3 | Hub no computador |
| 4 | Fechamento: 7z, verificação, sanitizado |
| 5 | Lançamento na pasta real |
