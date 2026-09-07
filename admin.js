document.addEventListener('DOMContentLoaded', async () => {
  const listaAgendamentos = document.getElementById('lista-agendamentos');

  try {
    const resposta = await fetch('/api/agendamentos');
    const agendamentos = await resposta.json();

    if (agendamentos.length === 0) {
      listaAgendamentos.innerHTML = `
        <tr>
          <td colspan="7" class="mensagem-vazia">Nenhum agendamento registado até ao momento.</td>
        </tr>
      `;
      return;
    }

    listaAgendamentos.innerHTML = '';

    agendamentos.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${item.id}</strong></td>
        <td>${item.nome}</td>
        <td><a href="https://wa.me/351${item.telefone}" target="_blank" class="link-whatsapp">${item.telefone} 💬</a></td>
        <td>${item.servico}</td>
        <td><span class="badge-barbeiro">${item.barbeiro}</span></td>
        <td>${item.data}</td>
        <td><strong>${item.hora}</strong></td>
      `;
      listaAgendamentos.appendChild(tr);
    });

  } catch (erro) {
    listaAgendamentos.innerHTML = `
      <tr>
        <td colspan="7" class="mensagem-erro">Erro ao carregar os dados da agenda.</td>
      </tr>
    `;
  }
});