/**
 * ORCAMENTO.JS - Gerador de Orçamentos Profissionais & Simulador de Adesivos em Folha Sulfite
 * Sul Design • Gráfica & Comunicação Visual
 * Sócios: José Reis & Leonardo Monti
 */

class OrcamentoManager {
  constructor() {
    this.budgetState = {
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      validUntil: this.getExpirationDate(7),
      clientName: '',
      clientPhone: '',
      clientNotes: '',
      salesRep: 'jose', // 'jose' ou 'leonardo'
      paymentMethod: 'Pix (Chave: 35999702316)',
      turnaround: '2 a 4 dias úteis',
      deliveryType: 'balcao',
      discount: 0,
      discountType: 'fixed', // 'fixed' ou 'percent'
      shippingFee: 0,
      items: []
    };

    this.stickerState = {
      sheetType: 'a4', // a4, a3, super_a3, custom
      sheetWidth: 210,  // mm
      sheetHeight: 297, // mm
      margin: 5,        // mm
      shape: 'circle',  // 'circle' ou 'rect'
      width: 50,        // mm (5cm)
      height: 50,       // mm (5cm)
      gap: 3,           // mm
      orientation: 'auto', // 'auto', 'portrait', 'landscape'
      stickersNeeded: 100,
      pricePerSheet: 6.00,
      paperType: 'vinil_brilho',
      calculated: null
    };

    this.activeTab = 'orcamento'; // 'orcamento' ou 'simulador'
    this.isGeneratingImage = false;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.loadCatalogDropdown();
    this.loadInitialBudget();
    this.calculateStickers();
    this.renderStickerCanvas();
    this.renderBudgetItems();
    this.renderReceipt();
    this.setupEventListeners();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  generateOrderNumber() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `ORC-${year}-${randomSuffix}`;
  }

  getExpirationDate(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('pt-BR');
  }

  // ================= SIMULADOR DE ADESIVOS EM FOLHA SULFITE =================
  setSheetPreset(type) {
    this.stickerState.sheetType = type;
    if (type === 'a4') {
      this.stickerState.sheetWidth = 210;
      this.stickerState.sheetHeight = 297;
    } else if (type === 'a3') {
      this.stickerState.sheetWidth = 297;
      this.stickerState.sheetHeight = 420;
    } else if (type === 'super_a3') {
      this.stickerState.sheetWidth = 320;
      this.stickerState.sheetHeight = 450;
    }

    const customInputs = document.getElementById('customSheetInputs');
    if (customInputs) {
      if (type === 'custom') {
        customInputs.classList.remove('hidden');
      } else {
        customInputs.classList.add('hidden');
      }
    }

    this.updateStickerSimulation();
  }

  setStickerShape(shape) {
    this.stickerState.shape = shape;
    const heightGroup = document.getElementById('stickerHeightGroup');
    const widthLabel = document.getElementById('stickerWidthLabel');
    const shapeCircleBtn = document.getElementById('shapeCircleBtn');
    const shapeRectBtn = document.getElementById('shapeRectBtn');

    if (shape === 'circle') {
      if (heightGroup) heightGroup.classList.add('hidden');
      if (widthLabel) widthLabel.textContent = 'Diâmetro (cm):';
      this.stickerState.height = this.stickerState.width;
      if (shapeCircleBtn) {
        shapeCircleBtn.classList.add('border-orange-500', 'bg-orange-50', 'text-orange-700');
        shapeCircleBtn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
      }
      if (shapeRectBtn) {
        shapeRectBtn.classList.remove('border-orange-500', 'bg-orange-50', 'text-orange-700');
        shapeRectBtn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
      }
    } else {
      if (heightGroup) heightGroup.classList.remove('hidden');
      if (widthLabel) widthLabel.textContent = 'Largura (cm):';
      if (shapeCircleBtn) {
        shapeCircleBtn.classList.remove('border-orange-500', 'bg-orange-50', 'text-orange-700');
        shapeCircleBtn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
      }
      if (shapeRectBtn) {
        shapeRectBtn.classList.add('border-orange-500', 'bg-orange-50', 'text-orange-700');
        shapeRectBtn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
      }
    }

    this.updateStickerSimulation();
  }

  setQuickStickerSize(widthCm, heightCm = null, shape = null) {
    if (shape) {
      this.setStickerShape(shape);
    }
    const widthMm = Math.round(widthCm * 10);
    const heightMm = heightCm ? Math.round(heightCm * 10) : widthMm;

    this.stickerState.width = widthMm;
    this.stickerState.height = heightMm;

    const wInput = document.getElementById('stickerWidthInput');
    const hInput = document.getElementById('stickerHeightInput');
    if (wInput) wInput.value = widthCm;
    if (hInput && heightCm) hInput.value = heightCm;

    this.updateStickerSimulation();
  }

  updateStickerSimulation() {
    const wInput = document.getElementById('stickerWidthInput');
    const hInput = document.getElementById('stickerHeightInput');
    const gapInput = document.getElementById('stickerGapInput');
    const marginInput = document.getElementById('sheetMarginInput');
    const neededInput = document.getElementById('stickersNeededInput');
    const priceInput = document.getElementById('pricePerSheetInput');
    const customW = document.getElementById('customSheetW');
    const customH = document.getElementById('customSheetH');

    if (wInput) this.stickerState.width = Math.max(5, Number(wInput.value) * 10);
    if (this.stickerState.shape === 'circle') {
      this.stickerState.height = this.stickerState.width;
    } else if (hInput) {
      this.stickerState.height = Math.max(5, Number(hInput.value) * 10);
    }

    if (gapInput) this.stickerState.gap = Math.max(0, Number(gapInput.value));
    if (marginInput) this.stickerState.margin = Math.max(0, Number(marginInput.value));
    if (neededInput) this.stickerState.stickersNeeded = Math.max(1, parseInt(neededInput.value, 10) || 1);
    if (priceInput) this.stickerState.pricePerSheet = Math.max(0, Number(priceInput.value) || 0);

    if (this.stickerState.sheetType === 'custom') {
      if (customW) this.stickerState.sheetWidth = Math.max(50, Number(customW.value));
      if (customH) this.stickerState.sheetHeight = Math.max(50, Number(customH.value));
    }

    this.calculateStickers();
    this.renderStickerMetrics();
    this.renderStickerCanvas();
  }

  calculateStickers() {
    const { sheetWidth, sheetHeight, margin, width, height, gap, shape } = this.stickerState;

    const usableW = Math.max(10, sheetWidth - 2 * margin);
    const usableH = Math.max(10, sheetHeight - 2 * margin);

    const stepW = width + gap;
    const stepH = height + gap;

    // Configuração 1: Normal (sem rotação do adesivo)
    const cols1 = Math.max(0, Math.floor((usableW + gap) / stepW));
    const rows1 = Math.max(0, Math.floor((usableH + gap) / stepH));
    const count1 = cols1 * rows1;

    // Configuração 2: Rotacionada 90° (adesivo girado)
    let cols2 = 0;
    let rows2 = 0;
    let count2 = 0;
    if (shape !== 'circle') {
      const stepWRot = height + gap;
      const stepHRot = width + gap;
      cols2 = Math.max(0, Math.floor((usableW + gap) / stepWRot));
      rows2 = Math.max(0, Math.floor((usableH + gap) / stepHRot));
      count2 = cols2 * rows2;
    }

    let bestOrientation = 'normal';
    let totalPerSheet = count1;
    let cols = cols1;
    let rows = rows1;
    let effectiveW = width;
    let effectiveH = height;

    if (shape !== 'circle' && count2 > count1) {
      bestOrientation = 'rotated';
      totalPerSheet = count2;
      cols = cols2;
      rows = rows2;
      effectiveW = height;
      effectiveH = width;
    }

    // Calcula coordenadas para o canvas (centralizado na área útil)
    const gridW = cols > 0 ? (cols * effectiveW + (cols - 1) * gap) : 0;
    const gridH = rows > 0 ? (rows * effectiveH + (rows - 1) * gap) : 0;
    const startX = margin + (usableW - gridW) / 2;
    const startY = margin + (usableH - gridH) / 2;

    const layout = [];
    let stickerIndex = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (effectiveW + gap);
        const y = startY + r * (effectiveH + gap);
        layout.push({
          num: stickerIndex++,
          x,
          y,
          w: effectiveW,
          h: effectiveH,
          shape,
          row: r + 1,
          col: c + 1
        });
      }
    }

    // Aproveitamento da folha em área (%)
    const sheetArea = sheetWidth * sheetHeight;
    let singleStickerArea = 0;
    if (shape === 'circle') {
      const radius = width / 2;
      singleStickerArea = Math.PI * radius * radius;
    } else {
      singleStickerArea = width * height;
    }
    const totalStickersArea = totalPerSheet * singleStickerArea;
    const efficiency = sheetArea > 0 ? ((totalStickersArea / sheetArea) * 100).toFixed(1) : '0';
    const waste = (100 - Number(efficiency)).toFixed(1);

    // Tiragem
    const needed = this.stickerState.stickersNeeded;
    const sheetsNeeded = totalPerSheet > 0 ? Math.ceil(needed / totalPerSheet) : 0;
    const totalProduced = sheetsNeeded * totalPerSheet;
    const surplus = totalProduced - needed;
    const totalPrice = sheetsNeeded * this.stickerState.pricePerSheet;
    const unitPrice = totalProduced > 0 ? (totalPrice / totalProduced) : 0;

    this.stickerState.calculated = {
      totalPerSheet,
      cols,
      rows,
      bestOrientation,
      efficiency,
      waste,
      sheetsNeeded,
      totalProduced,
      surplus,
      totalPrice,
      unitPrice,
      layout,
      usableW,
      usableH,
      effectiveW,
      effectiveH
    };

    return this.stickerState.calculated;
  }

  renderStickerMetrics() {
    const calc = this.stickerState.calculated;
    if (!calc) return;

    const elTotal = document.getElementById('metricStickersPerSheet');
    const elGrid = document.getElementById('metricGridPattern');
    const elEfficiency = document.getElementById('metricEfficiency');
    const elEfficiencyBar = document.getElementById('metricEfficiencyBar');
    const elSheets = document.getElementById('metricSheetsNeeded');
    const elProduced = document.getElementById('metricTotalProduced');
    const elSurplus = document.getElementById('metricSurplus');
    const elTotalPrice = document.getElementById('metricTotalPrice');
    const elUnitPrice = document.getElementById('metricUnitPrice');
    const elOrientationTip = document.getElementById('metricOrientationTip');

    if (elTotal) elTotal.textContent = calc.totalPerSheet;
    if (elGrid) elGrid.textContent = `${calc.cols} colunas × ${calc.rows} linhas`;
    if (elEfficiency) elEfficiency.textContent = `${calc.efficiency}%`;
    if (elEfficiencyBar) elEfficiencyBar.style.width = `${Math.min(100, Math.max(5, Number(calc.efficiency)))}%`;
    if (elSheets) elSheets.textContent = calc.sheetsNeeded;
    if (elProduced) elProduced.textContent = calc.totalProduced;
    if (elSurplus) elSurplus.textContent = `+${calc.surplus} sobra`;
    if (elTotalPrice) elTotalPrice.textContent = `R$ ${calc.totalPrice.toFixed(2).replace('.', ',')}`;
    if (elUnitPrice) elUnitPrice.textContent = `R$ ${calc.unitPrice.toFixed(2).replace('.', ',')}`;

    if (elOrientationTip) {
      if (this.stickerState.shape === 'circle') {
        elOrientationTip.innerHTML = `💡 <strong>Adesivo Redondo:</strong> ${calc.totalPerSheet} unidades distribuídas perfeitamente na folha sulfite.`;
      } else if (calc.bestOrientation === 'rotated') {
        elOrientationTip.innerHTML = `💡 <strong>Melhor rendimento:</strong> Adesivos rotacionados a 90° garantem <strong>maior aproveitamento</strong> nesta folha.`;
      } else {
        elOrientationTip.innerHTML = `💡 <strong>Melhor rendimento:</strong> Posição padrão vertical otimizada com mínimo desperdício de corte.`;
      }
    }
  }

  renderStickerCanvas() {
    const canvas = document.getElementById('sheetCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const calc = this.stickerState.calculated;
    if (!calc) return;

    const { sheetWidth, sheetHeight, margin, shape } = this.stickerState;

    // Configura resolução DPI nítida
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.parentElement ? Math.min(canvas.parentElement.clientWidth, 480) : 380;
    const scale = displayWidth / sheetWidth;
    const displayHeight = sheetHeight * scale;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 1. Fundo do Canvas (ambiente)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // 2. Desenho da Folha Sulfite Branca com Sombra
    const paperX = 12;
    const paperY = 12;
    const paperW = displayWidth - 24;
    const paperH = displayHeight - 24;
    const mmToPx = paperW / sheetWidth;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(paperX, paperY, paperW, paperH);
    ctx.restore();

    // Borda delicada da folha
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(paperX, paperY, paperW, paperH);

    // 3. Linha de Margem de Segurança da Impressora (tracejada)
    const marginPx = margin * mmToPx;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      paperX + marginPx,
      paperY + marginPx,
      paperW - 2 * marginPx,
      paperH - 2 * marginPx
    );
    ctx.restore();

    // 4. Desenha os Adesivos no layout calculado
    calc.layout.forEach(st => {
      const x = paperX + st.x * mmToPx;
      const y = paperY + st.y * mmToPx;
      const w = st.w * mmToPx;
      const h = st.h * mmToPx;

      ctx.save();
      if (st.shape === 'circle') {
        const radius = w / 2;
        const centerX = x + radius;
        const centerY = y + radius;

        // Sombra suave do adesivo
        ctx.shadowColor = 'rgba(255, 94, 0, 0.15)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;

        // Preenchimento com degradê suave da marca Sul Design
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, '#fff7ed');
        grad.addColorStop(1, '#ffedd5');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Linha de corte do adesivo (die-cut)
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Linha interna tracejada de segurança
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(1, radius - 2), 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Número do adesivo no centro
        ctx.fillStyle = '#9a3412';
        ctx.font = `bold ${Math.max(8, Math.min(12, Math.floor(radius * 0.45)))}px Plus Jakarta Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.num, centerX, centerY);

      } else {
        // Retângulo com cantos arredondados
        const radius = Math.min(6, w * 0.1, h * 0.1);
        ctx.shadowColor = 'rgba(255, 94, 0, 0.15)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;

        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, '#fff7ed');
        grad.addColorStop(1, '#ffedd5');
        ctx.fillStyle = grad;

        this.roundRect(ctx, x, y, w, h, radius);
        ctx.fill();

        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.2;
        this.roundRect(ctx, x, y, w, h, radius);
        ctx.stroke();

        // Número
        ctx.fillStyle = '#9a3412';
        ctx.font = `bold ${Math.max(8, Math.min(12, Math.floor(h * 0.28)))}px Plus Jakarta Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.num, x + w / 2, y + h / 2);
      }
      ctx.restore();
    });

    // 5. Marcação de Dimensões nas Bordas (Legenda)
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Folha: ${sheetWidth} × ${sheetHeight} mm | Margem: ${margin} mm`, displayWidth / 2, displayHeight - 4);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ================= ADICIONAR ADESIVOS AO ORÇAMENTO =================
  addStickersToBudget() {
    const calc = this.stickerState.calculated;
    if (!calc || calc.totalPerSheet === 0) {
      this.showToast('Nenhum adesivo cabe nesta folha com as dimensões informadas.', 'error');
      return;
    }

    const { shape, width, height, paperType, sheetType } = this.stickerState;
    const wCm = (width / 10).toFixed(1).replace('.0', '');
    const hCm = (height / 10).toFixed(1).replace('.0', '');
    const shapeLabel = shape === 'circle' ? `Redondo Ø ${wCm} cm` : `Retangular ${wCm} × ${hCm} cm`;
    const paperLabel = paperType === 'vinil_brilho' ? 'Vinil Adesivo Brilho Impermeável' :
                       paperType === 'vinil_fosco' ? 'Vinil Adesivo Fosco Fosforescente' :
                       paperType === 'transparente' ? 'Vinil Transparente Cristal' : 'Papel Adesivo Sulfite';
    const sheetName = sheetType === 'a4' ? 'Folha Sulfite A4' :
                      sheetType === 'a3' ? 'Folha A3' :
                      sheetType === 'super_a3' ? 'Folha Super A3' : 'Folha Especial';

    const newItem = {
      id: 'item-' + Date.now(),
      productId: 'adesivo-vinil',
      title: `Adesivos Personalizados (${shapeLabel})`,
      specs: `${paperLabel} • Impressão digital alta resolução • ${calc.cols}x${calc.rows} por ${sheetName} (${calc.totalPerSheet} un/folha)`,
      image: 'img/produtos/adesivo-vinil.jpg',
      quantity: calc.totalProduced,
      quantityLabel: `${calc.sheetsNeeded} folhas (${calc.totalProduced} adesivos)`,
      unitPrice: calc.unitPrice,
      subtotal: calc.totalPrice
    };

    this.budgetState.items.push(newItem);
    this.renderBudgetItems();
    this.renderReceipt();

    this.showToast(`✅ ${calc.totalProduced} adesivos adicionados à nota de orçamento!`, 'success');

    // Rola suavemente até o comprovante do orçamento
    const receiptSection = document.getElementById('receiptPreviewSection');
    if (receiptSection) {
      receiptSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ================= CATÁLOGO DE PRODUTOS SUL DESIGN =================
  loadCatalogDropdown() {
    const select = document.getElementById('catalogProductSelect');
    if (!select || !window.storage) return;

    const products = window.storage.getProducts();
    select.innerHTML = '<option value="">-- Escolha um produto da Sul Design --</option>' +
      products.map(p => `
        <option value="${p.id}">${p.name} (a partir de R$ ${Number(p.basePrice).toFixed(2).replace('.', ',')})</option>
      `).join('');
  }

  onCatalogProductSelected(productId) {
    const detailsContainer = document.getElementById('catalogItemDetails');
    if (!productId) {
      if (detailsContainer) detailsContainer.classList.add('hidden');
      return;
    }

    const product = window.storage.getProductById(productId);
    if (!product) return;

    if (detailsContainer) detailsContainer.classList.remove('hidden');

    // Imagem e Nome
    const imgEl = document.getElementById('catalogPreviewImg');
    const nameEl = document.getElementById('catalogSelectedName');
    const descEl = document.getElementById('catalogSelectedDesc');
    if (imgEl) imgEl.src = product.image;
    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description;

    // Quantidades / Tiragens
    const qtySelect = document.getElementById('catalogQtySelect');
    if (qtySelect && product.quantities) {
      qtySelect.innerHTML = product.quantities.map(q => `
        <option value="${q.qty}" data-price="${q.price}">${q.label} - R$ ${Number(q.price).toFixed(2).replace('.', ',')}</option>
      `).join('');
    }

    // Papéis
    const paperSelect = document.getElementById('catalogPaperSelect');
    if (paperSelect && product.papers && product.papers.length > 0) {
      paperSelect.parentElement.classList.remove('hidden');
      paperSelect.innerHTML = product.papers.map(p => `
        <option value="${p.label}" data-add="${p.priceAdd}">${p.label} ${p.priceAdd !== 0 ? `(${p.priceAdd > 0 ? '+' : ''} R$ ${p.priceAdd.toFixed(2)})` : ''}</option>
      `).join('');
    } else if (paperSelect) {
      paperSelect.parentElement.classList.add('hidden');
    }

    // Acabamentos
    const finishSelect = document.getElementById('catalogFinishSelect');
    if (finishSelect && product.finishes && product.finishes.length > 0) {
      finishSelect.parentElement.classList.remove('hidden');
      finishSelect.innerHTML = product.finishes.map(f => `
        <option value="${f.label}" data-mult="${f.multiplier}">${f.label}</option>
      `).join('');
    } else if (finishSelect) {
      finishSelect.parentElement.classList.add('hidden');
    }

    this.updateCatalogCalculatedPrice();
  }

  updateCatalogCalculatedPrice() {
    const select = document.getElementById('catalogProductSelect');
    if (!select || !select.value) return;

    const product = window.storage.getProductById(select.value);
    if (!product) return;

    const qtySelect = document.getElementById('catalogQtySelect');
    const paperSelect = document.getElementById('catalogPaperSelect');
    const finishSelect = document.getElementById('catalogFinishSelect');
    const customPriceInput = document.getElementById('catalogCustomPriceInput');

    let basePrice = 0;
    if (qtySelect && qtySelect.selectedOptions[0]) {
      basePrice = Number(qtySelect.selectedOptions[0].dataset.price) || product.basePrice;
    }

    let priceAdd = 0;
    if (paperSelect && paperSelect.selectedOptions[0]) {
      priceAdd = Number(paperSelect.selectedOptions[0].dataset.add) || 0;
    }

    let multiplier = 1.0;
    if (finishSelect && finishSelect.selectedOptions[0]) {
      multiplier = Number(finishSelect.selectedOptions[0].dataset.mult) || 1.0;
    }

    const calculatedPrice = (basePrice + priceAdd) * multiplier;
    if (customPriceInput) {
      customPriceInput.value = calculatedPrice.toFixed(2);
    }
  }

  addCatalogProductToBudget() {
    const select = document.getElementById('catalogProductSelect');
    if (!select || !select.value) {
      this.showToast('Selecione um produto do catálogo.', 'error');
      return;
    }

    const product = window.storage.getProductById(select.value);
    if (!product) return;

    const qtySelect = document.getElementById('catalogQtySelect');
    const paperSelect = document.getElementById('catalogPaperSelect');
    const finishSelect = document.getElementById('catalogFinishSelect');
    const customPriceInput = document.getElementById('catalogCustomPriceInput');

    const qtyLabel = qtySelect ? qtySelect.selectedOptions[0].textContent.split(' - ')[0] : '1 un';
    const qtyVal = qtySelect ? parseInt(qtySelect.value, 10) : 1;
    const paperLabel = paperSelect && !paperSelect.parentElement.classList.contains('hidden') ? paperSelect.value : '';
    const finishLabel = finishSelect && !finishSelect.parentElement.classList.contains('hidden') ? finishSelect.value : '';
    const price = customPriceInput ? Number(customPriceInput.value) : product.basePrice;

    const specsArr = [];
    if (paperLabel) specsArr.push(paperLabel);
    if (finishLabel) specsArr.push(finishLabel);
    if (product.turnaround) specsArr.push(`⚡ Prazo: ${product.turnaround}`);

    const newItem = {
      id: 'item-' + Date.now(),
      productId: product.id,
      title: product.name,
      specs: specsArr.join(' • ') || product.description,
      image: product.image,
      quantity: qtyVal,
      quantityLabel: qtyLabel,
      unitPrice: qtyVal > 0 ? (price / qtyVal) : price,
      subtotal: price
    };

    this.budgetState.items.push(newItem);
    this.renderBudgetItems();
    this.renderReceipt();

    // Reset da seleção
    select.value = '';
    this.onCatalogProductSelected('');
    this.showToast(`✅ ${product.name} adicionado ao orçamento!`, 'success');
  }

  // ================= ITEM PERSONALIZADO LIVRE =================
  addCustomItemToBudget() {
    const nameInput = document.getElementById('customItemName');
    const specsInput = document.getElementById('customItemSpecs');
    const qtyInput = document.getElementById('customItemQty');
    const priceInput = document.getElementById('customItemPrice');
    const iconSelect = document.getElementById('customItemIcon');

    if (!nameInput || !nameInput.value.trim()) {
      this.showToast('Informe o nome do item.', 'error');
      if (nameInput) nameInput.focus();
      return;
    }

    const name = nameInput.value.trim();
    const specs = specsInput ? specsInput.value.trim() : '';
    const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
    const price = priceInput ? (Number(priceInput.value) || 0) : 0;
    const icon = iconSelect ? iconSelect.value : 'package';

    // Mapeamento de imagens padrão baseadas em ícones ou logotipo
    let image = 'img/logo-icon.png';
    if (icon === 'tag') image = 'img/produtos/adesivo-vinil.jpg';
    else if (icon === 'file') image = 'img/produtos/panfleto-flyer.jpg';
    else if (icon === 'card') image = 'img/produtos/cartao-visita.jpg';
    else if (icon === 'flag') image = 'img/produtos/banner-lona.jpg';
    else if (icon === 'cup') image = 'img/produtos/caneca-personalizada.jpg';

    const newItem = {
      id: 'item-' + Date.now(),
      productId: 'custom-' + Date.now(),
      title: name,
      specs: specs || 'Produção sob medida com acabamento premium',
      image,
      quantity: qty,
      quantityLabel: `${qty} un`,
      unitPrice: qty > 0 ? (price / qty) : price,
      subtotal: price
    };

    this.budgetState.items.push(newItem);
    this.renderBudgetItems();
    this.renderReceipt();

    // Reset campos
    nameInput.value = '';
    if (specsInput) specsInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (priceInput) priceInput.value = '';

    this.showToast(`✅ Item personalizado adicionado!`, 'success');
  }

  removeBudgetItem(itemId) {
    this.budgetState.items = this.budgetState.items.filter(i => i.id !== itemId);
    this.renderBudgetItems();
    this.renderReceipt();
    this.showToast('Item removido do orçamento.', 'info');
  }

  // ================= CARREGAMENTO INICIAL DO ORÇAMENTO =================
  loadInitialBudget() {
    // Tenta carregar do localStorage ou cria exemplo padrão realista
    const saved = localStorage.getItem('suldesign_current_budget');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          this.budgetState = { ...this.budgetState, ...parsed };
          return;
        }
      } catch (e) {}
    }

    // Itens padrão demonstrativos da Sul Design
    this.budgetState.clientName = 'Carlos Eduardo Silva';
    this.budgetState.clientPhone = '(35) 99881-2233';
    this.budgetState.clientNotes = 'Pedido para inauguração da loja no centro. Alta resolução.';
    this.budgetState.items = [
      {
        id: 'item-demo-1',
        productId: 'cartao-visita',
        title: 'Cartão de Visita Premium',
        specs: 'Couché 300g • Laminação Fosca + Verniz Localizado Frente e Verso',
        image: 'img/produtos/cartao-visita.jpg',
        quantity: 1000,
        quantityLabel: '1.000 un',
        unitPrice: 0.11,
        subtotal: 110.00
      },
      {
        id: 'item-demo-2',
        productId: 'banner-lona',
        title: 'Banner em Lona com Bastão & Corda',
        specs: 'Lona 440g anti-reflexo 80x120cm • Acabamento completo com madeira e ponteira',
        image: 'img/produtos/banner-lona.jpg',
        quantity: 1,
        quantityLabel: '1 unidade',
        unitPrice: 85.00,
        subtotal: 85.00
      }
    ];
  }

  saveBudgetState() {
    localStorage.setItem('suldesign_current_budget', JSON.stringify(this.budgetState));
  }

  // ================= RENDERIZAÇÃO DA LISTA DE ITENS (EDITOR) =================
  renderBudgetItems() {
    const container = document.getElementById('budgetItemsEditorList');
    const countBadge = document.getElementById('budgetItemsCount');
    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${this.budgetState.items.length} ${this.budgetState.items.length === 1 ? 'item' : 'itens'}`;
    }

    if (this.budgetState.items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 px-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
          <i data-lucide="package-open" class="w-10 h-10 text-stone-300 mx-auto mb-2"></i>
          <h4 class="font-bold text-stone-700 text-sm">Nenhum item no orçamento</h4>
          <p class="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Use o simulador de adesivos acima ou adicione itens do catálogo para montar a proposta.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = this.budgetState.items.map((item, index) => `
      <div class="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-orange-200 transition">
        <div class="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 flex-shrink-0 flex items-center justify-center p-1">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <h5 class="font-black text-stone-900 text-sm truncate">${item.title}</h5>
            <span class="font-black text-stone-900 text-sm whitespace-nowrap">R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}</span>
          </div>
          <p class="text-[11px] text-stone-500 truncate">${item.specs}</p>
          <div class="flex items-center justify-between mt-1 pt-1 border-t border-stone-100">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              Qtd: ${item.quantityLabel}
            </span>
            <button onclick="orcamento.removeBudgetItem('${item.id}')" class="text-stone-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Remover
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
    this.saveBudgetState();
  }

  // ================= RENDERIZAÇÃO DO COMPROVANTE / NOTA VISUAL =================
  renderReceipt() {
    const clientNameInput = document.getElementById('clientNameInput');
    const clientPhoneInput = document.getElementById('clientPhoneInput');
    const clientNotesInput = document.getElementById('clientNotesInput');
    const discountInput = document.getElementById('discountInput');
    const turnaroundSelect = document.getElementById('turnaroundSelect');
    const salesRepSelect = document.getElementById('salesRepSelect');

    if (clientNameInput && clientNameInput.value) this.budgetState.clientName = clientNameInput.value.trim();
    if (clientPhoneInput && clientPhoneInput.value) this.budgetState.clientPhone = clientPhoneInput.value.trim();
    if (clientNotesInput) this.budgetState.clientNotes = clientNotesInput.value.trim();
    if (discountInput) this.budgetState.discount = Math.max(0, Number(discountInput.value) || 0);
    if (turnaroundSelect) this.budgetState.turnaround = turnaroundSelect.value;
    if (salesRepSelect) this.budgetState.salesRep = salesRepSelect.value;

    // Cálculo Financeiro
    const subtotal = this.budgetState.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    const discount = Number(this.budgetState.discount) || 0;
    const finalTotal = Math.max(0, subtotal - discount + (Number(this.budgetState.shippingFee) || 0));

    // Elementos da Nota
    const rcOrderNum = document.getElementById('rcOrderNum');
    const rcDate = document.getElementById('rcDate');
    const rcValid = document.getElementById('rcValid');
    const rcClientName = document.getElementById('rcClientName');
    const rcClientPhone = document.getElementById('rcClientPhone');
    const rcSalesRep = document.getElementById('rcSalesRep');
    const rcItemsContainer = document.getElementById('rcItemsContainer');
    const rcSubtotal = document.getElementById('rcSubtotal');
    const rcDiscountRow = document.getElementById('rcDiscountRow');
    const rcDiscount = document.getElementById('rcDiscount');
    const rcTotal = document.getElementById('rcTotal');
    const rcTurnaround = document.getElementById('rcTurnaround');
    const rcNotesContainer = document.getElementById('rcNotesContainer');
    const rcNotesText = document.getElementById('rcNotesText');

    if (rcOrderNum) rcOrderNum.textContent = this.budgetState.orderNumber;
    if (rcDate) rcDate.textContent = this.budgetState.createdAt;
    if (rcValid) rcValid.textContent = this.budgetState.validUntil;

    if (rcClientName) {
      rcClientName.textContent = this.budgetState.clientName || 'Cliente Balcão / WhatsApp';
    }
    if (rcClientPhone) {
      rcClientPhone.textContent = this.budgetState.clientPhone ? `Tel: ${this.budgetState.clientPhone}` : 'Atendimento Direto';
    }
    if (rcSalesRep) {
      rcSalesRep.textContent = this.budgetState.salesRep === 'leonardo' ? 'Leonardo Monti' : 'José Reis';
    }

    if (rcTurnaround) rcTurnaround.textContent = this.budgetState.turnaround;

    // Observações
    if (rcNotesContainer && rcNotesText) {
      if (this.budgetState.clientNotes) {
        rcNotesContainer.classList.remove('hidden');
        rcNotesText.textContent = this.budgetState.clientNotes;
      } else {
        rcNotesContainer.classList.add('hidden');
      }
    }

    // Tabela Visual de Itens
    if (rcItemsContainer) {
      if (this.budgetState.items.length === 0) {
        rcItemsContainer.innerHTML = `
          <div class="py-6 text-center text-stone-400 text-xs font-semibold">
            Nenhum item adicionado à nota ainda.
          </div>
        `;
      } else {
        rcItemsContainer.innerHTML = this.budgetState.items.map((item, idx) => `
          <div class="flex items-center gap-3.5 py-3 border-b border-stone-100 last:border-b-0">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 border border-stone-200/80 flex items-center justify-center p-1 flex-shrink-0 shadow-sm">
              <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <h4 class="font-black text-stone-900 text-sm leading-snug">${item.title}</h4>
                <span class="font-black text-stone-900 text-base whitespace-nowrap">
                  R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p class="text-[11px] text-stone-600 font-medium leading-relaxed mt-0.5">${item.specs}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-800">
                  ${item.quantityLabel}
                </span>
                <span class="text-[10px] text-stone-400 font-semibold">
                  Unit: R$ ${Number(item.unitPrice).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // Totais
    if (rcSubtotal) rcSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (rcDiscountRow && rcDiscount) {
      if (discount > 0) {
        rcDiscountRow.classList.remove('hidden');
        rcDiscount.textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
      } else {
        rcDiscountRow.classList.add('hidden');
      }
    }
    if (rcTotal) rcTotal.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;

    this.saveBudgetState();
  }

  // ================= COPIAR IMAGEM PARA O WHATSAPP EM 1 CLIQUE =================
  async copyBudgetAsImage() {
    if (this.isGeneratingImage) return;

    const receiptEl = document.getElementById('orcamentoVoucher');
    const copyBtn = document.getElementById('btnCopyBudgetImg');
    if (!receiptEl) return;

    try {
      this.isGeneratingImage = true;
      if (copyBtn) {
        copyBtn.disabled = true;
        copyBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Gerando imagem HD...
        `;
      }

      // Usa html2canvas com renderização em escala Retina (2x) para nitidez absoluta
      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Converte para blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.98));

      if (!blob) {
        throw new Error('Falha ao gerar o arquivo de imagem.');
      }

      // Tenta a API nativa ClipboardItem
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);

          this.showToast('📋 Imagem copiada com sucesso! Abra o WhatsApp e cole com Ctrl + V.', 'success');
          return;
        } catch (clipboardErr) {
          console.warn('Clipboard writeImage bloqueado pelo navegador, fazendo fallback:', clipboardErr);
        }
      }

      // Fallback: Baixa a imagem diretamente se a escrita de imagem for restrita no navegador
      this.downloadBlob(blob, `Orcamento-SulDesign-${this.budgetState.orderNumber}.png`);
      this.showToast('📥 Imagem baixada! Basta arrastar ou anexar no WhatsApp.', 'success');

    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      this.showToast('Erro ao processar imagem. Tentando baixar arquivo...', 'error');
    } finally {
      this.isGeneratingImage = false;
      if (copyBtn) {
        copyBtn.disabled = false;
        copyBtn.innerHTML = `
          <i data-lucide="copy" class="w-4 h-4"></i>
          Copiar Imagem (1 Clique)
        `;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ================= BAIXAR IMAGEM PNG =================
  async downloadBudgetAsImage() {
    const receiptEl = document.getElementById('orcamentoVoucher');
    if (!receiptEl) return;

    try {
      this.showToast('Gerando download em alta resolução...', 'info');

      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const clientSlug = (this.budgetState.clientName || 'Cliente').replace(/\s+/g, '-');
          this.downloadBlob(blob, `Orcamento-SulDesign-${clientSlug}-${this.budgetState.orderNumber}.png`);
          this.showToast('✅ Download concluído!', 'success');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro ao baixar:', err);
      this.showToast('Erro ao baixar imagem.', 'error');
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ================= ENVIAR NO WHATSAPP =================
  async shareOnWhatsApp() {
    const clientPhone = (this.budgetState.clientPhone || '').replace(/\D/g, '');
    const clientName = this.budgetState.clientName || 'Cliente';
    const subtotal = this.budgetState.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    const finalTotal = Math.max(0, subtotal - (Number(this.budgetState.discount) || 0));

    // Monta texto detalhado e formal
    let msg = `Olá *${clientName}*, tudo bem? Aqui é da *Sul Design • Gráfica & Comunicação Visual*! 🎨\n\n`;
    msg += `Segue a proposta para o seu pedido (*${this.budgetState.orderNumber}*):\n\n`;

    this.budgetState.items.forEach((item, idx) => {
      msg += `▪️ *${item.quantityLabel} ${item.title}*: R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}\n`;
      msg += `   _${item.specs}_\n`;
    });

    if (this.budgetState.discount > 0) {
      msg += `\n🏷️ *Desconto Especial*: - R$ ${Number(this.budgetState.discount).toFixed(2).replace('.', ',')}`;
    }

    msg += `\n💰 *VALOR TOTAL*: *R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n`;
    msg += `⚡ *Prazo de Produção*: ${this.budgetState.turnaround}\n`;
    msg += `💳 *Chave Pix*: \`35999702316\` (Sul Design)\n\n`;
    msg += `Estou te enviando também a imagem do comprovante oficial em anexo. Podemos aprovar a produção? 😊`;

    // Se suportar Web Share API com arquivos no celular, compartilha a imagem direto
    if (navigator.canShare && navigator.userAgent.includes('Mobile')) {
      try {
        const receiptEl = document.getElementById('orcamentoVoucher');
        const canvas = await html2canvas(receiptEl, { scale: 2, backgroundColor: '#ffffff' });
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], `Orcamento-${this.budgetState.orderNumber}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Orçamento Sul Design - ${clientName}`,
            text: msg
          });
          return;
        }
      } catch (e) {
        console.log('Mobile share fallback:', e);
      }
    }

    // Copia imagem para a área de transferência primeiro para facilitar o Ctrl+V
    this.copyBudgetAsImage();

    // Abre o WhatsApp
    const encoded = encodeURIComponent(msg);
    const targetPhone = clientPhone.length >= 10 ? (clientPhone.startsWith('55') ? clientPhone : '55' + clientPhone) : '';
    const waUrl = targetPhone ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, '_blank');
  }

  // ================= CONVERTER EM PEDIDO NO SISTEMA DO ADMIN =================
  convertToShopOrder() {
    if (!window.storage) return;

    if (this.budgetState.items.length === 0) {
      this.showToast('Adicione pelo menos um item para registrar o pedido.', 'error');
      return;
    }

    const subtotal = this.budgetState.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    const total = Math.max(0, subtotal - (Number(this.budgetState.discount) || 0));

    const orderData = {
      clientName: this.budgetState.clientName || 'Cliente Balcão',
      clientPhone: this.budgetState.clientPhone || '',
      channel: 'whatsapp',
      isOrganic: true,
      deliveryType: this.budgetState.deliveryType,
      notes: `Convertido do Orçamento ${this.budgetState.orderNumber}. ${this.budgetState.clientNotes || ''}`,
      artStatus: 'ready',
      paymentMethod: 'Pix',
      attendanceAssignee: this.budgetState.salesRep || 'jose',
      productionAssignee: 'leonardo',
      total: total,
      cost: Number((total * 0.35).toFixed(2)),
      items: this.budgetState.items.map(item => ({
        productId: item.productId,
        productName: item.title,
        quantity: item.quantity,
        quantityLabel: item.quantityLabel,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        details: item.specs
      }))
    };

    const newOrder = window.storage.createOrder(orderData);
    this.showToast(`🎉 Pedido ${newOrder.id} gerado com sucesso no Painel dos Sócios!`, 'success');

    setTimeout(() => {
      if (confirm(`Pedido ${newOrder.id} registrado no caixa! Deseja abrir o Painel Admin para acompanhar a produção?`)) {
        window.location.href = 'admin.html';
      }
    }, 800);
  }

  // ================= EVENT LISTENERS & NAVEGAÇÃO =================
  setupEventListeners() {
    // Inputs de Cliente & Orçamento
    const inputs = ['clientNameInput', 'clientPhoneInput', 'clientNotesInput', 'discountInput', 'turnaroundSelect', 'salesRepSelect'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.renderReceipt());
        el.addEventListener('change', () => this.renderReceipt());
      }
    });

    // Inputs do Simulador de Folha
    const stickerInputs = ['stickerWidthInput', 'stickerHeightInput', 'stickerGapInput', 'sheetMarginInput', 'stickersNeededInput', 'pricePerSheetInput', 'customSheetW', 'customSheetH'];
    stickerInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateStickerSimulation());
      }
    });

    // Redimensionamento de Janela
    window.addEventListener('resize', () => {
      this.renderStickerCanvas();
    });
  }

  resetBudget() {
    if (confirm('Deseja iniciar um novo orçamento? Os itens atuais serão limpos.')) {
      this.budgetState.orderNumber = this.generateOrderNumber();
      this.budgetState.createdAt = new Date().toLocaleDateString('pt-BR');
      this.budgetState.validUntil = this.getExpirationDate(7);
      this.budgetState.clientName = '';
      this.budgetState.clientPhone = '';
      this.budgetState.clientNotes = '';
      this.budgetState.discount = 0;
      this.budgetState.items = [];

      const nameInput = document.getElementById('clientNameInput');
      const phoneInput = document.getElementById('clientPhoneInput');
      const notesInput = document.getElementById('clientNotesInput');
      const discInput = document.getElementById('discountInput');
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (notesInput) notesInput.value = '';
      if (discInput) discInput.value = '';

      this.renderBudgetItems();
      this.renderReceipt();
      this.showToast('Novo orçamento pronto para preenchimento!', 'info');
    }
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('budgetToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'budgetToast';
      toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-xs font-black shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2 pointer-events-none max-w-sm text-center';
      document.body.appendChild(toast);
    }

    if (type === 'success') {
      toast.style.backgroundColor = '#15803d'; // Verde escuro
    } else if (type === 'error') {
      toast.style.backgroundColor = '#b91c1c'; // Vermelho
    } else {
      toast.style.backgroundColor = '#18181b'; // Grafite Sul Design
    }

    toast.textContent = message;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 3800);
  }
}

// Inicializa Instância Global
window.orcamento = new OrcamentoManager();
