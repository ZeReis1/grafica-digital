/**
 * DRIVE.JS - Sul Design Drive (Nuvem de Arquivos Compartilhada dos Sócios)
 * Permite fazer upload de arquivos no Notebook ou Celular e baixar instantaneamente em outro PC.
 * Estilo Google Drive com visualização em Grade/Lista, Pastas e Busca.
 */

class SulDesignDrive {
  constructor() {
    this.binId = 'suldesign-drive-v1';
    this.baseUrl = 'https://filebin.net';
    this.files = [];
    this.currentFolder = 'all';
    this.searchQuery = '';
    this.viewMode = localStorage.getItem('suldesign_drive_view') || 'grid';
    this.currentUploader = localStorage.getItem('suldesign_drive_user') || 'jose';
    this.metadata = this.loadMetadata();
    this.isLoading = false;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.setupDragAndDrop();
    this.setupViewMode();
    this.setupUploaderSelector();
    this.fetchFiles();

    // Atualização automática a cada 25 segundos para manter os PCs sincronizados
    this.autoRefreshInterval = setInterval(() => {
      if (!document.hidden && !this.isLoading) {
        this.fetchFiles(true);
      }
    }, 25000);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ================= METADADOS LOCAIS =================
  loadMetadata() {
    try {
      const data = localStorage.getItem('suldesign_drive_meta');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveMetadata() {
    try {
      localStorage.setItem('suldesign_drive_meta', JSON.stringify(this.metadata));
    } catch (e) {}
  }

  // ================= BUSCA E CARREGAMENTO DE ARQUIVOS DA NUVEM =================
  async fetchFiles(silent = false) {
    const listContainer = document.getElementById('filesContainer');
    const loadingEl = document.getElementById('driveLoading');
    const emptyEl = document.getElementById('driveEmpty');
    const statsFilesCount = document.getElementById('statsFilesCount');
    const statsTotalBytes = document.getElementById('statsTotalBytes');

    if (!silent && loadingEl) loadingEl.classList.remove('hidden');
    if (!silent && emptyEl) emptyEl.classList.add('hidden');
    this.isLoading = true;

    try {
      const res = await fetch(`${this.baseUrl}/${this.binId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.status === 404) {
        // Bin novo ainda sem arquivos
        this.files = [];
      } else if (res.ok) {
        const data = await res.json();
        const rawFiles = Array.isArray(data.files) ? data.files : [];

        // Enriquece os arquivos com os metadados locais (pastas, autor, nome amigável)
        this.files = rawFiles.map(rf => {
          const meta = this.metadata[rf.filename] || {};
          return {
            ...rf,
            displayName: meta.originalName || rf.filename,
            folder: meta.folder || this.detectFolder(rf.filename),
            uploader: meta.uploader || 'Sócio Sul Design',
            downloadUrl: `${this.baseUrl}/${this.binId}/${rf.filename}`,
            fileType: this.getFileType(rf.filename),
            bytes: rf.bytes || 0,
            updatedAt: rf.updated_at || rf.created_at || new Date().toISOString()
          };
        });

        // Ordena pelos mais recentes primeiro
        this.files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // Atualiza estatísticas do cabeçalho
        if (data.bin) {
          if (statsFilesCount) statsFilesCount.textContent = `${this.files.length} arquivos`;
          if (statsTotalBytes) statsTotalBytes.textContent = data.bin.bytes_readable || this.formatBytes(data.bin.bytes || 0);
        }
      }
    } catch (err) {
      console.warn('Erro ao conectar ao filebin:', err);
      // Mantém lista atual se houver erro de rede
    } finally {
      this.isLoading = false;
      if (loadingEl) loadingEl.classList.add('hidden');
      this.renderFiles();
      this.updateFolderCounts();
    }
  }

  detectFolder(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('adesivo') || lower.includes('rotulo') || lower.includes('sticker')) return 'adesivos';
    if (lower.includes('banner') || lower.includes('faixa') || lower.includes('lona')) return 'banners';
    if (lower.includes('cartao') || lower.includes('panfleto') || lower.includes('pasta')) return 'impressos';
    if (lower.endsWith('.cdr') || lower.endsWith('.ai') || lower.endsWith('.psd')) return 'artes';
    if (lower.endsWith('.pdf') || lower.endsWith('.tiff') || lower.endsWith('.tif')) return 'impressao';
    return 'geral';
  }

  // ================= RENDERIZAÇÃO ESTILO GOOGLE DRIVE =================
  renderFiles() {
    const container = document.getElementById('filesContainer');
    const emptyEl = document.getElementById('driveEmpty');
    const folderTitle = document.getElementById('currentFolderTitle');
    if (!container) return;

    let filtered = [...this.files];

    // 1. Filtro por Pasta
    if (this.currentFolder !== 'all') {
      filtered = filtered.filter(f => f.folder === this.currentFolder);
    }

    // 2. Filtro por Busca
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.displayName.toLowerCase().includes(q) || 
        f.filename.toLowerCase().includes(q)
      );
    }

    // Título da pasta
    if (folderTitle) {
      const folderNames = {
        all: 'Meu Drive • Todos os Arquivos',
        artes: '🎨 01. Artes & Criação (José Reis)',
        impressao: '🖨️ 02. Prontos para Impressão (Leonardo Monti)',
        adesivos: '🏷️ 03. Adesivos & Rótulos',
        banners: '🚩 04. Banners & Lonas',
        impressos: '📇 05. Cartões & Panfletos',
        geral: '📁 06. Arquivos Gerais'
      };
      folderTitle.textContent = folderNames[this.currentFolder] || 'Sul Design Drive';
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    if (this.viewMode === 'grid') {
      container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4';
      container.innerHTML = filtered.map(file => this.renderGridCard(file)).join('');
    } else {
      container.className = 'space-y-1.5';
      container.innerHTML = this.renderListView(filtered);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderGridCard(file) {
    const isImage = file.fileType.isImage;
    const typeBadge = file.fileType.badge;
    const typeColor = file.fileType.color;
    const sizeStr = file.bytes_readable || this.formatBytes(file.bytes);
    const dateStr = this.formatRelativeDate(file.updatedAt);

    return `
      <article class="drive-card flex flex-col justify-between group shadow-sm hover:shadow-md transition">
        <div>
          <!-- Área de Pré-Visualização / Thumbnail -->
          <div class="aspect-video w-full bg-stone-100 flex items-center justify-center relative overflow-hidden border-b border-stone-200/80">
            ${isImage ? `
              <img src="${file.downloadUrl}" alt="${file.displayName}" loading="lazy" class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300">
            ` : `
              <div class="flex flex-col items-center justify-center p-4 text-center">
                <i data-lucide="${file.fileType.icon}" class="w-12 h-12 ${typeColor} mb-2"></i>
                <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${file.fileType.bgClass} text-stone-800">
                  ${typeBadge}
                </span>
              </div>
            `}

            <!-- Badge Superior Esquerdo de Tipo -->
            <span class="absolute top-2 left-2 ${file.fileType.bgClass} text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border border-stone-200/60">
              ${file.fileType.ext.toUpperCase()}
            </span>

            <!-- Botão de Download Rápido sobre a Imagem -->
            <a 
              href="${file.downloadUrl}" 
              download="${file.displayName}"
              class="absolute bottom-2 right-2 p-2 rounded-xl bg-stone-900/85 hover:bg-orange-600 text-white shadow-md transition transform scale-90 sm:scale-100 flex items-center gap-1 text-xs font-bold"
              title="Baixar Arquivo"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
            </a>
          </div>

          <!-- Dados do Arquivo -->
          <div class="p-3.5">
            <h4 class="font-bold text-stone-900 text-xs sm:text-sm truncate leading-snug mb-1" title="${file.displayName}">
              ${file.displayName}
            </h4>
            <div class="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span>${sizeStr}</span>
              <span>${dateStr}</span>
            </div>
            <div class="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
              <span class="truncate">👤 ${file.uploader}</span>
              <span class="font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                ${file.folder}
              </span>
            </div>
          </div>
        </div>

        <!-- Barra Inferior de Ações -->
        <div class="px-3.5 pb-3 pt-1 flex items-center justify-between gap-1.5 border-t border-stone-50 bg-stone-50/50">
          <a 
            href="${file.downloadUrl}" 
            download="${file.displayName}"
            class="flex-1 py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            Baixar
          </a>

          <button 
            onclick="drive.copyFileLink('${file.filename}')"
            class="p-1.5 rounded-lg border border-stone-200 hover:bg-white text-stone-600 hover:text-stone-900 transition"
            title="Copiar Link de Download"
          >
            <i data-lucide="link" class="w-3.5 h-3.5"></i>
          </button>

          <button 
            onclick="drive.shareFileWhatsApp('${file.filename}', '${file.displayName}', '${sizeStr}')"
            class="p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-600 transition"
            title="Enviar Link no WhatsApp"
          >
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          </button>

          <button 
            onclick="drive.deleteFilePrompt('${file.filename}')"
            class="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Excluir Arquivo"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </article>
    `;
  }

  renderListView(files) {
    return `
      <div class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-50 border-b border-stone-200 text-stone-500 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-3 px-4">Nome do Arquivo</th>
                <th class="py-3 px-3">Pasta</th>
                <th class="py-3 px-3">Enviado por</th>
                <th class="py-3 px-3">Modificado</th>
                <th class="py-3 px-3">Tamanho</th>
                <th class="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 font-semibold text-stone-800">
              ${files.map(file => {
                const sizeStr = file.bytes_readable || this.formatBytes(file.bytes);
                const dateStr = this.formatRelativeDate(file.updatedAt);
                return `
                  <tr class="hover:bg-stone-50/80 transition group">
                    <td class="py-3 px-4 flex items-center gap-2.5">
                      <i data-lucide="${file.fileType.icon}" class="w-4 h-4 ${file.fileType.color} flex-shrink-0"></i>
                      <span class="font-bold truncate max-w-xs sm:max-w-md" title="${file.displayName}">
                        ${file.displayName}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-stone-500 uppercase text-[10px] font-bold">
                      <span class="bg-stone-100 px-2 py-0.5 rounded">${file.folder}</span>
                    </td>
                    <td class="py-3 px-3 text-stone-600">${file.uploader}</td>
                    <td class="py-3 px-3 text-stone-500">${dateStr}</td>
                    <td class="py-3 px-3 text-stone-700 font-bold">${sizeStr}</td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <a 
                          href="${file.downloadUrl}" 
                          download="${file.displayName}"
                          class="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition flex items-center gap-1 shadow-sm"
                        >
                          <i data-lucide="download" class="w-3.5 h-3.5"></i> Baixar
                        </a>
                        <button onclick="drive.copyFileLink('${file.filename}')" class="p-1 rounded text-stone-400 hover:text-stone-800" title="Copiar Link">
                          <i data-lucide="link" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="drive.shareFileWhatsApp('${file.filename}', '${file.displayName}', '${sizeStr}')" class="p-1 rounded text-emerald-600 hover:text-emerald-700" title="WhatsApp">
                          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="drive.deleteFilePrompt('${file.filename}')" class="p-1 rounded text-stone-400 hover:text-red-500" title="Excluir">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ================= UPLOAD REAL DE ARQUIVOS (COM BARRA DE PROGRESSO) =================
  async handleFileInput(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await this.uploadFiles(Array.from(files));
    e.target.value = '';
  }

  async uploadFiles(fileList) {
    const modal = document.getElementById('uploadProgressModal');
    const bar = document.getElementById('uploadProgressBar');
    const percentLabel = document.getElementById('uploadProgressPercent');
    const filenameLabel = document.getElementById('uploadCurrentFileName');
    const speedLabel = document.getElementById('uploadSpeedLabel');

    if (modal) modal.showModal();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (filenameLabel) {
        filenameLabel.textContent = `[${i + 1}/${fileList.length}] ${file.name}`;
      }

      await this.uploadSingleFile(file, (percent, speed) => {
        if (bar) bar.style.width = `${percent}%`;
        if (percentLabel) percentLabel.textContent = `${percent}%`;
        if (speedLabel) speedLabel.textContent = speed;
      });
    }

    if (modal) modal.close();
    this.showToast(`✅ ${fileList.length} arquivo(s) enviados com sucesso para a nuvem!`, 'success');
    await this.fetchFiles();
  }

  uploadSingleFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      // Normaliza nome do arquivo para URL segura mantendo a extensão
      const safeName = this.sanitizeFileName(file.name);
      const url = `${this.baseUrl}/${this.binId}/${safeName}`;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('filename', safeName);

      const startTime = Date.now();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const elapsedSec = (Date.now() - startTime) / 1000;
          const bytesPerSec = elapsedSec > 0 ? (e.loaded / elapsedSec) : 0;
          const speedStr = `${this.formatBytes(bytesPerSec)}/s`;
          if (onProgress) onProgress(percent, speedStr);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Salva metadados do arquivo (nome original, pasta, autor)
          this.metadata[safeName] = {
            originalName: file.name,
            size: file.size,
            folder: this.currentFolder === 'all' ? this.detectFolder(file.name) : this.currentFolder,
            uploader: this.currentUploader === 'leonardo' ? 'Leonardo Monti' : 'José Reis',
            uploadedAt: new Date().toISOString()
          };
          this.saveMetadata();
          resolve(xhr.response);
        } else {
          console.error('Erro no upload:', xhr.status, xhr.responseText);
          resolve(null); // Resolve para continuar a fila de outros arquivos
        }
      };

      xhr.onerror = () => {
        console.error('Erro de rede durante o upload');
        resolve(null);
      };

      xhr.send(file);
    });
  }

  sanitizeFileName(name) {
    // Remove caracteres especiais que podem quebrar headers HTTP
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
    const base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
    const cleanBase = base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .substring(0, 60);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${cleanBase}-${randomSuffix}${ext}`;
  }

  // ================= ARRASTAR E SOLTAR (DRAG & DROP) =================
  setupDragAndDrop() {
    const overlay = document.getElementById('dropzoneOverlay');
    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (overlay) overlay.classList.add('active');
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0 && overlay) {
        dragCounter = 0;
        overlay.classList.remove('active');
      }
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      if (overlay) overlay.classList.remove('active');

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.uploadFiles(Array.from(files));
      }
    });
  }

  // ================= NAVEGAÇÃO DE PASTAS =================
  setFolder(folderId) {
    this.currentFolder = folderId;

    document.querySelectorAll('.drive-folder-card').forEach(btn => {
      if (btn.dataset.folder === folderId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderFiles();
  }

  updateFolderCounts() {
    const folders = ['all', 'artes', 'impressao', 'adesivos', 'banners', 'impressos', 'geral'];
    folders.forEach(f => {
      const badge = document.getElementById(`countFolder_${f}`);
      if (badge) {
        const count = f === 'all' ? this.files.length : this.files.filter(item => item.folder === f).length;
        badge.textContent = count;
      }
    });
  }

  // ================= AÇÕES NOS ARQUIVOS =================
  async deleteFilePrompt(filename) {
    const file = this.files.find(f => f.filename === filename);
    const displayName = file ? file.displayName : filename;

    if (!confirm(`Deseja realmente excluir "${displayName}" da nuvem dos sócios?`)) {
      return;
    }

    try {
      this.showToast('Excluindo da nuvem...', 'info');
      const res = await fetch(`${this.baseUrl}/${this.binId}/${filename}`, {
        method: 'DELETE'
      });

      if (res.ok || res.status === 404) {
        delete this.metadata[filename];
        this.saveMetadata();
        this.files = this.files.filter(f => f.filename !== filename);
        this.renderFiles();
        this.updateFolderCounts();
        this.showToast('Arquivo excluído com sucesso.', 'success');
      } else {
        this.showToast('Não foi possível excluir o arquivo.', 'error');
      }
    } catch (err) {
      this.showToast('Erro de conexão ao excluir.', 'error');
    }
  }

  copyFileLink(filename) {
    const link = `${this.baseUrl}/${this.binId}/${filename}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        this.showToast('🔗 Link direto copiado! Pode colar em outro PC ou WhatsApp.', 'success');
      }).catch(() => {
        prompt('Copie o link abaixo:', link);
      });
    } else {
      prompt('Copie o link abaixo:', link);
    }
  }

  shareFileWhatsApp(filename, displayName, sizeStr) {
    const link = `${this.baseUrl}/${this.binId}/${filename}`;
    let text = `Olá! Segue o link para download do arquivo na *Sul Design*:\n\n`;
    text += `📁 *${displayName}* (${sizeStr})\n`;
    text += `⬇️ Baixar direto: ${link}\n\n`;
    text += `_Disponível na nuvem da Sul Design._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  downloadAllZip() {
    window.open(`${this.baseUrl}/archive/${this.binId}/zip`, '_blank');
  }

  // ================= CONTROLES DE INTERFACE =================
  setupViewMode() {
    const gridBtn = document.getElementById('btnViewGrid');
    const listBtn = document.getElementById('btnViewList');

    if (this.viewMode === 'grid') {
      if (gridBtn) gridBtn.classList.add('bg-stone-200', 'text-stone-900');
      if (listBtn) listBtn.classList.remove('bg-stone-200', 'text-stone-900');
    } else {
      if (listBtn) listBtn.classList.add('bg-stone-200', 'text-stone-900');
      if (gridBtn) gridBtn.classList.remove('bg-stone-200', 'text-stone-900');
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('suldesign_drive_view', mode);
    this.setupViewMode();
    this.renderFiles();
  }

  setupUploaderSelector() {
    const select = document.getElementById('driveUploaderSelect');
    if (select) {
      select.value = this.currentUploader;
      select.addEventListener('change', (e) => {
        this.currentUploader = e.target.value;
        localStorage.setItem('suldesign_drive_user', this.currentUploader);
      });
    }
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.renderFiles();
  }

  // ================= HELPERS FORMATADORES =================
  getFileType(filename) {
    const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';

    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      return { isImage: true, ext, icon: 'image', color: 'text-emerald-500', bgClass: 'bg-emerald-100', badge: 'Imagem' };
    }
    if (ext === 'pdf') {
      return { isImage: false, ext, icon: 'file-text', color: 'text-red-500', bgClass: 'bg-red-100', badge: 'Documento PDF' };
    }
    if (['cdr'].includes(ext)) {
      return { isImage: false, ext, icon: 'palette', color: 'text-emerald-600', bgClass: 'bg-emerald-200 text-emerald-900', badge: 'Vetor CorelDRAW' };
    }
    if (['ai', 'eps'].includes(ext)) {
      return { isImage: false, ext, icon: 'pen-tool', color: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-900', badge: 'Adobe Illustrator' };
    }
    if (['psd', 'psb'].includes(ext)) {
      return { isImage: false, ext, icon: 'layers', color: 'text-sky-600', bgClass: 'bg-sky-100 text-sky-900', badge: 'Adobe Photoshop' };
    }
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) {
      return { isImage: false, ext, icon: 'archive', color: 'text-amber-500', bgClass: 'bg-amber-100', badge: 'Pacote ZIP' };
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return { isImage: false, ext, icon: 'file-text', color: 'text-blue-500', bgClass: 'bg-blue-100', badge: 'Texto' };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return { isImage: false, ext, icon: 'table', color: 'text-emerald-700', bgClass: 'bg-emerald-100', badge: 'Planilha' };
    }

    return { isImage: false, ext: ext || 'arq', icon: 'file', color: 'text-stone-500', bgClass: 'bg-stone-200', badge: 'Arquivo' };
  }

  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatRelativeDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 2) return 'agora mesmo';
      if (diffMin < 60) return `há ${diffMin} min`;
      if (diffHours < 24) return `há ${diffHours} h`;
      if (diffDays === 1) return 'ontem';
      if (diffDays < 7) return `há ${diffDays} dias`;
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'recente';
    }
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('driveToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'driveToast';
      toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-xs font-black shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2 pointer-events-none max-w-sm text-center';
      document.body.appendChild(toast);
    }

    if (type === 'success') toast.style.backgroundColor = '#15803d';
    else if (type === 'error') toast.style.backgroundColor = '#b91c1c';
    else toast.style.backgroundColor = '#18181b';

    toast.textContent = message;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 3500);
  }
}

// Inicializa instância global
window.drive = new SulDesignDrive();
