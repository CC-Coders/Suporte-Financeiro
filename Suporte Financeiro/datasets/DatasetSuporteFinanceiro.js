function defineStructure() {

}
function onSync(lastSyncDate) {
}
function createDataset(fields, constraints, sortFields) {

    //var codColigada = null;
    var operacao = null;
    var myQuery = null; 

    if (constraints != null) {
        for (i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == 'OPERACAO') {
                operacao = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'IDLAN') {
                IDLAN = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'IDMOV') {
                IDMOV = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CGCCFO'){
                CGCCFO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODCOLIGADAPAGAMENTO'){
                CODCOLIGADAPAGAMENTO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'NUMBANCO'){
                NUMBANCO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODCOLIGADA'){
                CODCOLIGADA = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODCCUSTO'){
                CODCCUSTO = constraints[i].initialValue;
            }
        }
    }

    if (operacao == 'PuxaLancamento') {
        myQuery = "\
    SELECT\
        FLAN.CODCOLIGADA,\
        FLAN.IDLAN,\
        FCFO.CODCFO,\
        FCFO.CGCCFO,\
        FCFO.NOMEFANTASIA,\
        FLANRATCCU.CODCCUSTO,\
        GCCUSTO.NOME as NOMECC,\
        FLAN.NUMERODOCUMENTO,\
        DATAPREVBAIXA,\
        VALORORIGINAL\
    FROM\
        FLAN\
        INNER JOIN FCFO ON FLAN.CODCFO = FCFO.CODCFO\
        INNER JOIN FLANRATCCU ON FLAN.IDLAN= FLANRATCCU.IDLAN\
        INNER JOIN GCCUSTO ON GCCUSTO.CODCCUSTO = FLANRATCCU.CODCCUSTO\
    WHERE\
        FLAN.IDLAN='" + IDLAN + "'\
        AND GCCUSTO.ATIVO = 'T'\
        "
    }

    if (operacao == 'PuxaLancamentoComMovimento') {
        myQuery = "\
    SELECT\
        FLAN.CODCOLIGADA,\
        FLAN.IDLAN,\
        FCFO.CODCFO,\
        FCFO.CGCCFO,\
        FCFO.NOMEFANTASIA,\
        FLANRATCCU.CODCCUSTO,\
		GCCUSTO.NOME as NOMECC,\
        FLAN.NUMERODOCUMENTO,\
        DATAPREVBAIXA,\
        TMOV.DATACRIACAO,\
		TMOV.DATAEMISSAO,\
		TMOV.DATASAIDA,\
        VALORORIGINAL,\
        TMOV.CODTMV\
    FROM\
        FLAN\
        INNER JOIN FCFO ON FLAN.CODCFO = FCFO.CODCFO\
		INNER JOIN TMOV ON FLAN.IDMOV = TMOV.IDMOV\
		INNER JOIN FLANRATCCU ON FLAN.IDLAN= FLANRATCCU.IDLAN\
		INNER JOIN GCCUSTO ON GCCUSTO.CODCCUSTO = FLANRATCCU.CODCCUSTO\
    WHERE\
		FLAN.IDLAN = '" + IDLAN + "'\
		AND	FLAN.CODCOLIGADA='" + CODCOLIGADA + "'\
		AND TMOV.CODCOLIGADA='" + CODCOLIGADA + "'\
		AND FLANRATCCU.CODCOLIGADA='" + CODCOLIGADA + "'\
		AND FLANRATCCU.CODCOLIGADA='" + CODCOLIGADA + "'\
		AND GCCUSTO.CODCOLIGADA='" + CODCOLIGADA + "'\
        "
    }

    if (operacao == 'PuxaMovimentoAluguel') {
        myQuery = "\
    SELECT\
        FLAN.CODCOLIGADA,\
        IDLAN,\
        FLAN.IDMOV,\
        FCFO.CODCFO,\
        FCFO.CGCCFO,\
        FCFO.NOMEFANTASIA,\
        TMOVRATCCU.CODCCUSTO,\
        GCCUSTO.NOME AS CENTRODECUSTO,\
        FLAN.NUMERODOCUMENTO,\
        DATAPREVBAIXA,\
        TMOV.DATACRIACAO,\
		TMOV.DATAEMISSAO,\
		TMOV.DATASAIDA,\
        FLAN.VALORORIGINAL,\
        TMOV.CODTMV\
    FROM \
        FLAN\
        INNER JOIN TMOVRATCCU ON TMOVRATCCU.IDMOV = FLAN.IDMOV AND FLAN.CODCOLIGADA = TMOVRATCCU.CODCOLIGADA\
        INNER JOIN GCCUSTO ON GCCUSTO.CODCCUSTO = TMOVRATCCU.CODCCUSTO AND GCCUSTO.CODCOLIGADA = FLAN.CODCOLIGADA\
        INNER JOIN FCFO ON FLAN.CODCFO = FCFO.CODCFO\
        INNER JOIN TMOV ON FLAN.IDMOV = TMOV.IDMOV AND TMOV.CODCOLIGADA = FLAN.CODCOLIGADA \
    WHERE \
        FLAN.IDMOV = '"+ IDMOV +"'\
        AND TMOV.CODTMV = '1.2.06'\
        AND GCCUSTO.ATIVO = 'T'\
        AND TMOV.CODCOLIGADA = "+CODCOLIGADA+"\
    ";
    }

    if (operacao == 'EmailSuperiores') {
        myQuery = "\
        SELECT * FROM viewPerfilUsuarioAprovacao\
    "
    }

    if (operacao == 'AtribuiSuperior') {
        myQuery = "\
    SELECT\
        codusuarioFluig,\
        perfil,\
        codcoligada,\
        limite\
    FROM\
        viewPerfilUsuarioAprovacao\
    WHERE\
    codcoligada ='" + CODCOLIGADA + "'\
    AND limite > 1\
	AND codusuarioFluig not in ('claudio','josemario')\
    AND perfil = '"+ CODCCUSTO +"'\
    "
    }

    if (operacao == 'BuscaFornecedor') {
        myQuery = "SELECT FCFO.CODCOLIGADA, FCFO.CODCFO, FCFO.NOMEFANTASIA as FORNECEDOR, FCFO.CGCCFO as CNPJ FROM FCFO"
    }

    if (operacao == 'BuscaDestinoDePagamento') {
        myQuery = "\
    SELECT\
        FDADOSPGTO.IDPGTO,\
        FDADOSPGTO.CODCOLIGADA,\
        NUMEROBANCO,\
        CODIGOAGENCIA,\
        DIGITOAGENCIA,\
        CONTACORRENTE,\
        DIGITOCONTA,\
        TIPOCONTA,\
        FAVORECIDO,\
        CGCFAVORECIDO,\
        FDADOSPGTO.FORMAPAGAMENTO,\
        FCFO.CODCOLIGADA,\
        FCFO.CODCFO,\
        FCFO.NOMEFANTASIA as FORNECEDOR,\
        FCFO.CGCCFO as CNPJ\
    FROM\
        FDADOSPGTO\
        INNER JOIN FCFO ON FDADOSPGTO.CODCFO = FCFO.CODCFO\
    WHERE\
		FDADOSPGTO.CODCOLIGADA = '"+ CODCOLIGADAPAGAMENTO +"'\
        AND FCFO.CGCCFO ='"+ CGCCFO +"'\
        AND FDADOSPGTO.ATIVO = '1'\
    "
    }

    if (operacao == 'BuscaBancos') {
        myQuery = "\
    SELECT \
        NUMBANCO,\
        NOME,\
        NUMEROOFICIAL\
    FROM\
        GBANCO\
    WHERE\
        NUMBANCO='"+ NUMBANCO +"'\
    "
    }

    log.info('myQuery' + myQuery)

    return ExcutaQuery(myQuery);

}
function onMobileSync(user) {

}
function ExcutaQuery(myQuery){
    var newDataset = DatasetBuilder.newDataset();
	var dataSource = "/jdbc/FluigRM"; // nome da conexão usada no standalone
	var ic = new javax.naming.InitialContext();
	var ds = ic.lookup(dataSource);
    var created = false;
    try {
		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		var rs = stmt.executeQuery(myQuery);
		var columnCount = rs.getMetaData().getColumnCount();
		while (rs.next()) {
			if (!created) {
				for (var i = 1; i <= columnCount; i++) {
					newDataset.addColumn(rs.getMetaData().getColumnName(i));
				}
				created = true;
			}
			var Arr = new Array();
			for (var i = 1; i <= columnCount; i++) {
				var obj = rs.getObject(rs.getMetaData().getColumnName(i));
				if (null != obj) {
					Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
				} else {
					Arr[i - 1] = "---";
				}
			}
			newDataset.addRow(Arr);
		}

	} catch (e) {
		log.error("ERRO==============> " + e.message);
	} 
    finally {
		if (stmt != null) {
			stmt.close();
		}
		if (conn != null) {
			conn.close();
		}
	}
    return newDataset;
}