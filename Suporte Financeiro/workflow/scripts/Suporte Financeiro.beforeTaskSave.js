function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    var atividade = getValue('WKNumState');
    hAPI.setCardValue("numProces", getValue("WKNumProces"));
    var numSolic = hAPI.getCardValue("numProces");
    hAPI.setCardValue("numProces", getValue("WKNumProces"));
    var CategoriaChamado = hAPI.getCardValue("CategoriaAlteracao");
    var comentario = getValue("WKUserComment");

    if (atividade == 4) {
        if (CategoriaChamado == "Adiantamento de Pagamento de Fornecedores" && hAPI.getCardValue("atualizaBancoForn") == '1') {
            atualizaDadosPagFornecedor();
        }
        EnviaNotificacao(numSolic);
    }
    else if (atividade == 5 && hAPI.getCardValue("opcaoSelec") == "nao") {
        //log.info("Entrou no Categoria NAO")
        if (hAPI.getCardValue("Mobile") == 'true') {
            //log.info("Comentário realizado: " + comentario);
            if (comentario == null || comentario == "") {
                throw " Favor Escrever a justificativa de retorno nos comentários da solicitação "
            }
            else {
                EnviaNotificacaoCancelada(numSolic)
            }
        }
        else {
            if (comentario.split("<p>").length > 1) {
                EnviaNotificacaoCancelada(numSolic)
            }
            else {
                throw " Favor Escrever a justificativa de retorno nos comentários da solicitação "
            }
        }
    }
    else if (atividade == 5 && hAPI.getCardValue("opcaoSelec") == "sim") {
        if (CategoriaChamado == "Antecipação de Pagamento") {

            log.info("CODCOLIGADA SELECIONADA = " + hAPI.getCardValue("ColigadaLanc"))

            var newXml = new String;
            newXml += "<FinLAN>";
            newXml += "<FLAN>";
            newXml += "<CODCOLIGADA>" + hAPI.getCardValue("CodColigada") + "</CODCOLIGADA>";
            newXml += "<IDLAN>" + hAPI.getCardValue("IdentificadorMov") + "</IDLAN>";
            newXml += "<DATAPREVBAIXA>" + hAPI.getCardValue("data_alteracao") + "</DATAPREVBAIXA>";
            newXml += "<USUARIOALTERACAO>" + hAPI.getCardValue("UsuarioRR") + "</USUARIOALTERACAO>";
            newXml += "</FLAN>";
            newXml += "</FinLAN>";

            log.info("XML ATUALIZA = " + newXml);


            var c1 = DatasetFactory.createConstraint("pCodcoligada", hAPI.getCardValue("CodColigada"), hAPI.getCardValue("CodColigada"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("pUserRM", hAPI.getCardValue("UsuarioRR"), hAPI.getCardValue("UsuarioRR"), ConstraintType.MUST);
            var constraints = new Array(c1, c2, c3);
            var retorno = DatasetFactory.getDataset("AtualizaDataPrevBaixa", null, constraints, null);

            //log.info("RETORNO = " + retorno.values[0][1]);

            if (!retorno || retorno == "" || retorno == null) {
                throw "Houve um erro na comunicação com o webservice. Tente novamente!";
                ret = false;
            }
            else if (retorno.values[0][0] == "false") {
                throw "Não foi possível atualizar o lançamento. Motivo: " + retorno.values[0][1] + ". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
                ret = false;
            }
            else {
                ret = true;
                EnviaNotificacaoAprovado(numSolic)
            }
        }
        else if (CategoriaChamado == "Antecipação de Aluguel") {
            var c1 = DatasetFactory.createConstraint("IDMOV", hAPI.getCardValue("IdentificadorMovAlug"), hAPI.getCardValue("IdentificadorMovAlug"), ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("CODCOLIGADA", hAPI.getCardValue("coligadaMovAlug"), hAPI.getCardValue("coligadaMovAlug"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2,c3], null)

            var newXml = new String;
            newXml += "<MovMovimento>";
            newXml += "<TMOV>";
            newXml += "<CODCOLIGADA>" + Dataset.values[0][0] + "</CODCOLIGADA>";
            newXml += "<IDMOV>" + Dataset.values[0][2] + "</IDMOV>";
            newXml += "<DATAEMISSAO>" + hAPI.getCardValue("data_alteracaoAluguel") + "</DATAEMISSAO>";
            newXml += "<DATAEXTRA1>" + hAPI.getCardValue("data_alteracaoAluguel") + "</DATAEXTRA1>";
            newXml += "<DATASAIDA>" + hAPI.getCardValue("data_alteracaoAluguel") + "</DATASAIDA>";
            newXml += "</TMOV>";
            newXml += "</MovMovimento>";

            log.info("XML atualizaMovimentoAlug = " + newXml);

            var c1 = DatasetFactory.createConstraint("pCodcoligada", Dataset.values[0][0], Dataset.values[0][0], ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
            var constraints = new Array(c1, c2);
            var retorno = DatasetFactory.getDataset("AtualizaMovimentoFinanceiro", null, constraints, null);


            log.info("RETORNO = " + retorno.values[0][1]);
            log.dir(retorno);

            if (!retorno || retorno == "" || retorno == null) {
                throw "Houve um erro na comunicação com o webservice. Tente novamente!";
            }
            else {

                if (retorno.values[0][0] == "false") {
                    throw "Não foi possível atualizar o movimento. Motivo: " + retorno.values[0][1] + ". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
                }
                else {
                    EnviaNotificacaoAprovado(numSolic)
                }
            }
        }
    }
    else if (atividade == 14) {
        //log.info("Entrou no atividade 22")
        EnviaNotificacaoAprovado(numSolic)
    }
}

function EnviaNotificacao(numSolic) {
    //log.info("envia email");
    try {
        var url = 'http://fluig.castilho.com.br:1010';//Prod
        //var url = 'http://homologacao.castilho.com.br:2020';//Homolog

        var mensagem = null;
        mensagem = "Alerta referente à Solicitação Nº" + numSolic + ", \
		favor <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>acessar a solicitação</a> e dar <b>continuidade ao seu chamado</b>.<br>";

        var html =
            "<p class='DescrMsgForum'>\
			" + mensagem + "\
		</p>\
		<div class='DescrMsgForum actions'>\
			<p class='DescrMsgForum'>\
				<b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
				<b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>";

        if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Pagamento") {
            var c1 = DatasetFactory.createConstraint("IDLAN", hAPI.getCardValue("IdentificadorMov"), hAPI.getCardValue("IdentificadorMov"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("CODCOLIGADA", hAPI.getCardValue("CodColigada"),  hAPI.getCardValue("#CodColigada"), ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("OPERACAO", "PuxaLancamentoComMovimento", "PuxaLancamentoComMovimento", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)

            html +=
                "<br>\
					<b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
					<b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
					<b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
					<b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
					<b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                    <b>Diferença entre Entrada e Criação: </b>" + hAPI.getCardValue("diferenca") + "</b></br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorOriginal") + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
					<b>Data para Adiantamento Solicitada: </b>" + hAPI.getCardValue("data_alteracao") + "</br>"
                    if (hAPI.getCardValue("TMVLan") == '1.2.22') {
                        var anexos = BuscaAnexos();
                        if (anexos != false && anexos != "") {
                            html +=
                                "<div class='DescrMsgForum'>\
                                        <p class='DescrMsgForum'>\
                                            <b>Anexos:</b>\
                                            <ul>\
                                                " + anexos + "<br>\
                                            </ul>\
                                        </p>\
                                    </div>";
                        }
                        // DIOGO
                        /* else {
                            throw "Favor Anexar o Boleto a ser pago."
                        }*/
                    }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Aluguel") {
            var c1 = DatasetFactory.createConstraint("IDMOV", hAPI.getCardValue("IdentificadorMovAlug"), hAPI.getCardValue("IdentificadorMovAlug"), ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("CODCOLIGADA", hAPI.getCardValue("coligadaMovAlug"), hAPI.getCardValue("coligadaMovAlug"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)

            html +=
                "<br>\
					<b>Razão Social: </b>" + Dataset.values[0][5] + "</br>\
					<b>CPF/CNPJ: </b>" + Dataset.values[0][4] + "</br>\
					<b>Clifor: </b>" + Dataset.values[0][3] + "</br>\
					<b>Centro de Custo: </b>" + Dataset.values[0][6] + " - " + Dataset.values[0][7] + "</br>\
					<b>Numero Documento: </b>" + Dataset.values[0][8] + "</b></br>\
					<b>Valor: </b>R$ " + FormataValorInserir(Dataset.values[0][10]) + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
					<b>Data Solicitada para Adiantamento: </b>" + hAPI.getCardValue("data_alteracaoAluguel") + "</br>";
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Pagamento de Fornecedores") {
            html +=
                "<br>\
					<b>Fornecedor: </b>" + hAPI.getCardValue("NomeECnpjFornecedor") + "</br>\
					<b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
					<b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoFornece") + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
					<b>Data Solicitada para Adiantamento: </b>" + hAPI.getCardValue("DataSolicAdiantamento") + "</br>";
            if (hAPI.getCardValue("FormaPgtoFornece") == '001 - Cheque Curitiba') {
                var anexos = BuscaAnexos();
                if (anexos != false && anexos != "") {
                    html +=
                        "<div class='DescrMsgForum'>\
                                <p class='DescrMsgForum'>\
                                    <b>Anexos:</b>\
                                    <ul>\
                                        " + anexos + "<br>\
                                    </ul>\
                                </p>\
                            </div>";
                }
                // DIOGO
                /*
                 else {
                    throw "Favor Anexar o Boleto a ser pago."
                }
                */
            }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Viagem") {
            html +=
                "<br>\
					<b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
					<b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoViagem") + "</br>\
                    <b>Data Solicitada para Adiantamento: </b>" + hAPI.getCardValue("DataSolicAdiantamentoViagem") + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>"
					;
        }
        html += "\
			</p>\
		</div>\
        <br>";
        html += "<div class='DescrMsgForum actions'>\
			<br />\
			<p class='DescrMsgForum'> Para mais detalhes, <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>clique aqui.</a></p>\
		</div>";

        var data = {
            companyId: getValue("WKCompany").toString(),
            serviceCode: 'ServicoFluig',
            endpoint: '/api/public/alert/customEmailSender',
            method: 'post',
            timeoutService: '100',
            params: {
                to: BuscaRemetentes(),
                from: "fluig@construtoracastilho.com.br", //Prod
                //from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[FLUIG] Solicitação - Suporte Financeiro - " + hAPI.getCardValue("CategoriaAlteracao"),
                templateId: "TPL_SUPORTE_TI2",
                dialectId: "pt_BR",
                param: {
                    "CORPO_EMAIL": html,
                    "SERVER_URL": url,
                    "TENANT_ID": "1"
                }
            }
        }

        var clientService = fluigAPI.getAuthorizeClientService();
        var vo = clientService.invoke(JSONUtil.toJSON(data));

        if (vo.getResult() == null || vo.getResult().isEmpty()) {
            throw "Retorno está vazio";
        } else {
            log.info(vo.getResult());
        }
        log.info("Fim envia email");
    } catch (error) {
        throw "Erro ao enviar e-mail de notificação: " + error;
    }
}

function EnviaNotificacaoAprovado(numSolic) {
    //log.info("envia email");
    try {
        var url = 'http://fluig.castilho.com.br:1010';//Prod
        //var url = 'http://homologacao.castilho.com.br:2020';//Homolog

        var mensagem = null;
        mensagem = "\
		<p>\
			Segue a resolução referente a solicitação\
			<a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
		</p>"

        var comentario = getValue("WKUserComment");

        var html = "\
		<p class='DescrMsgForum'>\
			" + mensagem + "\
		</p>\
		<div class='DescrMsgForum actions'>\
			<p class='DescrMsgForum'>\
            <b>Solicitação Aprovada</b></br>\
            <b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
            <b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>"

        if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Pagamento") {
            var c1 = DatasetFactory.createConstraint("IDLAN", hAPI.getCardValue("IdentificadorMov"), hAPI.getCardValue("IdentificadorMov"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("CODCOLIGADA", hAPI.getCardValue("CodColigada"),  hAPI.getCardValue("#CodColigada"), ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("OPERACAO", "PuxaLancamentoComMovimento", "PuxaLancamentoComMovimento", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null)

            html +=
                "<br>\
					<b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
					<b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
					<b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
					<b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
					<b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                    <b>Diferença entre Entrada e Criação: </b>" + hAPI.getCardValue("diferenca") + "</b></br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorOriginal") + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
					<b>Nova Data de Pagamento: </b>" + hAPI.getCardValue("data_alteracao") + "</br>"
                    if (hAPI.getCardValue("Mobile") == 'false' && comentario != "" ) {
                        var comentarioSplit = comentario.split("<p>");
                        var splitfinal = comentarioSplit[1].split("</p>")
                        html += "<b>Comentário: </b>"+ splitfinal[0] +"</br>"
                    }
                    else if(hAPI.getCardValue("Mobile") == 'true' && comentario != ""){
                        html += "<b>Comentário: </b>"+ comentario +"</br>"
                    }
                    if (hAPI.getCardValue("TMVLan") == '1.2.22') {
                        var anexos = BuscaAnexos();
                        if (anexos != false && anexos != "") {
                            html +=
                                "<div class='DescrMsgForum'>\
                                        <p class='DescrMsgForum'>\
                                            <b>Anexos:</b>\
                                            <ul>\
                                                " + anexos + "<br>\
                                            </ul>\
                                        </p>\
                                    </div>";
                        }
                        // DIOGO
                        /*else {
                            throw "Favor Anexar o Boleto a ser pago."
                        }*/
                    }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Aluguel") {
            var c1 = DatasetFactory.createConstraint("IDMOV", hAPI.getCardValue("IdentificadorMovAlug"), hAPI.getCardValue("coligadaMovAlug"), ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("CODCOLIGADA", hAPI.getCardValue("coligadaMovAlug"), hAPI.getCardValue("IdentificadorMovAlug"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2,c3], null)

            html +=
                "<br>\
						<b>Razão Social: </b>" + Dataset.values[0][5] + "</br>\
						<b>CPF/CNPJ: </b>" + Dataset.values[0][4] + "</br>\
						<b>Clifor: </b>" + Dataset.values[0][3] + "</br>\
						<b>Centro de Custo: </b>" + Dataset.values[0][6] + " - " + Dataset.values[0][7] + "</br>\
						<b>Numero Documento: </b>" + Dataset.values[0][8] + "</b></br>\
						<b>Valor: </b>R$ " + FormataValorInserir(Dataset.values[0][10]) + "</br>\
						<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
						<b>Nova Data de Pagamento: </b>" + hAPI.getCardValue("data_alteracaoAluguel") + "</br>";
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Pagamento de Fornecedores") {
            html +=
                "<br>\
                    <b>Fornecedor: </b>" + hAPI.getCardValue("NomeECnpjFornecedor") + "</br>\
                    <b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
                    <b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
                    <b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoFornece") + "</br>\
                    <b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>\
                    <b>Data Aprovada: </b>" + hAPI.getCardValue("DataSolicAdiantamento") + "</br>";
            if (hAPI.getCardValue("FormaPgtoFornece") == '001 - Cheque Curitiba') {
                var anexos = BuscaAnexos();
                if (anexos != false && anexos != "") {
                    html +=
                        "<div class='DescrMsgForum'>\
                                <p class='DescrMsgForum'>\
                                    <b>Anexos:</b>\
                                    <ul>\
                                        " + anexos + "<br>\
                                    </ul>\
                                </p>\
                            </div>";
                }
                // DIOGO
                /*else {
                    throw "Favor Anexar o Boleto a ser pago."
                }*/
            }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Viagem") {
            html +=
                "<br>\
					<b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
					<b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoViagem") + "</br>\
                    <b>Data Aprovada para o Adiantamento: </b>" + hAPI.getCardValue("DataSolicAdiantamentoViagem") + "</br>\
					<b>Justificativa: </b>" + hAPI.getCardValue("Justificativa") + "</br>";
        }
        html += "\
			</p>\
		</div>\
        <br>";
        html += "<div class='DescrMsgForum actions'>\
			<br />\
			<p class='DescrMsgForum'> Para mais detalhes, <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>clique aqui.</a></p>\
		</div>";

        var data = {
            companyId: getValue("WKCompany").toString(),
            serviceCode: 'ServicoFluig',
            endpoint: '/api/public/alert/customEmailSender',
            method: 'post',
            timeoutService: '100',
            params: {
                to: BuscaRemetentes(),
                from: "fluig@construtoracastilho.com.br", //Prod
                //from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[FLUIG] Solicitação Aprovada - Suporte Financeiro - " + hAPI.getCardValue("CategoriaAlteracao"),
                templateId: "TPL_SUPORTE_TI2",
                dialectId: "pt_BR",
                param: {
                    "CORPO_EMAIL": html,
                    "SERVER_URL": url,
                    "TENANT_ID": "1"
                }
            }
        }

        var clientService = fluigAPI.getAuthorizeClientService();
        var vo = clientService.invoke(JSONUtil.toJSON(data));

        if (vo.getResult() == null || vo.getResult().isEmpty()) {
            throw "Retorno está vazio";
        } else {
            //log.info(vo.getResult());
        }
        //log.info("Fim envia email");
    } catch (error) {
        throw "Erro ao enviar e-mail de notificação: " + error;
    }
}

function EnviaNotificacaoCancelada(numSolic) {
    //log.info("envia email");
    try {
        var url = 'http://fluig.castilho.com.br:1010';//Prod
        //var url = 'http:////homologacao.castilho.com.br:2020';//Homolog

        var mensagem = null;
        mensagem = "\
		<p>\
			Segue a resolução referente a solicitação\
			<a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
		</p>"

        var html = "\
		<p class='DescrMsgForum'>\
			" + mensagem + "\
		</p>\
		    <div class='DescrMsgForum actions'>\
                <p class='DescrMsgForum'>\
                <b>Solicitação Cancelada</b></br>\
                <b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
                <b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>"

        if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Pagamento") {
            var c1 = DatasetFactory.createConstraint("IDLAN", hAPI.getCardValue("IdentificadorMov"), hAPI.getCardValue("IdentificadorMov"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaLancamento", "PuxaLancamento", ConstraintType.MUST)
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2], null)

            var comentario = getValue("WKUserComment");

            if (hAPI.getCardValue("Mobile") == 'false') {
                var comentarioSplit = comentario.split("<p>");
                var splitfinal = comentarioSplit[1].split("</p>")
                //log.info("Comentario realizado: " + comentario

                html += "\
                            <br />\
                                <b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
                                <b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
                                <b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
                                <b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
                                <b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                                <b>Diferença entre Entrada e Criação: </b>" + hAPI.getCardValue("diferenca") + "</b></br>\
                                <b>Valor: </b>R$ " + hAPI.getCardValue("ValorOriginal") + "</br>\
                                <b>Motivo para o cancelamento da solicitação: </b>" + splitfinal[0] + "</br>\
                                </ul>\
                            </p>\
                        </div>\
                    <br>";
            }
            else {
                html += "\
                            <br />\
                                <b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
                                <b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
                                <b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
                                <b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
                                <b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                                <b>Diferença entre Entrada e Criação: </b>" + hAPI.getCardValue("diferenca") + "</b></br>\
                                <b>Valor: </b>R$ " + FormataValorInserir(Dataset.values[0][9]) + "</br>\
                                <b>Motivo para o cancelamento da solicitação: </b>" + comentario + "</br>\
                                </ul>\
                            </p>\
                        </div>\
                    <br>";
            }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Antecipação de Aluguel") {
            var c1 = DatasetFactory.createConstraint("IDMOV", hAPI.getCardValue("IdentificadorMovAlug"), hAPI.getCardValue("IdentificadorMovAlug"), ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("OPERACAO", "PuxaMovimentoAluguel", "PuxaMovimentoAluguel", ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("CODCOLIGADA", "coligadaMovAlug", "coligadaMovAlug", ConstraintType.MUST);
            var Dataset = DatasetFactory.getDataset("DatasetSuporteFinanceiro", null, [c1, c2, c3], null);

            var comentario = getValue("WKUserComment");

            var mensagem = null;
            mensagem = "\
    <p>\
        Segue a resolução referente a solicitação\
        <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
    </p>"

            var html = "\
    <p class='DescrMsgForum'>\
        " + mensagem + "\
    </p>\
        <div class='DescrMsgForum actions'>\
            <p class='DescrMsgForum'>\
            <b>Solicitação Cancelada</b></br>\
            <b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
            <b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>"

            if (hAPI.getCardValue("Mobile") == 'false') {
                var comentarioSplit = comentario.split("<p>");
                var splitfinal = comentarioSplit[1].split("</p>")
                //log.info("Comentario realizado: " + comentario

                html += "\
                            <br />\
                                <b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
                                <b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
                                <b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
                                <b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
                                <b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                                <b>Valor: </b>R$ " + FormataValorInserir(Dataset.values[0][10]) + "</br>\
                                <b>Motivo para o cancelamento da solicitação: </b>" + splitfinal[0] + "</br>\
                                </ul>\
                            </p>\
                        </div>\
                    <br>";
            }
            else {
                html += "\
                            <br />\
                                <b>Razão Social: </b>" + Dataset.values[0][4] + "</br>\
                                <b>CNPJ: </b>" + Dataset.values[0][3] + "</br>\
                                <b>Clifor: </b>" + Dataset.values[0][2] + "</br>\
                                <b>Centro de Custo: </b>" + Dataset.values[0][5] + " - " + Dataset.values[0][6] + "</br>\
                                <b>Número Documento: </b>" + Dataset.values[0][7] + "</b></br>\
                                <b>Valor: </b>R$ " + FormataValorInserir(Dataset.values[0][10]) + "</br>\
                                <b>Motivo para o cancelamento da solicitação: </b>" + comentario + "</br>\
                                </ul>\
                            </p>\
                        </div>\
                    <br>";
            }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Pagamento de Fornecedores") {
            var comentario = getValue("WKUserComment");

            var mensagem = null;
            mensagem = "\
            <p>\
            Segue a resolução referente a solicitação\
            <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
            </p>"

            var html = "\
            <p class='DescrMsgForum'>\
            " + mensagem + "\
            </p>\
            <div class='DescrMsgForum actions'>\
            <p class='DescrMsgForum'>\
            <b>Solicitação Cancelada</b></br>\
            <b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
            <b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>"

            if (hAPI.getCardValue("Mobile") == 'false') {
                var comentarioSplit = comentario.split("<p>");
                var splitfinal = comentarioSplit[1].split("</p>")
                //log.info("Comentario realizado: " + comentario

                html +=
                    "<br>\
                    <b>Fornecedor: </b>" + hAPI.getCardValue("NomeECnpjFornecedor") + "</br>\
                    <b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
                    <b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
                    <b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoFornece") + "</br>\
                    <b>Motivo para o cancelamento da solicitação: </b>" + splitfinal[0] + "</br>\
                    </ul>\
                </p>\
            </div>\
            <br>"
            }
            else {
                html += "\
                            <br />\
                            <b>Fornecedor: </b>" + hAPI.getCardValue("NomeECnpjFornecedor") + "</br>\
                            <b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
                            <b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
                            <b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoFornece") + "</br>\
                                <b>Motivo para o cancelamento da solicitação: </b>" + comentario + "</br>\
                                </ul>\
                            </p>\
                        </div>\
                    <br>";
            }
        }
        else if (hAPI.getCardValue("CategoriaAlteracao") == "Adiantamento de Viagem") {
            var comentario = getValue("WKUserComment");

            var mensagem = null;
            mensagem = "\
            <p>\
            Segue a resolução referente a solicitação\
            <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
            </p>"

            var html = "\
            <p class='DescrMsgForum'>\
            " + mensagem + "\
            </p>\
            <div class='DescrMsgForum actions'>\
            <p class='DescrMsgForum'>\
            <b>Solicitação Cancelada</b></br>\
            <b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
            <b>Categoria:</b> " + hAPI.getCardValue('CategoriaAlteracao') + "</br>"

            if (hAPI.getCardValue("Mobile") == 'false') {
                var comentarioSplit = comentario.split("<p>");
                var splitfinal = comentarioSplit[1].split("</p>")
                //log.info("Comentario realizado: " + comentario
                html +=
                    "<br>\
                    <b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
					<b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
					<b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoViagem") + "</br>\
                    <b>Motivo para o cancelamento da solicitação: </b>" + splitfinal[0] + "</br>\
                    </ul>\
                </p>\
            </div>\
            <br>"
            }
            else {
                html += "\
                <br />\
                    <b>Centro De Custo: </b>" + hAPI.getCardValue("CentroCustoAdiantamento") + "</br>\
                    <b>Departamento: </b>" + hAPI.getCardValue("DepartamentoAdiantamento") + "</br>\
                    <b>Valor: </b>R$ " + hAPI.getCardValue("ValorAdiantamentoViagem") + "</br>\
                    <b>Motivo para o cancelamento da solicitação: </b>" + comentario + "</br>\
                    </ul>\
                    </p>\
                </div>\
            <br>";
            }
        }
        html += "\
        </p>\
    </div>\
    <br>";

        /*var anexos = BuscaAnexos();
            if (anexos != false && anexos != "") {
                html += 
                "<div class='DescrMsgForum'>\
                    <p class='DescrMsgForum'>\
                        <b>Anexos:</b>\
                        <ul>\
                            " + anexos + "<br>\
                        </ul>\
                    </p>\
                </div>";
            }*/

        html += "<div class='DescrMsgForum actions'>\
			<br />\
			<p class='DescrMsgForum'> Para mais detalhes, <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>clique aqui.</a></p>\
		</div>";

        var data = {
            companyId: getValue("WKCompany").toString(),
            serviceCode: 'ServicoFluig',
            endpoint: '/api/public/alert/customEmailSender',
            method: 'post',
            timeoutService: '100',
            params: {
                to: BuscaRemetentes(),
                from: "fluig@construtoracastilho.com.br", //Prod
                //from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[FLUIG] Solicitação Cancelada - Suporte Financeiro - " + hAPI.getCardValue("CategoriaAlteracao"),
                templateId: "TPL_SUPORTE_TI2",
                dialectId: "pt_BR",
                param: {
                    "CORPO_EMAIL": html,
                    "SERVER_URL": url,
                    "TENANT_ID": "1"
                }
            }
        }

        var clientService = fluigAPI.getAuthorizeClientService();
        var vo = clientService.invoke(JSONUtil.toJSON(data));

        if (vo.getResult() == null || vo.getResult().isEmpty()) {
            throw "Retorno está vazio";
        } else {
            //log.info(vo.getResult());
        }
        //log.info("Fim envia email");
    } catch (error) {
        throw "Erro ao enviar e-mail de notificação: " + error;
    }
}

function FormataData(data) {
    data = data.split("-");
    var retorno = data[2] + "/" + data[1] + "/" + data[0];
    return retorno;
}

function FormataValorInserir(valor) {
    var numero = parseFloat(valor);
    numero = numero.toFixed(2).split(".");
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
}

function BuscaRemetentes() {
    return "gabriel.persike@castilho.com.br"
    var usuario = hAPI.getCardValue('usuario');
    var solicitante = hAPI.getCardValue('solicitante');
    var emailsCopia = hAPI.getCardValue("email");
    var mail = hAPI.getCardValue("mail");
    var atividade = getValue('WKNumState');

    var listRemetentes = "financeiro@castilho.com.br; ";//Prod
    listRemetentes += "diogo.franca@castilho.com.br; "

    if (atividade == 0 || atividade == 4) {
        listRemetentes += hAPI.getCardValue("emailCoordenadorOperacional")
        listRemetentes += "; ";
    }
    if (hAPI.getCardValue("TMVLan") == '1.2.22') {
        listRemetentes += "contabilidade@castilho.com.br; "
    }
    if (atividade == 21) {
        //log.info("Teria entrado no if")
        listRemetentes += "rodrigo.ramos@castilho.com.br; ";//Homolog
    }
    else if (atividade == 5 || atividade == 14) {
        listRemetentes += hAPI.getCardValue("emailGerenteContratos");
        listRemetentes += "; ";
        listRemetentes += hAPI.getCardValue("emailCoordenadorOperacional")
        listRemetentes += "; ";
    }

    if (emailsCopia != null && emailsCopia != "" && emailsCopia != undefined) {
        listRemetentes += emailsCopia;
    }

    if (listRemetentes.substring(listRemetentes.length - 2, listRemetentes.length) == "; ") {
        listRemetentes = listRemetentes.substring(0, listRemetentes.length - 2);
    }

    if (listRemetentes.substring(listRemetentes.length - 1, listRemetentes.length) == ";" || listRemetentes.substring(listRemetentes.length - 1, listRemetentes.length) == " ") {
        listRemetentes = listRemetentes.substring(0, listRemetentes.length - 1);
    }

    log.info("ListRemetentes: " + listRemetentes);
    return listRemetentes;
}

function BuscaAnexos() {
    var retorno = "";
    var docs = hAPI.listAttachments();

    for (var i = 0; i < docs.size(); i++) {
        var doc = docs.get(i);
        retorno += "<li><a href='" + fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()) + "'>" + doc.getDocumentDescription() + "</a></li>"
    }

    return retorno;
}

/*function atualizaDadosPagFornecedor(){
    var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('CodColigada');
	var codColForn = hAPI.getCardValue('codColForn');
	var codForn = hAPI.getCardValue('CodCfo');
	var idPagForn = hAPI.getCardValue('idPgto');
    idPagForn = parseInt(idPagForn)
    idPagForn = idPagForn + 1;
	var descricaoPag = hAPI.getCardValue('descricaoPag');
	var bancoPag = hAPI.getCardValue('bancoPag');
	var agenciaPag = hAPI.getCardValue('agenciaPag');
	var digAgenciaPag = hAPI.getCardValue('digAgenciaPag');
	var contaPag = hAPI.getCardValue('contaPag');
	var digContaPag = hAPI.getCardValue('digContaPag');
	var favorecidoPag = hAPI.getCardValue('favorecidoPag');
	favorecidoPag = favorecidoPag.split("&").join("&amp;");
	var cpfCnpjPag = hAPI.getCardValue('cpfCnpjPag');	
	var tipoPag = hAPI.getCardValue('tipoPag');
	
	var newXml = new String;
	newXml +="<FinDadosPgtoBR>";	
		newXml +="<FDadosPgto>";
			newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
			newXml +="<CODCOLCFO>0</CODCOLCFO>";
			newXml +="<CODCFO>"+ codForn +"</CODCFO>";
			newXml +="<FORMAPAGAMENTO>T</FORMAPAGAMENTO>";
			newXml +="<IDPGTO>"+ idPagForn +"</IDPGTO>";
			newXml +="<DESCRICAO>"+ descricaoPag +"</DESCRICAO>";
			newXml +="<NUMEROBANCO>"+ bancoPag +"</NUMEROBANCO>";
			newXml +="<CODIGOAGENCIA>"+ agenciaPag +"</CODIGOAGENCIA>";
			newXml +="<DIGITOAGENCIA>"+ digAgenciaPag +"</DIGITOAGENCIA>";
			newXml +="<CONTACORRENTE>"+ contaPag +"</CONTACORRENTE>";
			newXml +="<DIGITOCONTA>"+ digContaPag +"</DIGITOCONTA>";
			newXml +="<FAVORECIDO>"+ favorecidoPag +"</FAVORECIDO>";
			newXml +="<CGCFAVORECIDO>"+ cpfCnpjPag +"</CGCFAVORECIDO>";
			newXml +="<TIPOCONTA>"+ tipoPag +"</TIPOCONTA>";
			newXml +="<ATIVO>1</ATIVO>";
		newXml +="</FDadosPgto>";
	newXml +="</FinDadosPgtoBR>";	
	
	log.info("XML ATUALIZA DADOS PAG = "+newXml);
	
    var c1 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("pUsuarioExec", usuario, usuario, ConstraintType.MUST);
    var constraints = new Array(c1,c2,c3);
    var retorno = DatasetFactory.getDataset("AtualizaDadosPagFornec", null, constraints, null);

    log.info("RETORNO = "+retorno.values[0][1]);

    if (!retorno || retorno == "" || retorno == null) 
    {
    	throw "Houve um erro na comunicação com o webservice. Tente novamente!";
    }
    else if (retorno.values[0][0] == "false") 
	{
		throw "Não foi possível atualizar o lançamento. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
	}
	else
	{
		hAPI.setCardValue("resultadoMsg", retorno.values[0][1]);
	}
	
}*/