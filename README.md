# forenSIS (beta)

App para o exame pericial: fotos e ditado no mesmo registro, enviados direto do celular de serviço para o Google Drive com conferência de integridade (SHA-256), e um hub no computador para revisar, escrever o laudo e fechar o caso.

**Estado:** app do celular v0.4.5 · hub v0.6.2. Fases 0 a 3 feitas; fase 4 sem a selagem; fase 5 por fazer.

## Isolamento do beta

- Endereço próprio; o app de ditado atual (`transcricao-forense`) não é alterado.
- Permissão restrita do Drive (`drive.file`): o app só enxerga o que ele mesmo criou (`DPT_BETA/Morto/2026/…`) e não consegue ver nem alterar `DPT/`.
- Só casos fictícios, de `2026 9000` a `2026 9999`.

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

- **Fechar e trancar:** confere o hash de cada arquivo; monta `laudo_pericial.7z` (7-Zip, AES-256, nomes cifrados) com `Originais/`, `Editadas/`, `caso.json`, `hub.json`, `transcricao.txt`, o laudo final, `laudo_texto.txt` e `SHA256SUMS.txt`; testa, extrai e confere; envia e confere o hash no Drive; marca a pasta como fechada e só então manda para a lixeira o que está no pacote. Ficam o `.7z` e o `_sanitizado.docx`. Se algo falhar antes do fim, nada é apagado.
- A senha é digitada duas vezes e não é gravada em lugar nenhum.
- Foto com hash divergente ou sem hash bloqueia o fechamento. Arquivo posto à mão na pasta é invisível ao app (`drive.file`): fica, com aviso; "Concluir limpeza" termina depois, com a senha.
- **Reabrir** (com a senha): confere cada arquivo com o `SHA256SUMS.txt` e devolve fotos, anotadas, `caso.json`, `hub.json` e transcrição; o pacote vira `laudo_pericial_anterior_*.7z` e entra em `anteriores/` no próximo fechamento.
- 7-Zip no navegador: `vendor/7z-wasm-1.2.0` (7-Zip 24.09, GNU LGPL + restrição unRAR, ver `License.txt`), servido pelo próprio site.

## Fases

| Fase | Conteúdo | Situação |
|---|---|---|
| 0 | Login, pastas de teste, envio com SHA-256 | feita |
| 1 | Câmera no app, fila sem sinal | feita |
| 2 | Ditado ligado à foto, seções, tela cheia, exclusão | feita |
| 2.1 | Uso em campo: instalação, renovação do login, arrastar texto | feita |
| 3 | Hub: fotos, anotações, laudo, anexo | feita (ajustes contínuos) |
| 4 | Fechamento, reabertura, sanitizador | feita; falta a **selagem** (hashes ao e-mail institucional e/ou carimbo de tempo RFC 3161) |
| 5 | Lançamento | por fazer |

### 5 — Lançamento
- Domínio próprio, separado de `gabrielzlisboa-gif.github.io` (compartilhado com os outros projetos, inclusive o armazenamento local).
- Verificação em duas etapas obrigatória na conta Google usada.
- Validar com o DPT o uso de conta Google pessoal para as fotos e o envio do áudio do ditado ao Groq.
- Troca para a pasta real (`DPT`) e fim do limite de casos fictícios.

### Adiados
- Escala métrica nas fotos e calibração no hub.
- Sanitização de outros nomes, CPF e endereços.
- Ditado pelo microfone do computador; anexo em formato de documento.
- Se o login falhar no app instalado, avaliar login por redirecionamento.
