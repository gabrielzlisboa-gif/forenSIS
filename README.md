# forenSIS (beta)

App para o exame pericial: fotografias e ditado no mesmo registro, enviados direto do celular de serviço para o Google Drive, com conferência de integridade (SHA-256), e um hub no computador para revisar e editar.

**Estado:** fase 2.1 em andamento (v0.4.1): abre sem internet, instalável, sessão mantida na recarga, arrastar texto avulso até a foto; primeiro teste de campo feito — tela do caso com as seções (tocar abre a página da seção) e os botões Câmera e Ditado; depois de cada foto a câmera desliga e a foto fica congelada em tela cheia para conferir e descrever (Descartar, Descrever, Nova foto); visualizador em tela cheia com zoom; transcrição com dicionário e contexto por seção; envio verificado ao Drive com `caso.json` e `transcricao.txt`. Usar apenas dados fictícios. A página da fase 0 continua em `diagnostico.html`.

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

| Fase | Conteúdo | Situação |
|---|---|---|
| 0 | Login, pastas de teste, envio com SHA-256, diagnóstico da câmera | feita |
| 1 | Câmera no app, fila sem sinal | feita |
| 2 | Ditado ligado à foto, seções, foto congelada, tela cheia, exclusão com lixeira do Drive | feita |
| 2.1 | **Uso em campo** (ver abaixo) | em andamento |
| 3 | Hub no computador (inclui vincular texto avulso a foto arrastando e soltando com o mouse, como no celular) | |
| 4 | **Fechamento e selagem** (ver abaixo) | |
| 5 | **Lançamento** (ver abaixo) | |

### 2.1 — Uso em campo
- ~~*Service worker* e instalação como aplicativo~~ — feito na v0.4.0: o app abre da cópia guardada no aparelho, mesmo sem internet; versão nova é baixada em segundo plano e só entra na próxima abertura (com aviso).
- ~~Renovação do login~~ — feito na v0.4.0: quando faltam menos de 20 min, ou ao reabrir o app, o toque em Câmera ou em abrir caso renova com a conta guardada. Nunca durante a captura.
- Teste de campo no Moto G100 (13/11, 15 min): luvas, segurar para ditar e pinça funcionam; câmera abre em 0,5 s em média (máx. 0,7 s); bateria cerca de 16 pontos por hora. Falta um exame completo. Medições em Configurações › Teste de campo.
- ~~Recarga acidental derrubava o login~~ — feito na v0.4.1: "puxar para atualizar" desativado e sessão mantida na recarga da mesma aba (até vencer).
- ~~Vincular texto avulso a uma foto~~ — feito na v0.4.1: na página da seção, arrastar a alça do texto até o cartão da foto (a lista rola sozinha nas bordas); "desvincular" e "Desfazer" para reverter.
- Se o login falhar no app instalado (janela do Google em modo aplicativo), usar o app pela aba do Chrome e avaliar o login por redirecionamento.
- ~~Cópia local (.zip em Downloads, sem senha) desligada por padrão~~ — feito na v0.3.2.

### 4 — Fechamento e selagem
- Pacote 7z com senha, verificação dos hashes e versão sanitizada.
- Selagem do caso: lista de hashes enviada ao e-mail institucional e/ou carimbo de tempo externo (RFC 3161), para provar data e integridade além do `caso.json`.
- Senha fora do código do script de fechamento.
- Se a cópia local continuar existindo, gerá-la com senha.

### 5 — Lançamento
- Endereço próprio para o app (domínio próprio), separado de `gabrielzlisboa-gif.github.io`, que é compartilhado com os outros projetos e dá acesso ao armazenamento local.
- Verificação em duas etapas obrigatória na conta Google usada.
- Validar com o DPT o uso de conta Google pessoal para as fotos e o envio do áudio do ditado ao Groq.
- Troca do escopo para a pasta real (`DPT`) e fim do limite de casos fictícios.

### Adiados (versão posterior)
- Escala métrica nas fotos e calibração no hub.
- Melhoria da sanitização e reescrita completa do script de fechamento.
