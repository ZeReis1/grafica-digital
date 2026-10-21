/**
 * ADMIN.JS - Gestão de Pedidos, Produção, Fluxo de Caixa e Repartição de Sócios
 * Sócios: José Reis & Leonardo Monti
 * Otimizado para alta produtividade no Notebook/PC e 100% responsivo para Mobile.
 */

class GraphicShopAdmin {
  constructor() {
    this.currentTab = 'split'; // Abre direto na Repartição de Sócios
    this.splitPeriod = 'all';
    this.financePeriod = 'all';
    this.orderStatusFilter = 'all';
    this.orderSearchQuery = '';
    this.cashFlowChart = null;
    this.categoriesChart = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.checkAuth();

    // Sincronização em tempo real quando clientes fazem pedidos no catálogo ou WhatsApp
    window.addEventListener('grafica-data-change', (e) => {
      this.refreshCurrentView();
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ================= AUTENTICAÇÃO COM PIN =================
  checkAuth() {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    const lockScreen = document.getElementById('pinLockScreen');
    const adminApp = document.getElementById('adminApp');

    if (isAuth) {
      if (lockScreen) lockScreen.classList.add('hidden');
      if (adminApp) adminApp.classList.remove('hidden');
      this.loadDashboard();
    } else {
      if (lockScreen) lockScreen.classList.remove('hidden');
      if (adminApp) adminApp.classList.add('hidden');
      const pinInput = document.getElementById('pinInput');
      if (pinInput) setTimeout(() => pinInput.focus(), 100);
    }
  }

  unlockWithPin() {
    const pinInput = document.getElementById('pinInput');
    const enteredPin = pinInput ? pinInput.value.trim() : '';
    const config = window.storage.getConfig();

    if (enteredPin === String(config.adminPin || '1234')) {
      sessionStorage.setItem('admin_authenticated', 'true');
      const lockScreen = document.getElementById('pinLockScreen');
      const adminApp = document.getElementById('adminApp');
      if (lockScreen) lockScreen.classList.add('hidden');
      if (adminApp) adminApp.classList.remove('hidden');
      this.loadDashboard();
    } else {
      alert('PIN incorreto. O padrão inicial é 1234.');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  lockPanel() {
    sessionStorage.removeItem('admin_authenticated');
    this.checkAuth();
  }

  // ================= NAVEGAÇÃO ENTRE ABAS =================
  loadDashboard() {
    const config = window.storage.getConfig();
    const titleEl = document.getElementById('adminStoreTitle');
    if (titleEl) titleEl.textContent = `${config.shortName || 'PrintPro'} Admin`;

    this.switchTab('split');
    this.updatePendingOrdersBadge();
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Seções
    const sections = {
      split: document.getElementById('tabSplit'),
      orders: document.getElementById('tabOrders'),
      finances: document.getElementById('tabFinances'),
      products: document.getElementById('tabProducts'),
      settings: document.getElementById('tabSettings')
    };

    // Botões Sidebar
    const buttons = {
      split: document.getElementById('tabBtnSplit'),
      orders: document.getElementById('tabBtnOrders'),
      finances: document.getElementById('tabBtnFinances'),
      products: document.getElementById('tabBtnProducts'),
      settings: document.getElementById('tabBtnSettings')
    };

    const titles = {
      split: "Repartição de Lucros dos Sócios • José Reis & Leonardo Monti",
      orders: "Gestão de Pedidos & Fila de Produção",
      finances: "Fluxo de Caixa Geral & Despesas",
      products: "Catálogo & Tabela de Preços",
      settings: "Configurações Gerais & Chave Pix"
    };

    Object.keys(sections).forEach(key => {
      if (sections[key]) {
        if (key === tab) {
          sections[key].classList.remove('hidden');
        } else {
          sections[key].classList.add('hidden');
        }
      }

      if (buttons[key]) {
        if (key === tab) {
          buttons[key].className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-emerald-600 text-white font-bold transition shadow-sm";
        } else {
          buttons[key].className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition";
        }
      }
    });

    const pageTitle = document.getElementById('currentTabTitle');
    if (pageTitle) pageTitle.textContent = titles[tab] || "Painel de Controle";

    this.refreshCurrentView();
  }

  refreshCurrentView() {
    if (this.currentTab === 'split') {
      this.renderPartnersSplit();
    } else if (this.currentTab === 'finances') {
      this.updateKPIs();
      this.renderCharts();
      this.renderFinanceTable();
    } else if (this.currentTab === 'orders') {
      this.renderOrders();
    } else if (this.currentTab === 'products') {
      this.renderProductsList();
    } else if (this.currentTab === 'settings') {
      this.loadSettingsForm();
    }
    this.updatePendingOrdersBadge();

    if (window.lucide) window.lucide.createIcons();
  }

  updatePendingOrdersBadge() {
    const orders = window.storage.getOrders();
    const pending = orders.filter(o => o.status === 'novo' || o.status === 'arte' || o.status === 'producao').length;
    const badge = document.getElementById('adminPendingOrdersBadge');
    if (badge) {
      badge.textContent = pending;
      badge.className = pending > 0 ? "ml-auto text-[10px] font-black bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full" : "hidden";
    }
  }

  // ================= REPARTIÇÃO DE SÓCIOS (JOSÉ & LEONARDO) =================
  setSplitPeriod(period, btnEl) {
    this.splitPeriod = period;
    document.querySelectorAll('.split-period-btn').forEach(b => {
      b.className = "split-period-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900";
    });
    if (btnEl) btnEl.className = "split-period-btn px-3 py-1.5 rounded-lg active bg-white text-slate-900 font-bold shadow-sm";

    this.renderPartnersSplit();
  }

  renderPartnersSplit() {
    const data = window.storage.getPartnersMetrics(this.splitPeriod);

    // Cards Totais
    const elJose = document.getElementById('splitTotalJose');
    if (elJose) elJose.textContent = data.totalJose.toFixed(2).replace('.', ',');

    const elLeo = document.getElementById('splitTotalLeonardo');
    if (elLeo) elLeo.textContent = data.totalLeonardo.toFixed(2).replace('.', ',');

    const elCaixa = document.getElementById('splitTotalCaixa');
    if (elCaixa) elCaixa.textContent = data.totalCaixa.toFixed(2).replace('.', ',');

    const elCaptacao = document.getElementById('splitTotalCaptacao');
    if (elCaptacao) elCaptacao.textContent = data.totalCaptacao.toFixed(2).replace('.', ',');

    // Sub-itens José
    const subJoseAt = document.getElementById('subJoseAtendimento');
    if (subJoseAt) subJoseAt.textContent = `R$ ${data.breakdownJose.atendimento.toFixed(2).replace('.', ',')}`;
    const subJoseAr = document.getElementById('subJoseArte');
    if (subJoseAr) subJoseAr.textContent = `R$ ${data.breakdownJose.arte.toFixed(2).replace('.', ',')}`;
    const subJosePr = document.getElementById('subJoseProducao');
    if (subJosePr) subJosePr.textContent = `R$ ${data.breakdownJose.producao.toFixed(2).replace('.', ',')}`;
    const subJoseLu = document.getElementById('subJoseLucro');
    if (subJoseLu) subJoseLu.textContent = `R$ ${data.breakdownJose.lucro.toFixed(2).replace('.', ',')}`;

    // Sub-itens Leonardo
    const subLeoAt = document.getElementById('subLeoAtendimento');
    if (subLeoAt) subLeoAt.textContent = `R$ ${data.breakdownLeonardo.atendimento.toFixed(2).replace('.', ',')}`;
    const subLeoAr = document.getElementById('subLeoArte');
    if (subLeoAr) subLeoAr.textContent = `R$ ${data.breakdownLeonardo.arte.toFixed(2).replace('.', ',')}`;
    const subLeoPr = document.getElementById('subLeoProducao');
    if (subLeoPr) subLeoPr.textContent = `R$ ${data.breakdownLeonardo.producao.toFixed(2).replace('.', ',')}`;
    const subLeoLu = document.getElementById('subLeoLucro');
    if (subLeoLu) subLeoLu.textContent = `R$ ${data.breakdownLeonardo.lucro.toFixed(2).replace('.', ',')}`;

    // Renderiza Tabela DRE
    const tableBody = document.getElementById('splitTableBody');
    if (!tableBody) return;

    if (data.orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-8 text-slate-400 text-xs font-semibold">
            Nenhum pedido encontrado no período selecionado.
          </td>
        </tr>
      `;
      return;
    }

    const channelBadges = {
      whatsapp: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">💬 WhatsApp</span>',
      balcao: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">🏬 Balcão</span>',
      site: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">🌐 Site</span>',
      indicacao: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">🤝 Indicação</span>',
      trafego_pago: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">📢 Anúncio</span>'
    };

    tableBody.innerHTML = data.orders.map(order => {
      const sp = order.profitSplit;
      const channelHtml = channelBadges[order.channel] || channelBadges.whatsapp;

      return `
        <tr>
          <td data-label="Pedido">
            <div class="font-mono text-xs font-black text-slate-900">${order.id}</div>
            ${channelHtml}
          </td>
          <td data-label="Cliente" class="font-semibold text-xs text-slate-800">
            ${order.clientName}
          </td>
          <td data-label="Valor Bruto" class="font-bold text-xs text-slate-900">
            R$ ${Number(order.total).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="(-) Custo" class="text-xs text-red-600 font-medium">
            - R$ ${Number(sp.cost).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="(=) Margem" class="font-bold text-xs text-slate-700">
            R$ ${Number(sp.margin).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="Caixa (10%)" class="text-xs text-slate-600 font-semibold">
            R$ ${Number(sp.caixaEmpresa).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="José Reis" class="font-black text-xs text-emerald-700 bg-emerald-50/50">
            R$ ${Number(sp.totalJose).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="Leonardo Monti" class="font-black text-xs text-sky-700 bg-sky-50/50">
            R$ ${Number(sp.totalLeonardo).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="Ações">
            <button onclick="admin.viewOrderSplitDetail('${order.id}')" class="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> Ver Split
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= MODAL DE REGISTRO RÁPIDO DE PEDIDOS (WHATSAPP / BALCÃO) =================
  openQuickOrderModal() {
    const modal = document.getElementById('quickOrderModal');
    if (!modal) return;

    // Reseta inputs
    const el = (id) => document.getElementById(id);
    if (el('orderClientName')) el('orderClientName').value = '';
    if (el('orderClientPhone')) el('orderClientPhone').value = '';
    if (el('orderDescription')) el('orderDescription').value = '';
    if (el('orderAmount')) el('orderAmount').value = '';
    if (el('orderCost')) el('orderCost').value = '';

    this.updateSplitPreview();
    modal.classList.add('active');
  }

  updateSplitPreview() {
    const amount = Number(document.getElementById('orderAmount')?.value) || 0;
    let cost = Number(document.getElementById('orderCost')?.value);

    // Sugestão automática de custo se vazio (30% do valor)
    if (isNaN(cost) || cost === 0) {
      cost = Number((amount * 0.30).toFixed(2));
      const costInput = document.getElementById('orderCost');
      if (costInput && amount > 0 && !costInput.value) {
        costInput.placeholder = cost.toFixed(2);
      }
    }

    const channelRadio = document.querySelector('input[name="orderChannel"]:checked');
    const channel = channelRadio ? channelRadio.value : 'whatsapp';
    const isOrganic = (channel !== 'trafego_pago');

    const artRadio = document.querySelector('input[name="splitArt"]:checked');
    const artValue = artRadio ? artRadio.value : 'ready';
    const artStatus = (artValue === 'ready') ? 'ready' : 'need_design';
    const artAssignee = (artValue === 'ready') ? null : artValue;

    const attRadio = document.querySelector('input[name="splitAttendance"]:checked');
    const attendanceAssignee = attRadio ? attRadio.value : 'jose';

    const prodRadio = document.querySelector('input[name="splitProduction"]:checked');
    const productionAssignee = prodRadio ? prodRadio.value : 'leonardo';

    const split = window.storage.calculateProfitSplit(amount, cost, {
      channel,
      isOrganic,
      artStatus,
      attendanceAssignee,
      artAssignee,
      productionAssignee
    });

    const elMargin = document.getElementById('previewMargin');
    if (elMargin) elMargin.textContent = `R$ ${split.margin.toFixed(2).replace('.', ',')}`;

    const elJose = document.getElementById('previewJose');
    if (elJose) elJose.textContent = `R$ ${split.totalJose.toFixed(2).replace('.', ',')}`;

    const elLeo = document.getElementById('previewLeonardo');
    if (elLeo) elLeo.textContent = `R$ ${split.totalLeonardo.toFixed(2).replace('.', ',')}`;

    const elCaixa = document.getElementById('previewCaixa');
    if (elCaixa) elCaixa.textContent = `R$ ${split.caixaEmpresa.toFixed(2).replace('.', ',')}`;
  }

  submitQuickOrder() {
    const name = document.getElementById('orderClientName')?.value.trim();
    const phone = document.getElementById('orderClientPhone')?.value.trim() || '';
    const desc = document.getElementById('orderDescription')?.value.trim();
    const amount = Number(document.getElementById('orderAmount')?.value);
    let cost = Number(document.getElementById('orderCost')?.value);

    if (isNaN(cost) || cost === 0) {
      cost = Number((amount * 0.30).toFixed(2));
    }

    if (!name || !desc || isNaN(amount) || amount <= 0) {
      alert('Por favor, informe o Nome do Cliente, a Descrição do Material e o Valor Cobrado.');
      return;
    }

    const channelRadio = document.querySelector('input[name="orderChannel"]:checked');
    const channel = channelRadio ? channelRadio.value : 'whatsapp';
    const isOrganic = (channel !== 'trafego_pago');

    const artRadio = document.querySelector('input[name="splitArt"]:checked');
    const artValue = artRadio ? artRadio.value : 'ready';
    const artStatus = (artValue === 'ready') ? 'ready' : 'need_design';
    const artAssignee = (artValue === 'ready') ? null : artValue;

    const attRadio = document.querySelector('input[name="splitAttendance"]:checked');
    const attendanceAssignee = attRadio ? attRadio.value : 'jose';

    const prodRadio = document.querySelector('input[name="splitProduction"]:checked');
    const productionAssignee = prodRadio ? prodRadio.value : 'leonardo';

    const paymentMethod = document.getElementById('orderPaymentMethod')?.value || 'Pix';
    const paymentStatus = document.getElementById('orderPaymentStatus')?.value || 'pago';

    // Cria o Pedido Completo com Repartição
    const newOrder = window.storage.createOrder({
      clientName: name,
      clientPhone: phone.replace(/\D/g, ''),
      channel,
      isOrganic,
      deliveryType: channel === 'balcao' ? 'balcao' : 'entrega',
      address: '',
      notes: `Pedido lançado via ${channel === 'whatsapp' ? 'WhatsApp' : channel}.`,
      artStatus,
      status: 'producao',
      paymentStatus,
      paymentMethod,
      attendanceAssignee,
      artAssignee,
      productionAssignee,
      cost,
      total: amount,
      items: [
        {
          productName: desc,
          quantityLabel: "1 lote",
          paper: "Padrão de Qualidade",
          finish: "Conforme combinado",
          total: amount
        }
      ]
    });

    // Se houve custo, registra como despesa de insumo
    if (cost > 0) {
      window.storage.addFinance({
        type: "despesa",
        category: "Insumos & Papel",
        description: `Insumos ${newOrder.id} (${name})`,
        amount: cost,
        paymentMethod: paymentMethod,
        orderId: newOrder.id
      });
    }

    this.closeModal('quickOrderModal');
    this.refreshCurrentView();
    alert(`Pedido ${newOrder.id} lançado com sucesso! Repartição entre José e Leonardo computada.`);
  }

  viewOrderSplitDetail(orderId) {
    const order = window.storage.getOrderById(orderId);
    if (!order) return;

    const sp = order.profitSplit;
    const msg = `
📊 REPARTIÇÃO DO PEDIDO #${order.id}
👤 Cliente: ${order.clientName}
💰 Valor Bruto: R$ ${Number(order.total).toFixed(2)}
📦 Custo Insumos: R$ ${Number(sp.cost).toFixed(2)}
💵 Margem Líquida: R$ ${Number(sp.margin).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━
🏦 Caixa da Empresa (10%): R$ ${Number(sp.caixaEmpresa).toFixed(2)}
${sp.captacaoValor > 0 ? `📢 Fundo de Tráfego/Ads (15%): R$ ${Number(sp.captacaoValor).toFixed(2)}\n` : '📢 Captação Orgânica: +15% revertido para Lucros!\n'}
${sp.arteValor > 0 ? `🎨 Criação de Arte (15%): R$ ${Number(sp.arteValor).toFixed(2)}\n` : '🎨 Arte Própria do Cliente: +15% revertido para Lucros!\n'}
💬 Atendimento (15%): R$ ${Number(sp.atendimentoValor).toFixed(2)}
⚙️ Produção (25%): R$ ${Number(sp.producaoValor).toFixed(2)}
💎 Divisão Lucro Líquido: R$ ${Number(sp.lucroPoolTotal).toFixed(2)} (50/50)

━━━━━━━━━━━━━━━━━━━━━━━━
🟢 TOTAL JOSÉ REIS: R$ ${Number(sp.totalJose).toFixed(2)}
🔵 TOTAL LEONARDO MONTI: R$ ${Number(sp.totalLeonardo).toFixed(2)}
    `;

    alert(msg);
  }

  openSplitRulesModal() {
    const modal = document.getElementById('splitRulesModal');
    if (modal) modal.classList.add('active');
  }

  exportPartnersCSV() {
    const data = window.storage.getPartnersMetrics(this.splitPeriod);
    if (data.orders.length === 0) {
      alert('Nenhum pedido no período selecionado.');
      return;
    }

    let csv = "\uFEFF"; // UTF-8 BOM para o Excel abrir com acentuação correta
    csv += "Pedido;Data;Canal;Cliente;ValorBruto(R$);Custo(R$);Margem(R$);Caixa10%(R$);JoseReis(R$);LeonardoMonti(R$)\n";

    data.orders.forEach(o => {
      const sp = o.profitSplit;
      const dateStr = new Date(o.createdAt).toLocaleDateString('pt-BR');
      csv += `"${o.id}";"${dateStr}";"${o.channel}";"${o.clientName}";"${Number(o.total).toFixed(2).replace('.', ',')}";"${Number(sp.cost).toFixed(2).replace('.', ',')}";"${Number(sp.margin).toFixed(2).replace('.', ',')}";"${Number(sp.caixaEmpresa).toFixed(2).replace('.', ',')}";"${Number(sp.totalJose).toFixed(2).replace('.', ',')}";"${Number(sp.totalLeonardo).toFixed(2).replace('.', ',')}"\n`;
    });

    csv += `\n"TOTAIS ACUMULADOS";"";"";"";"";"";"${data.totalMargem.toFixed(2).replace('.', ',')}";"${data.totalCaixa.toFixed(2).replace('.', ',')}";"${data.totalJose.toFixed(2).replace('.', ',')}";"${data.totalLeonardo.toFixed(2).replace('.', ',')}"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acerto-socios-jose-leonardo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ================= MÓDULO FINANCEIRO GERAL =================
  setPeriodFilter(period, btnEl) {
    this.financePeriod = period;
    document.querySelectorAll('.period-btn').forEach(b => {
      b.className = "period-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900";
    });
    if (btnEl) btnEl.className = "period-btn px-3 py-1.5 rounded-lg active bg-white text-slate-900 font-bold shadow-sm";

    this.updateKPIs();
    this.renderCharts();
    this.renderFinanceTable();
  }

  updateKPIs() {
    const metrics = window.storage.getFinancialMetrics(this.financePeriod);

    const revEl = document.getElementById('kpiRevenue');
    if (revEl) revEl.textContent = metrics.totalRevenue.toFixed(2).replace('.', ',');

    const expEl = document.getElementById('kpiExpense');
    if (expEl) expEl.textContent = metrics.totalExpense.toFixed(2).replace('.', ',');

    const profEl = document.getElementById('kpiProfit');
    if (profEl) {
      profEl.textContent = metrics.netProfit.toFixed(2).replace('.', ',');
      profEl.className = metrics.netProfit >= 0 ? "text-xl sm:text-2xl font-black text-emerald-700" : "text-xl sm:text-2xl font-black text-red-600";
    }

    const marginBadge = document.getElementById('kpiMarginBadge');
    if (marginBadge) {
      marginBadge.textContent = `Margem Líquida: ${metrics.profitMargin}%`;
      marginBadge.className = metrics.profitMargin >= 0 ? "text-[11px] text-sky-700 font-bold mt-1 block" : "text-[11px] text-red-600 font-bold mt-1 block";
    }

    const ticketEl = document.getElementById('kpiTicket');
    if (ticketEl) ticketEl.textContent = Number(metrics.averageTicket).toFixed(2).replace('.', ',');

    const countEl = document.getElementById('kpiOrdersCount');
    if (countEl) countEl.textContent = `${metrics.completedOrdersCount} vendas fechadas`;
  }

  renderCharts() {
    const metrics = window.storage.getFinancialMetrics(this.financePeriod);

    const cashFlowCtx = document.getElementById('chartCashFlow');
    if (cashFlowCtx) {
      if (this.cashFlowChart) this.cashFlowChart.destroy();

      this.cashFlowChart = new Chart(cashFlowCtx, {
        type: 'bar',
        data: {
          labels: ['Faturamento (Entradas)', 'Custos & Despesas (Saídas)', 'Lucro Líquido Real'],
          datasets: [{
            data: [metrics.totalRevenue, metrics.totalExpense, Math.max(0, metrics.netProfit)],
            backgroundColor: [
              'rgba(16, 185, 129, 0.85)',
              'rgba(239, 68, 68, 0.85)',
              'rgba(2, 132, 199, 0.85)'
            ],
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (val) => `R$ ${val}` }
            }
          }
        }
      });
    }

    const catCtx = document.getElementById('chartCategories');
    if (catCtx) {
      if (this.categoriesChart) this.categoriesChart.destroy();

      const catLabels = Object.keys(metrics.categoryTotals);
      const catValues = Object.values(metrics.categoryTotals);

      this.categoriesChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels.length > 0 ? catLabels : ['Sem vendas no período'],
          datasets: [{
            data: catValues.length > 0 ? catValues : [1],
            backgroundColor: [
              '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  renderFinanceTable() {
    const tableBody = document.getElementById('financeTableBody');
    const filterSelect = document.getElementById('financeTypeFilter');
    if (!tableBody) return;

    const filterType = filterSelect ? filterSelect.value : 'all';
    const metrics = window.storage.getFinancialMetrics(this.financePeriod);
    let list = metrics.transactions;

    if (filterType !== 'all') {
      list = list.filter(t => t.type === filterType);
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400 text-xs font-semibold">
            Nenhuma movimentação financeira encontrada.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(tx => {
      const isIncome = tx.type === 'receita';
      const formattedDate = new Date(tx.date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });

      return `
        <tr>
          <td data-label="Data" class="font-mono text-xs text-slate-600">${formattedDate}</td>
          <td data-label="Tipo">
            <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
              ${isIncome ? '▲ Receita' : '▼ Custo'}
            </span>
          </td>
          <td data-label="Categoria" class="font-semibold text-xs text-slate-700">${tx.category}</td>
          <td data-label="Descrição" class="text-xs text-slate-800 font-medium">
            ${tx.description}
            ${tx.orderId ? `<span class="ml-1 text-[10px] text-sky-600 font-bold">(${tx.orderId})</span>` : ''}
          </td>
          <td data-label="Forma Pagto" class="text-xs text-slate-600 font-medium">${tx.paymentMethod || 'Pix'}</td>
          <td data-label="Valor" class="font-bold text-xs ${isIncome ? 'text-emerald-700' : 'text-red-600'}">
            ${isIncome ? '+' : '-'} R$ ${Number(tx.amount).toFixed(2).replace('.', ',')}
          </td>
          <td data-label="Ações">
            <button onclick="admin.deleteFinanceTx('${tx.id}')" class="text-slate-400 hover:text-red-600 p-1 transition" title="Excluir Lançamento">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  deleteFinanceTx(id) {
    if (confirm('Deseja realmente excluir este lançamento do fluxo de caixa?')) {
      window.storage.deleteFinance(id);
      this.refreshCurrentView();
    }
  }

  exportFinancialCSV() {
    const finances = window.storage.getFinances();
    if (finances.length === 0) {
      alert('Nenhum dado financeiro para exportar.');
      return;
    }

    let csvContent = "\uFEFF";
    csvContent += "ID;Data;Tipo;Categoria;Descricao;FormaPagamento;Valor(R$);PedidoVinculado\n";

    finances.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('pt-BR') + ' ' + new Date(tx.date).toLocaleTimeString('pt-BR');
      const valStr = Number(tx.amount).toFixed(2).replace('.', ',');
      csvContent += `"${tx.id}";"${dateStr}";"${tx.type}";"${tx.category}";"${tx.description.replace(/"/g, '""')}";"${tx.paymentMethod}";"${valStr}";"${tx.orderId || ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxo-caixa-grafica-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openQuickExpenseModal() {
    const modal = document.getElementById('quickExpenseModal');
    if (modal) modal.classList.add('active');
  }

  submitQuickExpense() {
    const category = document.getElementById('expenseCategory')?.value;
    const desc = document.getElementById('expenseDescription')?.value.trim();
    const amount = Number(document.getElementById('expenseAmount')?.value);
    const payment = document.getElementById('expensePaymentMethod')?.value || 'Pix';

    if (!desc || isNaN(amount) || amount <= 0) {
      alert('Por favor, informe a descrição e o valor gasto.');
      return;
    }

    window.storage.addFinance({
      type: "despesa",
      category: category,
      description: desc,
      amount: amount,
      paymentMethod: payment
    });

    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';

    this.closeModal('quickExpenseModal');
    this.refreshCurrentView();
    alert('Despesa registrada no caixa da empresa!');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // ================= GESTÃO DE PEDIDOS & PRODUÇÃO =================
  filterOrders(status, btnEl) {
    this.orderStatusFilter = status;
    document.querySelectorAll('.order-filter-btn').forEach(b => {
      b.className = "order-filter-btn px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200";
    });
    if (btnEl) btnEl.className = "order-filter-btn px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold";

    this.renderOrders();
  }

  searchOrders(val) {
    this.orderSearchQuery = val.toLowerCase();
    this.renderOrders();
  }

  renderOrders() {
    const container = document.getElementById('ordersContainer');
    const emptyNotice = document.getElementById('emptyOrdersNotice');
    const countAll = document.getElementById('countAllOrders');
    if (!container) return;

    let orders = window.storage.getOrders();
    if (countAll) countAll.textContent = orders.length;

    if (this.orderStatusFilter !== 'all') {
      orders = orders.filter(o => o.status === this.orderStatusFilter);
    }

    if (this.orderSearchQuery.trim() !== '') {
      const q = this.orderSearchQuery;
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        (o.clientPhone && o.clientPhone.includes(q))
      );
    }

    if (orders.length === 0) {
      container.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    const statusLabels = {
      novo: { label: "Novo / Aguardando", class: "status-novo" },
      arte: { label: "Criação / Prova de Arte", class: "status-arte" },
      producao: { label: "Em Impressão & Corte", class: "status-producao" },
      pronto: { label: "Pronto para Retirada", class: "status-pronto" },
      entregue: { label: "Entregue / Concluído", class: "status-entregue" },
      cancelado: { label: "Cancelado", class: "status-cancelado" }
    };

    container.innerHTML = orders.map(order => {
      const st = statusLabels[order.status] || { label: order.status, class: "status-novo" };
      const sp = order.profitSplit || window.storage.calculateProfitSplit(order.total, order.cost);

      return `
        <div class="admin-card p-4 sm:p-5 flex flex-col justify-between border-t-4 ${order.status === 'pronto' ? 'border-t-emerald-500' : order.status === 'producao' ? 'border-t-sky-500' : 'border-t-slate-400'}">
          <div>
            <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
              <div>
                <span class="font-mono text-xs font-black text-sky-600 block">${order.id}</span>
                <h4 class="font-bold text-slate-900 text-sm">${order.clientName}</h4>
                ${order.clientPhone ? `<span class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3"></i> ${order.clientPhone}</span>` : ''}
              </div>
              <span class="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                R$ ${Number(order.total).toFixed(2).replace('.', ',')}
              </span>
            </div>

            <!-- Resumo dos Itens e Repartição dos Sócios -->
            <div class="space-y-1.5 mb-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ${(order.items || []).map(item => `
                <div class="border-b border-slate-200/60 pb-1 last:border-0 last:pb-0">
                  <p class="font-bold text-slate-800">${item.quantityLabel || ''} ${item.productName}</p>
                  <p class="text-[11px] text-slate-500">${item.paper || ''} • ${item.finish || ''}</p>
                </div>
              `).join('')}

              <!-- Divisão Rápida deste Pedido -->
              <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold">
                <span class="text-emerald-700">José: R$ ${Number(sp.totalJose).toFixed(2).replace('.', ',')}</span>
                <span class="text-sky-700">Leonardo: R$ ${Number(sp.totalLeonardo).toFixed(2).replace('.', ',')}</span>
                <span class="text-slate-500">Caixa: R$ ${Number(sp.caixaEmpresa).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <!-- Ações de Status e WhatsApp -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Fase Produção</label>
                <select 
                  onchange="admin.changeOrderStatus('${order.id}', this.value)" 
                  class="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-xs ${st.class}"
                >
                  <option value="novo" ${order.status === 'novo' ? 'selected' : ''}>Novo / Aguardando</option>
                  <option value="arte" ${order.status === 'arte' ? 'selected' : ''}>Em Criação de Arte</option>
                  <option value="producao" ${order.status === 'producao' ? 'selected' : ''}>Em Produção / Impressão</option>
                  <option value="pronto" ${order.status === 'pronto' ? 'selected' : ''}>Pronto p/ Retirada</option>
                  <option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>Entregue / Concluído</option>
                  <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pagamento</label>
                <select 
                  onchange="admin.changeOrderPayment('${order.id}', this.value)"
                  class="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-semibold text-xs bg-white text-slate-800"
                >
                  <option value="pendente" ${order.paymentStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
                  <option value="parcial" ${order.paymentStatus === 'parcial' ? 'selected' : ''}>Sinal 50%</option>
                  <option value="pago" ${order.paymentStatus === 'pago' ? 'selected' : ''}>Pago Integral</option>
                </select>
              </div>
            </div>

            <!-- Botão de Notificar Cliente no WhatsApp -->
            ${order.clientPhone ? `
              <button 
                onclick="admin.notifyClientWhatsApp('${order.id}')"
                class="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-emerald-200"
              >
                <i data-lucide="message-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Avisar Cliente no WhatsApp
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  changeOrderStatus(orderId, newStatus) {
    window.storage.updateOrderStatus(orderId, newStatus);
    this.refreshCurrentView();
  }

  changeOrderPayment(orderId, newPaymentStatus) {
    window.storage.updateOrderPayment(orderId, newPaymentStatus);
    this.refreshCurrentView();
  }

  notifyClientWhatsApp(orderId) {
    const order = window.storage.getOrderById(orderId);
    if (!order || !order.clientPhone) return;

    const config = window.storage.getConfig();
    let msg = "";

    if (order.status === 'pronto') {
      msg = `🎉 *Olá, ${order.clientName}! Boas notícias da ${config.storeName}:*\n\nSeu pedido *#${order.id}* já está *PRONTO PARA RETIRADA* no nosso balcão!\n\n📍 *Endereço:* ${config.address}\n⏰ *Horário:* ${config.operatingHours}\n\nEstamos aguardando sua visita! 😊`;
    } else if (order.status === 'arte') {
      msg = `🎨 *Olá, ${order.clientName}!* Estamos trabalhando na arte do seu pedido *#${order.id}*. Em breve enviaremos a prévia aqui para sua aprovação.`;
    } else if (order.status === 'producao') {
      msg = `⚙️ *Olá, ${order.clientName}!* Sua arte foi aprovada e seu pedido *#${order.id}* acabou de entrar na linha de impressão e acabamento. Prazo estimado: ${config.standardTurnaround}.`;
    } else {
      msg = `👋 *Olá, ${order.clientName}!* Entrando em contato sobre o seu pedido *#${order.id}* na ${config.storeName}.`;
    }

    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ================= CATÁLOGO & PRODUTOS =================
  renderProductsList() {
    const container = document.getElementById('adminProductsList');
    if (!container) return;

    const products = window.storage.getProducts();

    container.innerHTML = products.map(prod => `
      <div class="admin-card p-4 flex flex-col justify-between">
        <div>
          <div class="aspect-video w-full rounded-xl overflow-hidden bg-white border border-stone-200 mb-3 relative flex items-center justify-center p-2">
            <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-contain">
            <span class="absolute top-2 left-2 bg-stone-900/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              ${prod.categoryLabel}
            </span>
          </div>
          <h4 class="font-black text-stone-900 text-sm mb-1">${prod.name}</h4>
          <p class="text-xs text-stone-600 line-clamp-2 mb-2 leading-relaxed">${prod.description}</p>
        </div>

        <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-stone-500 block font-bold uppercase tracking-wider">Preço Base</span>
            <span class="text-sm font-black text-stone-900">R$ ${Number(prod.basePrice).toFixed(2).replace('.', ',')}</span>
          </div>
          <button onclick="admin.deleteProductPrompt('${prod.id}')" class="text-stone-400 hover:text-red-500 p-2 transition" title="Remover do Catálogo">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  deleteProductPrompt(id) {
    if (confirm('Deseja realmente remover este produto do catálogo da loja?')) {
      window.storage.deleteProduct(id);
      this.refreshCurrentView();
    }
  }

  openNewProductModal() {
    const name = prompt('Nome do Novo Produto (Ex: Cardápio em PVC, Crachá em PVC):');
    if (!name) return;

    const basePrice = Number(prompt('Preço Base Inicial (R$):', '50.00'));
    if (isNaN(basePrice)) return;

    const turnaround = prompt('Prazo de Produção (Ex: 2 a 3 dias úteis):', '2 a 3 dias úteis');

    window.storage.upsertProduct({
      id: 'prod-' + Date.now(),
      name: name,
      category: 'corporativo',
      categoryLabel: 'Impressos Personalizados',
      badge: 'Novidade',
      badgeType: 'accent',
      description: `Impressão de alta qualidade com acabamento de precisão para ${name}.`,
      basePrice: basePrice,
      unit: "unidades",
      turnaround: turnaround || "2 a 3 dias úteis",
      quantities: [
        { qty: 100, price: basePrice, label: "100 un" },
        { qty: 500, price: basePrice * 3, label: "500 un" },
        { qty: 1000, price: basePrice * 5, label: "1.000 un" }
      ],
      papers: [
        { id: "padrao", label: "Padrão de Mercado", priceAdd: 0 }
      ],
      finishes: [
        { id: "padrao", label: "Acabamento Tradicional", multiplier: 1.0 }
      ],
      extras: [],
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
    });

    this.refreshCurrentView();
    alert('Novo produto adicionado ao catálogo!');
  }

  // ================= CONFIGURAÇÕES & BACKUP =================
  loadSettingsForm() {
    const config = window.storage.getConfig();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('cfgStoreName', config.storeName);
    setVal('cfgShortName', config.shortName);
    setVal('cfgWhatsapp', config.whatsappNumber);
    setVal('cfgDisplayPhone', config.displayPhone);
    setVal('cfgPixKey', config.pixKey);
    setVal('cfgPixOwner', config.pixOwner);
    setVal('cfgAddress', config.address);
    setVal('cfgArtFee', config.standardArtFee);
    setVal('cfgAdminPin', config.adminPin);
  }

  saveStoreSettings() {
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';

    const newConfig = {
      ...window.storage.getConfig(),
      storeName: getVal('cfgStoreName'),
      shortName: getVal('cfgShortName'),
      whatsappNumber: getVal('cfgWhatsapp').replace(/\D/g, ''),
      displayPhone: getVal('cfgDisplayPhone'),
      pixKey: getVal('cfgPixKey'),
      pixOwner: getVal('cfgPixOwner'),
      address: getVal('cfgAddress'),
      standardArtFee: Number(getVal('cfgArtFee')) || 35.00,
      adminPin: getVal('cfgAdminPin') || '1234'
    };

    window.storage.saveConfig(newConfig);
    alert('Configurações salvas com sucesso! O catálogo mobile foi atualizado em tempo real.');
    this.refreshCurrentView();
  }

  downloadBackupJSON() {
    const jsonStr = window.storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-grafica-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = window.storage.importAllData(e.target.result);
      if (res.success) {
        alert('Backup restaurado com sucesso! Seus dados foram recarregados.');
        location.reload();
      } else {
        alert('Erro ao restaurar backup: ' + res.error);
      }
    };
    reader.readAsText(file);
  }
}

// Instancia Painel Admin
window.admin = new GraphicShopAdmin();
