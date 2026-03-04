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

> **Sveltia CMS** (`/admin`) foi abandonado. Pode ser ignorado.

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
livro.html           livros                  Detalhe de livro

obra.html            obras                   Detalhe de obra + sidebar (NOVO)

works.html           —                       (a verificar)
```

---

## Collections do Directus — Campos

### `escritos`
| Campo     | Tipo    | Obs                              |
|-----------|---------|----------------------------------|
| title     | String  |                                  |
| date      | Date    |                                  |
| excerpt   | Text    | aparece na listagem da home      |
| body      | Text    | markdown / rich text             |
| status    | String  | published / draft                |
| featured  | Boolean | aparece como headline no hero    |

### `projetos`
| Campo     | Tipo    | Obs                              |
|-----------|---------|----------------------------------|
| title     | String  |                                  |
| date      | Date    |                                  |
| type      | String  |                                  |
| excerpt   | Text    |                                  |
| cover     | Image   |                                  |
| status    | String  | published / draft                |

### `drops`
| Campo   | Tipo    | Obs                                        |
|---------|---------|--------------------------------------------|
| title   | String  |                                            |
| author  | String  |                                            |
| type    | String  | book / album / podcast / film              |
| cover   | Image   |                                            |
| note    | Text    | nota pessoal (aparece no detalhe)          |
| link    | String  | link externo (opcional)                    |
| order   | Integer | ordem de exibição                          |
| status  | String  | published / draft                          |
| featured| Boolean | aparece como imagem flutuante no hero (máx 3) |

### `livros`
| Campo   | Tipo    | Obs                              |
|---------|---------|----------------------------------|
| title   | String  |                                  |
| autor   | String  |                                  |
| Cover   | Image   | atenção: campo com C maiúsculo   |
| ano     | Integer |                                  |
| status  | String  | published / draft                |

### `obras` ← NOVA (criar no Directus)
| Campo       | Tipo    | Obs                              |
|-------------|---------|----------------------------------|
| title       | String  |                                  |
| type        | String  | desenho, pintura, animação, vídeo|
| year        | String  |                                  |
| image       | Image   |                                  |
| description | Text    | opcional                         |
| order       | Integer |                                  |
| status      | String  | published / draft                |

> ⚠️ Após criar `obras`, configurar permissões públicas:
> Settings → Access Control → Public → obras: **read**

---

## Estilo & Design System

```css
--bg:     #0a0a08   /* fundo */
--fg:     #e8e8d8   /* texto */
--red:    #E8320A   /* cor principal / nav */
--green:  #00ff41   /* álbuns */
--blue:   #3355ff   /* projetos */
--purple: #cc44ff   /* obras visuais / podcasts */
--yellow: #f2e04a   /* livros */

--f-title:  'AuthenticSans', 'OffBit', monospace
--f-ui:     'GTPressura', monospace
--f-body:   'MyriadPro', sans-serif
```

Cores por seção/tipo:
- ESCRITOS / nav → vermelho (`--red`)
- DROPS livro → amarelo, álbum → verde, podcast → roxo, filme → azul
- LIVROS QUE DIRIGI → amarelo
- OBRAS VISUAIS → roxo
- PROJETOS → azul

---

## Deploy

Push para `master` no repo `dlameira/dlameira.github.io` → GitHub Pages publica automaticamente.
