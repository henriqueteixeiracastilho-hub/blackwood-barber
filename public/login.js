document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');

  if (!formLogin) return;

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.mensagem || 'Login efetuado com sucesso!');
        window.location.href = '/reserva.html';
      } else {
        alert(dados.mensagem || 'E-mail ou palavra-passe incorretos.');
      }
    } catch (erro) {
      console.error('Erro ao tentar fazer login:', erro);
      alert('Erro ao ligar ao servidor.');
    }
  });
});