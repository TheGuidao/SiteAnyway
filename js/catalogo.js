/* Preços do catálogo já publicado. Edite aqui para atualizar os pedidos. */
(function (root) {
  'use strict';

  const whatsapp = '5513991080668';
  const products = {
    camiseta: {
      name: 'Camisa Logo Anyway',
      prices: { PP: 60, P: 60, M: 65, G: 70, GG: 75, G1: 80 },
      colors: ['Preta', 'Branca'],
    },
    copo: {
      name: 'Copo Personalizado Anyway',
      prices: { Everyday: 60, Pilsner: 75, Quencher: 100 },
    },
  };
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPrice = (value) => currency.format(value);

  function quote(kind, options) {
    if (!Object.hasOwn(products, kind)) throw new Error('Escolha um produto válido.');
    const product = products[kind];
    const variant = kind === 'camiseta' ? options.tamanho : options.modelo;
    if (!Object.hasOwn(product.prices, variant)) {
      throw new Error(kind === 'camiseta' ? 'Escolha o tamanho da camiseta.' : 'Escolha o modelo do copo.');
    }
    if (kind === 'camiseta' && !product.colors.includes(options.cor)) {
      throw new Error('Escolha a cor da camiseta.');
    }
    const quantity = Number(options.quantidade);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error('Escolha uma quantidade inteira entre 1 e 20.');
    }
    return { name: product.name, variant, quantity, unit: product.prices[variant], total: product.prices[variant] * quantity };
  }

  function buildOrder(kind, options) {
    const result = quote(kind, options);
    const name = String(options.nome || '').trim();
    if (!name) throw new Error('Informe seu nome.');
    const details = [
      `Produto: ${result.name}`,
      ...(kind === 'camiseta' ? [`Cor: ${options.cor}`, `Tamanho: ${result.variant}`] : [`Modelo: ${result.variant}`]),
      `Quantidade: ${result.quantity}`,
      `Valor unitário: ${formatPrice(result.unit)}`,
      `Subtotal: ${formatPrice(result.total)} (sem frete)`,
    ];
    const contact = [`Nome: ${name}`];
    for (const [field, label] of [['endereco', 'Endereço'], ['email', 'E-mail'], ['telefone', 'Telefone']]) {
      const value = String(options[field] || '').trim();
      if (value) contact.push(`${label}: ${value}`);
    }
    const message = ['Olá, Anyway! Gostaria de consultar este pedido:', '', ...details, '', ...contact,
      '', 'Podem confirmar a disponibilidade, o frete e o pagamento?'].join('\n');
    return { ...result, summary: [...details, '', ...contact].join('\n'), message,
      url: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` };
  }

  const api = { products, whatsapp, quote, buildOrder, formatPrice };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AnywayCatalog = api;
})(typeof window === 'undefined' ? {} : window);
