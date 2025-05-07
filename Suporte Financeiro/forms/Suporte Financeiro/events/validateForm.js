function validateForm(form){
    var msg = ""

    if (form.getValue("CategoriaChamado") == "AntecipaPagamentos" ) {
        if (form.getValue("IdentificadorMov") == "") {
            msg += "Campo Numero Referência não preeenchido. ";
        }
        
        if (form.getValue("data_alteracao") == ""){
            msg += "Data para alteração não Selecionada. "
        }
        var data = form.getValue("data_alteracao");
        var dataOcor = form.getValue("DataDeHoje")
        
        
        if(data < dataOcor){
            msg += "Data para alteração Inválida."
        }
        log.info("mensagem: " + msg); 
    }
    else if(form.getValue("CategoriaChamado") == "AntecipaAluguel"){
        if (form.getValue("IdentificadorMovAlug") == "") {
            msg += "Campo Numero Referência não preeenchido. ";
        }
        
        /*var strData = form.getValue("data_alteracaoAluguel");
        var partesData = strData.split("/");
        var data = new Date(partesData[2], partesData[1] - 1, partesData[0]);
        if(data < new Date()){
            msg += "Data para alteração Inválida."
        }*/
        log.info("mensagem: " + msg); 
    }

    if (form.getValue("usuario") == ""){
        msg += "Nenhum usuário selecionado. "
    }

    if (form.getValue("Justificativa") == ""){
        msg += "Nenhuma justificativa inserida. "
    }

    if (form.getValue("CategoriaAlteracao") == ""){
        msg += "Favor selecionar uma categoria para o chamado. "
    }

    /*if (form.getValue("emailGerenteContratos") == ""){
        msg += "Favor Inserir o Email do Gerente de Contratos responsável. "
    }

    if (form.getValue("emailCoordenadorOperacional") == ""){
        msg += "Favor Inserir o Email do Coordenador Operacional responsável. "
    }*/

    if (form.getValue("atividade") == "5") {
        if (form.getValue("aprovar") == ""|| form.getValue("aprovar") == null ) {
            msg += "Favor Aprovar ou Negar a solicitação. "
        }
        /*
        var localTime = new Date();
        var brasiliaHours = 10;
        var brasiliaMinutes = 0;
        var localHours = localTime.getHours();
        var localMinutes = localTime.getMinutes();
        if (form.getValue("CategoriaAlteracao") == "Antecipação de Pagamento") {
            var diaComparacao = form.getValue("data_alteracao").split("/")[0];
        }
        else if(form.getValue("CategoriaAlteracao") == "Antecipação de Aluguel"){
            var diaComparacao = form.getValue("data_alteracaoAluguel").split("/")[0];
        }
       
        if (localTime.getDate() == diaComparacao) {
            if (localHours > brasiliaHours || (localHours === brasiliaHours && localMinutes > brasiliaMinutes)) {
                msg += "Não é possível aprovar o pagamento após as 10:00 (Horário de Brasília). Favor selecionar outra data."
            }   
        }*/
    }

    if (form.getValue("atividade") == "21") {
        if (form.getValue("validar") == ""|| form.getValue("validar") == null ) {
            msg += "Favor Validar ou não a solicitação. "
        }
        /*
        var localTime = new Date();
        var brasiliaHours = 10;
        var brasiliaMinutes = 0;
        var localHours = localTime.getHours();
        var localMinutes = localTime.getMinutes();
        if (form.getValue("CategoriaAlteracao") == "Antecipação de Pagamento") {
            var diaComparacao = form.getValue("data_alteracao").split("/")[0];
        }
        else if(form.getValue("CategoriaAlteracao") == "Antecipação de Aluguel"){
            var diaComparacao = form.getValue("data_alteracaoAluguel").split("/")[0];
        }
       
        if (localTime.getDate() == diaComparacao) {
            if (localHours > brasiliaHours || (localHours === brasiliaHours && localMinutes > brasiliaMinutes)) {
                msg += "Não é possível aprovar o pagamento após as 10:00 (Horário de Brasília). Favor selecionar outra data."
            }   
        }*/
    }
    
    if (msg !="") {
        log.info("if: " + msg);
        throw msg;
    }
    else {
        log.info("else: " + msg);
    }
}