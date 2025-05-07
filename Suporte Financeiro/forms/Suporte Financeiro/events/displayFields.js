function displayFields(form, customHTML) {
	form.setValue("atividade", getValue('WKNumState'));
	form.setValue("formMode", form.getFormMode());
	form.setValue("solicitante", getValue("WKUser"));
	//var atividade = getValue('WKNumState');
	form.setValue("DataDeHoje", dataAtual())

	if(getValue('WKNumState') == 4){
        var mail = fluigAPI.getUserService().getCurrent().getEmail();
        form.setValue("emailGerenteContratos", mail);
    }

    if(getValue('WKNumState') == 21){
        var mail = fluigAPI.getUserService().getCurrent().getEmail();
        form.setValue("emailCoordenadorOperacional", mail);
    }
	
    if (getValue('WKNumState') == 5) {
        form.setValue("UsuarioRR", getValue("WKUser"));
    }

	if ( form.getMobile() != null && form.getMobile()) {
        form.setValue('Mobile', 'true');
    }
    else{
        form.setValue('Mobile', 'false');
    }
}

function dataAtual() {
    var data = new Date();
    var dia  = data.getDate();
    var mes  = data.getMonth() + 1;
    var ano  = data.getFullYear();

    dia  = (dia<=9 ? "0"+dia : dia);
    mes  = (mes<=9 ? "0"+mes : mes);

    var newData = dia+"/"+mes+"/"+ano;

    return newData;
}