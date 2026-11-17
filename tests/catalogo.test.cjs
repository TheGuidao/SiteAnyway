const test = require('node:test');
const assert = require('node:assert/strict');
const { quote, buildOrder } = require('../js/catalogo.js');

test('camiseta branca G: duas unidades custam R$ 140, sem frete', () => {
  const result = quote('camiseta', { cor: 'Branca', tamanho: 'G', quantidade: '2' });
  assert.equal(result.unit, 70);
  assert.equal(result.total, 140);
});
test('preserva os preços publicados para todos os tamanhos e modelos', () => {
  for (const [tamanho, price] of Object.entries({ PP: 60, P: 60, M: 65, G: 70, GG: 75, G1: 80 })) {
    assert.equal(quote('camiseta', { cor: 'Preta', tamanho, quantidade: 1 }).total, price);
  }
  for (const [modelo, price] of Object.entries({ Everyday: 60, Pilsner: 75, Quencher: 100 })) {
    assert.equal(quote('copo', { modelo, quantidade: 1 }).total, price);
  }
});
test('rejeita quantidades vazias, negativas, fracionadas, inválidas e acima do limite', () => {
  for (const quantidade of ['', 0, -1, 1.5, 21, Infinity, NaN, '2 itens']) {
    assert.throws(() => quote('copo', { modelo: 'Everyday', quantidade }), /quantidade/);
  }
});
test('rejeita produto, cor e variante fora do catálogo', () => {
  assert.throws(() => quote('constructor', {}), /produto/);
  assert.throws(() => quote('copo', { modelo: '__proto__', quantidade: 1 }), /modelo/);
  assert.throws(() => quote('camiseta', { tamanho: 'XG', cor: 'Preta', quantidade: 1 }), /tamanho/);
  assert.throws(() => quote('camiseta', { tamanho: 'P', cor: 'Azul', quantidade: 1 }), /cor/);
});
test('pedido codifica acentos, símbolos e quebras de linha corretamente para o WhatsApp', () => {
  const order = buildOrder('camiseta', { cor: 'Branca', tamanho: 'M', quantidade: 3, nome: 'João & Ana', endereco: 'Rua São José, 1 #2', email: 'teste@example.com' });
  const url = new URL(order.url);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5513991080668');
  assert.equal(url.searchParams.get('text'), order.message);
  assert.equal(order.total, 195);
  assert.match(order.message, /Cor: Branca\nTamanho: M/);
  assert.match(order.message, /João & Ana/);
  assert.match(order.message, /sem frete/);
  assert.match(order.message, /confirmar a disponibilidade/);
});
test('dados de entrega são opcionais e nomes vazios são rejeitados', () => {
  const options = { modelo: 'Pilsner', quantidade: 1, nome: '  Maria  ' };
  const order = buildOrder('copo', options);
  assert.match(order.summary, /Nome: Maria$/);
  assert.doesNotMatch(order.summary, /Endereço|Telefone|E-mail|undefined/);
  assert.throws(() => buildOrder('copo', { ...options, nome: '  ' }), /nome/);
});
