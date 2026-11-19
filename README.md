# forenSIS (beta)

App para o exame pericial: fotos e ditado no mesmo registro, enviados direto do celular de serviço para o Google Drive com conferência de integridade (SHA-256), e um hub no computador para revisar, escrever o laudo e fechar o caso.

**Estado:** app do celular v0.4.6 · hub v0.6.4. Fases 0 a 4 feitas; fase 5 por fazer.

## Isolamento do beta

- Endereço próprio; o app de ditado atual (`transcricao-forense`) não é alterado.
- Permissão restrita do Drive (`drive.file`): o app só enxerga o que ele mesmo criou (`DPT_BETA/Morto/2026/…`) e não consegue ver nem alterar `DPT/`.
- Só casos fictícios, de `2026 9000` a `2026 9999`.

## Segurança

- **Drive:** escopo `drive.file` — o app só alcança o que ele mesmo criou. Mantido no lançamento (ver fase 5).
- **Conta Google:** verificação em duas etapas.
- **Caso fechado:** `.7z` com AES-256 e nomes cifrados; senha de no mínimo 8 caracteres, nunca gravada.
- **Política de segurança de conteúdo (CSP)** nas duas páginas: só roda o script do próprio app (conferido pelo hash), o login do Google e arquivos do site; a página só conversa com o Drive, o login do Google e o Groq (o hub, sem o Groq). Bloqueia script injetado e envio de dados para qualquer outro endereço. **Depois de editar o `<script>` de `index.html` ou `hub.html`, rode `python3 tools/csp.py`**: sem isso a página não abre (os testes acusam).
- **Sem dependências de terceiros em tempo de execução** além do login do Google: fontes (Inter e JetBrains Mono, licença OFL) e 7-Zip servidos pelo próprio site.
- **Ditado:** o áudio vai ao Groq; não contém dados pessoais.
- Decisões do beta (uso pessoal): endereço `github.io` compartilhado com o `transcricao-forense` e repositório público mantidos; sem PIN próprio no celular (vale o bloqueio do Android).

## Configuração do Google Cloud (uma vez)

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto chamado `forenSIS`.
2. Em **APIs e serviços → Biblioteca**, ative a **Google Drive API**.
3. Em **Google Auth Platform** (tela de consentimento OAuth):
   - **Branding:** nome do app `forenSIS` e seu e-mail de suporte.
   - **Público:** tipo **Externo**, status **Em teste**; em **Usuários de teste**, adicione o seu e-mail.
   - **Acesso a dados:** adicione o escopo `.../auth/drive.file`.
4. Em **Clientes**, crie um cliente do tipo **Aplicativo da Web**, com a origem `https://gabrielzlisboa-gif.github.io` (sem URI de redirecionamento).
5. Cole o **ID do cliente** (termina em `.apps.googleusercontent.com`) nas configurações do app. O ID não é secreto; não use "chave secreta do cliente".

## Celular (`index.html`)

- Câmera no próprio app (resolução máxima do sensor), foto congelada para conferir antes de enviar, tela cheia com zoom.
- Segurar para ditar; o ditado (Groq Whisper) fica ligado à foto ou solto na seção. Texto solto se arrasta até uma foto.
- Fila sem sinal: tudo fica no aparelho até subir e ter o hash conferido no Drive. Hash divergente avisa e oferece "Reenviar".
- Exclusão de foto já enviada: vai para a lixeira do Drive e fica registrada no `caso.json`.
- Instalável (service worker): abre sem internet; versão nova entra na próxima abertura. Login renovado num toque em Câmera ou ao abrir caso, nunca durante a captura.
- Caso fechado no computador: o celular para de enviar e avisa; caso reaberto: volta a enviar. Pasta do caso apagada no Drive: o que falta enviar vai para uma pasta nova (nada já enviado é reenviado).
- Cópia local em .zip desligada por padrão.

## Hub no computador (`hub.html`)

- Mesmo endereço, mesma conta e mesmo ID de cliente; lê os casos de `DPT_BETA`.
- **Sem conflito com o celular:** o celular grava `caso.json`; o hub grava só `hub.json` por cima (correções, vínculos, seções, legendas, anotações, laudo). O texto ditado continua no `caso.json` e pode ser restaurado.
- **Fotos:** por seção, numeradas na ordem do anexo; filtros; hash conferido; corrigir descrições, arrastar texto até a foto, legenda, troca de seção.
- **Anotações:** seta, círculo, texto e recorte, móveis e editáveis; a cópia vai para `Editadas/` com hash conferido e o original não muda.
- **Laudo (editor):** começa montado das descrições e vira o texto final do caso. Trechos ligados a descrições (editar no laudo edita a descrição); texto livre que pode ser vinculado a uma ou mais fotos; "(foto N)" é marca que se renumera com o anexo e pode ser escondida; trecho apagado fica "fora do laudo" na aba Fotos; ditado novo aparece na faixa "não estão no texto". Painel de fotos sempre aberto ao lado.
- **Anexo para o Word:** páginas-imagem JPEG a 300 dpi (padrão 16 × 24,7 cm), 6, 4, 2 ou 1 foto com legenda; só as fotos escolhidas; copiar, baixar .jpg/.zip ou imprimir.
- **Sanitizador de .docx:** mesma regra do script (de "QUESITOS" em diante, sem preâmbulo e descrição do fato, nome do periciando por [VÍTIMA]), mais cabeçalho, rodapé, notas, comentários, metadados, imagens e "Outros termos" por [OCULTO]. Só `.docx`.

## Fechar, reabrir

- **Fechar e trancar:** confere o hash de cada arquivo; monta `laudo_pericial.7z` (7-Zip, AES-256, nomes cifrados, sem compressão — JPEG não encolhe) com `Originais/`, `Editadas/`, `caso.json`, `hub.json`, `transcricao.txt`, o laudo final, `laudo_texto.txt` e `SHA256SUMS.txt`; testa, extrai e confere; envia e confere o hash no Drive; marca a pasta como fechada e só então manda para a lixeira o que está no pacote. Ficam o `.7z` e o `_sanitizado.docx`. Se algo falhar antes do fim, nada é apagado.
- A senha é digitada duas vezes e não é gravada em lugar nenhum.
- Foto com hash divergente ou sem hash bloqueia o fechamento. Arquivo posto à mão na pasta é invisível ao app (`drive.file`): fica, com aviso; "Concluir limpeza" termina depois, com a senha.
- **Reabrir** (com a senha): confere cada arquivo com o `SHA256SUMS.txt` e devolve fotos, anotadas, `caso.json`, `hub.json` e transcrição; o pacote vira `laudo_pericial_anterior_*.7z` e entra em `anteriores/` no próximo fechamento.
- **Caso grande** (teste de carga, Chrome): 150 fotos + 20 anotadas (~480 MB) fecham em ~1 min e reabrem em ~40 s, sem contar a rede, com ~1,4 GB de memória na aba; 300 fotos (~950 MB) fecham com ~2,5 GB. Acima de ~600 MB o hub avisa para fechar outras abas. Antes de fechar ou reabrir, o acesso ao Google é renovado se faltar menos de 40 min.
- 7-Zip no navegador: `vendor/7z-wasm-1.2.0` (7-Zip 24.09, GNU LGPL + restrição unRAR, ver `License.txt`), servido pelo próprio site.

## Fases

| Fase | Conteúdo | Situação |
|---|---|---|
| 0 | Login, pastas de teste, envio com SHA-256 | feita |
| 1 | Câmera no app, fila sem sinal | feita |
| 2 | Ditado ligado à foto, seções, tela cheia, exclusão | feita |
| 2.1 | Uso em campo: instalação, renovação do login, arrastar texto | feita |
| 3 | Hub: fotos, anotações, laudo, anexo | feita (ajustes contínuos, ver abaixo) |
| 4 | Fechamento, reabertura, sanitizador, teste com caso grande | feita |
| 5 | Lançamento | por fazer |

### 3 — Ajustes do hub
- Histórico próprio de desfazer/refazer no editor do laudo (hoje o Ctrl+Z do navegador perde o histórico quando o editor é redesenhado, por exemplo depois de vincular uma foto).

### 5 — Lançamento
- Dividir o `hub.html` (mais de 2.200 linhas) em arquivos por função — laudo, anotações, anexo, sanitizador, fechamento — para facilitar manutenção e auditoria de segurança. Sem mudança para o usuário. Com o código em arquivos, a CSP passa a valer sem o hash (e sem o `tools/csp.py`).
- Validar com o DPT o uso de conta Google pessoal para as fotos e o envio do áudio do ditado ao Groq.
- Pasta real **sem acesso ao Drive inteiro**: continuar com `drive.file` e, uma vez, escolher a pasta `DPT/Morto` pelo seletor do Google (Google Picker). Isso dá ao app acesso só àquela pasta, para criar os casos novos dentro dela; os casos antigos e o resto do Drive continuam fora do alcance. Exige uma chave de API do Picker, restrita ao endereço do app.
- Fim do limite de casos fictícios.

### Adiados
- Domínio próprio (o `github.io` é compartilhado com o `transcricao-forense`; reavaliar se outros projetos forem publicados ali).
- Selagem do pacote fechado (hash ao e-mail institucional e/ou carimbo de tempo RFC 3161): só se o forenSIS entrar na cadeia de custódia do DPT ou se fotos fora do laudo passarem a ser pedidas no processo; avaliar na validação com o DPT.
- Escala métrica nas fotos e calibração no hub.
- Sanitização de outros nomes, CPF e endereços.
- Ditado pelo microfone do computador; anexo em formato de documento.
- Se o login falhar no app instalado, avaliar login por redirecionamento.
