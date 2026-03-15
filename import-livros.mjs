// ─────────────────────────────────────────────────────────────────────────────
// import-livros.mjs
// Importa livros em massa para o Directus a partir de um CSV + pasta de capas.
//
// Uso:
//   npm install csv-parse           ← só na primeira vez
//   node import-livros.mjs livros.csv C:\capas
//
// As capas devem se chamar {isbn_fisico}.jpg (ou .png, .webp, .jpeg).
// Se não encontrar a capa pelo ISBN, tenta a coluna cover_url do CSV.
// ─────────────────────────────────────────────────────────────────────────────

import { createReadStream, readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { parse } from 'csv-parse';

const DIRECTUS = 'https://directus-production-afdd.up.railway.app';
const TOKEN    = 'KCcBJTqLUEu3fzD9IRUDg5AgUY_8pPUO';

const authHeaders = { 'Authorization': `Bearer ${TOKEN}` };

// ── Extensões de imagem suportadas ────────────────────────────────────────────
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function encontrarCapa(pastaCapas, isbn) {
  if (!pastaCapas || !isbn?.trim()) return null;
  for (const ext of EXTS) {
    const caminho = join(pastaCapas, `${isbn.trim()}${ext}`);
    if (existsSync(caminho)) return caminho;
  }
  return null;
}

// ── Upload de arquivo local para o Directus ───────────────────────────────────
async function uploadArquivo(caminho) {
  try {
    const buffer   = readFileSync(caminho);
    const ext      = extname(caminho).toLowerCase();
    const mimeMap  = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
    const mimeType = mimeMap[ext] || 'image/jpeg';
    const filename = caminho.split(/[\\/]/).pop();

    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), filename);

    const res = await fetch(`${DIRECTUS}/files`, {
      method: 'POST',
      headers: authHeaders,   // sem Content-Type → o fetch define o boundary
      body: form,
    });

    if (!res.ok) {
      console.warn(`    ⚠ Upload falhou (HTTP ${res.status}): ${filename}`);
      return null;
    }
    const { data } = await res.json();
    return data.id;
  } catch (e) {
    console.warn(`    ⚠ Erro no upload: ${e.message}`);
    return null;
  }
}

// ── Importa capa a partir de URL (fallback) ───────────────────────────────────
async function importarUrl(url) {
  if (!url?.trim()) return null;
  try {
    const res = await fetch(`${DIRECTUS}/files/import`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    });
    if (!res.ok) {
      console.warn(`    ⚠ URL falhou (HTTP ${res.status}): ${url}`);
      return null;
    }
    const { data } = await res.json();
    return data.id;
  } catch (e) {
    console.warn(`    ⚠ Erro na URL: ${e.message}`);
    return null;
  }
}

// ── Cria livro no Directus ────────────────────────────────────────────────────
async function criarLivro(campos) {
  const res = await fetch(`${DIRECTUS}/items/livros`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(campos),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(`HTTP ${res.status}: ${texto}`);
  }
  return (await res.json()).data;
}

// ── Lê o CSV ──────────────────────────────────────────────────────────────────
async function lerCsv(arquivo) {
  const registros = [];
  await new Promise((resolve, reject) => {
    createReadStream(arquivo)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true, bom: true }))
      .on('data', row => registros.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  return registros;
}

// ── Principal ─────────────────────────────────────────────────────────────────
async function run() {
  const arquivo    = process.argv[2] || 'livros.csv';
  const pastaCapas = process.argv[3] || null;   // ex: C:\capas

  if (pastaCapas) {
    console.log(`\n🖼  Pasta de capas: ${pastaCapas}`);
  } else {
    console.log(`\n⚠  Nenhuma pasta de capas informada — usando cover_url do CSV como fallback.`);
  }

  console.log(`📂 Lendo ${arquivo}...`);
  const registros = await lerCsv(arquivo);
  console.log(`📚 ${registros.length} livros encontrados\n`);

  let ok = 0, erros = 0, semCapa = 0;

  for (let i = 0; i < registros.length; i++) {
    const row = registros[i];
    const num = `[${String(i + 1).padStart(3, '0')}/${registros.length}]`;
    console.log(`${num} ${row.title || '(sem título)'}`);

    // 1. Busca a capa
    let coverId = null;
    const capaCaminho = encontrarCapa(pastaCapas, row.isbn_fisico);

    if (capaCaminho) {
      process.stdout.write(`      → upload local (${row.isbn_fisico})... `);
      coverId = await uploadArquivo(capaCaminho);
      console.log(coverId ? `✓` : '✗ falhou');
    } else if (row.cover_url?.trim()) {
      process.stdout.write(`      → importando URL... `);
      coverId = await importarUrl(row.cover_url);
      console.log(coverId ? `✓` : '✗ falhou');
    } else {
      semCapa++;
    }

    // 2. Monta os campos do livro
    const livro = {};
    const set = (campo, valor) => { if (valor?.trim()) livro[campo] = valor.trim(); };

    livro.status = row.status?.trim() || 'published';
    set('title',          row.title);
    set('subtitle',       row.subtitle);
    set('autor',          row.autor);
    set('editora',        row.editora);
    set('colecao',        row.colecao);
    set('formato',        row.formato);
    set('idioma',         row.idioma || 'Português');
    set('isbn_fisico',    row.isbn_fisico);
    set('isbn_ebook',     row.isbn_ebook);
    set('sinopse',        row.sinopse);
    set('notas',          row.notas);
    set('link_compra',    row.link_compra);
    set('tradutor',       row.tradutor);
    set('capista',        row.capista);
    set('arte_de_capa',   row.arte_de_capa);
    set('artes_internas', row.artes_internas);

    if (row.ano)     livro.ano     = Number(row.ano);
    if (row.paginas) livro.paginas = Number(row.paginas);
    if (coverId)     livro.Cover   = coverId;

    // 3. Cria no Directus
    try {
      const criado = await criarLivro(livro);
      console.log(`      ✓ criado (id: ${criado.id})`);
      ok++;
    } catch (e) {
      console.error(`      ✗ ERRO: ${e.message}`);
      erros++;
    }

    // Pausa entre requisições
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n${'─'.repeat(52)}`);
  console.log(`✅ Concluído: ${ok} criados, ${erros} erros, ${semCapa} sem capa`);
}

run().catch(err => {
  console.error('\n❌ Falha fatal:', err.message);
  process.exit(1);
});
