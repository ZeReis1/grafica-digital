/**
 * ADMIN.JS - Gestão de Pedidos, Produção e Fluxo de Caixa da Gráfica
 * Otimizado para alta produtividade no Notebook/PC e 100% responsivo para Mobile.
 */

class GraphicShopAdmin {
  constructor() {
    this.currentTab = 'finances';
    this.periodFilter = 'all';
    this.orderStatusFilter = 'all';
    this.orderSearchQuery = '';
    this.cashFlowChart = null;
    this.categoriesChart = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.checkAuth();

    // Sincronização em tempo real quando clientes fazem pedidos no catálogo
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

    this.switchTab('finances');
    this.updatePendingOrdersBadge();
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Seções
    const sections = {
      finances: document.getElementById('tabFinances'),
      orders: document.getElementById('tabOrders'),
      products: document.getElementById('tabProducts'),
      settings: document.getElementById('tabSettings')
    };

    // Botões Sidebar
    const buttons = {
      finances: document.getElementById('tabBtnFinances'),
      orders: document.getElementById('tabBtnOrders'),
      products: document.getElementById('tabBtnProducts'),
      settings: document.getElementById('tabBtnSettings')
    };

    const titles = {
      finances: "Fluxo de Caixa & Finanças da Gráfica",
      orders: "Gestão de Pedidos & Fila de Produção",
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
          buttons[key].className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-sky-600 text-white font-bold transition shadow-sm";
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
    if (this.currentTab === 'finances') {
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

  // ================= MÓDULO FINANCEIRO (NOTEBOOK / PC) =================
  setPeriodFilter(period, btnEl) {
    this.periodFilter = period;
    document.querySelectorAll('.period-btn').forEach(b => {
      b.className = "period-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900";
    });
    if (btnEl) btnEl.className = "period-btn px-3 py-1.5 rounded-lg active bg-white text-slate-900 font-bold shadow-sm";

    this.updateKPIs();
    this.renderCharts();
    this.renderFinanceTable();
  }

  updateKPIs() {
    const metrics = window.storage.getFinancialMetrics(this.periodFilter);

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
    const metrics = window.storage.getFinancialMetrics(this.periodFilter);

    // 1. Gráfico Entradas vs Saídas
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
              'rgba(16, 185, 129, 0.85)', // Verde
              'rgba(239, 68, 68, 0.85)',   // Vermelho
              'rgba(2, 132, 199, 0.85)'    // Ciano Azul
            ],
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `R$ ${Number(ctx.raw).toFixed(2).replace('.', ',')}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => `R$ ${val}`
              }
            }
          }
        }
      });
    }

    // 2. Gráfico Categorias
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
    const metrics = window.storage.getFinancialMetrics(this.periodFilter);
    let list = metrics.transactions;

    if (filterType !== 'all') {
      list = list.filter(t => t.type === filterType);
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400 text-xs font-semibold">
            Nenhuma movimentação financeira encontrada para os filtros selecionados.
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

    let csvContent = "\uFEFF"; // UTF-8 BOM para o Excel abrir sem quebrar acentuação
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

  // ================= LANÇAMENTOS RÁPIDOS NO NOTEBOOK =================
  openQuickSaleModal() {
    const modal = document.getElementById('quickSaleModal');
    if (modal) modal.classList.add('active');
  }

  submitQuickSale() {
    const client = document.getElementById('saleClientName')?.value.trim();
    const desc = document.getElementById('saleDescription')?.value.trim();
    const amount = Number(document.getElementById('saleAmount')?.value);
    const cost = Number(document.getElementById('saleCost')?.value) || 0;
    const payment = document.getElementById('salePaymentMethod')?.value || 'Pix';
    const status = document.getElementById('salePaymentStatus')?.value || 'pago';

    if (!client || !desc || isNaN(amount) || amount <= 0) {
      alert('Por favor, informe o Cliente, a Descrição e o Valor Cobrado.');
      return;
    }

    // 1. Cria o Pedido Interno
    const newOrder = window.storage.createOrder({
      clientName: client,
      clientPhone: "",
      deliveryType: "balcao",
      address: "",
      notes: "Venda registrada diretamente no balcão da gráfica.",
      artStatus: "ready",
      status: "producao",
      paymentStatus: status,
      paymentMethod: payment,
      items: [
        {
          productName: desc,
          quantityLabel: "1 lote",
          paper: "Conforme combinado",
          finish: "Padrão",
          total: amount
        }
      ],
      total: amount
    });

    // 2. Se houver custo de produção estimado, lança a saída
    if (cost > 0) {
      window.storage.addFinance({
        type: "despesa",
        category: "Insumos & Papel",
        description: `Custo prod. ${newOrder.id} (${client})`,
        amount: cost,
        paymentMethod: payment,
        orderId: newOrder.id
      });
    }

    // Limpa campos
    document.getElementById('saleClientName').value = '';
    document.getElementById('saleDescription').value = '';
    document.getElementById('saleAmount').value = '';
    document.getElementById('saleCost').value = '';

    this.closeModal('quickSaleModal');
    this.refreshCurrentView();
    alert(`Venda lançada com sucesso! Pedido ${newOrder.id} gerado.`);
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
    alert('Despesa registrada no fluxo de caixa!');
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

    // Filtros
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
      const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });

      return `
        <div class="admin-card p-4 sm:p-5 flex flex-col justify-between border-t-4 ${order.status === 'pronto' ? 'border-t-emerald-500' : order.status === 'producao' ? 'border-t-sky-500' : 'border-t-slate-400'}">
          <div>
            <!-- Header do Card -->
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

            <!-- Resumo dos Itens -->
            <div class="space-y-1.5 mb-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ${order.items.map(item => `
                <div class="border-b border-slate-200/60 pb-1 last:border-0 last:pb-0">
                  <p class="font-bold text-slate-800">${item.quantityLabel || ''} ${item.productName}</p>
                  <p class="text-[11px] text-slate-500">${item.paper || ''} • ${item.finish || ''}</p>
                </div>
              `).join('')}
              ${order.notes ? `<p class="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded font-medium mt-1">Obs: ${order.notes}</p>` : ''}
              ${order.artLink ? `<p class="text-[11px] text-sky-600 font-bold truncate">Arte: <a href="${order.artLink}" target="_blank" class="underline">Ver Arquivo</a></p>` : ''}
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
          <div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
            <img src="${prod.image}" class="w-full h-full object-cover">
            <span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ${prod.categoryLabel}
            </span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm mb-1">${prod.name}</h4>
          <p class="text-xs text-slate-500 line-clamp-2 mb-2">${prod.description}</p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Preço Base</span>
            <span class="text-sm font-black text-slate-900">R$ ${Number(prod.basePrice).toFixed(2).replace('.', ',')}</span>
          </div>
          <button onclick="admin.deleteProductPrompt('${prod.id}')" class="text-slate-400 hover:text-red-500 p-2 transition" title="Remover do Catálogo">
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
