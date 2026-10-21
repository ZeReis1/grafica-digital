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
  logoUrl: "img/logo.jpg",
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
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "talão-recibo",
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
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
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
        productId: "talão-recibo",
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
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveProducts(DEFAULT_PRODUCTS);
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

// Instância Global
window.storage = new StorageManager();
