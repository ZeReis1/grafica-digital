/**
 * STORAGE.JS - Gestor de Estado Central & Banco de Dados Local da Gráfica
 * Sincroniza em tempo real entre o Catálogo Mobile do Cliente e o Painel Admin do Notebook.
 * Inclui o Motor de Repartição de Lucros Operacional entre os Sócios:
 * José Reis e Leonardo Monti.
 */

const STORAGE_KEYS = {
  CONFIG: 'grafica_config_v3', // v3 Sul Design
  PRODUCTS: 'grafica_products_v3',
  ORDERS: 'grafica_orders_v3',
  FINANCES: 'grafica_finances_v3',
  CART: 'grafica_cart_v3'
};

// Configuração Padrão da Gráfica Sul Design com Sócios
const DEFAULT_CONFIG = {
  storeName: "Sul Design • Gráfica & Comunicação Visual",
  shortName: "Sul Design",
  logoUrl: "img/logo-full.png",
  logoIconUrl: "img/logo-icon.png",
  tagline: "Comunicação visual, impressos de alta precisão e design profissional.",
  whatsappNumber: "5535999702316", // Número configurado
  displayPhone: "(35) 99970-2316",
  pixKey: "35999702316",
  pixType: "Telefone",
  pixOwner: "Sul Design Comunicação Visual",
  address: "Rua do Comércio, 340 - Centro (Retirada no Balcão)",
  operatingHours: "Seg a Sex: 08:30 às 18:30 | Sáb: 08:30 às 12:30",
  standardArtFee: 35.00, // Custo para criação de arte profissional
  standardTurnaround: "2 a 4 dias úteis",
  adminPin: "1234", // PIN padrão para acessar a área administrativa
  partners: [
    { id: "jose", name: "José Reis", role: "Sócio • Atendimento & Arte" },
    { id: "leonardo", name: "Leonardo Monti", role: "Sócio • Produção & Acabamento" }
  ],
  splitRules: {
    caixa: 10,       // 10% Caixa da Empresa
    captacao: 15,    // 15% Captação (se orgânico -> vai p/ Lucros)
    atendimento: 15, // 15% Atendimento e Fechamento
    arte: 15,        // 15% Criação da Arte (se pronta -> vai p/ Lucros)
    producao: 25,    // 25% Produção e Impressão
    lucros: 20       // 20% Base de Divisão de Lucros (50/50)
  }
};

// Catálogo Inicial de Produtos com Simulador de Preços Realista
const DEFAULT_PRODUCTS = [
  {
    id: "cartao-visita",
    name: "Cartão de Visita Premium",
    category: "cartoes",
    categoryLabel: "Cartões de Visita",
    badge: "Mais Vendido",
    badgeType: "hot",
    description: "A porta de entrada do seu negócio. Impressão offset de altíssima definição com opções de verniz localizado e toque aveludado.",
    basePrice: 65.00,
    unit: "unidades",
    turnaround: "2 a 3 dias úteis",
    sizes: [
      { id: "padrao", label: "Padrão (9x5 cm)", multiplier: 1.0 }
    ],
    quantities: [
      { qty: 250, price: 65.00, label: "250 un" },
      { qty: 500, price: 85.00, label: "500 un" },
      { qty: 1000, price: 110.00, label: "1.000 un (Recomendado)", popular: true },
      { qty: 2500, price: 215.00, label: "2.500 un" },
      { qty: 5000, price: 380.00, label: "5.000 un" }
    ],
    papers: [
      { id: "couche-300", label: "Couché 300g (Encorpado / Padrão)", priceAdd: 0 },
      { id: "couche-250", label: "Couché 250g (Mais Leve / Econômico)", priceAdd: -10 },
      { id: "reciclato-240", label: "Reciclato 240g (Ecológico Sustentável)", priceAdd: 15 },
      { id: "kraft-300", label: "Kraft 300g (Rústico & Vintage)", priceAdd: 20 }
    ],
    finishes: [
      { id: "verniz-total", label: "Brilho UV Total Frente (Clássico)", multiplier: 1.0 },
      { id: "lam-fosca-verniz-local", label: "Laminação Fosca + Verniz Localizado Frente e Verso (Luxo)", multiplier: 1.45 },
      { id: "lam-fosca-total", label: "Laminação Fosca Total Frente e Verso", multiplier: 1.25 },
      { id: "sem-verniz", label: "Fosco / Sem Aplicação de Verniz", multiplier: 0.95 }
    ],
    extras: [
      { id: "cantos-arredondados", label: "4 Cantos Arredondados", priceFixed: 15.00 }
    ],
    icon: "credit-card",
    image: "img/produtos/cartao-visita.jpg"
  },
  {
    id: "panfleto-flyer",
    name: "Panfletos & Flyers Promocionais",
    category: "panfletos",
    categoryLabel: "Panfletos & Flyers",
    badge: "Alta Conversão",
    badgeType: "hot",
    description: "Perfeito para divulgação em massa, lançamentos de cardápios, inaugurações e promoções locais com cores vibrantes.",
    basePrice: 95.00,
    unit: "unidades",
    turnaround: "3 a 4 dias úteis",
    sizes: [
      { id: "10x14", label: "10x14 cm (1/4 A4 - Mais Usado)", multiplier: 1.0 },
      { id: "14x20", label: "14x20 cm (1/2 A4 - Tamanho Médio)", multiplier: 1.65 },
      { id: "20x28", label: "20x28 cm (Formato A4 Grande)", multiplier: 2.4 }
    ],
    quantities: [
      { qty: 500, price: 95.00, label: "500 un" },
      { qty: 1000, price: 135.00, label: "1.000 un", popular: true },
      { qty: 2500, price: 245.00, label: "2.500 un" },
      { qty: 5000, price: 420.00, label: "5.000 un (Melhor Custo/Un)" },
      { qty: 10000, price: 780.00, label: "10.000 un" }
    ],
    papers: [
      { id: "couche-90", label: "Couché 90g (Econômico p/ Distribuição)", priceAdd: 0 },
      { id: "couche-115", label: "Couché 115g (Padrão de Qualidade)", priceAdd: 20 },
      { id: "couche-150", label: "Couché 150g (Mais Firme & Resistente)", priceAdd: 45 }
    ],
    finishes: [
      { id: "4x0", label: "Impressão Só Frente (4x0)", multiplier: 1.0 },
      { id: "4x4", label: "Impressão Frente e Verso Colorido (4x4)", multiplier: 1.35 }
    ],
    extras: [],
    icon: "file-text",
    image: "img/produtos/panfleto-flyer.jpg"
  },
  {
    id: "adesivo-vinil",
    name: "Adesivos & Rótulos em Vinil",
    category: "adesivos",
    categoryLabel: "Adesivos & Rótulos",
    badge: "À Prova D'água",
    badgeType: "accent",
    description: "Adesivos cortados eletronicamente no formato exato da sua logomarca ou embalagem. Suportam geladeira, água e calor.",
    basePrice: 48.00,
    unit: "unidades",
    turnaround: "2 dias úteis",
    sizes: [
      { id: "3x3", label: "3x3 cm (Pequeno / Lacres)", multiplier: 0.8 },
      { id: "4x4", label: "4x4 cm (Padrão Rótulos)", multiplier: 1.0 },
      { id: "5x5", label: "5x5 cm (Médio Destacado)", multiplier: 1.3 },
      { id: "7x7", label: "7x7 cm (Grande)", multiplier: 1.8 }
    ],
    quantities: [
      { qty: 100, price: 48.00, label: "100 un" },
      { qty: 250, price: 85.00, label: "250 un" },
      { qty: 500, price: 140.00, label: "500 un", popular: true },
      { qty: 1000, price: 230.00, label: "1.000 un" },
      { qty: 2000, price: 410.00, label: "2.000 un" }
    ],
    papers: [
      { id: "vinil-brilho", label: "Vinil Branco Brilho (Impermeável)", priceAdd: 0 },
      { id: "vinil-fosco", label: "Vinil Branco Fosco (Toque Sofisticado)", priceAdd: 5 },
      { id: "vinil-transparente", label: "Vinil Transparente Cristal", priceAdd: 15 },
      { id: "papel-adesivo", label: "Papel Adesivo Fotográfico (Econômico)", priceAdd: -10 }
    ],
    finishes: [
      { id: "meio-corte-reto", label: "Meio Corte Reto (Quadrado ou Redondo)", multiplier: 1.0 },
      { id: "corte-especial", label: "Corte Especial Personalizado no Contorno", multiplier: 1.2 }
    ],
    extras: [],
    icon: "tag",
    image: "img/produtos/adesivo-vinil.jpg"
  },
  {
    id: "banner-lona",
    name: "Banners & Lonas em Alta Resolução",
    category: "banners",
    categoryLabel: "Banners & Fachadas",
    badge: "Pronto para Pendurar",
    badgeType: "accent",
    description: "Lona 440g anti-reflexo com impressão digital fotográfica e acabamento completo com madeira, ponteiras e cordinha.",
    basePrice: 55.00,
    unit: "unidade",
    turnaround: "1 a 2 dias úteis",
    sizes: [
      { id: "60x90", label: "60 x 90 cm (Pequeno / Vitrine)", multiplier: 1.0, fixedPrice: 55.00 },
      { id: "80x120", label: "80 x 120 cm (Médio - Mais Vendido)", multiplier: 1.0, fixedPrice: 85.00, popular: true },
      { id: "100x150", label: "100 x 150 cm (Grande Destaque)", multiplier: 1.0, fixedPrice: 135.00 },
      { id: "200x100", label: "200 x 100 cm (Faixa Horizontal)", multiplier: 1.0, fixedPrice: 175.00 }
    ],
    quantities: [
      { qty: 1, price: 55.00, label: "1 unidade" },
      { qty: 2, price: 100.00, label: "2 unidades (Desc. 10%)" },
      { qty: 5, price: 235.00, label: "5 unidades" }
    ],
    papers: [
      { id: "lona-440-fosca", label: "Lona 440g Fosca (Não reflete luz/flash)", priceAdd: 0 },
      { id: "lona-440-brilho", label: "Lona 440g Brilho (Cores mais intensas)", priceAdd: 0 }
    ],
    finishes: [
      { id: "madeira-corda", label: "Bastão de Madeira + Ponteira + Corda", multiplier: 1.0 },
      { id: "ilhos-toda-volta", label: "Ilhós Metálico em Toda Volta (p/ Amarrar)", multiplier: 1.05 },
      { id: "apenas-refile", label: "Apenas Refilado (Sem Bastão)", multiplier: 0.9 }
    ],
    extras: [],
    icon: "flag",
    image: "img/produtos/banner-lona.jpg"
  },
  {
    id: "talao-recibo",
    name: "Blocos de Pedido, Recibos & Receituários",
    category: "corporativo",
    categoryLabel: "Material Corporativo",
    badge: "Numeração Inclusa",
    badgeType: "neutral",
    description: "Blocos de anotações, pedidos, receituários médicos e comandas com picote destacável e opção de vias autocopiativas.",
    basePrice: 75.00,
    unit: "blocos (50 folhas cada)",
    turnaround: "3 a 4 dias úteis",
    sizes: [
      { id: "14x20", label: "14x20 cm (1/2 Folha A4 - Tradicional)", multiplier: 1.0 },
      { id: "10x14", label: "10x14 cm (1/4 Folha A4 - Compacto)", multiplier: 0.75 }
    ],
    quantities: [
      { qty: 5, price: 75.00, label: "5 blocos (250 folhas)" },
      { qty: 10, price: 125.00, label: "10 blocos (500 folhas)", popular: true },
      { qty: 20, price: 220.00, label: "20 blocos (1.000 folhas)" },
      { qty: 50, price: 460.00, label: "50 blocos (2.500 folhas)" }
    ],
    papers: [
      { id: "sulfite-75", label: "1 Via - Sulfite Branco 75g", priceAdd: 0 },
      { id: "autocopiativo-2vias", label: "2 Vias Autocopiativas (Branco/Amarelo - Não precisa carbono)", priceAdd: 35 }
    ],
    finishes: [
      { id: "blocagem-cola", label: "Blocagem com Cola Vermelha no Topo", multiplier: 1.0 },
      { id: "grampo-picote", label: "Grampo + Picote Destacável + Numeração", multiplier: 1.2 }
    ],
    extras: [],
    icon: "book",
    image: "img/produtos/talao-recibo.jpg"
  },
  {
    id: "pasta-personalizada",
    name: "Pastas com Bolsa ou Orelha",
    category: "corporativo",
    categoryLabel: "Material Corporativo",
    badge: "Elegância Máxima",
    badgeType: "accent",
    description: "Pastas corporativas com encaixe para cartão de visita. Ideal para escritórios, contratos, propostas e apresentações de alto padrão.",
    basePrice: 390.00,
    unit: "unidades",
    turnaround: "4 a 6 dias úteis",
    sizes: [
      { id: "a4-aberta", label: "Formato Padrão A4 (31x45 cm aberta)", multiplier: 1.0 }
    ],
    quantities: [
      { qty: 100, price: 390.00, label: "100 un" },
      { qty: 250, price: 590.00, label: "250 un", popular: true },
      { qty: 500, price: 890.00, label: "500 un" },
      { qty: 1000, price: 1480.00, label: "1.000 un" }
    ],
    papers: [
      { id: "couche-300", label: "Couché 300g Extra Firme", priceAdd: 0 }
    ],
    finishes: [
      { id: "bolsa-colada", label: "Bolsa Colada c/ Encaixe de Cartão + Laminação Fosca", multiplier: 1.0 },
      { id: "bolsa-verniz-local", label: "Bolsa Colada + Laminação Fosca + Verniz Localizado", multiplier: 1.35 }
    ],
    extras: [],
    icon: "folder",
    image: "img/produtos/pasta-personalizada.jpg"
  },
  {
    id: "cardapio-plastificado",
    name: "Cardápios Plastificados & Laváveis",
    category: "restaurantes",
    categoryLabel: "Restaurantes & Bares",
    badge: "Higienizável",
    badgeType: "accent",
    description: "Cardápios resistentes com borda selada à prova de gordura e líquidos. Alta durabilidade para restaurantes, bares e cafeterias.",
    basePrice: 95.00,
    unit: "unidades",
    turnaround: "2 a 3 dias úteis",
    sizes: [
      { id: "a4-avulso", label: "Folha A4 Avulsa (Frente e Verso)", multiplier: 1.0 },
      { id: "a4-dobra", label: "Folha A3 Dobrada ao Meio (4 Páginas)", multiplier: 1.8 }
    ],
    quantities: [
      { qty: 10, price: 95.00, label: "10 un" },
      { qty: 25, price: 190.00, label: "25 un", popular: true },
      { qty: 50, price: 340.00, label: "50 un" },
      { qty: 100, price: 580.00, label: "100 un" }
    ],
    papers: [
      { id: "couche-300-polaseal", label: "Couché 300g com Plastificação Rígida Polaseal 0,05", priceAdd: 0 },
      { id: "pvc-lavavel", label: "PVC Rígido 0,3mm Lavável Imersível", priceAdd: 30 }
    ],
    finishes: [
      { id: "cantos-arredondados", label: "Bordas Seladas com Cantos Arredondados", multiplier: 1.0 }
    ],
    extras: [],
    icon: "coffee",
    image: "img/produtos/cardapio-plastificado.jpg"
  },
  {
    id: "caneca-personalizada",
    name: "Canecas de Porcelana Personalizadas",
    category: "brindes",
    categoryLabel: "Brindes & Presentes",
    badge: "Classe AAA",
    badgeType: "hot",
    description: "Caneca cerâmica resinada de 325ml com estampa fotográfica que não desbota no micro-ondas e lava-louças.",
    basePrice: 38.00,
    unit: "unidades",
    turnaround: "1 a 2 dias úteis",
    sizes: [
      { id: "325ml", label: "Tamanho Tradicional (325ml)", multiplier: 1.0 }
    ],
    quantities: [
      { qty: 1, price: 38.00, label: "1 unidade" },
      { qty: 5, price: 165.00, label: "5 unidades" },
      { qty: 10, price: 290.00, label: "10 unidades", popular: true },
      { qty: 25, price: 625.00, label: "25 unidades" },
      { qty: 50, price: 1150.00, label: "50 unidades (R$ 23/un)" }
    ],
    papers: [
      { id: "porcelana-branca", label: "Porcelana Branca Tradicional", priceAdd: 0 },
      { id: "alca-colorida", label: "Porcelana c/ Alça e Interior Colorido", priceAdd: 6 }
    ],
    finishes: [
      { id: "sublimacao-hd", label: "Estampa Fotográfica 360º de Alta Definição", multiplier: 1.0 }
    ],
    extras: [
      { id: "caixinha-presente", label: "Caixinha Individual de Presente", priceFixed: 4.50 }
    ],
    icon: "gift",
    image: "img/produtos/caneca-personalizada.jpg"
  }
];

// Pedidos Iniciais com Repartição de Lucros Demonstrativa
const DEFAULT_ORDERS = [
  {
    id: "PED-1082",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    clientName: "Carlos Eduardo Silva",
    clientPhone: "35998812233",
    channel: "whatsapp", // whatsapp, balcao, site, trafego_pago
    isOrganic: true,
    deliveryType: "balcao",
    address: "",
    notes: "Pedido fechado direto pelo WhatsApp.",
    artStatus: "ready", // Trouxe arte pronta -> +15% vai p/ divisão de lucros!
    artLink: "https://drive.google.com/file/d/exemplo-arte-carlos",
    status: "producao",
    paymentStatus: "pago",
    paymentMethod: "Pix",
    attendanceAssignee: "jose",     // José atendeu
    artAssignee: null,              // Arte veio pronta
    productionAssignee: "leonardo", // Leonardo na produção
    cost: 50.00,
    total: 174.50,
    items: [
      {
        productId: "cartao-visita",
        productName: "Cartão de Visita Premium",
        quantity: 1000,
        quantityLabel: "1.000 un",
        size: "Padrão (9x5 cm)",
        paper: "Couché 300g (Encorpado / Padrão)",
        finish: "Laminação Fosca + Verniz Localizado Frente e Verso (Luxo)",
        unitPrice: 174.50,
        subtotal: 174.50
      }
    ]
  },
  {
    id: "PED-1081",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    clientName: "Pizzaria Forno Nobre (Marcos)",
    clientPhone: "35991224455",
    channel: "trafego_pago", // Veio de anúncio Instagram -> 15% reserva de ads
    isOrganic: false,
    deliveryType: "entrega",
    address: "Av. Brasil, 450 - Jd. América",
    notes: "Cardápio novo de promoções.",
    artStatus: "need_design", // José criou a arte
    status: "arte",
    paymentStatus: "parcial",
    paymentMethod: "Pix",
    attendanceAssignee: "jose",     // José atendeu
    artAssignee: "jose",            // José criou a arte (+15%)
    productionAssignee: "leonardo", // Leonardo irá produzir (+25%)
    cost: 110.00,
    total: 365.75,
    items: [
      {
        productId: "panfleto-flyer",
        productName: "Panfletos & Flyers Promocionais",
        quantity: 2500,
        quantityLabel: "2.500 un",
        size: "10x14 cm (1/4 A4)",
        paper: "Couché 90g (Econômico)",
        finish: "Impressão Frente e Verso Colorido (4x4)",
        artFee: 35.00,
        unitPrice: 330.75,
        subtotal: 365.75
      }
    ]
  },
  {
    id: "PED-1080",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    clientName: "Dra. Renata Vasconcelos",
    clientPhone: "35997331122",
    channel: "whatsapp",
    isOrganic: true,
    deliveryType: "balcao",
    address: "",
    notes: "Receituário médico com CRM legível.",
    artStatus: "ready",
    status: "pronto",
    paymentStatus: "pago",
    paymentMethod: "Cartão de Crédito",
    attendanceAssignee: "jose",
    artAssignee: null,
    productionAssignee: "leonardo",
    cost: 40.00,
    total: 150.00,
    items: [
      {
        productId: "talao-recibo",
        productName: "Blocos de Pedido, Recibos & Receituários",
        quantity: 10,
        quantityLabel: "10 blocos (500 folhas)",
        size: "14x20 cm (1/2 Folha A4)",
        paper: "Sulfite Branco 75g",
        finish: "Grampo + Picote Destacável + Numeração",
        unitPrice: 150.00,
        subtotal: 150.00
      }
    ]
  },
  {
    id: "PED-1079",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    clientName: "Academia Iron Fit (Luciano)",
    clientPhone: "35988449988",
    channel: "balcao",
    isOrganic: true,
    deliveryType: "entrega",
    address: "Rua Tiradentes, 88 - Centro",
    notes: "Banner para fachada com reforço.",
    artStatus: "ready",
    status: "entregue",
    paymentStatus: "pago",
    paymentMethod: "Pix",
    attendanceAssignee: "leonardo", // Leonardo atendeu no balcão
    artAssignee: null,
    productionAssignee: "leonardo", // Leonardo produziu
    cost: 45.00,
    total: 141.75,
    items: [
      {
        productId: "banner-lona",
        productName: "Banners & Lonas em Alta Resolução",
        quantity: 1,
        quantityLabel: "1 unidade",
        size: "100 x 150 cm",
        paper: "Lona 440g Fosca",
        finish: "Ilhós Metálico em Toda Volta",
        unitPrice: 141.75,
        subtotal: 141.75
      }
    ]
  }
];

// Movimentações Financeiras Iniciais
const DEFAULT_FINANCES = [
  {
    id: "FIN-1001",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: "receita",
    category: "Venda WhatsApp",
    description: "PED-1082: 1.000 Cartões de Visita (Carlos Eduardo)",
    amount: 174.50,
    paymentMethod: "Pix",
    orderId: "PED-1082"
  },
  {
    id: "FIN-1002",
    date: new Date(Date.now() - 3600000 * 26).toISOString(),
    type: "receita",
    category: "Venda Anúncios",
    description: "PED-1081: Sinal 50% Panfletos (Pizzaria Forno Nobre)",
    amount: 182.87,
    paymentMethod: "Pix",
    orderId: "PED-1081"
  },
  {
    id: "FIN-1003",
    date: new Date(Date.now() - 3600000 * 30).toISOString(),
    type: "despesa",
    category: "Insumos & Papel",
    description: "Compra 6 Resmas Couché 300g + 4 Resmas 90g (Distribuidora Paulista)",
    amount: 380.00,
    paymentMethod: "Pix"
  },
  {
    id: "FIN-1004",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    type: "receita",
    category: "Venda WhatsApp",
    description: "PED-1080: 10 Blocos Receituário (Dra. Renata)",
    amount: 150.00,
    paymentMethod: "Cartão",
    orderId: "PED-1080"
  },
  {
    id: "FIN-1005",
    date: new Date(Date.now() - 3600000 * 50).toISOString(),
    type: "despesa",
    category: "Tintas & Toners",
    description: "Refil de Tinta Fotográfica Cyan + Magenta 1 Litro",
    amount: 220.00,
    paymentMethod: "Boleto"
  },
  {
    id: "FIN-1006",
    date: new Date(Date.now() - 3600000 * 70).toISOString(),
    type: "receita",
    category: "Venda Balcão",
    description: "Venda Balcão: 150 Cópias Coloridas A4 Plastificadas",
    amount: 225.00,
    paymentMethod: "Dinheiro"
  },
  {
    id: "FIN-1007",
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    type: "receita",
    category: "Venda Balcão",
    description: "PED-1079: Banner 100x150cm (Academia Iron Fit)",
    amount: 141.75,
    paymentMethod: "Pix",
    orderId: "PED-1079"
  },
  {
    id: "FIN-1008",
    date: new Date(Date.now() - 3600000 * 90).toISOString(),
    type: "despesa",
    category: "Terceirização",
    description: "Acabamento de Laminação Soft Touch Lote 350",
    amount: 95.00,
    paymentMethod: "Pix"
  },
  {
    id: "FIN-1009",
    date: new Date(Date.now() - 3600000 * 120).toISOString(),
    type: "despesa",
    category: "Custos Fixos",
    description: "Internet Fibra Óptica 600MB + Energia Elétrica",
    amount: 345.00,
    paymentMethod: "Boleto"
  }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      this.saveConfig(DEFAULT_CONFIG);
    } else {
      const cfg = this.getConfig();
      if (!cfg.logoUrl || cfg.logoUrl === 'img/logo.jpg') {
        cfg.logoUrl = DEFAULT_CONFIG.logoUrl;
        cfg.logoIconUrl = DEFAULT_CONFIG.logoIconUrl;
        this.saveConfig(cfg);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveProducts(DEFAULT_PRODUCTS);
    } else {
      let storedProducts = this.getProducts();
      let updated = false;
      storedProducts = storedProducts.map(p => {
        const match = DEFAULT_PRODUCTS.find(dp => dp.id === p.id || (dp.id === 'talao-recibo' && p.id === 'talão-recibo'));
        if (match && (p.image.includes('unsplash.com') || p.id === 'talão-recibo')) {
          updated = true;
          return { ...p, id: match.id, image: match.image };
        }
        return p;
      });
      if (updated) {
        this.saveProducts(storedProducts);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      // Pré-calcula a repartição dos pedidos iniciais
      const initialOrders = DEFAULT_ORDERS.map(order => {
        const split = this.calculateProfitSplit(order.total, order.cost, {
          channel: order.channel,
          isOrganic: order.isOrganic,
          artStatus: order.artStatus,
          attendanceAssignee: order.attendanceAssignee,
          artAssignee: order.artAssignee,
          productionAssignee: order.productionAssignee
        });
        return { ...order, profitSplit: split };
      });
      this.saveOrders(initialOrders);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCES)) {
      this.saveFinances(DEFAULT_FINANCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      this.saveCart([]);
    }
  }

  // ================= MOTOR DE REPARTIÇÃO DE LUCROS =================
  calculateProfitSplit(saleAmount, costAmount = 0, options = {}) {
    const sale = Number(saleAmount) || 0;
    const cost = Number(costAmount) || 0;
    const margin = Math.max(0, sale - cost);

    // Opções
    const channel = options.channel || 'whatsapp';
    const isOrganic = options.isOrganic !== undefined ? options.isOrganic : (channel !== 'trafego_pago');
    const artStatus = options.artStatus || 'ready'; // ready ou need_design
    
    // Responsáveis (jose, leonardo, both)
    const attendanceAssignee = options.attendanceAssignee || 'jose';
    const artAssignee = options.artAssignee || (artStatus === 'need_design' ? 'jose' : null);
    const productionAssignee = options.productionAssignee || 'leonardo';

    // 1. 10% Caixa da Empresa
    const caixaEmpresa = Number((0.10 * margin).toFixed(2));

    // 2. 15% Captação (se orgânico, vai p/ lucros)
    const captacaoValor = isOrganic ? 0 : Number((0.15 * margin).toFixed(2));

    // 3. 15% Atendimento e Fechamento
    const atendimentoValor = Number((0.15 * margin).toFixed(2));

    // 4. 15% Criação da Arte (se pronta, vai p/ lucros)
    const arteValor = (artStatus === 'ready') ? 0 : Number((0.15 * margin).toFixed(2));

    // 5. 25% Produção e Acabamento
    const producaoValor = Number((0.25 * margin).toFixed(2));

    // 6. 20% Base de Divisão de Lucros + Sobras de Captação e Arte
    const sobraCaptacao = isOrganic ? (0.15 * margin) : 0;
    const sobraArte = (artStatus === 'ready') ? (0.15 * margin) : 0;
    const lucroPoolTotal = Number(((0.20 * margin) + sobraCaptacao + sobraArte).toFixed(2));

    // Divisão 50/50 do Lucro
    const lucroJose = Number((lucroPoolTotal / 2).toFixed(2));
    const lucroLeonardo = Number((lucroPoolTotal / 2).toFixed(2));

    // Atribuição de Atendimento (15%)
    let atendimentoJose = 0;
    let atendimentoLeonardo = 0;
    if (attendanceAssignee === 'jose') {
      atendimentoJose = atendimentoValor;
    } else if (attendanceAssignee === 'leonardo') {
      atendimentoLeonardo = atendimentoValor;
    } else {
      atendimentoJose = Number((atendimentoValor / 2).toFixed(2));
      atendimentoLeonardo = Number((atendimentoValor / 2).toFixed(2));
    }

    // Atribuição de Arte (15% ou 0)
    let arteJose = 0;
    let arteLeonardo = 0;
    if (arteValor > 0) {
      if (artAssignee === 'jose') {
        arteJose = arteValor;
      } else if (artAssignee === 'leonardo') {
        arteLeonardo = arteValor;
      } else {
        arteJose = Number((arteValor / 2).toFixed(2));
        arteLeonardo = Number((arteValor / 2).toFixed(2));
      }
    }

    // Atribuição de Produção (25%)
    let producaoJose = 0;
    let producaoLeonardo = 0;
    if (productionAssignee === 'jose') {
      producaoJose = producaoValor;
    } else if (productionAssignee === 'leonardo') {
      producaoLeonardo = producaoValor;
    } else {
      producaoJose = Number((producaoValor / 2).toFixed(2));
      producaoLeonardo = Number((producaoValor / 2).toFixed(2));
    }

    // Totais Consolidados de Cada Sócio
    const totalJose = Number((lucroJose + atendimentoJose + arteJose + producaoJose).toFixed(2));
    const totalLeonardo = Number((lucroLeonardo + atendimentoLeonardo + arteLeonardo + producaoLeonardo).toFixed(2));

    return {
      sale,
      cost,
      margin,
      channel,
      isOrganic,
      artStatus,
      attendanceAssignee,
      artAssignee,
      productionAssignee,
      caixaEmpresa,
      captacaoValor,
      atendimentoValor,
      arteValor,
      producaoValor,
      lucroPoolTotal,
      lucroJose,
      lucroLeonardo,
      atendimentoJose,
      atendimentoLeonardo,
      arteJose,
      arteLeonardo,
      producaoJose,
      producaoLeonardo,
      totalJose,
      totalLeonardo
    };
  }

  // MÉTRICAS CONSOLIDADAS DOS SÓCIOS
  getPartnersMetrics(periodFilter = 'all') {
    const orders = this.getOrders();
    const now = new Date();

    const filtered = orders.filter(o => {
      if (periodFilter === 'all') return true;
      const oDate = new Date(o.createdAt);
      if (periodFilter === 'today') {
        return oDate.toDateString() === now.toDateString();
      }
      if (periodFilter === '7days') {
        const diff = (now - oDate) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (periodFilter === 'month') {
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    let totalJose = 0;
    let totalLeonardo = 0;
    let totalCaixa = 0;
    let totalCaptacao = 0;
    let totalMargem = 0;

    const breakdownJose = {
      lucro: 0,
      atendimento: 0,
      arte: 0,
      producao: 0
    };

    const breakdownLeonardo = {
      lucro: 0,
      atendimento: 0,
      arte: 0,
      producao: 0
    };

    const ordersWithSplit = filtered.map(order => {
      let split = order.profitSplit;
      if (!split) {
        const cost = Number(order.cost) || (Number(order.total) * 0.30);
        split = this.calculateProfitSplit(order.total, cost, {
          channel: order.channel || 'whatsapp',
          isOrganic: order.isOrganic !== undefined ? order.isOrganic : true,
          artStatus: order.artStatus || 'ready',
          attendanceAssignee: order.attendanceAssignee || 'jose',
          artAssignee: order.artAssignee || (order.artStatus === 'need_design' ? 'jose' : null),
          productionAssignee: order.productionAssignee || 'leonardo'
        });
      }

      totalJose += split.totalJose;
      totalLeonardo += split.totalLeonardo;
      totalCaixa += split.caixaEmpresa;
      totalCaptacao += split.captacaoValor;
      totalMargem += split.margin;

      breakdownJose.lucro += split.lucroJose;
      breakdownJose.atendimento += split.atendimentoJose;
      breakdownJose.arte += split.arteJose;
      breakdownJose.producao += split.producaoJose;

      breakdownLeonardo.lucro += split.lucroLeonardo;
      breakdownLeonardo.atendimento += split.atendimentoLeonardo;
      breakdownLeonardo.arte += split.arteLeonardo;
      breakdownLeonardo.producao += split.producaoLeonardo;

      return {
        ...order,
        profitSplit: split
      };
    });

    return {
      totalJose: Number(totalJose.toFixed(2)),
      totalLeonardo: Number(totalLeonardo.toFixed(2)),
      totalCaixa: Number(totalCaixa.toFixed(2)),
      totalCaptacao: Number(totalCaptacao.toFixed(2)),
      totalMargem: Number(totalMargem.toFixed(2)),
      breakdownJose,
      breakdownLeonardo,
      orders: ordersWithSplit
    };
  }

  // ================= CONFIGURAÇÃO =================
  getConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }

  saveConfig(config) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    this.dispatchChangeEvent('config', config);
    if (window.cloudSync) window.cloudSync.schedulePush();
  }

  // ================= PRODUTOS =================
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.dispatchChangeEvent('products', products);
    if (window.cloudSync) window.cloudSync.schedulePush();
  }

  upsertProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      if (!product.id) product.id = 'prod-' + Date.now();
      products.unshift(product);
    }
    this.saveProducts(products);
    return product;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
  }

  // ================= PEDIDOS =================
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.dispatchChangeEvent('orders', orders);
    if (window.cloudSync) window.cloudSync.schedulePush();
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const nextNum = 1083 + orders.length;

    const total = Number(orderData.total) || 0;
    const cost = Number(orderData.cost) !== undefined && !isNaN(Number(orderData.cost)) 
      ? Number(orderData.cost) 
      : Number((total * 0.30).toFixed(2)); // Custo padrão 30% caso não informado

    const channel = orderData.channel || 'whatsapp';
    const isOrganic = orderData.isOrganic !== undefined ? orderData.isOrganic : (channel !== 'trafego_pago');
    const artStatus = orderData.artStatus || 'ready';
    const attendanceAssignee = orderData.attendanceAssignee || 'jose';
    const artAssignee = orderData.artAssignee || (artStatus === 'need_design' ? 'jose' : null);
    const productionAssignee = orderData.productionAssignee || 'leonardo';

    // Calcula Repartição de Lucros no Ato da Criação
    const profitSplit = this.calculateProfitSplit(total, cost, {
      channel,
      isOrganic,
      artStatus,
      attendanceAssignee,
      artAssignee,
      productionAssignee
    });

    const newOrder = {
      id: `PED-${nextNum}`,
      createdAt: new Date().toISOString(),
      status: "novo",
      paymentStatus: "pendente",
      ...orderData,
      total,
      cost,
      channel,
      isOrganic,
      artStatus,
      attendanceAssignee,
      artAssignee,
      productionAssignee,
      profitSplit
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Registra automaticamente como receita futura/prevista
    if (newOrder.total > 0) {
      const catName = channel === 'whatsapp' ? 'Venda WhatsApp' :
                      channel === 'balcao' ? 'Venda Balcão' :
                      channel === 'site' ? 'Venda Catálogo Site' : 'Venda Anúncios';

      this.addFinance({
        type: "receita",
        category: catName,
        description: `${newOrder.id}: ${newOrder.clientName} (${newOrder.items?.[0]?.productName || 'Material Gráfico'})`,
        amount: Number(newOrder.total),
        paymentMethod: newOrder.paymentMethod || "Pix",
        orderId: newOrder.id
      });
    }

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders(orders);
    }
    return order;
  }

  updateOrderPayment(orderId, paymentStatus, paymentMethod) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.paymentStatus = paymentStatus;
      if (paymentMethod) order.paymentMethod = paymentMethod;
      this.saveOrders(orders);
    }
    return order;
  }

  updateOrderSplit(orderId, splitData) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.cost = Number(splitData.cost) || order.cost || 0;
      order.channel = splitData.channel || order.channel;
      order.isOrganic = splitData.isOrganic !== undefined ? splitData.isOrganic : order.isOrganic;
      order.artStatus = splitData.artStatus || order.artStatus;
      order.attendanceAssignee = splitData.attendanceAssignee || order.attendanceAssignee;
      order.artAssignee = splitData.artAssignee || order.artAssignee;
      order.productionAssignee = splitData.productionAssignee || order.productionAssignee;

      order.profitSplit = this.calculateProfitSplit(order.total, order.cost, {
        channel: order.channel,
        isOrganic: order.isOrganic,
        artStatus: order.artStatus,
        attendanceAssignee: order.attendanceAssignee,
        artAssignee: order.artAssignee,
        productionAssignee: order.productionAssignee
      });

      this.saveOrders(orders);
    }
    return order;
  }

  deleteOrder(id) {
    let orders = this.getOrders();
    orders = orders.filter(o => o.id !== id);
    this.saveOrders(orders);

    // Remove despesas ou receitas vinculadas a este pedido para não corromper o caixa e DRE
    let finances = this.getFinances();
    finances = finances.filter(f => f.orderId !== id);
    this.saveFinances(finances);
    return true;
  }

  // ================= CARRINHO (Mobile Storefront) =================
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.dispatchChangeEvent('cart', cart);
  }

  addToCart(item) {
    const cart = this.getCart();
    item.cartItemId = 'cart-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    cart.push(item);
    this.saveCart(cart);
    return cart;
  }

  removeFromCart(cartItemId) {
    let cart = this.getCart();
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    this.saveCart([]);
  }

  // ================= FLUXO DE CAIXA & FINANÇAS =================
  getFinances() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FINANCES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveFinances(finances) {
    localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(finances));
    this.dispatchChangeEvent('finances', finances);
    if (window.cloudSync) window.cloudSync.schedulePush();
  }

  addFinance(tx) {
    const finances = this.getFinances();
    const newTx = {
      id: `FIN-${Date.now().toString().slice(-5)}`,
      date: tx.date || new Date().toISOString(),
      type: tx.type || "receita",
      category: tx.category || "Outros",
      description: tx.description || "Lançamento",
      amount: Math.abs(Number(tx.amount) || 0),
      paymentMethod: tx.paymentMethod || "Pix",
      orderId: tx.orderId || null
    };
    finances.unshift(newTx);
    this.saveFinances(finances);
    return newTx;
  }

  deleteFinance(id) {
    let finances = this.getFinances();
    finances = finances.filter(f => f.id !== id);
    this.saveFinances(finances);
  }

  getFinancialMetrics(periodFilter = 'all') {
    const finances = this.getFinances();
    const now = new Date();
    
    const filtered = finances.filter(tx => {
      if (periodFilter === 'all') return true;
      const txDate = new Date(tx.date);
      if (periodFilter === 'today') {
        return txDate.toDateString() === now.toDateString();
      }
      if (periodFilter === '7days') {
        const diff = (now - txDate) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (periodFilter === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    filtered.forEach(tx => {
      const val = Number(tx.amount) || 0;
      if (tx.type === 'receita') {
        totalRevenue += val;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + val;
      } else {
        totalExpense += val;
      }
    });

    const netProfit = totalRevenue - totalExpense;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    const orders = this.getOrders();
    const completedOrders = orders.filter(o => o.status === 'entregue' || o.paymentStatus === 'pago');
    const averageTicket = completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : 0;

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      profitMargin,
      transactionCount: filtered.length,
      completedOrdersCount: completedOrders.length,
      averageTicket,
      categoryTotals,
      transactions: filtered
    };
  }

  // ================= BACKUP & RESTAURAÇÃO =================
  exportAllData() {
    return JSON.stringify({
      config: this.getConfig(),
      products: this.getProducts(),
      orders: this.getOrders(),
      finances: this.getFinances(),
      exportedAt: new Date().toISOString(),
      version: "2.0"
    }, null, 2);
  }

  importAllData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.config) this.saveConfig(data.config);
      if (data.products) this.saveProducts(data.products);
      if (data.orders) this.saveOrders(data.orders);
      if (data.finances) this.saveFinances(data.finances);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  dispatchChangeEvent(type, data) {
    window.dispatchEvent(new CustomEvent('grafica-data-change', { detail: { type, data } }));
  }
}

// ================= GESTOR DE SINCRONIZAÇÃO EM NUVEM EM TEMPO REAL =================
class CloudSyncManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.cloudEndpoint = 'https://kvdb.io/N1ETYS3RhrX7EkribLWbQu/suldesign_data_v2';
    this.eventBusUrl = 'https://ntfy.sh/suldesign_sync_stream_v2';
    this.cloudKey = localStorage.getItem('suldesign_cloud_key') || 'suldesign_matriz_prod_v2';
    this.customFirebaseUrl = localStorage.getItem('suldesign_firebase_url') || '';
    this.activePartner = localStorage.getItem('suldesign_active_partner') || 'jose';
    this.deviceId = this.getOrCreateDeviceId();

    this.status = 'syncing'; // 'synced', 'syncing', 'offline', 'error'
    this.lastSyncTime = localStorage.getItem('suldesign_last_sync_time') || null;
    this.isSyncing = false;
    this.pendingPush = false;
    this.debounceTimer = null;
    this.sse = null;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  getOrCreateDeviceId() {
    let id = localStorage.getItem('suldesign_device_id');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('suldesign_device_id', id);
    }
    return id;
  }

  getActivePartnerName() {
    return this.activePartner === 'leonardo' ? 'Leonardo Monti' : 'José Reis';
  }

  setActivePartner(partnerId) {
    this.activePartner = partnerId;
    localStorage.setItem('suldesign_active_partner', partnerId);
    this.updateModalUI();
    this.showToast(`Sócio ativo: ${this.getActivePartnerName()}`, 'info');
  }

  async init() {
    this.renderHeaderBadge();
    this.injectSyncModal();

    // 1. Puxa dados da nuvem na inicialização imediatamente
    await this.pullFromCloud();

    // 2. Conecta ao barramento SSE para receber notificações em tempo real
    this.setupRealtimeSSE();

    // 3. Heartbeat periódico a cada 25 segundos
    setInterval(() => {
      if (!document.hidden && !this.isSyncing) {
        this.pullFromCloud(true);
      }
    }, 25000);

    // 4. Ao alternar abas ou focar na janela
    window.addEventListener('focus', () => {
      if (!this.isSyncing) this.pullFromCloud(true);
    });

    // 5. Ao recuperar conexão de rede
    window.addEventListener('online', () => {
      this.setStatus('syncing');
      if (this.pendingPush) {
        this.pushToCloud();
      } else {
        this.pullFromCloud();
      }
    });

    window.addEventListener('offline', () => {
      this.setStatus('offline');
    });
  }

  setupRealtimeSSE() {
    if (typeof EventSource === 'undefined') return;
    try {
      if (this.sse) this.sse.close();
      this.sse = new EventSource(this.eventBusUrl + '/sse');

      this.sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.deviceId && data.deviceId !== this.deviceId) {
            console.log('[CloudSync] Alteração remota detectada por:', data.sender || 'Outro sócio');
            this.pullFromCloud(true);
          }
        } catch(e) {}
      };

      this.sse.onerror = () => {
        // O navegador reconecta automaticamente
      };
    } catch(e) {
      console.warn('[CloudSync] SSE indisponível:', e);
    }
  }

  getEndpointUrl() {
    if (this.customFirebaseUrl && this.customFirebaseUrl.trim()) {
      return `${this.customFirebaseUrl.trim().replace(/\/$/, '')}/suldesign.json`;
    }
    return this.cloudEndpoint;
  }

  async pullFromCloud(silent = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    if (!silent) this.setStatus('syncing');

    try {
      const res = await fetch(this.getEndpointUrl(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && cloudState.data) {
          const localUpdated = localStorage.getItem('suldesign_last_sync_time');
          const remoteUpdated = cloudState.updatedAt;

          const remoteOrders = Array.isArray(cloudState.data.orders) ? cloudState.data.orders : [];
          const localOrders = this.storage.getOrders();

          // Aplica dados da nuvem se for mais recente ou se o local não tem os pedidos reais
          if (!localUpdated || !remoteUpdated || remoteUpdated >= localUpdated || (remoteOrders.length > 0 && localOrders.length === 0)) {
            if (cloudState.data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cloudState.data.config));
            if (cloudState.data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cloudState.data.products));
            if (cloudState.data.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cloudState.data.orders));
            if (cloudState.data.finances) localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(cloudState.data.finances));
            if (cloudState.data.currentBudget) {
              localStorage.setItem('suldesign_current_budget', JSON.stringify(cloudState.data.currentBudget));
            }

            this.lastSyncTime = remoteUpdated || new Date().toISOString();
            localStorage.setItem('suldesign_last_sync_time', this.lastSyncTime);

            // Avisa o painel admin e a página de orçamento para recarregarem os dados
            window.dispatchEvent(new CustomEvent('grafica-data-change', { detail: { type: 'cloud-pull', data: cloudState.data } }));
          }

          this.setStatus('synced');
        } else {
          // Nuvem vazia: envia a semente local
          await this.pushToCloud(true);
        }
      } else {
        this.setStatus(!navigator.onLine ? 'offline' : 'error');
      }
    } catch(err) {
      console.warn('[CloudSync] Erro no pull:', err);
      this.setStatus(!navigator.onLine ? 'offline' : 'synced');
    } finally {
      this.isSyncing = false;
      this.updateUI();
    }
  }

  schedulePush() {
    this.pendingPush = true;
    this.setStatus('syncing');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.pushToCloud();
    }, 800);
  }

  async pushToCloud(silent = false) {
    if (!navigator.onLine) {
      this.pendingPush = true;
      this.setStatus('offline');
      return;
    }

    this.isSyncing = true;
    if (!silent) this.setStatus('syncing');

    let currentBudget = null;
    try {
      const bStr = localStorage.getItem('suldesign_current_budget');
      if (bStr) currentBudget = JSON.parse(bStr);
    } catch(e) {}

    const now = new Date().toISOString();
    const payload = {
      app: 'SulDesign',
      version: '2.2',
      updatedAt: now,
      updatedBy: this.getActivePartnerName(),
      deviceId: this.deviceId,
      data: {
        config: this.storage.getConfig(),
        products: this.storage.getProducts(),
        orders: this.storage.getOrders(),
        finances: this.storage.getFinances(),
        currentBudget: currentBudget
      }
    };

    try {
      const res = await fetch(this.getEndpointUrl(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.pendingPush = false;
        this.lastSyncTime = now;
        localStorage.setItem('suldesign_last_sync_time', now);
        this.setStatus('synced');

        // Notifica parceiros via stream SSE
        this.notifyPeers();
      } else {
        this.setStatus('error');
      }
    } catch(err) {
      console.warn('[CloudSync] Erro no push:', err);
      this.pendingPush = true;
      this.setStatus(!navigator.onLine ? 'offline' : 'error');
    } finally {
      this.isSyncing = false;
      this.updateUI();
    }
  }

  async notifyPeers() {
    try {
      await fetch(this.eventBusUrl, {
        method: 'POST',
        headers: { 'Title': 'Sul Design Sync' },
        body: JSON.stringify({
          action: 'update',
          deviceId: this.deviceId,
          sender: this.getActivePartnerName(),
          timestamp: Date.now()
        })
      });
    } catch(e) {}
  }

  async syncNow() {
    this.showToast('Sincronizando com a nuvem...', 'info');
    await this.pushToCloud();
    await this.pullFromCloud();
    this.showToast('Nuvem atualizada e sincronizada com sucesso!', 'success');
  }

  setStatus(newStatus) {
    this.status = newStatus;
    this.updateUI();
  }

  formatLastSyncTime() {
    if (!this.lastSyncTime) return 'Nunca';
    try {
      const d = new Date(this.lastSyncTime);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString('pt-BR') + ')';
    } catch(e) {
      return this.lastSyncTime;
    }
  }

  updateUI() {
    const badgeBtn = document.getElementById('cloudSyncBadgeBtn');
    if (badgeBtn) {
      const dot = badgeBtn.querySelector('.sync-dot');
      const text = badgeBtn.querySelector('.sync-text');

      badgeBtn.className = 'px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition select-none shadow-sm cursor-pointer ';

      if (this.status === 'synced') {
        badgeBtn.className += 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100';
        if (dot) dot.className = 'sync-dot w-2 h-2 rounded-full bg-emerald-500';
        if (text) text.textContent = 'Nuvem Sincronizada';
      } else if (this.status === 'syncing') {
        badgeBtn.className += 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100';
        if (dot) dot.className = 'sync-dot w-2 h-2 rounded-full bg-amber-500 animate-ping';
        if (text) text.textContent = 'Sincronizando...';
      } else if (this.status === 'offline') {
        badgeBtn.className += 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100';
        if (dot) dot.className = 'sync-dot w-2 h-2 rounded-full bg-rose-500';
        if (text) text.textContent = 'Modo Offline (Salvo no PC)';
      } else {
        badgeBtn.className += 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100';
        if (dot) dot.className = 'sync-dot w-2 h-2 rounded-full bg-amber-500';
        if (text) text.textContent = 'Conectando Nuvem...';
      }
    }

    this.updateModalUI();
  }

  renderHeaderBadge() {
    if (document.getElementById('cloudSyncBadgeBtn')) return;

    let container = document.getElementById('cloudSyncSlot');
    if (!container) {
      container = document.querySelector('header .flex.items-center.gap-2') || document.querySelector('header');
    }
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'cloudSyncBadgeBtn';
    btn.onclick = () => this.openSyncModal();
    btn.className = 'px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition select-none shadow-sm cursor-pointer bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100';
    btn.title = 'Status da Sincronização na Nuvem da Sul Design (Clique para gerenciar)';
    btn.innerHTML = `
      <span class="sync-dot w-2 h-2 rounded-full bg-emerald-500"></span>
      <span class="sync-text text-[11px] font-black">Nuvem Sincronizada</span>
    `;

    container.prepend(btn);
  }

  injectSyncModal() {
    if (document.getElementById('cloudSyncModal')) return;

    const modal = document.createElement('div');
    modal.id = 'cloudSyncModal';
    modal.className = 'fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Cabeçalho -->
        <div class="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h3 class="font-black text-base leading-tight">Sincronização em Nuvem</h3>
              <p class="text-xs text-stone-300 font-medium mt-0.5">Sul Design • José Reis & Leonardo Monti</p>
            </div>
          </div>
          <button onclick="window.cloudSync.closeSyncModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg font-bold transition">
            ✕
          </button>
        </div>

        <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <!-- Card de Status da Conexão -->
          <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">Status da Nuvem:</span>
              <div id="modalSyncStatusText" class="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Conectado & Sincronizado
              </div>
              <span id="modalSyncLastTime" class="text-[10px] text-stone-500 font-medium block mt-1">Última sincronização: Carregando...</span>
            </div>
            <button onclick="window.cloudSync.syncNow()" class="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Sincronizar Agora
            </button>
          </div>

          <!-- Seletor do Sócio no Dispositivo Atual -->
          <div>
            <label class="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">Quem está usando este aparelho agora?</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                id="btnPartnerJose"
                onclick="window.cloudSync.setActivePartner('jose')"
                class="p-3 rounded-2xl border text-left transition"
              >
                <div class="font-black text-xs text-stone-900">José Reis</div>
                <div class="text-[10px] text-stone-500 font-medium">Sócio • Atendimento & Arte</div>
              </button>
              <button 
                id="btnPartnerLeo"
                onclick="window.cloudSync.setActivePartner('leonardo')"
                class="p-3 rounded-2xl border text-left transition"
              >
                <div class="font-black text-xs text-stone-900">Leonardo Monti</div>
                <div class="text-[10px] text-stone-500 font-medium">Sócio • Produção & Acabamento</div>
              </button>
            </div>
          </div>

          <!-- Backup & Segurança -->
          <div class="pt-4 border-t border-stone-200">
            <label class="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">Cópia de Segurança (Backup)</label>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="window.cloudSync.exportBackupFile()" class="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-stone-200">
                <svg class="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Baixar Backup (.json)
              </button>

              <label class="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-stone-200 cursor-pointer text-center">
                <svg class="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Restaurar Backup
                <input type="file" accept=".json" class="hidden" onchange="window.cloudSync.importBackupFile(this.files[0])">
              </label>
            </div>
          </div>

          <!-- Configuração Avançada (Sanfona) -->
          <details class="pt-2 text-xs text-stone-600">
            <summary class="font-bold text-stone-700 cursor-pointer hover:text-stone-900 select-none py-1">
              ⚙️ Opções Avançadas de Servidor / Banco Próprio
            </summary>
            <div class="pt-3 space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 mt-2">
              <div>
                <label class="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1">Chave da Matriz Sul Design:</label>
                <input type="text" id="modalCloudKeyInput" value="${this.cloudKey}" class="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold bg-white">
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1">URL Banco Firebase / Supabase (Opcional):</label>
                <input type="text" id="modalFirebaseUrlInput" placeholder="Ex: https://meu-projeto-default-rtdb.firebaseio.com" value="${this.customFirebaseUrl}" class="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono bg-white">
              </div>
              <button onclick="window.cloudSync.saveAdvancedSettings()" class="w-full py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition">
                Salvar Configurações Avançadas
              </button>
            </div>
          </details>
        </div>

        <div class="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button onclick="window.cloudSync.closeSyncModal()" class="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition">
            Concluir & Fechar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeSyncModal();
    });
  }

  updateModalUI() {
    const statusText = document.getElementById('modalSyncStatusText');
    const lastTime = document.getElementById('modalSyncLastTime');
    const btnJose = document.getElementById('btnPartnerJose');
    const btnLeo = document.getElementById('btnPartnerLeo');

    if (statusText) {
      if (this.status === 'synced') {
        statusText.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Conectado & Sincronizado';
        statusText.className = 'text-xs font-black text-emerald-700 flex items-center gap-1.5';
      } else if (this.status === 'syncing') {
        statusText.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> Sincronizando dados...';
        statusText.className = 'text-xs font-black text-amber-700 flex items-center gap-1.5';
      } else {
        statusText.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Modo Offline (Salvo Localmente)';
        statusText.className = 'text-xs font-black text-rose-700 flex items-center gap-1.5';
      }
    }

    if (lastTime) {
      lastTime.textContent = `Última sincronização: ${this.formatLastSyncTime()}`;
    }

    if (btnJose && btnLeo) {
      if (this.activePartner === 'jose') {
        btnJose.className = 'p-3 rounded-2xl border-2 border-orange-500 bg-orange-50 text-left transition';
        btnLeo.className = 'p-3 rounded-2xl border border-stone-200 bg-white text-left transition hover:bg-stone-50';
      } else {
        btnLeo.className = 'p-3 rounded-2xl border-2 border-orange-500 bg-orange-50 text-left transition';
        btnJose.className = 'p-3 rounded-2xl border border-stone-200 bg-white text-left transition hover:bg-stone-50';
      }
    }
  }

  openSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (modal) {
      this.updateModalUI();
      modal.classList.remove('hidden');
    }
  }

  closeSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  saveAdvancedSettings() {
    const keyInput = document.getElementById('modalCloudKeyInput');
    const fbInput = document.getElementById('modalFirebaseUrlInput');

    if (keyInput) {
      this.cloudKey = keyInput.value.trim() || 'suldesign_matriz_prod_v2';
      localStorage.setItem('suldesign_cloud_key', this.cloudKey);
    }
    if (fbInput) {
      this.customFirebaseUrl = fbInput.value.trim();
      localStorage.setItem('suldesign_firebase_url', this.customFirebaseUrl);
    }

    this.showToast('Configurações salvas! Sincronizando...', 'success');
    this.syncNow();
  }

  async exportBackupFile() {
    let budget = null;
    try { budget = JSON.parse(localStorage.getItem('suldesign_current_budget')); } catch(e) {}
    const backupData = {
      app: 'SulDesign',
      exportedAt: new Date().toISOString(),
      partner: this.getActivePartnerName(),
      config: this.storage.getConfig(),
      products: this.storage.getProducts(),
      orders: this.storage.getOrders(),
      finances: this.storage.getFinances(),
      currentBudget: budget
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `backup-suldesign-${d}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📥 Backup baixado com sucesso!', 'success');
  }

  async importBackupFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || (!parsed.orders && !parsed.config)) {
        throw new Error('Arquivo de backup inválido.');
      }

      if (parsed.config) this.storage.saveConfig(parsed.config);
      if (parsed.products) this.storage.saveProducts(parsed.products);
      if (parsed.orders) this.storage.saveOrders(parsed.orders);
      if (parsed.finances) this.storage.saveFinances(parsed.finances);
      if (parsed.currentBudget) {
        localStorage.setItem('suldesign_current_budget', JSON.stringify(parsed.currentBudget));
      }

      await this.pushToCloud();
      this.showToast('✅ Backup restaurado e sincronizado na nuvem com sucesso!', 'success');
      setTimeout(() => location.reload(), 1200);
    } catch(err) {
      alert('Erro ao importar backup: ' + err.message);
    }
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-stone-900';
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl ${bg} text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instâncias Globais
window.storage = new StorageManager();
window.cloudSync = new CloudSyncManager(window.storage);
