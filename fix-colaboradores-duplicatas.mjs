// fix-colaboradores-duplicatas.mjs
// Corrige duplicatas e separa "Bruno Abbati & Pedro Inoue"

const DIRECTUS = 'https://directus-production-afdd.up.railway.app';
const TOKEN = 'ynOx8xSSe-PVHMUBIlz0nG9YetXgAxU5';
const h = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function main() {
  // ── 1. Petê Rissati (id 3) → mover vínculo para Petê Rissatti (id 7) ──
  console.log('1. Petê Rissati (3) → Rissatti (7)');
  // vínculo: id=3, livros_id=2, papel=tradutor → atualizar colaboradores_id para 7
  await api('PATCH', '/items/livros_colaboradores/3', { colaboradores_id: 7 });
  await api('DELETE', '/items/colaboradores/3');
  console.log('   ok');

  // ── 2. Mateus Aciole (id 42) → mover vínculo para Mateus Acioli (id 13) ──
  console.log('2. Mateus Aciole (42) → Acioli (13)');
  // vínculo: id=83, livros_id=31, papel=capista → atualizar colaboradores_id para 13
  await api('PATCH', '/items/livros_colaboradores/83', { colaboradores_id: 13 });
  await api('DELETE', '/items/colaboradores/42');
  console.log('   ok');

  // ── 3. Rogério W. Galindo (id 31) → mover vínculo para Rogerio W. Galindo (id 49) ──
  console.log('3. Rogério (31) → Rogerio (49)');
  // vínculo: id=64, livros_id=23, papel=tradutor → atualizar colaboradores_id para 49
  await api('PATCH', '/items/livros_colaboradores/64', { colaboradores_id: 49 });
  await api('DELETE', '/items/colaboradores/31');
  console.log('   ok');

  // ── 4. "Bruno Abbati & Pedro Inoue" (id 34) → separar ───────────────────
  console.log('4. Bruno Abbati & Pedro Inoue (34) → separar');
  // vínculo atual: id=68, livros_id=24, papel=capista → vai virar Pedro Inoue (id 4)
  // criar Bruno Abbati
  const brunoRes = await api('POST', '/items/colaboradores', { name: 'Bruno Abbati', status: 'published' });
  const brunoId = brunoRes.data?.id;
  console.log(`   Bruno Abbati criado com id ${brunoId}`);
  // criar vínculo Bruno Abbati → livro 24
  await api('POST', '/items/livros_colaboradores', { livros_id: 24, colaboradores_id: brunoId, papel: 'capista' });
  // atualizar vínculo existente: de id 34 para Pedro Inoue (id 4)
  await api('PATCH', '/items/livros_colaboradores/68', { colaboradores_id: 4 });
  // deletar colaborador composto
  await api('DELETE', '/items/colaboradores/34');
  console.log('   ok');

  console.log('\nConcluído!');
}

main().catch(console.error);
