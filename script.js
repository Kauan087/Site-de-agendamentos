document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("agendamento-form");
    const projetorSelect = document.getElementById("projetor");
    const horariosContainer = document.getElementById("horarios-container");
    const tabelaAgendamentos = document.getElementById("tabela-agendamentos");

    function salvarAgendamento(agendamento) {
        let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
        agendamentos.push(agendamento);
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    }

    function carregarAgendamentos() {
        return JSON.parse(localStorage.getItem("agendamentos")) || [];
    }

    function obterProximoDiaUtil() {
        let hoje = new Date();
        let diaAgendamento = new Date(hoje);

        if (hoje.getHours() >= 17) {
            diaAgendamento.setDate(hoje.getDate() + 1);
        }

        while (diaAgendamento.getDay() === 6 || diaAgendamento.getDay() === 0) {
            diaAgendamento.setDate(diaAgendamento.getDate() + 1);
        }

        return diaAgendamento.toISOString().split('T')[0];
    }

    function atualizarHorariosDisponiveis() {
        const projetorSelecionado = projetorSelect.value;
        horariosContainer.innerHTML = "";

        const horarios = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º"];
        const agendamentos = carregarAgendamentos();
        const dataFormatada = obterProximoDiaUtil();

        const horariosOcupados = agendamentos
            .filter(a => a.projetor === projetorSelecionado && a.data === dataFormatada)
            .map(a => a.horario);

        horarios.forEach(horario => {
            const label = document.createElement("label");
            label.classList.add(horariosOcupados.includes(horario) ? "horario-indisponivel" : "horario-disponivel");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = horario;
            checkbox.name = "horario";
            if (horariosOcupados.includes(horario)) checkbox.disabled = true;

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(horario));
            horariosContainer.appendChild(label);
        });
    }

    function atualizarListaAgendamentos() {
        if (!tabelaAgendamentos) return;
        tabelaAgendamentos.innerHTML = "<tr><th>Professor</th><th>Item Agendado</th><th>Horários</th></tr>";

        const agendamentos = carregarAgendamentos();
        const hoje = new Date().toISOString().split('T')[0];
        const agendamentosAtivos = agendamentos.filter(a => a.data >= hoje);

        const agendamentosAgrupados = {};
        agendamentosAtivos.forEach(a => {
            const chave = `${a.professor}-${a.projetor}-${a.data}`;
            if (!agendamentosAgrupados[chave]) {
                agendamentosAgrupados[chave] = { professor: a.professor, projetor: a.projetor, horarios: [], data: a.data };
            }
            agendamentosAgrupados[chave].horarios.push(a.horario);
        });

        Object.values(agendamentosAgrupados).forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${a.professor}</td><td>${a.projetor}</td><td>${a.horarios.sort().join(", ")}</td>`;
            tabelaAgendamentos.appendChild(tr);
        });
    }

    function exibirAlertaSucesso() {
        alert("✅ Horário agendado com sucesso!");
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const professor = document.getElementById("professor").value;
            const projetor = projetorSelect.value;
            const horariosSelecionados = Array.from(document.querySelectorAll("input[name='horario']:checked"))
                .map(cb => cb.value);
            const dataFormatada = obterProximoDiaUtil();

            if (!professor || !projetor || horariosSelecionados.length === 0) return;

            horariosSelecionados.forEach(horario => {
                salvarAgendamento({ professor, projetor, horario, data: dataFormatada });
            });

            exibirAlertaSucesso();
            atualizarHorariosDisponiveis();
            atualizarListaAgendamentos();
            form.reset();
        });

        projetorSelect.addEventListener("change", atualizarHorariosDisponiveis);
        atualizarHorariosDisponiveis();
    }

    atualizarListaAgendamentos();
});
