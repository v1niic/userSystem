const form = document.querySelector("#formCadastro");
const cep = document.querySelector("#cep");
const buscarCep = document.querySelector("#buscarCep");
const camposComSugestoes = ["bairro", "cidade"];
const estado = document.querySelector("estado");

function carregarSugestoes(campo) {
    const lista = document.querySelector(`#sugestoes${campo[0].toUpperCase()}${campo.slice(1)}`);
    const sugestoes = JSON.parse(localStorage.getItem(`sugestoes-${campo}`) || "[]");

    lista.replaceChildren(...sugestoes.map((valor) => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        return opcao;
    }));
}

function salvarSugestoes() {
    camposComSugestoes.forEach((campo) => {
        const valor = document.querySelector(`#${campo}`).value.trim();
        if (!valor) return;

        const chave = `sugestoes-${campo}`;
        const sugestoes = JSON.parse(localStorage.getItem(chave) || "[]");
        const atualizadas = [valor, ...sugestoes.filter((item) => item !== valor)].slice(0, 20);
        localStorage.setItem(chave, JSON.stringify(atualizadas));
    });
}

camposComSugestoes.forEach(carregarSugestoes);

function mensagem(texto, tipo = "sucesso") {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: tipo === "sucesso"
            ? "#198754"
            :"dc3545"
        }
    }).showToast();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    salvarSugestoes();
    console.log(Object.fromEntries(
        [...form.elements]
            .filter((element) => element.id)
            .map((element) => [element.id, element.value])
    ));
    form.reset();
});

buscarCep.addEventListener("click", async function (event) {
    event.preventDefault();

    const valor = cep.value.replace(/\D/g, "");

    if (valor.length !== 8) {
        mensagem("Digitte um CEP válido.", "erro");
        return;
    }

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error("CEP não encontrado.");
        }

        document.querySelector("#logradouro").value = dados.logradouro;
        document.querySelector("#bairro").value = dados.bairro;
        document.querySelector("#estado").value = dados.uf;
        document.querySelector("#cidade").value = dados.localidade;
        
    } catch (erro) {
        mensagem(erro.message, "erro");
    }
});

function adicionarOpcao(selecao, texto, valor) {
    selecao.add(new Option(texto, valor));
}

async function carregarEstado() {
    try {
        const resposta = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        if (!resposta.ok) {
            throw new Error("Não foi possivel carregar os estados");
        }
        const estados = await resposta.json();
        estados.forEach(a => adicionarOpcao(estado, a.nome, a.sigla));
    } catch (error) {
        mensagem(error.message, "erro");
    }
}

carregarEstado();