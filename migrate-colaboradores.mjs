// migrate-colaboradores.mjs
// Migra colaboradores dos campos texto antigos para a collection colaboradores
// e cria os vínculos M2M em livros_colaboradores e drops_colaboradores.
//
// Uso: node migrate-colaboradores.mjs

const DIRECTUS = 'https://directus-production-afdd.up.railway.app';
const TOKEN = 'ynOx8xSSe-PVHMUBIlz0nG9YetXgAxU5';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function get(path) {
  const res = await fetch(`${DIRECTUS}${path}`, { headers });
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${DIRECTUS}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

function splitNames(str) {
  if (!str) return [];
  return str.split(/[;,]/).map(s => s.trim()).filter(Boolean);
}

async function main() {
  // ── 1. Buscar dados ─────────────────────────────────────────────────────
  const [lRes, dRes] = await Promise.all([
    get('/items/livros?filter[status][_eq]=published&limit=500&fields=id,title,tradutor,capista,arte_de_capa,artes_internas'),
    get('/items/drops?filter[status][_eq]=published&limit=500&fields=id,title,author'),
  ]);
  const livros = lRes.data || [];
  const drops  = dRes.data || [];
  console.log(`Livros: ${livros.length} | Drops: ${drops.length}`);

  // ── 2. Coletar nomes únicos ──────────────────────────────────────────────
  const allNames = new Set();
  livros.forEach(l => {
    ['tradutor','capista','arte_de_capa','artes_internas'].forEach(c => {
      splitNames(l[c]).forEach(n => allNames.add(n));
    });
  });
  drops.forEach(d => splitNames(d.author).forEach(n => allNames.add(n)));
  console.log(`\nNomes únicos encontrados: ${allNames.size}`);
  [...allNames].sort().forEach(n => console.log('  -', n));

  // ── 3. Criar colaboradores ───────────────────────────────────────────────
  console.log('\nCriando colaboradores...');
  const nameToId = {};
  for (const name of allNames) {
    const r = await post('/items/colaboradores', { name, status: 'published' });
    if (r.data?.id) {
      nameToId[name] = r.data.id;
      console.log(`  ✓ [${r.data.id}] ${name}`);
    } else {
      console.error(`  ✗ Erro criando "${name}":`, r.errors);
    }
  }

  // ── 4. Criar vínculos livros_colaboradores ───────────────────────────────
  console.log('\nVinculando colaboradores a livros...');
  let livrosOk = 0, livrosErr = 0;
  const papeis = {
    tradutor: 'tradutor',
    capista: 'capista',
    arte_de_capa: 'arte_de_capa',
    artes_internas: 'artes_internas',
  };
  for (const livro of livros) {
    for (const [campo, papel] of Object.entries(papeis)) {
      const nomes = splitNames(livro[campo]);
      for (const nome of nomes) {
        const colabId = nameToId[nome];
        if (!colabId) { console.warn(`  Sem ID para "${nome}"`); continue; }
        const r = await post('/items/livros_colaboradores', {
          livros_id: livro.id,
          colaboradores_id: colabId,
          papel,
        });
        if (r.data?.id) livrosOk++;
        else { livrosErr++; console.error(`  Erro: livro ${livro.id} + "${nome}":`, r.errors); }
      }
    }
  }
  console.log(`  Vínculos livros: ${livrosOk} ok, ${livrosErr} erros`);

  // ── 5. Criar vínculos drops_colaboradores ────────────────────────────────
  console.log('\nVinculando colaboradores a drops...');
  let dropsOk = 0, dropsErr = 0;
  for (const drop of drops) {
    const nomes = splitNames(drop.author);
    for (const nome of nomes) {
      const colabId = nameToId[nome];
      if (!colabId) { console.warn(`  Sem ID para "${nome}"`); continue; }
      const r = await post('/items/drops_colaboradores', {
        drops_id: drop.id,
        colaboradores_id: colabId,
        papel: 'autor',
      });
      if (r.data?.id) dropsOk++;
      else { dropsErr++; console.error(`  Erro: drop ${drop.id} + "${nome}":`, r.errors); }
    }
  }
  console.log(`  Vínculos drops: ${dropsOk} ok, ${dropsErr} erros`);

  console.log('\nMigração concluída!');
}

main().catch(console.error);
