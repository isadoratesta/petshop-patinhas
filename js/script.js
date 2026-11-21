
/*
 * Petshop Patinhas - Fase 2
 * Simulação de agendamento de serviços
 * Autora: Isadora Oliveira Testa da Silva
 */

// Localiza os elementos do formulário.
const formulario = document.getElementById("formAgendamento");
const campoData = document.getElementById("data");
const campoHorario = document.getElementById("horario");
const resultado = document.getElementById("resultado");

// Valores ilustrativos dos serviços.
const precos = {
    banho: {
        local: 50,
        telebusca: 70
    },
    tosa: {
        local: 60,
        telebusca: 80
    },
    banhoTosa: {
        local: 95,
        telebusca: 115
    }
};

// Retorna a data local no formato AAAA-MM-DD.
function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// Impede a seleção de datas anteriores à atual.
function atualizarDataMinima() {
    campoData.min = formatarDataLocal(new Date());
}

// Converte a data escolhida para um objeto Date local.
function converterData(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

// Verifica dia e horário de funcionamento.
function horarioValido(data, horario) {
    const diaSemana = data.getDay();

    // Domingo: estabelecimento fechado.
    if (diaSemana === 0) {
        return false;
    }

    // Horários disponíveis a cada 30 minutos.
    const [hora, minuto] = horario.split(":").map(Number);
    const totalMinutos = hora * 60 + minuto;

    if (minuto !== 0 && minuto !== 30) {
        return false;
    }

    // Sábado: das 9h às 13h.
    if (diaSemana === 6) {
        return totalMinutos >= 540 && totalMinutos < 780;
    }

    // Segunda a sexta: das 9h às 18h.
    return totalMinutos >= 540 && totalMinutos < 1080;
}

// Formata valores em reais.
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Mostra uma mensagem na página.
function mostrarMensagem(mensagem, tipo) {
    resultado.hidden = false;
    resultado.className = tipo === "erro"
        ? "alert alert-danger mt-3"
        : "alert alert-success mt-3";

    // textContent evita interpretar texto como HTML.
    resultado.textContent = mensagem;
    resultado.setAttribute("role", "status");

    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Atualiza o calendário quando a página é aberta.
atualizarDataMinima();

// Executa quando o formulário é enviado.
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    atualizarDataMinima();

    // Obtém os valores necessários para o agendamento.
    const servico = document.getElementById("servico").value;

    const modalidadeSelecionada =
        document.querySelector('input[name="modalidade"]:checked');

    const modalidade = modalidadeSelecionada
        ? modalidadeSelecionada.value
        : "";

    const dataTexto = campoData.value;
    const horario = campoHorario.value;

    // Verifica os campos obrigatórios.
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    // Confere se foi selecionada uma combinação válida.
    if (!precos[servico] || !precos[servico][modalidade]) {
        mostrarMensagem(
            "Selecione um serviço e uma modalidade válidos.",
            "erro"
        );
        return;
    }

    const dataEscolhida = converterData(dataTexto);

    // Impede datas anteriores à atual.
    if (dataTexto < formatarDataLocal(new Date())) {
        mostrarMensagem(
            "Selecione uma data atual ou futura.",
            "erro"
        );
        return;
    }

    // Verifica o horário de funcionamento.
    if (!horarioValido(dataEscolhida, horario)) {
        mostrarMensagem(
            "Horário indisponível. Atendemos de segunda a sexta, " +
            "das 9h às 18h, e sábado, das 9h às 13h. " +
            "Os agendamentos são feitos a cada 30 minutos.",
            "erro"
        );
        return;
    }

    // Confere se o horário ainda não passou.
    const [horas, minutos] = horario.split(":").map(Number);

    const dataAgendamento = new Date(
        dataEscolhida.getFullYear(),
        dataEscolhida.getMonth(),
        dataEscolhida.getDate(),
        horas,
        minutos
    );

    if (dataAgendamento <= new Date()) {
        mostrarMensagem(
            "Escolha uma data e um horário futuros.",
            "erro"
        );
        return;
    }

    // Identifica o serviço escolhido.
    const nomesServicos = {
        banho: "Banho",
        tosa: "Tosa",
        banhoTosa: "Banho e tosa"
    };

    const nomesModalidades = {
        local: "Entrega no local",
        telebusca: "Tele-busca"
    };

    // Calcula o valor do serviço.
    const valor = precos[servico][modalidade];

    // Apresenta a confirmação demonstrativa.
    const mensagem =
        "Simulação realizada com sucesso!\n" +
        "Serviço: " + nomesServicos[servico] + "\n" +
        "Modalidade: " + nomesModalidades[modalidade] + "\n" +
        "Data: " + dataEscolhida.toLocaleDateString("pt-BR") + "\n" +
        "Horário: " + horario + "\n" +
        "Valor: " + formatarMoeda(valor) + "\n\n" +
        "Atenção: este é um agendamento demonstrativo. " +
        "Nenhuma reserva foi registrada.";

    mostrarMensagem(mensagem, "sucesso");
});

// Limpa a mensagem quando o formulário é reiniciado.
formulario.addEventListener("reset", function() {
    resultado.hidden = true;
    resultado.textContent = "";
    atualizarDataMinima();
});
