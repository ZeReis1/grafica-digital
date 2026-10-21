# 🦅 Sul Design • Gráfica Digital, Comunicação Visual & Gestão de Sócios

Plataforma oficial da **Sul Design**, com **Catálogo Digital Mobile-First** para clientes de gráfica rápida e comunicação visual, integrada com o **Painel Administrativo dos Sócios (José Reis & Leonardo Monti)** com divisão de lucros por etapas operacionais, controle de fluxo de caixa e pedidos em tempo real via WhatsApp.

---

## 📱 1. Catálogo Mobile (90% do Tráfego de Clientes)

Projetado especialmente para o celular com navegação fluida, botões táteis ergonômicos e carregamento instantâneo:

- **Simulador de Orçamento em Tempo Real**:
  - O cliente escolhe a tiragem (ex: 250, 500, 1.000, 2.500, 5.000 un).
  - Seleciona o tipo de papel/material (Couché 300g, Couché 250g, Vinil Impermeável, Lona 440g, etc.).
  - Escolhe o acabamento (Verniz UV Total, Laminação Fosca + Verniz Localizado, etc.).
  - Define a criação da arte: *"Já tenho o arquivo pronto"* ou *"Quero que a gráfica crie (+ R$ 35,00)"*.
  - O valor total e o prazo de entrega recalculam instantaneamente na tela!
- **Carrinho & Pedidos**:
  - Adiciona múltiplos itens personalizados.
  - Seleção de retirada no balcão ou entrega com motoboy.
  - Chave Pix com cópia em 1 clique e instrução de comprovante.
  - Botão **"Confirmar Pedido no WhatsApp"** que formata a mensagem técnica detalhada automaticamente, sem erros de comunicação.
- **Rastreamento de Pedido Integrado**:
  - O cliente pode consultar o status do pedido pelo código (`PED-1082`) ou pelo telefone.
  - Linha do tempo visual: *Recebido ➔ Conferência de Arte ➔ Impressão & Acabamento ➔ Pronto para Retirada!*

---

## 💻 2. Painel Administrativo (Otimizado para Notebook/PC)

Ambiente fechado com senha/PIN (padrão: `1234`), com visual espaçoso e ferramentas de alta produtividade para o dia a dia da gráfica:

- **Fluxo de Caixa & Métricas em Tempo Real (KPIs)**:
  - Faturamento Bruto (Receitas).
  - Custos & Despesas de Produção (Saídas).
  - Lucro Líquido Real e Margem de Lucro (%).
  - Ticket Médio por Venda.
  - Gráficos visuais (Chart.js) comparando Entradas vs Saídas e vendas por categoria.
  - Filtros por período: *Hoje*, *Últimos 7 dias*, *Este Mês*, *Todo o Período*.
  - Exportação completa do extrato financeiro para **CSV / Excel** em 1 clique.
- **Lançamentos Rápidos de Balcão**:
  - Botão **`+ Nova Venda Balcão`**: Registre vendas físicas presenciais em 10 segundos no notebook (cliente, produto, valor cobrado, custo estimado e forma de pagamento).
  - Botão **`+ Novo Custo / Despesa`**: Registre saídas por categoria (Insumos/Papel, Tintas/Toners, Terceirização, Despesas Fixas, etc.).
- **Gestão de Pedidos & Linha de Produção**:
  - Visualização de todos os pedidos com status de produção e status de pagamento.
  - Alteração de fase da produção com 1 clique.
  - Botão **`Avisar Cliente no WhatsApp`**: Dispara automaticamente mensagens prontas para o cliente (ex: *"Seu pedido está pronto para retirada!"* ou *"Sua arte está disponível para aprovação"*).
- **Catálogo & Tabela de Preços**:
  - Adicione novos produtos, altere preços base, prazos de entrega e itens em destaque.
- **Configurações & Backup**:
  - Configure nome da gráfica, WhatsApp oficial, Chave Pix, Endereço de retirada e taxa de criação de arte.
  - Download de backup completo em JSON (`backup-grafica.json`) e restauração com 1 clique.

---

## 🚀 Como Executar Localmente no Notebook

Você pode abrir o projeto de duas formas imediatas:

### Opção A: Abrir Diretamente no Navegador
Dê um duplo clique no arquivo `index.html` (para ver o catálogo mobile) ou `admin.html` (para acessar o painel de gestão).

### Opção B: Servidor Local via Terminal
No PowerShell dentro da pasta `c:\Users\jrrei\Downloads\grafica-digital`:
```powershell
npx serve .
```
E acesse `http://localhost:3000` no navegador.

---

## 🌐 Como Publicar na Internet (100% Gratuito)

O projeto já está configurado com `vercel.json` e `netlify.toml`:

### Vercel (Recomendado):
1. Acesse [vercel.com](https://vercel.com).
2. Arraste a pasta `grafica-digital` ou execute no terminal:
   ```bash
   npx vercel
   ```
3. Em 30 segundos seu site estará no ar com link HTTPS gratuito (ex: `minhagrafica.vercel.app`).

### Netlify Drop:
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arraste a pasta `grafica-digital` para a janela do navegador. Pronto!

---

## 🔐 Senha de Acesso Inicial
- **PIN do Admin:** `1234` *(Pode ser alterado na aba "Configurações" do painel admin)*
- **WhatsApp configurado:** `(35) 99970-2316`
