const senhaCorreta = "LIBERTADORES";
let jogadores = {
    completo: [],
    masculino: [],
    feminino: []
};


let jogadoresFiltrados = [];

async function gerarHashSHA256(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function verificarSenha() {
    const senha = document.getElementById('senha').value;
    const senhaCorretaHash = "ce855f48b7422de36b50512a9a0a06a59d4f2f6efac6f439456777a396773cc1";

    const senhaHash = await gerarHashSHA256(senha);
    
     if (senhaHash === senhaCorretaHash) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('filtros').style.display = 'block';
        await carregarJogadores(); 
        jogadoresFiltrados = jogadores.completo; 
        mostrarJogadores(jogadoresFiltrados);
    } else {
        document.getElementById('erroSenha').style.display = 'block';
    }
}


async function carregarJogadores() {
    try {
        const responseCompleto = await fetch('https://botafogo-atletas.mange.li/2024-1/all');
        const responseMasculino = await fetch('https://botafogo-atletas.mange.li/2024-1/masculino');
        const responseFeminino = await fetch('https://botafogo-atletas.mange.li/2024-1/feminino');

        if (responseCompleto.ok && responseMasculino.ok && responseFeminino.ok) {
            jogadores.completo = await responseCompleto.json();
            jogadores.masculino = await responseMasculino.json();
            jogadores.feminino = await responseFeminino.json();
        } else {
            console.error("Erro ao carregar os dados dos jogadores");
            alert("Erro ao carregar os dados dos jogadores.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro na requisição dos dados.");
    }
}


function mostrarJogadores(listaJogadores) {
    const listaElement = document.getElementById('listaJogadores');
    listaElement.innerHTML = ''; 

    listaJogadores.forEach(jogador => {
        const divJogador = document.createElement('div');
        divJogador.classList.add('jogador');
        divJogador.classList.add(jogador.genero);


        const img = document.createElement('img');
        img.src = jogador.imagem; 
        img.alt = jogador.nome;


        img.onerror = function() {
            img.src = 'https://via.placeholder.com/100';
            img.alt = 'Imagem não disponível';
        };


        const nomeJogador = document.createElement('span');
        nomeJogador.textContent = jogador.nome;


        const btnDetalhes = document.createElement('button');
        btnDetalhes.textContent = 'Ver Detalhes';
        btnDetalhes.onclick = function() {
            window.location.href = `detalhes.html?id=${jogador.id}`;
        };

        divJogador.appendChild(img);
        divJogador.appendChild(nomeJogador);
        divJogador.appendChild(btnDetalhes);

        listaElement.appendChild(divJogador);
    });
}


function filtrarJogadores(tipo) {
    if (tipo === 'masculino') {
        jogadoresFiltrados = jogadores.masculino;
    } else if (tipo === 'feminino') {
        jogadoresFiltrados = jogadores.feminino;
    } else {
        jogadoresFiltrados = jogadores.completo;
    }
    mostrarJogadores(jogadoresFiltrados); 
}


function pesquisarJogadores() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase(); 

    const jogadoresPesquisados = jogadoresFiltrados.filter(jogador =>
        jogador.nome.toLowerCase().includes(searchTerm)
    );

    mostrarJogadores(jogadoresPesquisados); 
}


function obterIdJogador() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function carregarDetalhesJogador() {
    const idJogador = obterIdJogador();

    if (!idJogador) {
        return;
    }

    try {
        const response = await fetch(`https://botafogo-atletas.mange.li/2024-1/${idJogador}`);
        if (response.ok) {
            const jogador = await response.json();
            exibirDetalhesJogador(jogador);
        } else {
            console.error("Erro ao carregar os detalhes do jogador");
            alert("Erro ao carregar os detalhes do jogador.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao carregar os dados.");
    }
}


function exibirDetalhesJogador(jogador) {
    const detalhesElement = document.getElementById('detalhesJogador');
    detalhesElement.innerHTML = `
        <h3>${jogador.nome}</h3>
        <img src="${jogador.imagem}" alt="${jogador.nome}">
        <p><strong>Elenco:</strong> ${jogador.elenco}</p>
        <p><strong>Posição:</strong> ${jogador.posicao}</p>
        <p><strong>Nascimento:</strong> ${jogador.nascimento}</p>
        <p><strong>Altura:</strong> ${jogador.altura} m</p>
        <p><strong>Naturalidade:</strong> ${jogador.naturalidade}</p>
        <p><strong>No Botafogo desde:</strong> ${jogador.no_botafogo_desde}</p>
        <p><strong>Numero de Jogos:</strong> ${jogador.n_jogos}</p>
        <p><strong>Detalhes:</strong> ${jogador.detalhes}</p>
    `;
}

carregarDetalhesJogador();
