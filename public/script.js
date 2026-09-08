document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================
  // 1. AUTO-SELEÇÃO DO SERVIÇO VINDO DA PÁGINA DE SERVIÇOS
  // ==========================================================
  const params = new URLSearchParams(window.location.search);
  const servicoParam = params.get("servico");
  const selectServico = document.getElementById("servico");

  if (servicoParam && selectServico) {
    selectServico.value = servicoParam;
  }

  // ==========================================================
  // 2. LÓGICA DA PÁGINA DE RESERVA (reserva.html)
  // ==========================================================
  const bookingForm = document.getElementById("bookingForm");
  const dataInput = document.getElementById("data");
  const horariosContainer = document.getElementById("horariosContainer");
  const infoText = document.querySelector(".horarios-section .info-text");

  const horariosPadrao = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "18:00", "18:30"
  ];

  let horarioSelecionado = null;

  // Quando o utilizador escolhe/muda uma data, gera a grelha de horários
  if (dataInput && horariosContainer) {
    dataInput.addEventListener("change", (e) => {
      const dataEscolhida = e.target.value;

      if (!dataEscolhida) {
        if (infoText) infoText.textContent = "Selecione uma data para ver os horários.";
        horariosContainer.innerHTML = "";
        horarioSelecionado = null;
        return;
      }

      if (infoText) infoText.textContent = "Selecione o horário pretendido:";
      horariosContainer.innerHTML = "";
      horarioSelecionado = null;

      horariosPadrao.forEach((horario) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "horario-btn";
        btn.textContent = horario;

        btn.addEventListener("click", () => {
          document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          horarioSelecionado = horario;
        });

        horariosContainer.appendChild(btn);
      });
    });
  }

  // Submissão do formulário de reserva
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!horarioSelecionado) {
        alert("Por favor, selecione um horário antes de confirmar.");
        return;
      }

      const novaReserva = {
        id: Date.now(),
        nome: document.getElementById("nome").value,
        telemovel: document.getElementById("telemovel").value,
        servico: document.getElementById("servico").value,
        barbeiro: document.getElementById("barbeiro").value,
        data: document.getElementById("data").value,
        horario: horarioSelecionado
      };

      // Guarda no localStorage
      const reservas = JSON.parse(localStorage.getItem("minhasReservas") || "[]");
      reservas.push(novaReserva);
      localStorage.setItem("minhasReservas", JSON.stringify(reservas));

      // Redireciona diretamente para a página de Minhas Reservas
      window.location.href = "minhas-reservas.html";
    });
  }

  // ==========================================================
  // 3. LÓGICA DA PÁGINA MINHAS RESERVAS (minhas-reservas.html)
  // ==========================================================
  const listaReservas = document.getElementById("listaReservas");
  if (listaReservas) {
    carregarReservas();
  }
});

// Função para renderizar as reservas guardadas
function carregarReservas() {
  const listaReservas = document.getElementById("listaReservas");
  if (!listaReservas) return;

  const reservas = JSON.parse(localStorage.getItem("minhasReservas") || "[]");

  if (reservas.length === 0) {
    listaReservas.innerHTML = '<p class="empty-msg">Nenhuma reserva encontrada.</p>';
    return;
  }

  listaReservas.innerHTML = "";

  reservas.forEach((reserva, index) => {
    const card = document.createElement("div");
    card.className = "reserva-item";
    card.style.cssText = "background: #121212; border: 1px solid #333; padding: 18px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;";

    card.innerHTML = `
      <div>
        <h4 style="color: #e5b869; margin: 0 0 6px 0; font-size: 1.1rem;">${reserva.servico}</h4>
        <p style="margin: 3px 0; font-size: 0.9rem; color: #ddd;"><strong>Data:</strong> ${reserva.data} às ${reserva.horario}</p>
        <p style="margin: 3px 0; font-size: 0.9rem; color: #ddd;"><strong>Barbeiro:</strong> ${reserva.barbeiro}</p>
        <p style="margin: 3px 0; font-size: 0.85rem; color: #888;">Cliente: ${reserva.nome} (${reserva.telemovel})</p>
      </div>
      <button onclick="cancelarReserva(${index})" style="background: #e53935; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">Cancelar</button>
    `;

    listaReservas.appendChild(card);
  });
}

// Função para cancelar/remover uma reserva
function cancelarReserva(index) {
  if (confirm("Tem a certeza que deseja cancelar esta reserva?")) {
    const reservas = JSON.parse(localStorage.getItem("minhasReservas") || "[]");
    reservas.splice(index, 1);
    localStorage.setItem("minhasReservas", JSON.stringify(reservas));
    carregarReservas();
  }
}