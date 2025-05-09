function BuscaObras() {
    var Obras = "<option value=''></option>";
    //console.log("Executou o BuscaObras")
    var c1 = DatasetFactory.createConstraint("colleagueId", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST);
    //var c3 = DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD);
    var ds = DatasetFactory.getDataset("colleagueGroup", null, [c1], null);
    //console.log("ds1: " + ds);
    var constraints = [];
    if ($("#solicitante").val() == 'thalessa.tomm' || $("#solicitante").val() == 'fernando.jarvorski' || $("#solicitante").val() == 'rodrigo.ramos' || 
    		$("#solicitante").val() == 'diogo.franca' || $("#solicitante").val() == 'gabriela.tomm') {
        constraints.push(DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST));
    }
    constraints.push(DatasetFactory.createConstraint("usuario", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST));

    var dataset = DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, constraints, null);
    //console.log("ds2: " + ds);
    if (dataset.values.length > 0) {
        //console.log("entrou no if");
        var coligadaGroup = null;
        for (var i = 0; i < dataset.values.length; i++) {
            //console.log("entrou no for");
            if (coligadaGroup != dataset.values[i].NOMEFANTASIA) {
                //console.log("entrou no if2");
                coligadaGroup = dataset.values[i].NOMEFANTASIA;
                Obras += "<optgroup label='" + dataset.values[i].CODCOLIGADA + " - " + dataset.values[i].NOMEFANTASIA + "'></optgroup>";
            }
            Obras += "<option value='" + dataset.values[i].CODCOLIGADA + " - " + dataset.values[i].CODCCUSTO + " - " + dataset.values[i].perfil + "'>" + dataset.values[i].CODCCUSTO + " - " + dataset.values[i].perfil + "</option>";
        }
    }
    return Obras
}

function VerificaSeUsuarioTI() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("colleagueId", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("groupId", "Suporte TI", "Suporte TI", ConstraintType.MUST)
        ], null, {
            success: (grupos) => {
                if (grupos.values.length > 0) {
                    resolve("true");
                }
                else {
                    resolve("false");
                }
            },
            error: (error) => {
                reject(error);
            }
        })
    });
}

function FormataData(data) {
    data = data.split("-");
    var retorno = data[2] + "/" + data[1] + "/" + data[0];
    return retorno;
}

function dataAtualFormatada() {
    var data = new Date(),
        dia = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0' + dia : dia,
        mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0' + mes : mes,
        anoF = data.getFullYear();
    $("#DataDeHoje").val(diaF + "/" + mesF + "/" + anoF)
}

function BuscaListDeUsuariosAD(solicitante = null) {
    var callback = {
        success: (listUsuarios) => {
            if (listUsuarios.values[0].error == undefined) {
                $("#usuario").html("<option></option>");
                for (var i = 0; i < listUsuarios.values.length; i++) {
                    $("#usuario").append("<option values='" + listUsuarios.values[i].usuarioAD + "'>" + listUsuarios.values[i].usuarioAD + "</option>");
                }
                if (solicitante != null) {
                    $("#usuario").val(solicitante);
                }
            }
            else {
                //console.log(listUsuarios.values[0].error);
                $("#usuario").html("<option></option>");
                $("#usuario").append("<option values='gabriel.persike'>gabriel.persike</option>");
                $("#usuario").append("<option values='diogo.franca'>diogo.franca</option>");
                $("#usuario").append("<option values='paulo.monteiro'>paulo.monteiro</option>");

                if (solicitante != null) {
                    $("#usuario").val(solicitante);
                }
            }
        },
        error: (error) => {
            FLUIGC.toast({
                title: "Erro ao buscar lista de usuários: ",
                message: error,
                type: "warning"
            });
        }
    }

    DatasetFactory.getDataset("ZRUsuariosAD", null, [], null, callback);
}

function FormataValorInserir(valor) {
    var numero = parseFloat(valor);
    numero = numero.toFixed(2).split(".");
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
}

function BuscaLancamentos() {
    var c1 = DatasetFactory.createConstraint("colleagueId", $("#usuario").val(), $("#usuario").val(), ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD);
    var ds = DatasetFactory.getDataset("colleagueGroup", null, [c1,c2], null);
    var constraints = [];

    if ($("#usuario").val() == 'alysson.silva1') {
        $("#usuario").val('alysson.silva')
    }

    if ($("#usuario").val() == 'thalessa.tomm' || $("#usuario").val() == 'fernando.jarvorski' || $("#usuario").val() == 'naiara.pinto' || $("#usuario").val() == 'rodrigo.ramos' || $("#usuario").val() == 'roney.tomm'
    || $("#usuario").val() == 'paulo.giovani' || $("#usuario").val() == 'kennedy.silva' || ds.values.length>0) {
        constraints.push(DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST));
    }
    constraints.push(DatasetFactory.createConstraint("usuario", $("#usuario").val(), $("#usuario").val(), ConstraintType.MUST));

    var dataset = DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, constraints, null);

    if ($("#formMode").val() == 'VIEW') {
        var c1 = DatasetFactory.createConstraint("IDLAN", $("#IdentificadorMov").text(), $("#IdentificadorMov").text(), ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("CODCOLIGADA",$("#CodColigada").val(), $("#CodColigada").val(), ConstraintType.MUST);
    }
    else if($("#formMode").val() == 'MOD'){
        var c1 = DatasetFactory.createConstraint("IDLAN", $("#IdentificadorMov").val(), $("#IdentificadorMov").val(), ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("CODCOLIGADA", $("#CodColigada").val(), $("#CodColigada").val(), ConstraintType.MUST);
    }
    else {
        var c1 = DatasetFactory.createConstraint("IDLAN", $("#IdentificadorMov").val(), $("#IdentificadorMov").val(), ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("CODCOLIGADA", $("#ColigadaLanc").val(), $("#ColigadaLanc").val(), ConstraintType.MUST);
    }
    var c3 = DatasetFactory.createConstraint("OPERACAO", "PuxaLancamentoComMovimento", "PuxaLancamentoComMovimento", ConstraintType.MUST)
    var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)
    var DsFinal = Dataset.values
    console.log(DsFinal)

    VerificaExcecaoChefeDeEscritorio(DsFinal);

    if ($("#ColigadaLanc").val() == '' || $("#ColigadaLanc").val() == null) {
        $("#spanRazaoSocialAntecipaPagamento").text('');
        $("#spanCNPJAntecipaPagamento").text('');
        $("#spanCliforAntecipaPagamento").text('');
        $("#spanNumeroDocumentoAntecipaPagamento").text('');
        $("#spanCentroDeCustoAntecipaPagamento").text('');
        $("#spanTipoMovimento").text('')
        $("#spanDataVencimento").text('');
        $('#spanDataCriaPagam').text('')
        $('#spanDataEmissPagam').text('')
        $("#spanDiferncaDatasPagam").text('')
        $("#spanValorAntecipaPagamento").text('')
        FLUIGC.toast({
            message: "Favor Selecionar uma coligada para que o Lançamento seja encontrado!",
            type: "warning",
        });
    }
    else if ($("#Perm").val() != 'nao') {
        if (DsFinal == null || DsFinal == '') {
            $("#spanRazaoSocialAntecipaPagamento").text('');
            $("#spanCNPJAntecipaPagamento").text('');
            $("#spanCliforAntecipaPagamento").text('');
            $("#spanNumeroDocumentoAntecipaPagamento").text('');
            $("#spanCentroDeCustoAntecipaPagamento").text('');
            $("#spanTipoMovimento").text('');
            $("#spanDataVencimento").text('');
            $("#spanValorAntecipaPagamento").text('')
            FLUIGC.toast({
                message: "Lançamento não encontrado. Favor verificar digitação ou Lançamento, pois não é possível alterar data de uma Fatura",
                type: "warning",
            });
        }
        if (DsFinal[0].CODTMV == '1.2.06') {
            $("#spanRazaoSocialAntecipaPagamento").text('');
            $("#spanCNPJAntecipaPagamento").text('');
            $("#spanCliforAntecipaPagamento").text('');
            $("#spanNumeroDocumentoAntecipaPagamento").text('');
            $("#spanCentroDeCustoAntecipaPagamento").text('');
            $("#spanTipoMovimento").text('');
            $("#spanDataVencimento").text('');
            $("#spanValorAntecipaPagamento").text('')
            FLUIGC.toast({
                message: "Para Adiantamento de Aluguel, favor Selecionar a Categoria: Antecipação de Aluguel",
                type: "warning",
            });
        }
        else {
            for (i = 0; i < dataset.values.length; i++) {
                if (dataset.values[i].CODCCUSTO == DsFinal[0].CODCCUSTO) {
                    $("#spanRazaoSocialAntecipaPagamento").text(DsFinal[0].NOMEFANTASIA);
                    $("#spanCNPJAntecipaPagamento").text(DsFinal[0].CGCCFO);
                    $("#spanCliforAntecipaPagamento").text(DsFinal[0].CODCFO);
                    $("#spanNumeroDocumentoAntecipaPagamento").text(DsFinal[0].NUMERODOCUMENTO);
                    $("#spanCentroDeCustoAntecipaPagamento").text(DsFinal[0].CODCCUSTO + " - " + DsFinal[0].NOMECC);
                    $("#CodCCusto").val(DsFinal[0].NOMECC);
                    $("#NumeroCCusto").val(DsFinal[0].CODCCUSTO);
                    $("#CodColigada").val(DsFinal[0].CODCOLIGADA);
                    $("#spanTipoMovimento").text(DsFinal[0].CODTMV);
                    $('#spanDataCriaPagam').text(FormataData(DsFinal[0].DATACRIACAO.split(" ")[0]));
                    $('#spanDataEmissPagam').text(FormataData(DsFinal[0].DATAEMISSAO.split(" ")[0]));
                    $("#spanDiferncaDatasPagam").text(CalculaDiferenca(DsFinal[0].DATAEMISSAO, DsFinal[0].DATACRIACAO) + ' dias');
                    $("#TMVLan").val(DsFinal[0].CODTMV);
                    var DataVenc = DsFinal[0].DATAPREVBAIXA;
                    $("#spanDataVencimento").text(FormataData(DataVenc.split(" ")[0]));
                    var ValorFormat = FormataValorInserir(DsFinal[0].VALORORIGINAL);
                    $("#ValorOriginal").val(FormataValorInserir(DsFinal[0].VALORORIGINAL))
                    $("#spanValorAntecipaPagamento").text("R$ " + ValorFormat)
                    $("#CodColigada").val(DsFinal[0].CODCOLIGADA);
                    $("#Perm").val("sim")
                }
            }
            if ($("#Perm").val() == '') {
                $("#spanRazaoSocialAntecipaPagamento").text('');
                $("#spanCNPJAntecipaPagamento").text('');
                $("#spanCliforAntecipaPagamento").text('');
                $("#spanNumeroDocumentoAntecipaPagamento").text('');
                $("#spanCentroDeCustoAntecipaPagamento").text('');
                var DataVenc = DsFinal[0].DATAPREVBAIXA;
                $("#spanTipoMovimento").text('')
                $("#spanDataVencimento").text('');
                $('#spanDataCriaPagam').text('')
                $('#spanDataEmissPagam').text('')
                $("#spanDiferncaDatasPagam").text('')
                var ValorFormat = FormataValorInserir('');
                $("#spanValorAntecipaPagamento").text('')
                FLUIGC.toast({
                    message: "Usuário não tem acesso ao Centro de Custo do Lançamento!",
                    type: "warning",
                });
            }
        }
    }
}

function VerificaExcecaoChefeDeEscritorio(DsFinal){
    console.log("Executou o ExceçãoChefedeEscritório")


    if(DsFinal[0].CODCOLIGADA == '1'){
        
        if ($("#usuario").val() == "hilke.coelho") {
            if (DsFinal[0].CODCCUSTO != '1.5.001') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        else if(($("#usuario").val() == "patricia.oliveira")){
            if (DsFinal[0].CODCCUSTO != '1.1.001' && DsFinal[0].CODCCUSTO != '1.1.006' && DsFinal[0].CODCCUSTO != '1.1.008' && DsFinal[0].CODCCUSTO != '1.1.009' && DsFinal[0].CODCCUSTO != '1.1.014') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        else if($("#usuario").val() == "josney"){
            if (DsFinal[0].CODCCUSTO != '1.1.010') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        else if($("#usuario").val() == "fabiana.moura"){
            if (DsFinal[0].CODCCUSTO != '1.4.001' && DsFinal[0].CODCCUSTO != '1.4.010') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        
    }
    else if(DsFinal[0].CODCOLIGADA == '2'){
        console.log("Entrou no coligada 2")
        if (($("#usuario").val() == "hilke.coelho")) {
            if (DsFinal[0].CODCCUSTO != '1.5.001') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        if (($("#usuario").val() == "paulo.giovani")) {
            if (DsFinal[0].CODCCUSTO != '1.5.008') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
        if (($("#usuario").val() == "josney")) {
            if (DsFinal[0].CODCCUSTO != '1.3.001') {
                $("#Perm").val('nao')
                FLUIGC.toast({
                    message: "Permissão negada para pedir Alteração Data de Pagamento para este Centro de Custo",
                    type: "warning",
                });
            }
        }
    }
}

function BuscaLancamentosAlug() {

    var c1 = DatasetFactory.createConstraint("colleagueId", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD);
    var ds = DatasetFactory.getDataset("colleagueGroup", null, [c1], null);
    var constraints = [];

    if ($("#solicitante").val() == 'thalessa.tomm' || $("#solicitante").val() == 'fernando.jarvorski' || $("#solicitante").val() == 'rodrigo.ramos' ||  $("#solicitante").val() == 'naiara.pinto'
    || $("#solicitante").val() == 'diretoria.financeira' || ds.values.length>0) {
        constraints.push(DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST));
    }

    constraints.push(DatasetFactory.createConstraint("usuario", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST));
    var dataset = DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, constraints, null);

    if ($("#formMode").val() == 'VIEW') {
        //console.log('Entrou no if view')
        var c1 = DatasetFactory.createConstraint("IDMOV", $("#IdentificadorMovAlug").text(), $("#IdentificadorMovAlug").text(), ConstraintType.MUST);
    }
    else {
        //console.log('Entrou no else view')
        var c1 = DatasetFactory.createConstraint("IDMOV", $("#IdentificadorMovAlug").val(), $("#IdentificadorMovAlug").val(), ConstraintType.MUST);
    }
    var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST)
    var c3 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligadaMovAlug").val(), $("#coligadaMovAlug").val(), ConstraintType.MUST)
    var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)
    //console.log(Dataset)
    var DsFinal = Dataset.values

    VerificaExcecaoChefeDeEscritorio(DsFinal)

    if (DsFinal == null || DsFinal == '') {
        //console.log("Entrou no if DS vazio")
        $("#spanRazaoSocialAntecipaAluguel").text('');
        $("#spanCNPJAntecipaAluguel").text('');
        $("#spanCliforAntecipaAluguel").text('');
        $("#spanNumeroDocumentoAntecipaAluguel").text('');
        $("#spanCentroDeCustoAntecipaAluguel").text('');
        $("#spanDataVencimentoAluguel").text('');
        $("#spanTipoMovimentoAlug").text('')
        $("#spanValorAntecipaAluguel").text('');
        FLUIGC.toast({
            message: "Lançamento não encontrado, favor verificar digitação",
            type: "warning",
        });
    }
    else {
        //console.log("Entrou no if DS não vazio")
        $("#Perm").val('')
        for (i = 0; i < dataset.values.length; i++) {
            if (dataset.values[i].CODCCUSTO == DsFinal[0].CODCCUSTO) {
                $("#spanRazaoSocialAntecipaAluguel").text(DsFinal[0].NOMEFANTASIA);
                $("#spanCNPJAntecipaAluguel").text(DsFinal[0].CGCCFO);
                $("#spanCliforAntecipaAluguel").text(DsFinal[0].CODCFO);
                $("#spanNumeroDocumentoAntecipaAluguel").text(DsFinal[0].NUMERODOCUMENTO);
                $("#spanCentroDeCustoAntecipaAluguel").text(DsFinal[0].CODCCUSTO + " - " + DsFinal[0].CENTRODECUSTO);
                $("#CodCCusto").val(DsFinal[0].CENTRODECUSTO)
                $("#spanTipoMovimentoAlug").text(DsFinal[0].CODTMV)
                $('#spanDataCriaAlug').text(FormataData(DsFinal[0].DATACRIACAO.split(" ")[0]))
                $('#spanDataEmissAlug').text(FormataData(DsFinal[0].DATAEMISSAO.split(" ")[0]))
                $("#spanDiferncaDatas").text(CalculaDiferenca(DsFinal[0].DATAEMISSAO, DsFinal[0].DATACRIACAO))
                var DataVenc = DsFinal[0].DATAPREVBAIXA;
                $("#spanDataVencimentoAluguel").text(FormataData(DataVenc.split(" ")[0]));
                var ValorFormat = FormataValorInserir(DsFinal[0].VALORORIGINAL);
                $("#spanValorAntecipaAluguel").text("R$ " + ValorFormat)
                $("#Perm").val("sim")
            }
        }

        if ($("#Perm").val() == '') {
            $("#spanRazaoSocialAntecipaAluguel").text('');
            $("#spanCNPJAntecipaAluguel").text('');
            $("#spanCliforAntecipaAluguel").text('');
            $("#spanNumeroDocumentoAntecipaAluguel").text('');
            $("#spanCentroDeCustoAntecipaAluguel").text('');
            var DataVenc = DsFinal[0].DATAPREVBAIXA;
            $("#spanDataVencimentoAluguel").text('');
            $("#spanTipoMovimentoAlug").text('')
            var ValorFormat = FormataValorInserir('');
            $("#spanValorAntecipaAluguel").text('');
            FLUIGC.toast({
                message: "Usuário não tem acesso ao Centro de Custo do Lançamento!",
                type: "warning",
            });
        }
    }
}

function CalculaDiferenca(data1, data2) {
    var momento1 = moment(data1, "YYYY-MM-DD HH:mm:ss.S");
    var momento2 = moment(data2, "YYYY-MM-DD HH:mm:ss.S");

    var diferenca = momento2.diff(momento1, "days");

    $("#diferenca").val(diferenca)

    return diferenca
}

function BuscaListaEmailSuperiores() {

    var callback = {
        success: function (dataset) {
            listUsuarios = dataset.values;
            listMails = ds.values;
            //console.log(listMails);
        },
        error: function (error) {
            ////console.log("Erro: " + error);
        }
    }
    var c2 = DatasetFactory.createConstraint("OPERACAO", "EmailSuperiores", "EmailSuperiores", ConstraintType.MUST)
    DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c2], null, callback)
    var ds = DatasetFactory.getDataset("colleague", null, null);

}

function AtribuiSuperiores() {
    var valorCodcoligada = '';
    if ($("#CategoriaAlteracao").val() == 'Antecipação de Pagamento') {
        var c1 = DatasetFactory.createConstraint("IDLAN", $("#IdentificadorMov").val(), $("#IdentificadorMov").val(), ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaLancamento", "PuxaLancamento", ConstraintType.MUST)
        var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2], null)
        var DsFinal = Dataset.values
        valorCodcoligada = DsFinal[0].CODCOLIGADA
    }
    else if ($("#CategoriaAlteracao").val() == 'Antecipação de Aluguel') {
        var c1 = DatasetFactory.createConstraint("IDMOV", $("#IdentificadorMovAlug").val(), $("#IdentificadorMovAlug").val(), ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("codcoligada", $("#coligadaMovAlug").val(), $("#coligadaMovAlug").val(), ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST)
        var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2,c3], null)
        var DsFinal = Dataset.values
        valorCodcoligada = DsFinal[0].CODCOLIGADA
    }
    else if($("#CategoriaAlteracao").val() == 'Adiantamento de Pagamento de Fornecedores'){
        $("#CodCCusto").val($("#CentroDeCustoAdiantFornece").val().split(" - ")[2]);
        valorCodcoligada = $("#CentroDeCustoAdiantFornece").val().split(" - ")[0];
    }
    else if($("#CategoriaAlteracao").val() == 'Adiantamento de Viagem'){
        $("#CodCCusto").val($("#CentroDeCustoAdiantViagem").val().split(" - ")[2]);
        valorCodcoligada = $("#CentroDeCustoAdiantViagem").val().split(" - ")[0];
    }

    for (i = 0; i < listUsuarios.length; i++) {
        if ($("#CodCCusto").val() == listUsuarios[i].perfil) {
            if (valorCodcoligada == listUsuarios[i].codcoligada) {
                if (listUsuarios[i].limite == '20000.0000') {
                    for (j = 0; j < listMails.length; j++) {
                        if (listUsuarios[i].codusuarioFluig == listMails[j]["colleaguePK.colleagueId"]) {
                            $("#emailGerenteContratos").val(listMails[j].mail)
                        }
                    }
                }
                if (listUsuarios[i].limite == '250000.0000') {
                    console.log(listUsuarios[i].limite)
                    for (j = 0; j < listMails.length; j++) {
                        if (listUsuarios[i].codusuarioFluig == listMails[j]["colleaguePK.colleagueId"]) {
                            $("#emailCoordenadorOperacional").val(listMails[j].mail)
                        }
                    }
                }
                if (listUsuarios[i].limite == '9000000.0000') {
                    console.log(listUsuarios[i].limite)
                    for (j = 0; j < listMails.length; j++) {
                        if (listUsuarios[i].codusuarioFluig == listMails[j]["colleaguePK.colleagueId"]) {
                            $("#emailCoordenadorOperacional").val(listMails[j].mail)
                        }
                    }
                }
            }
        }
    }
}

function BloqueiaCamposInfoChamado() {
    $("#IdentificadorMov, #IdentificadorMovAlug, #coligadaMovAlug, .info-chamado, .InputAdiantamentoFornecedor, .InputPagamentoAdiantamentoFornecedor, .InputAdiantamentoViagem").each(function () {
        var value = $(this).val();
        if (value !== null) {
            $(this).siblings("div:first").html(value.split("\n").join("<br>"));
        }
        $(this).hide();
    })
}

function ValidaCampos() {
    var atividade = $("#atividade").val();
    var formMode = $("#formMode").val();

    var valida = true;
    if (atividade == 0) {
        $(".info-chamado").each(function () {
            if ($(this).val() == null || $(this).val() == undefined || $(this).val() == "") {
                $(this).addClass("has-error");

                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }

            if ($(this).prop("id") == "Justificativa" && $(this).val().length < 15) {
                $(this).addClass("has-error");
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "O campo Justificativa deve conter pelo menos 15 caracteres!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        });

        if ($("#CategoriaAlteracao").val() == "Antecipação de Pagamento") {
            $(".InputPagamentoNotasFiscais").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
                if ($("#spanTipoMovimento").text() == '' || $("#spanTipoMovimento").text() == null) {
                    FLUIGC.toast({
                        message: "Campos de lançamento em branco! Favor verificar a Referência do lançamento!",
                        type: "warning"
                    });
                }
            });
        }

        else if ($("#CategoriaAlteracao").val() == "Antecipação de Aluguel") {
            $(".InputPagamentoAluguel").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });
        }

        else if ($("#CategoriaAlteracao").val() == "Adiantamento de Pagamento de Fornecedores") {
            if (($("#NovoFornecedor").is(":visible"))) {
                $(".InputPagamentoAdiantamentoFornecedor").each(function () {
                    if ($(this).val() == "" || $(this).val() == null) {
                        $(this).addClass("has-error");
                        if (valida == true) {
                            valida = false;
                            FLUIGC.toast({
                                message: "Campo não preenchido!",
                                type: "warning"
                            });
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            }, 700);
                        }
                    }
                });
            }
            $(".InputAdiantamentoFornecedor").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");
                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });
        }

        else if ($("#CategoriaAlteracao").val() == "Adiantamento de Viagem") {
            $(".InputAdiantamentoViagem").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });
        }
    }

    if (valida == true) {
        valida = ValidaEmailsEmCopia();
    }

    return valida;
}

function ValidaEmailsEmCopia() {
    if ($("#email").val() == "") {
        return true;
    }

    var valida = true;
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var emails = $("#email").val().trim().split(";");

    emails.forEach(email => {
        if (valida == true && !re.test(email.trim())) {
            valida = false;
        }
    });

    if (!valida) {
        FLUIGC.toast({
            message: "E-mails em cópia inválido!",
            type: "warning"
        });
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#email").offset().top - (screen.height * 0.15)
        }, 700);
        $("#email").addClass("has-error");
    }

    return valida;
}

function BuscaFornecedor() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [
            ds = DatasetFactory.createConstraint("OPERACAO", "BuscaFornecedor", "BuscaFornecedor", ConstraintType.MUST),
        ], null, {
            success: (fornecedores => {
                if (fornecedores.values.length < 1) {
                    FLUIGC.toast({
                        message: "Erro ao buscar fornecedores",
                        type: "warning"
                    });
                    reject();
                }
                else {
                    if (fornecedores.values[0].CNPJ != null && fornecedores.values[0].CNPJ != "" && fornecedores.values[0].CNPJ != undefined) {
                        resolve(fornecedores);
                    }
                    else {
                        FLUIGC.toast({
                            message: "Erro ao buscar fornecedores",
                            type: "warning"
                        });
                        console.error(fornecedores);
                        reject();
                    }
                }
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar fornecedores: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaDepartamentos() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DepartamentosRM", null, [
            DatasetFactory.createConstraint("codcoligada", 1, 1, ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", 1, 1, ConstraintType.MUST)
        ], null, {
            success: (departamentos => {
                var options = "<option></option>";
                departamentos.values.forEach(departamento => {
                    options +=
                        "<option value='" + departamento.coddepartamento + " - " + departamento.nome + "'>" + departamento.coddepartamento + " - " + departamento.nome + "</option>";
                });
                resolve(options);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar departamentos: ",
                    message: error,
                    type: "warning"
                });
            })
        })
    });
}

function BuscaDestinoDePagamento(ValorcGCGFO, CODCOLIGADA){
    $(".SpanPagamentoAdiantamentoFornecedor").text("")
    //console.log(ValorcGCGFO);
    //console.log(CODCOLIGADA);
    if ($("#formMode").text() == 'VIEW') {
        var c1 = DatasetFactory.createConstraint("CGCCFO", ValorcGCGFO, ValorcGCGFO, ConstraintType.MUST)
        var c2 = DatasetFactory.createConstraint("CODCOLIGADAPAGAMENTO", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
        var c3 = DatasetFactory.createConstraint("OPERACAO", "BuscaDestinoDePagamento", "BuscaDestinoDePagamento", ConstraintType.MUST)
        var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)
    }
    var c1 = DatasetFactory.createConstraint("CGCCFO", ValorcGCGFO, ValorcGCGFO, ConstraintType.MUST)
    var c2 = DatasetFactory.createConstraint("CODCOLIGADAPAGAMENTO", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
    var c3 = DatasetFactory.createConstraint("OPERACAO", "BuscaDestinoDePagamento", "BuscaDestinoDePagamento", ConstraintType.MUST)
    var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)
    var DsFinal = Dataset.values
    //console.log(DsFinal)
    for (i = 0; i < DsFinal.length; i++) {
        if (DsFinal[i].NUMEROBANCO != "---") {
            $("#spanNumeroBancoFornecedor").text(DsFinal[i].NUMEROBANCO);
            $("#spanCodigoAgenciaFornecedor").text(DsFinal[i].CODIGOAGENCIA);
            $("#spanDigitoAgenciaFornecedor").text(DsFinal[i].DIGITOAGENCIA);
            $("#spanContaCorrenteFornecedor").text(DsFinal[i].CONTACORRENTE);
            $("#spanDigtoContaFornecedor").text(DsFinal[i].DIGITOCONTA);
            $("#spanTipoContaFornecedor").text(DsFinal[i].TIPOCONTA);
            $("#spanFavorecidoFornecedor").text(DsFinal[i].FAVORECIDO);
            $("#spanCNPJFornecedor").text(DsFinal[i].CGCFAVORECIDO);   
        }
        else{
            $("#CodCfo").val(DsFinal[i].CODCFO);
            $("#idPgto").val(DsFinal[i].IDPGTO);
        }
    }
}

function CriaJson(categoria) {
    if (categoria == "Adiantamento de Pagamento de Fornecedores") {
        var ListDestinoPagamento = [];
            var json = {
                NumBanco: $(".spanNumeroBancoFornecedor").text(),
                CodAgencia: $(".spanCodigoAgenciaFornecedor").text(),
                DigitoAgencia: $(".spanDigitoAgenciaFornecedor").text(),
                ContaCorrente: $(".spanContaCorrenteFornecedor").text(),
                DigitoContCor: $(".spanDigtoContaFornecedor").text(),
                TipoConta: $(".spanTipoContaFornecedor").text(),
                Favorecido: $(".spanFavorecidoFornecedor").text(),
                CNPJfornecedor: $(".spanCNPJFornecedor").text(),
            };
            ListDestinoPagamento.push(json);
        $("#jsonDestinoPagamento").val(JSON.stringify(ListDestinoPagamento));
    }
}

function verificarHoraLocalMaiorQueBrasilia() {
    var localTime = new Date();
    var brasiliaHours = 10;
    var brasiliaMinutes = 0;
    var localHours = localTime.getHours();
    var localMinutes = localTime.getMinutes();
    //console.log(localHours, localMinutes);
    
    // Verificando se a hora local é maior que a hora atual em Brasília
    if (localHours > brasiliaHours || (localHours === brasiliaHours && localMinutes > brasiliaMinutes)) {
        FLUIGC.toast({
            message: "Favor agendar o adiantamento para amanhã. Lançamentos para o dia do Pagamento devem ser feitos até as 10:00 (Horário de Brasília)",
            type: "warning",
        });
        $("#data_alteracao").val("");
    } else {
        if ($("#atividade") == 0) {
            alert("Para que o adiantamento seja confirmado, ele precisa ser aprovado até as 10:00 (Horário de Brasília)");  
        }
    return true;
    }
}

function formatDateMobile(inputDate) {
    console.log("Executou a função")
    // Verifica se a data está no formato "yyyy-mm-dd"
    var regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(inputDate)) {
        const parts = inputDate.split("-");
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        $("#data_alteracao").val(formattedDate)
    }
}