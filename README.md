# Anyway — Introspecção

Site oficial da banda: https://bandanyway.com.br/

HTML, CSS e JavaScript puro. Não precisa instalar pacotes, configurar banco de dados ou executar um build. O site continua compatível com a hospedagem atual no GitHub Pages.

## O que foi atualizado

- Página inicial dedicada ao EP **Introspecção**, com capa oficial, player do Spotify e links para as seis faixas.
- Visual inspirado na capa do EP, com fotos reais da banda, parallax, entrada de elementos na rolagem e navegação para celular.
- Páginas de música, integrantes, merch e produtos com a mesma identidade.
- Biografia atualizada para informar que o EP foi lançado em 2026; sete integrantes e biografias preservados.
- Webclipe de Insônia carregado somente quando o visitante clica em reproduzir.
- Loja com filtros, fotos frente/verso, cor, tamanho/modelo, quantidade, subtotal e revisão antes de abrir o WhatsApp.
- Preços, opções de produtos, telefone comercial e domínio mantidos a partir do repositório original.
- Imagens WebP, fontes locais com suas licenças, títulos e descrições por página, sitemap e página 404.
- Preferência de movimento reduzido, opção de pausar animações, links de navegação por teclado e conteúdo disponível sem JavaScript.

## Publicar pelo site do GitHub

1. Abra o repositório `TheGuidao/SiteAnyway` e selecione a branch `main`.
2. Use **Add file → Upload files**.
3. Envie **o conteúdo** da pasta do site: os arquivos HTML, `style.css`, `CNAME`, `robots.txt`, `sitemap.xml` e as pastas `js`, `fonts` e `img`. Preserve as subpastas, especialmente `img/optimized`.
4. Confirme a substituição dos arquivos de mesmo nome e clique em **Commit changes**.
5. Aguarde o deploy do GitHub Pages terminar na aba **Actions**. Abra `https://bandanyway.com.br/` e use `Ctrl + F5` se o navegador ainda exibir a versão anterior.

Não envie o ZIP sem extrair. Não coloque todos os arquivos dentro de uma pasta extra no repositório. O `index.html` precisa continuar na raiz. Não é necessário alterar DNS, domínio ou configurações do Pages.

Os arquivos originais de `img/` podem permanecer. As páginas novas usam `img/optimized/`; os arquivos `.import` antigos não são necessários para o site, mas não precisam ser removidos.

## Onde editar depois

| Conteúdo | Arquivo |
| --- | --- |
| Abertura, novidades e chamada do EP | `index.html` |
| Player do EP, lista de faixas e webclipe | `lancamentos.html` |
| História e integrantes | `sobre.html` |
| Vitrine de produtos | `merch.html` |
| Campos e texto da camiseta | `produto-camiseta-logo.html` |
| Campos e texto dos copos | `produto-copo-logo.html` |
| Preços usados no pedido e número do WhatsApp | `js/catalogo.js` |
| Menu, animações, vídeo, galeria e formulário | `js/app.js` |
| Cores, tipografia, espaçamentos e responsividade | `style.css` |
| Imagens utilizadas pelas páginas | `img/optimized/` |

Ao alterar preços, atualize também os rótulos das opções no HTML do produto e o preço “a partir de” na vitrine. Ao mudar o WhatsApp, atualize o número em `js/catalogo.js` e nos links de contato dos HTMLs. Header e rodapé são HTML estático repetido nas páginas: alterações nesses trechos devem ser replicadas.

O pedido não é pago nem enviado automaticamente pelo site. Depois da revisão, o botão abre uma mensagem pronta no WhatsApp; o visitante decide enviá-la. Disponibilidade, frete e pagamento são confirmados com a banda. Dados de entrega são opcionais e não são armazenados pelo site.

## Conferir localmente

Abra `index.html` no navegador ou, na pasta do site, execute `python -m http.server 8000` e abra `http://localhost:8000`.

Verificações automatizadas (Node.js 20+ e Python 3, sem pacotes extras):

```sh
node --check js/app.js
node --check js/catalogo.js
node --test tests/catalogo.test.cjs
python tests/check_site.py
```

Os testes cobrem preços, quantidades inválidas, opções inválidas, codificação da mensagem do WhatsApp, arquivos locais, âncoras, metadados, seis faixas, sete integrantes e domínio. Spotify e YouTube dependem da conexão do visitante e das regras de reprodução dessas plataformas; links diretos acompanham os players.

## Origem dos conteúdos

- Fotos, logo, biografias, catálogo, preços e contato: repositório original, commit `583fd5f`.
- Capa e faixas do EP: player oficial do Spotify, álbum `0spaoQvWEuGP67r1fBMhmv`.
- Webclipe: vídeo oficial `-w5BZIGmD9w`, já presente no site original.
- Fontes: Barlow Condensed e Manrope, distribuídas com suas licenças SIL Open Font License em `fonts/`.

Não foram inventadas datas de shows, disponibilidade de estoque ou novas informações sobre a formação.
