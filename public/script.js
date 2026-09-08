const horariosTrabalho = [
  "09:00", "10:00", "11:00", "12:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

let horaSelecionada = "";

document.addEventListener('DOMContentLoaded', () => {
  const inputData = document.getElementById('data');
  const selectBarbeiro = document.getElementById('barbeiro');
  const selectServico = document.getElementById('servico');
  const gridHorarios = document.getElementById('horarios-grid');
  const formReserva = document.getElementById('form-reserva');

  // 1. SELECIONA AUTOMATICAMENTE O SERVIÇO PASSADO NA URL
  const urlParams = new URLSearchParams(window.location.search);
  const servicoUrl = urlParams.get('servico');

  if (servicoUrl && selectServico) {
    const servicoNormalizado = decodeURIComponent(servicoUrl).toLowerCase();
    for (let i = 0; i < selectServico.options.length; i++) {
      const optText = selectServico.options[i].text.toLowerCase();
      const optVal = selectServico.options[i].value.toLowerCase();
      if (optText.includes(servicoNormalizado) || optVal.includes(servicoNormalizado) || servicoNormalizado.includes(optText)) {
        selectServico.selectedIndex = i;
        break;
      }
    }
  }

  // 2. RENDERIZA OS HORÁRIOS EXCLUSIVAMENTE DENTRO DA DIV #horarios-grid
  function renderHorarios() {
    if (!gridHorarios) return;
    gridHorarios.innerHTML = '';

    if (!inputData || !inputData.value) {
      gridHorarios.innerHTML = '<p style="color: #888; font-size: 0.85rem; margin: 5px 0;">Selecione uma data para ver os horários.</p>';
      return;
    }

    horariosTrabalho.forEach(hora => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = hora;
      btn.className = 'hora-btn-item';

      btn.addEventListener('click', () => {
        document.querySelectorAll('.hora-btn-item').forEach(b => {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        horaSelecionada = hora;
      });

      gridHorarios.appendChild(btn);
    });
  }

  if (inputData) inputData.addEventListener('change', renderHorarios);
  if (selectBarbeiro) selectBarbeiro.addEventListener('change', renderHorarios);

  // 3. ENVIO DA RESERVA
  if (formReserva) {
    formReserva.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!horaSelecionada) {
        alert('Por favor, selecione um horário disponível!');
        return;
      }

      const agendamento = {
        nome: document.getElementById('nome').value,
        telemovel: document.getElementById('telemovel').value,
        servico: selectServico.value,
        barbeiro: selectBarbeiro.value,
        data: inputData.value,
        hora: horaSelecionada
      };

      try {
        const response = await fetch('/api/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agendamento)
        });

        if (response.ok) {
          alert('Reserva efetuada com sucesso!');
          window.location.href = 'minhas-reservas.html';
        } else {
          alert('Erro ao guardar a reserva.');
        }
      } catch (err) {
        alert('Erro ao ligar ao servidor.');
      }
    });
  }

  renderHorarios();
});
// Função para carregar e exibir as reservas na página minhas-reservas.html
async function carregarMinhasReservas() {
  const container = document.getElementById('lista-reservas');
  if (!container) return; // Se não estiver na página de reservas, ignora

  try {
    const res = await fetch('/api/agendamentos');
    const agendamentos = await res.json();

    if (!agendamentos || agendamentos.length === 0) {
      container.innerHTML = '<p style="color: #888; text-align: center;">Nenhuma reserva encontrada.</p>';
      return;
    }

    container.innerHTML = ''; // Limpa a lista

    agendamentos.forEach(item => {
      const card = document.createElement('div');
      card.style.backgroundColor = '#121212';
      card.style.border = '1px solid #333';
      card.style.borderRadius = '8px';
      card.style.padding = '15px';
      card.style.marginBottom = '15px';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';

      card.innerHTML = `
        <div>
          <h3 style="color: #d4af37; margin: 0 0 5px 0;">${item.servico}</h3>
          <p style="margin: 3px 0; color: #ccc;"><strong>Cliente:</strong> ${item.nome} (${item.telemovel})</p>
          <p style="margin: 3px 0; color: #ccc;"><strong>Barbeiro:</strong> ${item.barbeiro || 'Primeiro Disponível'}</p>
          <p style="margin: 3px 0; color: #d4af37;"><strong>Data e Hora:</strong> ${item.data} às ${item.hora}</p>
        </div>
        <button onclick="cancelarReserva(${item.id})" style="background-color: #8b0000; color: #fff; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Cancelar</button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar reservas:', err);
    container.innerHTML = '<p style="color: #ff4d4d;">Erro ao carregar as reservas.</p>';
  }
}

// Função para cancelar reserva
async function cancelarReserva(id) {
  if (!confirm('Tem a certeza que deseja cancelar esta reserva?')) return;

  try {
    const res = await fetch(`/api/agendamentos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Reserva cancelada!');
      carregarMinhasReservas(); // Recarrega a lista
    } else {
      alert('Erro ao cancelar a reserva.');
    }
  } catch (err) {
    alert('Erro de rede ao cancelar a reserva.');
  }
}

// Chamar automaticamente quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  carregarMinhasReservas();
});
// ==========================================
// PAINEL ADMIN - CARREGAR E GERIR RESERVAS
// ==========================================
async function carregarReservasAdmin() {
  const tbody = document.getElementById('tabela-admin');
  if (!tbody) return; // Se não estiver na página admin, não faz nada

  try {
    const response = await fetch('/api/agendamentos');
    const agendamentos = await response.json();

    if (!agendamentos || agendamentos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">Nenhuma reserva registada de momento.</td></tr>';
      return;
    }

    const filtro = document.getElementById('filtro-pesquisa')?.value.toLowerCase() || '';

    // Filtra agendamentos caso haja pesquisa
    const agendamentosFiltrados = agendamentos.filter(item => 
      (item.nome && item.nome.toLowerCase().includes(filtro)) ||
      (item.telemovel && item.telemovel.includes(filtro))
    );

    if (agendamentosFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">Nenhuma reserva encontrada para a pesquisa.</td></tr>';
      return;
    }

    tbody.innerHTML = ''; // Limpa a mensagem de carregamento

    agendamentosFiltrados.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.nome}</strong></td>
        <td>${item.telemovel}</td>
        <td>${item.servico}</td>
        <td>${item.barbeiro || 'Primeiro Disponível'}</td>
        <td><span style="color: #d4af37;">${item.data}</span> às ${item.hora}</td>
        <td>
          <button class="btn-cancelar-admin" onclick="eliminarReservaAdmin(${item.id})">Cancelar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar reservas no admin:', err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ff4d4d;">Erro ao ligar ao servidor.</td></tr>';
  }
}

// Função para o Admin eliminar qualquer reserva
async function eliminarReservaAdmin(id) {
  if (!confirm('Tem a certeza que pretende cancelar este agendamento?')) return;

  try {
    const res = await fetch(`/api/agendamentos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Reserva eliminada com sucesso!');
      carregarReservasAdmin();
    } else {
      alert('Erro ao eliminar a reserva.');
    }
  } catch (err) {
    alert('Erro ao contactar o servidor.');
  }
}

// Ligar eventos e carregar dados na inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarReservasAdmin();

  const btnAtualizar = document.getElementById('btn-atualizar');
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', carregarReservasAdmin);
  }

  const inputFiltro = document.getElementById('filtro-pesquisa');
  if (inputFiltro) {
    inputFiltro.addEventListener('input', carregarReservasAdmin);
  }
});
// ==========================================
// GESTÃO DO PERFIL DE UTILIZADOR
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const btnAbrirPerfil = document.getElementById('btn-abrir-perfil');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const modalPerfil = document.getElementById('modal-perfil');
  const formPerfil = document.getElementById('form-perfil');

  const avatarNavImg = document.getElementById('avatar-nav-img');
  const nomeNavUser = document.getElementById('nome-nav-user');
  const modalAvatarPreview = document.getElementById('modal-avatar-preview');
  const inputNome = document.getElementById('perfil-nome');
  const inputFotoFile = document.getElementById('perfil-foto-file');

  const AVATAR_PADRAO = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  let fotoBase64Temp = null; // Guarda a imagem carregada temporariamente

  // Carregar dados guardados
  function carregarPerfil() {
    const nomeGuardado = localStorage.getItem('user_nome') || 'Henrique Castilho';
    const fotoGuardada = localStorage.getItem('user_foto') || AVATAR_PADRAO;

    if (nomeNavUser) nomeNavUser.textContent = nomeGuardado;
    if (avatarNavImg) avatarNavImg.src = fotoGuardada;
    if (modalAvatarPreview) modalAvatarPreview.src = fotoGuardada;
    if (inputNome) inputNome.value = nomeGuardado;
    
    fotoBase64Temp = fotoGuardada;
  }

  // Abrir / Fechar Modal
  if (btnAbrirPerfil && modalPerfil) {
    btnAbrirPerfil.addEventListener('click', () => {
      carregarPerfil();
      modalPerfil.classList.add('active');
    });
  }

  if (btnFecharModal && modalPerfil) {
    btnFecharModal.addEventListener('click', () => {
      modalPerfil.classList.remove('active');
    });
  }

  // Ao selecionar um ficheiro do computador
  if (inputFotoFile) {
    inputFotoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          fotoBase64Temp = event.target.result;
          if (modalAvatarPreview) {
            modalAvatarPreview.src = fotoBase64Temp; // Atualiza a pré-visualização no modal
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Guardar alterações do perfil
  if (formPerfil) {
    formPerfil.addEventListener('submit', (e) => {
      e.preventDefault();

      const novoNome = inputNome.value.trim();
      
      localStorage.setItem('user_nome', novoNome);
      if (fotoBase64Temp) {
        localStorage.setItem('user_foto', fotoBase64Temp);
      }

      carregarPerfil();
      modalPerfil.classList.remove('active');
      alert('Perfil atualizado com sucesso!');
    });
  }

  carregarPerfil();
});
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    // Clica nos 3 pontos para abrir/fechar
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("active");
    });

    // Clica fora para fechar o menu automaticamente
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("active");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  const horariosContainer = document.getElementById("horariosContainer");
  const infoText = document.querySelector(".horarios-section .info-text");

  // Lista padrão de horários de funcionamento
  const horariosPadrao = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "18:00", "18:30"
  ];

  let horarioSelecionado = null;

  if (dataInput && horariosContainer) {
    // Escuta quando o utilizador escolhe/muda a data
    dataInput.addEventListener("change", (e) => {
      const dataEscolhida = e.target.value;

      if (!dataEscolhida) {
        if (infoText) infoText.textContent = "Selecione uma data para ver os horários.";
        horariosContainer.innerHTML = "";
        return;
      }

      // Atualiza a mensagem de instrução
      if (infoText) infoText.textContent = "Selecione o horário pretendido:";
      
      // Limpa os horários anteriores
      horariosContainer.innerHTML = "";

      // Gera os botões dos horários
      horariosPadrao.forEach((horario) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "horario-btn";
        btn.textContent = horario;

        btn.addEventListener("click", () => {
          // Remove a seleção dos outros botões
          document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selected"));
          
          // Seleciona o botão atual
          btn.classList.add("selected");
          horarioSelecionado = horario;
        });

        horariosContainer.appendChild(btn);
      });
    });
  }
});