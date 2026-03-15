// config-admin-colaboradores.mjs
// Configura a interface admin do Directus para a collection colaboradores:
// - Display template por nome (autocomplete mostra o nome ao buscar)
// - M2M em livros e drops: buscar existente + criar inline
// - Campo papel como dropdown com opções predefinidas
// - Campo website com interface de URL

const DIRECTUS = 'https://directus-production-afdd.up.railway.app';
const TOKEN = 'ynOx8xSSe-PVHMUBIlz0nG9YetXgAxU5';
const h = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS}${path}`, {
    method, headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function main() {
  // ── 1. collection colaboradores: display_template + ícone de cor ─────────
  console.log('1. Configurando collection colaboradores...');
  await api('PATCH', '/collections/colaboradores', {
    meta: {
      display_template: '{{name}}',
      icon: 'people',
      color: '#ff44bb',
      note: 'Artistas, capistas, tradutores e outros colaboradores',
    },
  });
  console.log('   ok');

  // ── 2. campo website em colaboradores: interface URL ──────────────────────
  console.log('2. Campo website → interface URL...');
  await api('PATCH', '/fields/colaboradores/website', {
    meta: {
      interface: 'input',
      options: { placeholder: 'https://...', iconLeft: 'link' },
      display: 'formatted-value',
      display_options: { format: false },
      width: 'full',
    },
  });
  console.log('   ok');

  // ── 3. campo name em colaboradores: campo principal ───────────────────────
  console.log('3. Campo name → interface input obrigatório...');
  await api('PATCH', '/fields/colaboradores/name', {
    meta: {
      interface: 'input',
      width: 'full',
      required: true,
      options: { placeholder: 'Nome completo' },
    },
  });
  console.log('   ok');

  // ── 4. papel em livros_colaboradores: dropdown com opções ─────────────────
  console.log('4. Papel (livros) → dropdown...');
  const papeisLivros = [
    { text: 'Tradução',       value: 'tradutor' },
    { text: 'Capa',           value: 'capista' },
    { text: 'Arte de capa',   value: 'arte_de_capa' },
    { text: 'Artes internas', value: 'artes_internas' },
    { text: 'Autor',          value: 'autor' },
    { text: 'Prefácio',       value: 'prefacio' },
    { text: 'Posfácio',       value: 'posfacio' },
    { text: 'Organização',    value: 'organizador' },
  ];
  await api('PATCH', '/fields/livros_colaboradores/papel', {
    meta: {
      interface: 'select-dropdown',
      options: { choices: papeisLivros, allowOther: true },
      display: 'labels',
      display_options: { choices: papeisLivros },
      width: 'half',
      note: null,
    },
  });
  console.log('   ok');

  // ── 5. papel em drops_colaboradores: dropdown com opções ──────────────────
  console.log('5. Papel (drops) → dropdown...');
  const papeisDrops = [
    { text: 'Autor',    value: 'autor' },
    { text: 'Diretor',  value: 'diretor' },
    { text: 'Artista',  value: 'artista' },
    { text: 'Criador',  value: 'criador' },
    { text: 'Designer', value: 'designer' },
  ];
  await api('PATCH', '/fields/drops_colaboradores/papel', {
    meta: {
      interface: 'select-dropdown',
      options: { choices: papeisDrops, allowOther: true },
      display: 'labels',
      display_options: { choices: papeisDrops },
      width: 'half',
      note: null,
    },
  });
  console.log('   ok');

  // ── 6. M2M livros.colaboradores: enable create + search por nome ──────────
  console.log('6. M2M livros.colaboradores → criar inline + busca...');
  await api('PATCH', '/fields/livros/colaboradores', {
    meta: {
      interface: 'list-m2m',
      options: {
        template: '{{colaboradores_id.name}}',
        fields: ['papel', 'colaboradores_id.name', 'colaboradores_id.website'],
        enableCreate: true,
        enableSelect: true,
        enableLink: false,
      },
      display: 'related-values',
      display_options: { template: '{{colaboradores_id.name}} ({{papel}})' },
      note: 'Capistas, tradutores, artistas etc.',
    },
  });
  console.log('   ok');

  // ── 7. M2M drops.colaboradores: enable create + search por nome ───────────
  console.log('7. M2M drops.colaboradores → criar inline + busca...');
  await api('PATCH', '/fields/drops/colaboradores', {
    meta: {
      interface: 'list-m2m',
      options: {
        template: '{{colaboradores_id.name}}',
        fields: ['papel', 'colaboradores_id.name', 'colaboradores_id.website'],
        enableCreate: true,
        enableSelect: true,
        enableLink: false,
      },
      display: 'related-values',
      display_options: { template: '{{colaboradores_id.name}} ({{papel}})' },
      note: 'Autor, artista, diretor etc.',
    },
  });
  console.log('   ok');

  console.log('\nConfiguração concluída!');
}

main().catch(console.error);
