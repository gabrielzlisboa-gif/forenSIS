# forenSIS (beta)

App para o exame pericial: fotografias e ditado no mesmo registro, enviados direto do celular de serviço para o Google Drive, com conferência de integridade (SHA-256), e um hub no computador para revisar e editar.

**Estado:** fase 4 — fechamento e sanitizador no hub (v0.3). App do celular v0.4.3.

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
| 2.1 | **Uso em campo** (ver abaixo) | feita |
| 3 | **Hub no computador** (ver abaixo) | v1 publicada |
| 4 | **Fechamento e selagem** (ver abaixo) | fechamento e sanitizador feitos; falta a selagem |
| 5 | **Lançamento** (ver abaixo) | |

### 2.1 — Uso em campo
- ~~*Service worker* e instalação como aplicativo~~ — feito na v0.4.0: o app abre da cópia guardada no aparelho, mesmo sem internet; versão nova é baixada em segundo plano e só entra na próxima abertura (com aviso).
- ~~Renovação do login~~ — feito na v0.4.0: quando faltam menos de 20 min, ou ao reabrir o app, o toque em Câmera ou em abrir caso renova com a conta guardada. Nunca durante a captura.
- Teste de campo no Moto G100 (13/11, 15 min): luvas, segurar para ditar e pinça funcionam; câmera abre em 0,5 s em média (máx. 0,7 s); bateria cerca de 16 pontos por hora. Falta um exame completo. Medições em Configurações › Teste de campo.
- ~~Recarga acidental derrubava o login~~ — feito na v0.4.1: "puxar para atualizar" desativado e sessão mantida na recarga da mesma aba (até vencer).
- ~~Vincular texto avulso a uma foto~~ — feito na v0.4.1: na página da seção, arrastar a alça do texto até o cartão da foto (a lista rola sozinha nas bordas); "desvincular" e "Desfazer" para reverter.
- Se o login falhar no app instalado (janela do Google em modo aplicativo), usar o app pela aba do Chrome e avaliar o login por redirecionamento.
- ~~Cópia local (.zip em Downloads, sem senha) desligada por padrão~~ — feito na v0.3.2.

### 3 — Hub no computador (`hub.html`)
- Abre no Chrome do computador, com a mesma conta e o mesmo ID de cliente do celular; lê os casos de `DPT_BETA` direto do Drive.
- **Sem conflito com o celular:** o celular grava `caso.json`; o hub grava só `hub.json` (correções de texto, vínculos, seção, legendas, edições). A tela mostra `caso.json` com `hub.json` por cima. O texto original do celular continua no `caso.json` e pode ser restaurado ("voltar ao do celular").
- Fotos por seção (numeração do anexo: ordem das seções, depois ordem do exame), filtros, hash conferido com o do Drive.
- Corrigir descrições; arrastar e soltar texto sem foto até a miniatura (ou para "sem foto"); legenda por foto; trocar seção (as descrições acompanham).
- **Protótipo do laudo:** concatenador que junta as descrições em texto único, na ordem das seções e do exame, com maiúscula inicial, ponto final e "(foto N)"; copiar ou baixar .txt.
- **Anotações:** seta, círculo, texto e recorte; a cópia vai para `Editadas/` com hash conferido; o original nunca muda; as marcações ficam guardadas para editar de novo.
- **Laudo clicável:** clicar num trecho do protótipo destaca a descrição (e, de leve, as outras da mesma foto) e abre a foto ao lado, em 1/3 ou metade da tela, na versão anotada ou original.
- **Anexo para o Word:** cada página vira uma imagem JPEG a 300 dpi do tamanho da área útil (padrão 16 × 24,7 cm), com 6, 4, 2 ou 1 foto e espaço fixo para legenda de até duas linhas; copiar e colar no Word, baixar .jpg ou todas em .zip, ou imprimir/PDF. A última página termina na última linha usada. Só entram as fotos escolhidas (na janela do anexo ou na caixa "Vai para o anexo do laudo" da foto); a numeração e o "(foto N)" do laudo seguem só as escolhidas, e a escolha fica salva no `hub.json`.
- Próximos: ditado pelo microfone do computador, anexo em formato de documento, escala métrica.

### 4 — Fechamento e selagem (hub, "Fechar caso")
- ~~Fechar e trancar o caso no hub~~ — feito no hub v0.3: baixa todos os arquivos do caso do Drive e confere cada hash; monta `laudo_pericial.7z` (7-Zip, AES-256, nomes cifrados) com `Originais/`, `Editadas/`, `caso.json`, `hub.json`, `transcricao.txt`, o laudo final completo, `laudo_prototipo.txt` e `SHA256SUMS.txt`; testa com a senha, extrai e confere cada arquivo; envia (envio retomável) e confere o hash no Drive; marca a pasta como fechada e só então manda os soltos para a lixeira do Drive. Na pasta ficam só o `.7z` e o `_sanitizado.docx`. Se algo falhar antes do fim, nada é apagado e o que a tentativa enviou vai para a lixeira.
- A senha é digitada duas vezes na hora e não é gravada em lugar nenhum (nem no código).
- Foto com hash divergente ou sem hash bloqueia o fechamento.
- O celular (v0.4.3) para de enviar para um caso fechado e avisa; o que for feito nele fica só no aparelho.
- ~~Sanitizador~~ — no hub ("Sanitizar laudo" e dentro do fechamento), com prévia: mesma regra do script (de "QUESITOS" em diante, sem preâmbulo e descrição do fato, sem tabelas pequenas e imagens, nome do periciando por [VÍTIMA]); além disso, tabelas dentro das partes removidas saem junto, as imagens saem de dentro do arquivo, o nome é trocado também em cabeçalho, rodapé, notas e comentários (sem diferenciar maiúsculas), o título/assunto do arquivo ficam em branco, e há "Outros termos" trocados por [OCULTO]. Só `.docx` (o `.doc` antigo precisa ser salvo como `.docx` no Word).
- Pendente: selagem (lista de hashes ao e-mail institucional e/ou carimbo de tempo RFC 3161); melhoria da sanitização (outros nomes, CPF, endereços); reabrir caso fechado.
- 7-Zip no navegador: `vendor/7z-wasm-1.2.0` (7-Zip 24.09, licença GNU LGPL + restrição unRAR, ver `License.txt`), servido pelo próprio site.

### 5 — Lançamento
- Endereço próprio para o app (domínio próprio), separado de `gabrielzlisboa-gif.github.io`, que é compartilhado com os outros projetos e dá acesso ao armazenamento local.
- Verificação em duas etapas obrigatória na conta Google usada.
- Validar com o DPT o uso de conta Google pessoal para as fotos e o envio do áudio do ditado ao Groq.
- Troca do escopo para a pasta real (`DPT`) e fim do limite de casos fictícios.

### Adiados (versão posterior)
- Escala métrica nas fotos e calibração no hub.
- Melhoria da sanitização e reescrita completa do script de fechamento.
