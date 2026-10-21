/**
 * APP.JS - Lógica do Catálogo Digital Mobile-First para Clientes
 * Gráfica Digital • Simulador de Preços em Tempo Real & Checkout WhatsApp
 */

class GraphicShopApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentProduct = null;
    this.calcState = {
      quantity: null,
      size: null,
      paper: null,
      finish: null,
      extras: [],
      artChoice: 'ready' // 'ready' ou 'need'
    };

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.loadStoreConfig();
    this.renderProducts();
    this.updateCartBadges();

    // Listener para sincronização automática entre abas
    window.addEventListener('grafica-data-change', (e) => {
      if (e.detail.type === 'config') this.loadStoreConfig();
      if (e.detail.type === 'products') this.renderProducts();
      if (e.detail.type === 'cart') this.updateCartBadges();
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  loadStoreConfig() {
    const config = window.storage.getConfig();
    
    // Atualiza nome da loja nos headers e footers
    const headerName = document.getElementById('headerStoreName');
    if (headerName) headerName.textContent = config.shortName || config.storeName;

    const footerName = document.getElementById('footerStoreName');
    if (footerName) footerName.textContent = config.storeName;

    const footerTagline = document.getElementById('footerTagline');
    if (footerTagline) footerTagline.textContent = config.tagline;

    const footerAddress = document.getElementById('footerAddress');
    if (footerAddress) footerAddress.textContent = config.address;

    const footerHours = document.getElementById('footerHours');
    if (footerHours) footerHours.textContent = config.operatingHours;

    const cartPixKey = document.getElementById('cartPixKey');
    if (cartPixKey) cartPixKey.textContent = config.pixKey;

    const cartPixOwner = document.getElementById('cartPixOwner');
    if (cartPixOwner) cartPixOwner.textContent = config.pixOwner;

    // Atualiza Links do WhatsApp
    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre os serviços da gráfica.')}`;
    
    const floatingWhatsapp = document.getElementById('floatingWhatsapp');
    if (floatingWhatsapp) floatingWhatsapp.href = whatsappUrl;

    const btnBottomWhatsapp = document.getElementById('btnBottomWhatsapp');
    if (btnBottomWhatsapp) btnBottomWhatsapp.href = whatsappUrl;

    const artFeeBadge = document.getElementById('artFeeBadge');
    if (artFeeBadge) artFeeBadge.textContent = `+ R$ ${Number(config.standardArtFee).toFixed(2).replace('.', ',')}`;
  }

  // ================= CATÁLOGO & PRODUTOS =================
  renderProducts() {
    const container = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptySearch');
    const countLabel = document.getElementById('productCount');
    if (!container) return;

    let products = window.storage.getProducts();

    // Filtro por Categoria
    if (this.currentCategory !== 'all') {
      products = products.filter(p => p.category === this.currentCategory);
    }

    // Filtro por Busca
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }

    if (countLabel) {
      countLabel.textContent = `${products.length} ${products.length === 1 ? 'item disponível' : 'itens disponíveis'}`;
    }

    if (products.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = products.map(product => {
      const badgeClass = product.badgeType === 'hot' ? 'badge-hot' : 
                         product.badgeType === 'accent' ? 'badge-accent' : 'badge-neutral';
      
      const minPriceFormatted = Number(product.basePrice).toFixed(2).replace('.', ',');

      return `
        <article class="product-card">
          <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.badge ? `<span class="absolute top-3 left-3 ${badgeClass} shadow-sm">${product.badge}</span>` : ''}
            <span class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              ⚡ ${product.turnaround}
            </span>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block mb-1">
                ${product.categoryLabel}
              </span>
              <h3 class="font-bold text-slate-900 text-base leading-snug mb-1">
                ${product.name}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2 mb-3">
                ${product.description}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span class="text-[10px] text-slate-400 font-semibold block leading-tight">A partir de</span>
                <div class="flex items-baseline gap-0.5">
                  <span class="text-xs font-bold text-slate-700">R$</span>
                  <span class="text-lg font-black text-slate-900">${minPriceFormatted}</span>
                </div>
              </div>

              <button 
                onclick="app.openCalculator('${product.id}')"
                class="px-4 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 active:scale-95 transition shadow-md shadow-sky-600/20 flex items-center gap-1.5"
              >
                <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
                Personalizar & Orçar
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  filterCategory(category, buttonEl) {
    this.currentCategory = category;
    
    // Atualiza chips visuais
    document.querySelectorAll('.cat-chip').forEach(btn => btn.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');

    // Atualiza título da seção
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
      sectionTitle.textContent = category === 'all' ? 'Produtos em Destaque' : buttonEl.textContent.trim();
    }

    this.renderProducts();
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.renderProducts();
  }

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    this.filterCategory('all', document.querySelector('.cat-chip'));
  }

  focusSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= SIMULADOR DE PREÇOS EM TEMPO REAL =================
  openCalculator(productId) {
    const product = window.storage.getProductById(productId);
    if (!product) return;

    this.currentProduct = product;

    // Inicializa escolhas padrão
    const defaultQty = product.quantities.find(q => q.popular) || product.quantities[0];
    const defaultPaper = product.papers && product.papers.length > 0 ? product.papers[0] : null;
    const defaultFinish = product.finishes && product.finishes.length > 0 ? product.finishes[0] : null;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;

    this.calcState = {
      quantity: defaultQty,
      size: defaultSize,
      paper: defaultPaper,
      finish: defaultFinish,
      extras: [],
      artChoice: 'ready'
    };

    // Atualiza Cabeçalho do Modal
    document.getElementById('calcProductName').textContent = product.name;
    document.getElementById('calcProductTurnaround').textContent = `⚡ Prazo: ${product.turnaround}`;

    // 1. Renderiza Tiragens / Quantidades
    const qtyContainer = document.getElementById('calcQuantities');
    qtyContainer.innerHTML = product.quantities.map(q => `
      <div 
        class="option-btn ${q.qty === defaultQty.qty ? 'selected' : ''}" 
        onclick="app.selectQuantity(${q.qty}, this)"
      >
        <span class="text-xs font-bold text-slate-800">${q.label}</span>
        <span class="text-[10px] text-slate-500 font-semibold mt-0.5">R$ ${Number(q.price).toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('');

    // 2. Renderiza Papéis
    const paperSection = document.getElementById('calcPaperSection');
    const papersContainer = document.getElementById('calcPapers');
    if (product.papers && product.papers.length > 0) {
      paperSection.classList.remove('hidden');
      papersContainer.innerHTML = product.papers.map((p, idx) => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-sky-300 transition text-xs font-medium">
          <div class="flex items-center gap-2">
            <input type="radio" name="calcPaper" value="${p.id}" ${idx === 0 ? 'checked' : ''} onchange="app.selectPaper('${p.id}')" class="text-sky-600 focus:ring-sky-500">
            <span class="text-slate-800">${p.label}</span>
          </div>
          ${p.priceAdd !== 0 ? `<span class="text-[11px] font-bold ${p.priceAdd > 0 ? 'text-sky-700' : 'text-emerald-600'}">${p.priceAdd > 0 ? '+ R$ ' + p.priceAdd.toFixed(2) : '- R$ ' + Math.abs(p.priceAdd).toFixed(2)}</span>` : '<span class="text-[10px] text-slate-400">Padrão</span>'}
        </label>
      `).join('');
    } else {
      paperSection.classList.add('hidden');
    }

    // 3. Renderiza Acabamentos
    const finishSection = document.getElementById('calcFinishSection');
    const finishesContainer = document.getElementById('calcFinishes');
    if (product.finishes && product.finishes.length > 0) {
      finishSection.classList.remove('hidden');
      finishesContainer.innerHTML = product.finishes.map((f, idx) => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-sky-300 transition text-xs font-medium">
          <div class="flex items-center gap-2">
            <input type="radio" name="calcFinish" value="${f.id}" ${idx === 0 ? 'checked' : ''} onchange="app.selectFinish('${f.id}')" class="text-sky-600 focus:ring-sky-500">
            <span class="text-slate-800">${f.label}</span>
          </div>
        </label>
      `).join('');
    } else {
      finishSection.classList.add('hidden');
    }

    // 4. Reset de Arte
    const artReadyRadio = document.querySelector('input[name="artChoice"][value="ready"]');
    if (artReadyRadio) artReadyRadio.checked = true;

    // 5. Extras (se existirem)
    const extrasSection = document.getElementById('calcExtrasSection');
    const extrasContainer = document.getElementById('calcExtras');
    if (product.extras && product.extras.length > 0) {
      extrasSection.classList.remove('hidden');
      extrasContainer.innerHTML = product.extras.map(extra => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-sky-300 transition text-xs font-medium">
          <div class="flex items-center gap-2">
            <input type="checkbox" value="${extra.id}" onchange="app.toggleExtra('${extra.id}', this.checked)" class="rounded text-sky-600 focus:ring-sky-500">
            <span class="text-slate-800">${extra.label}</span>
          </div>
          <span class="text-[11px] font-bold text-sky-700">+ R$ ${Number(extra.priceFixed).toFixed(2).replace('.', ',')}</span>
        </label>
      `).join('');
    } else {
      extrasSection.classList.add('hidden');
    }

    this.recalculatePrice();

    const modal = document.getElementById('calculatorModal');
    if (modal) modal.classList.add('active');
  }

  selectQuantity(qty, el) {
    const qObj = this.currentProduct.quantities.find(q => q.qty === qty);
    if (!qObj) return;
    this.calcState.quantity = qObj;

    document.querySelectorAll('#calcQuantities .option-btn').forEach(btn => btn.classList.remove('selected'));
    if (el) el.classList.add('selected');

    this.recalculatePrice();
  }

  selectPaper(paperId) {
    const pObj = this.currentProduct.papers.find(p => p.id === paperId);
    if (pObj) this.calcState.paper = pObj;
    this.recalculatePrice();
  }

  selectFinish(finishId) {
    const fObj = this.currentProduct.finishes.find(f => f.id === finishId);
    if (fObj) this.calcState.finish = fObj;
    this.recalculatePrice();
  }

  handleArtChange(choice) {
    this.calcState.artChoice = choice;
    this.recalculatePrice();
  }

  toggleExtra(extraId, isChecked) {
    const extra = this.currentProduct.extras.find(e => e.id === extraId);
    if (!extra) return;

    if (isChecked) {
      this.calcState.extras.push(extra);
    } else {
      this.calcState.extras = this.calcState.extras.filter(e => e.id !== extraId);
    }
    this.recalculatePrice();
  }

  recalculatePrice() {
    if (!this.currentProduct || !this.calcState.quantity) return;

    const config = window.storage.getConfig();
    let base = Number(this.calcState.quantity.price) || 0;

    // Adicional do Papel
    if (this.calcState.paper && this.calcState.paper.priceAdd) {
      base += Number(this.calcState.paper.priceAdd);
    }

    // Multiplicador de Acabamento
    if (this.calcState.finish && this.calcState.finish.multiplier) {
      base = base * Number(this.calcState.finish.multiplier);
    }

    // Extras fixos
    if (this.calcState.extras && this.calcState.extras.length > 0) {
      this.calcState.extras.forEach(extra => {
        base += Number(extra.priceFixed || 0);
      });
    }

    // Taxa de Criação de Arte
    let artFee = 0;
    if (this.calcState.artChoice === 'need') {
      artFee = Number(config.standardArtFee || 35.00);
      base += artFee;
    }

    this.calcState.currentTotal = Number(base.toFixed(2));

    // Atualiza Displays
    const valEl = document.getElementById('calcTotalValue');
    if (valEl) valEl.textContent = this.calcState.currentTotal.toFixed(2).replace('.', ',');

    const summaryUnit = document.getElementById('calcSummaryUnit');
    if (summaryUnit) summaryUnit.textContent = `${this.calcState.quantity.label}`;

    const summaryTurnaround = document.getElementById('calcSummaryTurnaround');
    if (summaryTurnaround) summaryTurnaround.textContent = this.currentProduct.turnaround;
  }

  closeCalculatorModal() {
    const modal = document.getElementById('calculatorModal');
    if (modal) modal.classList.remove('active');
  }

  closeCalculatorOnBackdrop(e) {
    if (e.target.id === 'calculatorModal') {
      this.closeCalculatorModal();
    }
  }

  // ================= ADICIONAR AO CARRINHO & CHECKOUT =================
  addCurrentToCart() {
    if (!this.currentProduct || !this.calcState.quantity) return;

    const item = {
      productId: this.currentProduct.id,
      productName: this.currentProduct.name,
      quantity: this.calcState.quantity.qty,
      quantityLabel: this.calcState.quantity.label,
      paper: this.calcState.paper ? this.calcState.paper.label : 'Padrão',
      finish: this.calcState.finish ? this.calcState.finish.label : 'Padrão',
      size: this.calcState.size ? this.calcState.size.label : 'Padrão',
      extras: this.calcState.extras.map(e => e.label),
      artChoice: this.calcState.artChoice,
      artFee: this.calcState.artChoice === 'need' ? Number(window.storage.getConfig().standardArtFee) : 0,
      total: this.calcState.currentTotal
    };

    window.storage.addToCart(item);
    this.closeCalculatorModal();
    this.updateCartBadges();

    // Feedback visual
    this.showToast('Item adicionado ao carrinho com sucesso! 🛒');
  }

  orderCurrentViaWhatsApp() {
    // Adiciona o item e abre o checkout imediatamente
    this.addCurrentToCart();
    this.openCartModal();
  }

  updateCartBadges() {
    const cart = window.storage.getCart();
    const count = cart.length;

    const badgeHeader = document.getElementById('cartBadge');
    if (badgeHeader) {
      badgeHeader.textContent = count;
      if (count > 0) {
        badgeHeader.classList.remove('scale-0');
        badgeHeader.classList.add('scale-100');
      } else {
        badgeHeader.classList.remove('scale-100');
        badgeHeader.classList.add('scale-0');
      }
    }

    const navBadge = document.getElementById('navCartBadge');
    if (navBadge) {
      navBadge.textContent = count;
      if (count > 0) {
        navBadge.classList.remove('scale-0');
        navBadge.classList.add('scale-100');
      } else {
        navBadge.classList.remove('scale-100');
        navBadge.classList.add('scale-0');
      }
    }
  }

  openCartModal() {
    const cart = window.storage.getCart();
    const itemsList = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyState');
    const form = document.getElementById('checkoutForm');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotalValue');

    if (cart.length === 0) {
      if (itemsList) itemsList.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (form) form.classList.add('hidden');
      if (footer) footer.classList.add('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (form) form.classList.remove('hidden');
      if (footer) footer.classList.remove('hidden');

      let grandTotal = 0;

      itemsList.innerHTML = cart.map(item => {
        grandTotal += Number(item.total);
        return `
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3">
            <div class="flex-1">
              <h4 class="font-bold text-slate-800 text-xs">${item.productName}</h4>
              <div class="text-[11px] text-slate-500 space-y-0.5 mt-1">
                <p>• <strong>Tiragem:</strong> ${item.quantityLabel}</p>
                <p>• <strong>Papel:</strong> ${item.paper}</p>
                <p>• <strong>Acabamento:</strong> ${item.finish}</p>
                <p>• <strong>Arte:</strong> ${item.artChoice === 'need' ? '🎨 Criação de Arte Profissional' : '✅ Arte Própria do Cliente'}</p>
              </div>
              <div class="mt-2 text-xs font-black text-sky-700">
                R$ ${Number(item.total).toFixed(2).replace('.', ',')}
              </div>
            </div>

            <button onclick="app.removeCartItem('${item.cartItemId}')" class="text-slate-400 hover:text-red-500 p-1.5 transition" title="Remover item">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      }).join('');

      if (totalEl) totalEl.textContent = grandTotal.toFixed(2).replace('.', ',');
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.add('active');
  }

  removeCartItem(cartItemId) {
    window.storage.removeFromCart(cartItemId);
    this.openCartModal();
    this.updateCartBadges();
  }

  closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.remove('active');
  }

  closeCartOnBackdrop(e) {
    if (e.target.id === 'cartModal') {
      this.closeCartModal();
    }
  }

  toggleDeliveryAddress(isDelivery) {
    const field = document.getElementById('addressField');
    if (field) {
      if (isDelivery) {
        field.classList.remove('hidden');
      } else {
        field.classList.add('hidden');
      }
    }
  }

  submitCartOrder() {
    const cart = window.storage.getCart();
    if (cart.length === 0) return;

    const nameInput = document.getElementById('clientNameInput');
    const phoneInput = document.getElementById('clientPhoneInput');
    const addressInput = document.getElementById('clientAddressInput');
    const artLinkInput = document.getElementById('clientArtLinkInput');
    const notesInput = document.getElementById('clientNotesInput');
    const deliveryRadio = document.querySelector('input[name="deliveryType"]:checked');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const isDelivery = deliveryRadio && deliveryRadio.value === 'entrega';
    const address = isDelivery && addressInput ? addressInput.value.trim() : '';
    const artLink = artLinkInput ? artLinkInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!name) {
      alert('Por favor, informe seu Nome Completo para identificarmos seu pedido.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!phone || phone.length < 8) {
      alert('Por favor, informe seu WhatsApp com DDD para contato.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (isDelivery && !address) {
      alert('Por favor, preencha o Endereço de Entrega.');
      if (addressInput) addressInput.focus();
      return;
    }

    const grandTotal = cart.reduce((acc, item) => acc + Number(item.total), 0);
    const config = window.storage.getConfig();

    // 1. Salva o Pedido no Banco de Dados
    const newOrder = window.storage.createOrder({
      clientName: name,
      clientPhone: phone.replace(/\D/g, ''),
      deliveryType: isDelivery ? 'entrega' : 'balcao',
      address: address,
      notes: notes,
      artStatus: cart.some(i => i.artChoice === 'need') ? 'need_design' : 'ready',
      artLink: artLink,
      paymentMethod: 'Pix',
      items: cart,
      total: grandTotal
    });

    // 2. Limpa o Carrinho
    window.storage.clearCart();
    this.updateCartBadges();
    this.closeCartModal();

    // 3. Chuva de Confetes
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // 4. Monta a Mensagem Formatada para o WhatsApp
    let msg = `👋 *Olá, ${config.storeName}! Acabei de fechar um pedido pelo catálogo digital:*\n\n`;
    msg += `📄 *PEDIDO:* #${newOrder.id}\n`;
    msg += `👤 *Cliente:* ${name}\n`;
    msg += `📱 *WhatsApp:* ${phone}\n`;
    msg += `📍 *Retirada:* ${isDelivery ? `Entrega no endereço: ${address}` : 'Retirar no Balcão da Gráfica'}\n`;
    if (artLink) msg += `🔗 *Link da Arte:* ${artLink}\n`;
    if (notes) msg += `📝 *Obs:* ${notes}\n`;

    msg += `\n📦 *ITENS DO PEDIDO:*\n`;
    cart.forEach((item, idx) => {
      msg += `\n*${idx + 1}. ${item.productName}*\n`;
      msg += `   • Quantidade: ${item.quantityLabel}\n`;
      msg += `   • Papel: ${item.paper}\n`;
      msg += `   • Acabamento: ${item.finish}\n`;
      msg += `   • Arte: ${item.artChoice === 'need' ? '🎨 Quero que a gráfica crie' : '✅ Enviarei a arte pronta'}\n`;
      msg += `   • Subtotal: R$ ${Number(item.total).toFixed(2).replace('.', ',')}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *VALOR TOTAL: R$ ${grandTotal.toFixed(2).replace('.', ',')}*\n`;
    msg += `🔑 *Pagamento:* Chave Pix: ${config.pixKey} (${config.pixOwner})\n`;
    msg += `\n_Estou enviando para darmos início à conferência de arte e produção!_`;

    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    // Abre o WhatsApp
    window.open(whatsappUrl, '_blank');

    // Abre modal com comprovante e código de rastreio
    this.showOrderConfirmationModal(newOrder);
  }

  showOrderConfirmationModal(order) {
    const html = `
      <div id="confirmOrderModal" class="modal-overlay active">
        <div class="modal-sheet max-w-md p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="check-circle" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-black text-slate-900">Pedido Enviado com Sucesso!</h3>
          <p class="text-xs text-slate-500 mt-1">Seu pedido foi registrado no sistema e aberto no seu WhatsApp.</p>

          <div class="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
            <p><strong>Número do Pedido:</strong> <span class="text-sky-600 font-extrabold">${order.id}</span></p>
            <p><strong>Total:</strong> R$ ${Number(order.total).toFixed(2).replace('.', ',')}</p>
            <p><strong>Status Inicial:</strong> <span class="px-2 py-0.5 rounded-full status-novo text-[10px] font-bold">Aguardando Início</span></p>
          </div>

          <p class="text-[11px] text-slate-400 mb-4">
            Guarde o número <strong>${order.id}</strong> para consultar o andamento da produção na aba "Rastrear".
          </p>

          <button onclick="document.getElementById('confirmOrderModal').remove()" class="btn-primary w-full text-xs">
            Entendido / Fechar
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons();
  }

  // ================= RASTREADOR DE PEDIDOS =================
  openTrackerModal() {
    const modal = document.getElementById('trackerModal');
    if (modal) modal.classList.add('active');
  }

  closeTrackerModal() {
    const modal = document.getElementById('trackerModal');
    if (modal) modal.classList.remove('active');
  }

  closeTrackerOnBackdrop(e) {
    if (e.target.id === 'trackerModal') {
      this.closeTrackerModal();
    }
  }

  trackOrder() {
    const input = document.getElementById('trackerInput');
    const resultBox = document.getElementById('trackerResult');
    if (!input || !resultBox) return;

    const term = input.value.trim().toUpperCase().replace(/\s/g, '');
    if (!term) {
      alert('Digite o número do pedido (ex: PED-1082) ou seu telefone.');
      return;
    }

    const orders = window.storage.getOrders();
    const order = orders.find(o => 
      o.id.toUpperCase() === term || 
      (o.clientPhone && o.clientPhone.includes(term.replace(/\D/g, '')))
    );

    resultBox.classList.remove('hidden');

    if (!order) {
      resultBox.innerHTML = `
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
          <p class="font-bold text-red-800 text-xs">Nenhum pedido encontrado para "${term}"</p>
          <p class="text-[11px] text-red-600 mt-1">Verifique o número digitado ou chame nossa equipe no WhatsApp.</p>
        </div>
      `;
      return;
    }

    // Status Map
    const statusMap = {
      novo: { step: 1, label: "Pedido Recebido", color: "text-amber-600" },
      arte: { step: 2, label: "Conferência / Criação de Arte", color: "text-purple-600" },
      producao: { step: 3, label: "Em Impressão & Acabamento", color: "text-sky-600" },
      pronto: { step: 4, label: "Pronto para Retirada no Balcão 🎉", color: "text-emerald-600 font-bold" },
      entregue: { step: 5, label: "Entregue ao Cliente", color: "text-slate-600 font-bold" },
      cancelado: { step: 0, label: "Pedido Cancelado", color: "text-red-600 font-bold" }
    };

    const currentStatus = statusMap[order.status] || { step: 1, label: order.status, color: "text-slate-700" };

    resultBox.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pedido Localizado</span>
            <h4 class="font-black text-slate-900 text-sm">${order.id} - ${order.clientName}</h4>
          </div>
          <span class="text-xs font-bold text-sky-700">R$ ${Number(order.total).toFixed(2).replace('.', ',')}</span>
        </div>

        <div>
          <span class="text-[11px] text-slate-500 font-medium block mb-1">Status Atual da Produção:</span>
          <p class="text-sm ${currentStatus.color}">● ${currentStatus.label}</p>
        </div>

        <!-- Timeline Visual -->
        <div class="pt-2">
          <div class="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            <div class="${currentStatus.step >= 1 ? 'text-sky-600' : 'text-slate-300'}">
              <div class="h-1.5 rounded-full mb-1 ${currentStatus.step >= 1 ? 'bg-sky-600' : 'bg-slate-200'}"></div>
              Recebido
            </div>
            <div class="${currentStatus.step >= 2 ? 'text-sky-600' : 'text-slate-300'}">
              <div class="h-1.5 rounded-full mb-1 ${currentStatus.step >= 2 ? 'bg-sky-600' : 'bg-slate-200'}"></div>
              Arte
            </div>
            <div class="${currentStatus.step >= 3 ? 'text-sky-600' : 'text-slate-300'}">
              <div class="h-1.5 rounded-full mb-1 ${currentStatus.step >= 3 ? 'bg-sky-600' : 'bg-slate-200'}"></div>
              Impressão
            </div>
            <div class="${currentStatus.step >= 4 ? 'text-emerald-600 font-extrabold' : 'text-slate-300'}">
              <div class="h-1.5 rounded-full mb-1 ${currentStatus.step >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}"></div>
              Pronto!
            </div>
          </div>
        </div>

        <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
          <p><strong>Itens:</strong> ${order.items.map(i => `${i.quantityLabel} ${i.productName}`).join(', ')}</p>
          <p><strong>Retirada:</strong> ${order.deliveryType === 'balcao' ? 'Balcão da Loja' : 'Entrega no Endereço'}</p>
        </div>
      </div>
    `;
  }

  // ================= UTILITÁRIOS =================
  copyPixKey() {
    const config = window.storage.getConfig();
    navigator.clipboard.writeText(config.pixKey).then(() => {
      this.showToast('Chave Pix copiada com sucesso! 🔑');
    }).catch(() => {
      alert(`Chave Pix: ${config.pixKey}`);
    });
  }

  openCustomQuoteWhatsApp() {
    const config = window.storage.getConfig();
    const msg = `Olá! Gostaria de solicitar um orçamento personalizado para um material gráfico sob medida.`;
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  showToast(msg) {
    const existing = document.getElementById('toastNotice');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 border border-slate-700 transition-all duration-300 opacity-0 -translate-y-2';
    toast.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('opacity-0', '-translate-y-2');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Instancia Aplicação
window.app = new GraphicShopApp();
