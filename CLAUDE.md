# WEIRD WIZ — Mapa do Projeto

Blog pessoal de Daniel Lameira sobre arte, criatividade, tecnologia, livros e consciência.

---

## Infraestrutura

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages                                           │
│  dlameira.github.io          ← hospedagem do site      │
└───────────────────┬─────────────────────────────────────┘
                    │ fetch (API REST)
┌───────────────────▼─────────────────────────────────────┐
│  Railway — Directus CMS                                 │
│  directus-production-afdd.up.railway.app                │
│  ← todo o conteúdo (posts, drops, livros, obras...)     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Brevo (sibforms.com)                                   │
│  ← newsletter: captura emails e envia novos posts       │
│  (independente, não se comunica com Directus)           │
└─────────────────────────────────────────────────────────┘
```

**Admin customizado:** `dlameira.github.io/admin` → `admin.html`
Login com email/senha do Directus. Gerencia: drops, livros, obras, escritos, colaboradores.

---

## Páginas × Collections do Directus

```
PÁGINA               COLLECTION DIRECTUS     DESCRIÇÃO
─────────────────────────────────────────────────────────────────
index.html           escritos                Hero com headlines (featured)
                     escritos                Seção ESCRITOS (lista)
                     drops                   Seção DROPS (grid, limit 100)
                     livros                  Seção LIVROS QUE DIRIGI (grid)
                     obras                   Seção OBRAS VISUAIS (grid)
                     projetos                Seção PROJETOS (lista)
                     content/settings/about  Seção ME (bio + links)

post.html            escritos                Detalhe de escrito
                     projetos                Detalhe de projeto (?tipo=projeto)

drops.html           drops                   Lista completa de drops
drop.html            drops                   Detalhe de drop + sidebar

livros.html          livros                  Lista completa de livros
livro.html           livros                  Detalhe de livro (com ficha técnica)

obra.html            obras                   Detalhe de obra + sidebar
```

---

## Collections do Directus — Campos

### `escritos`
| Campo     | Tipo    | Obs                                                      |
|-----------|---------|----------------------------------------------------------|
| title     | String  |                                                          |
| date      | Date    |                                                          |
| excerpt   | Text    | aparece na listagem da home                              |
| body      | Text    | markdown / rich text                                     |
| status    | String  | published / draft                                        |
| featured  | Boolean | aparece como headline no hero                            |
| tipo      | String  | `"projeto"` → aparece na seção PROJETOS (layout diferente) |
| cover     | Image   | opcional, usado quando tipo="projeto"                    |

> ⚠️ Não existe collection `projetos` separada. A seção PROJETOS na home
> filtra `escritos` onde `tipo === "projeto"`.

### `drops`
| Campo         | Tipo    | Obs                                                   |
|---------------|---------|-------------------------------------------------------|
| title         | String  |                                                       |
| author        | String  | fallback quando não há colaboradores vinculados       |
| type          | String  | **valores em português:** livro / album / podcast / filme / musica / video / canal / jogo / artista / ensaio |
| cover         | Image   |                                                       |
| note          | Text    | nota pessoal (aparece no detalhe)                     |
| link          | String  | link externo (opcional)                               |
| order         | Integer | ordem de exibição                                     |
| status        | String  | published / draft                                     |
| featured      | Boolean | aparece como imagem flutuante no hero (máx 3)         |
| colaboradores | M2M     | via `drops_colaboradores` (campos: papel, colaboradores_id) |

### `livros`
| Campo          | Tipo    | Obs                                  |
|----------------|---------|--------------------------------------|
| title          | String  |                                      |
| subtitle       | String  | opcional                             |
| autor          | String  | autor original (campo texto)         |
| Cover          | Image   | **atenção: C maiúsculo**             |
| ano            | Integer |                                      |
| editora        | String  |                                      |
| paginas        | Integer |                                      |
| sinopse        | Text    |                                      |
| colecao        | String  |                                      |
| formato        | String  | ex: 14x21                            |
| notas          | Text    | notas internas                       |
| link_compra    | String  |                                      |
| isbn_fisico    | String  |                                      |
| isbn_ebook     | String  |                                      |
| title_en       | String  | título em inglês (opcional)          |
| featured       | Boolean |                                      |
| status         | String  | published / draft                    |
| tradutor       | String  | campo texto legado (usar colaboradores) |
| capista        | String  | campo texto legado (usar colaboradores) |
| arte_de_capa   | String  | campo texto legado (usar colaboradores) |
| artes_internas | String  | campo texto legado (usar colaboradores) |
| colaboradores  | M2M     | via `livros_colaboradores` (campos: papel, colaboradores_id) |

### `colaboradores`
| Campo   | Tipo   | Obs                                        |
|---------|--------|--------------------------------------------|
| name    | String | obrigatório                                |
| website | String | opcional — exibido como link na ficha técnica |
| status  | String | published / draft                          |

### `livros_colaboradores` (junction M2M)
| Campo             | Tipo    | Obs                                                  |
|-------------------|---------|------------------------------------------------------|
| livros_id         | FK      | → livros                                             |
| colaboradores_id  | FK      | → colaboradores                                      |
| papel             | String  | tradutor / capista / arte_de_capa / artes_internas / autor / prefacio / posfacio / organizador |

### `drops_colaboradores` (junction M2M)
| Campo             | Tipo    | Obs                                  |
|-------------------|---------|--------------------------------------|
| drops_id          | FK      | → drops                              |
| colaboradores_id  | FK      | → colaboradores                      |
| papel             | String  | autor / diretor / artista / criador / designer |

### `obras`
| Campo       | Tipo    | Obs                                          |
|-------------|---------|----------------------------------------------|
| title       | String  |                                              |
| type        | String  | ex: desenho, pintura, animação, vídeo...     |
| year        | String  |                                              |
| image       | Image   |                                              |
| description | Text    | opcional                                     |
| link        | String  | opcional                                     |
| order       | Integer |                                              |
| status      | String  | published / draft                            |

> Permissão pública de leitura configurada para: escritos, drops, livros, obras,
> colaboradores, livros_colaboradores, drops_colaboradores.

---

## Estilo & Design System

```css
--bg:     #0a0a08   /* fundo */
--fg:     #e8e8d8   /* texto */
--red:    #E8320A   /* cor principal / nav */
--green:  #00ff41   /* álbuns */
--blue:   #3355ff   /* projetos / filmes */
--purple: #cc44ff   /* obras visuais / podcasts */
--yellow: #f2e04a   /* livros */

--f-title:  'AuthenticSans', 'OffBit', monospace
--f-ui:     'GTPressura', monospace
--f-body:   'MyriadPro', sans-serif
```

Cores por seção/tipo de drop:
| tipo      | cor        |
|-----------|------------|
| livro     | `--yellow` #f2e04a |
| album     | `--green`  #00ff41 |
| podcast   | `--purple` #cc44ff |
| filme     | `--blue`   #3355ff |
| musica    | #00ccff    |
| video     | #ff6600    |
| canal     | #ff2020    |
| jogo      | #7dff4f    |
| artista   | #ff44bb    |
| ensaio    | #e0c090    |

---

## Scripts utilitários (raiz do projeto)

| Arquivo                          | Uso                                                      |
|----------------------------------|----------------------------------------------------------|
| `import-livros.mjs`              | Importa livros em bulk via CSV para o Directus           |
| `migrate-colaboradores.mjs`      | **JÁ RODOU** — migrou nomes dos campos texto para a collection colaboradores |
| `fix-colaboradores-duplicatas.mjs` | **JÁ RODOU** — corrigiu duplicatas e separou "Bruno Abbati & Pedro Inoue" |
| `config-admin-colaboradores.mjs` | **JÁ RODOU** — configurou UI do Directus para campos M2M |
| `livros-template.csv`            | Template CSV para bulk import de livros                  |

---

## Deploy

Push para `master` no repo `dlameira/dlameira.github.io` → GitHub Pages publica automaticamente.
