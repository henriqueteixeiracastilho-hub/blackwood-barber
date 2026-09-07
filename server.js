const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para interpretar JSON e ficheiros estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FILE_PATH = path.join(__dirname, 'agendamentos.json');

// Função para ler agendamentos do ficheiro JSON
function lerAgendamentos() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Erro ao ler agendamentos.json:', err);
    return [];
  }
}

// Função para gravar agendamentos no ficheiro JSON
function gravarAgendamentos(agendamentos) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(agendamentos, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Erro ao gravar em agendamentos.json:', err);
    return false;
  }
}

// ROTA POST: Guardar agendamento
app.post('/api/agendamentos', (req, res) => {
  try {
    const { nome, telemovel, servico, barbeiro, data, hora } = req.body;

    if (!nome || !telemovel || !servico || !data || !hora) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
    }

    const agendamentos = lerAgendamentos();

    const novoAgendamento = {
      id: Date.now(),
      nome,
      telemovel,
      servico,
      barbeiro: barbeiro || 'Primeiro Disponível',
      data,
      hora
    };

    agendamentos.push(novoAgendamento);

    if (gravarAgendamentos(agendamentos)) {
      return res.status(201).json({ mensagem: 'Reserva guardada com sucesso!', agendamento: novoAgendamento });
    } else {
      return res.status(500).json({ mensagem: 'Erro ao gravar no ficheiro JSON.' });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

// ROTA GET: Obter todos os agendamentos
app.get('/api/agendamentos', (req, res) => {
  const agendamentos = lerAgendamentos();
  res.json(agendamentos);
});

// ROTA DELETE: Cancelar agendamento por ID
app.delete('/api/agendamentos/:id', (req, res) => {
  const id = Number(req.params.id);
  let agendamentos = lerAgendamentos();
  agendamentos = agendamentos.filter(a => a.id !== id);

  if (gravarAgendamentos(agendamentos)) {
    res.json({ mensagem: 'Agendamento cancelado com sucesso!' });
  } else {
    res.status(500).json({ mensagem: 'Erro ao eliminar o agendamento.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});