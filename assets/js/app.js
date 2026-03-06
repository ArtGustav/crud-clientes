const STORAGE_KEY = "crud-clientes";
const PAGE_SIZE = 5;

const state = {
  clientes: [],
  editId: null,
  filtro: "",
  ordenacao: "",
  pagina: 1,
};

const els = {
  form: document.getElementById("form-cliente"),
  id: document.getElementById("cliente-id"),
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  cidade: document.getElementById("cidade"),
  btnSalvar: document.getElementById("btn-salvar"),
  btnCancelar: document.getElementById("btn-cancelar"),
  busca: document.getElementById("busca"),
  ordenacao: document.getElementById("ordenacao"),
  tabela: document.getElementById("tabela-clientes"),
  tabelaCorpo: document.getElementById("tabela-corpo"),
  toast: document.getElementById("toast"),
  pagPrev: document.getElementById("pag-prev"),
  pagNext: document.getElementById("pag-next"),
  paginas: document.getElementById("paginas"),
  btnExportar: document.getElementById("btn-exportar"),
  importarJson: document.getElementById("importar-json"),
};

// Persistencia simples via localStorage
function carregarClientes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    const lista = raw ? JSON.parse(raw) : [];
    if (Array.isArray(lista)) {
      state.clientes = lista;
    }
  } catch (err) {
    state.clientes = [];
  }
}

function salvarClientes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.clientes));
}

function gerarId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function formatarData(ms) {
  return new Date(ms).toLocaleString("pt-BR");
}

function mostrarToast(tipo, msg) {
  els.toast.textContent = msg;
  els.toast.className = `toast show ${tipo || ""}`;
  setTimeout(() => {
    els.toast.className = "toast";
  }, 2500);
}

function limparFormulario() {
  state.editId = null;
  els.id.value = "";
  els.form.reset();
  els.btnCancelar.disabled = true;
  els.btnSalvar.textContent = "Salvar";
}

function preencherFormulario(cliente) {
  state.editId = cliente.id;
  els.id.value = cliente.id;
  els.nome.value = cliente.nome;
  els.email.value = cliente.email;
  els.telefone.value = cliente.telefone || "";
  els.cidade.value = cliente.cidade || "";
  els.btnCancelar.disabled = false;
  els.btnSalvar.textContent = "Salvar edicao";
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function emailExiste(email, ignoreId) {
  const lower = email.trim().toLowerCase();
  return state.clientes.some((c) => {
    if (ignoreId && c.id === ignoreId) return false;
    return c.email.trim().toLowerCase() === lower;
  });
}

function validarCliente(dados) {
  if (!dados.nome || dados.nome.trim().length < 3) {
    return { ok: false, msg: "Nome deve ter no minimo 3 caracteres." };
  }
  if (!dados.email || !validarEmail(dados.email)) {
    return { ok: false, msg: "Email invalido." };
  }
  if (emailExiste(dados.email, state.editId)) {
    return { ok: false, msg: "Email ja cadastrado." };
  }
  return { ok: true };
}

function aplicarFiltros(lista) {
  let filtrada = lista.slice();
  if (state.filtro) {
    const termo = state.filtro.toLowerCase();
    filtrada = filtrada.filter((c) => {
      return (
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo)
      );
    });
  }

  if (state.ordenacao === "nome-asc") {
    filtrada.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (state.ordenacao === "nome-desc") {
    filtrada.sort((a, b) => b.nome.localeCompare(a.nome));
  } else if (state.ordenacao === "criado-asc") {
    filtrada.sort((a, b) => a.criadoEm - b.criadoEm);
  } else if (state.ordenacao === "criado-desc") {
    filtrada.sort((a, b) => b.criadoEm - a.criadoEm);
  }

  return filtrada;
}

function paginar(lista) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
  if (state.pagina > totalPaginas) state.pagina = totalPaginas;
  const inicio = (state.pagina - 1) * PAGE_SIZE;
  const fim = inicio + PAGE_SIZE;
  return {
    paginaAtual: state.pagina,
    totalPaginas,
    itens: lista.slice(inicio, fim),
  };
}

// Render principal da tabela e paginacao
function renderizarTabela() {
  const filtrada = aplicarFiltros(state.clientes);
  const { itens, totalPaginas } = paginar(filtrada);

  els.tabelaCorpo.innerHTML = "";
  if (itens.length === 0) {
    els.tabelaCorpo.innerHTML =
      "<tr><td colspan='6'>Nenhum registro encontrado.</td></tr>";
    renderizarPaginacao(totalPaginas);
    return;
  }

  for (const cliente of itens) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefone || "-"}</td>
      <td>${cliente.cidade || "-"}</td>
      <td>${formatarData(cliente.criadoEm)}</td>
      <td>
        <button class="btn" data-action="editar" data-id="${cliente.id}">
          Editar
        </button>
        <button class="btn perigo" data-action="excluir" data-id="${cliente.id}">
          Excluir
        </button>
      </td>
    `;
    els.tabelaCorpo.appendChild(tr);
  }

  renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas) {
  els.paginas.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i += 1) {
    const btn = document.createElement("button");
    btn.className = `btn ${i === state.pagina ? "ativo" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      state.pagina = i;
      renderizarTabela();
    });
    els.paginas.appendChild(btn);
  }
  els.pagPrev.disabled = state.pagina === 1;
  els.pagNext.disabled = state.pagina === totalPaginas;
}

function atualizarCliente(dados) {
  const idx = state.clientes.findIndex((c) => c.id === state.editId);
  if (idx === -1) return;
  const atual = state.clientes[idx];
  state.clientes[idx] = {
    ...atual,
    ...dados,
    atualizadoEm: Date.now(),
  };
  salvarClientes();
  renderizarTabela();
  limparFormulario();
  mostrarToast("success", "Cliente atualizado com sucesso.");
}

function criarRegistro(dados) {
  const agora = Date.now();
  return {
    id: gerarId(),
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    telefone: dados.telefone || "",
    cidade: dados.cidade || "",
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

function adicionarCliente(dados) {
  state.clientes.unshift(criarRegistro(dados));
  salvarClientes();
  renderizarTabela();
  limparFormulario();
  mostrarToast("success", "Cliente cadastrado com sucesso.");
}

function excluirCliente(id) {
  const idx = state.clientes.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const nome = state.clientes[idx].nome;
  if (!confirm(`Excluir ${nome}?`)) return;
  state.clientes.splice(idx, 1);
  salvarClientes();
  renderizarTabela();
  mostrarToast("success", "Cliente excluido.");
}

function formatarTelefone(valor) {
  const digits = valor.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, p1, p2, p3) => {
      if (!p2) return `(${p1}`;
      if (!p3) return `(${p1}) ${p2}`;
      return `(${p1}) ${p2}-${p3}`;
    });
  }
  return digits.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (m, p1, p2, p3) => {
    if (!p2) return `(${p1}`;
    if (!p3) return `(${p1}) ${p2}`;
    return `(${p1}) ${p2}-${p3}`;
  });
}

function exportarJson() {
  const blob = new Blob([JSON.stringify(state.clientes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clientes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importarJson(arquivo) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("Formato invalido");

      let inseridos = 0;
      let ignorados = 0;

      for (const item of data) {
        const dados = {
          nome: (item.nome || "").trim(),
          email: (item.email || "").trim(),
          telefone: item.telefone || "",
          cidade: item.cidade || "",
        };
        const validacao = validarCliente(dados);
        if (!validacao.ok) {
          ignorados += 1;
          continue;
        }
        state.clientes.unshift(criarRegistro(dados));
        inseridos += 1;
      }

      if (inseridos > 0) {
        salvarClientes();
        renderizarTabela();
      }

      if (inseridos === 0) {
        mostrarToast("error", "Nenhum registro importado.");
      } else {
        mostrarToast(
          "success",
          `Importados: ${inseridos}. Ignorados: ${ignorados}.`
        );
      }
    } catch (err) {
      mostrarToast("error", "Arquivo JSON invalido.");
    } finally {
      els.importarJson.value = "";
    }
  };
  reader.readAsText(arquivo);
}

// Eventos da UI
function bindEvents() {
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = {
      nome: els.nome.value,
      email: els.email.value,
      telefone: els.telefone.value,
      cidade: els.cidade.value,
    };
    const validacao = validarCliente(dados);
    if (!validacao.ok) {
      mostrarToast("error", validacao.msg);
      return;
    }
    if (state.editId) {
      atualizarCliente(dados);
    } else {
      adicionarCliente(dados);
    }
  });

  els.btnCancelar.addEventListener("click", () => {
    limparFormulario();
  });

  els.busca.addEventListener("input", (e) => {
    state.filtro = e.target.value;
    state.pagina = 1;
    renderizarTabela();
  });

  els.ordenacao.addEventListener("change", (e) => {
    state.ordenacao = e.target.value;
    renderizarTabela();
  });

  els.tabela.addEventListener("click", (e) => {
    const alvo = e.target;
    if (!(alvo instanceof HTMLButtonElement)) return;
    const id = alvo.dataset.id;
    const acao = alvo.dataset.action;
    if (acao === "editar") {
      const cliente = state.clientes.find((c) => c.id === id);
      if (cliente) preencherFormulario(cliente);
    }
    if (acao === "excluir") {
      excluirCliente(id);
    }
  });

  els.pagPrev.addEventListener("click", () => {
    if (state.pagina > 1) {
      state.pagina -= 1;
      renderizarTabela();
    }
  });

  els.pagNext.addEventListener("click", () => {
    state.pagina += 1;
    renderizarTabela();
  });

  els.btnExportar.addEventListener("click", exportarJson);

  els.importarJson.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) importarJson(arquivo);
  });

  els.telefone.addEventListener("input", (e) => {
    e.target.value = formatarTelefone(e.target.value);
  });
}

function init() {
  carregarClientes();
  renderizarTabela();
  bindEvents();
}

init();
