listUsuarios = null;
listMails = null;
$(document).ready(function () {

  BuscaListaEmailSuperiores();
  var atividade = $("#atividade").val();
  var formMode = $("#formMode").val();


  if (formMode == 'ADD') {
    FLUIGC.popover('.popoverDicaIndetificadorLançamento',{trigger: 'hover', placement: 'bottom', html:true, });
    FLUIGC.popover('.popoverDicaIndetificadorMovimento',{trigger: 'hover', placement: 'bottom', html:true, });
    
    FLUIGC.calendar("#data_alteracao");
    $("#data_alteracao").on('blur', function() {
      if ($("#data_alteracao").val() == $("#DataDeHoje").val()) {
        verificarHoraLocalMaiorQueBrasilia();
      }
    })
    FLUIGC.calendar("#data_alteracaoAluguel");
    $("#data_alteracaoAluguel").on('blur', function() {
      if ($("#data_alteracaoAluguel").val() == $("#DataDeHoje").val()) {
        verificarHoraLocalMaiorQueBrasilia();
      }
    })
    FLUIGC.calendar("#DataSolicAdiantamento");
    FLUIGC.calendar("#DataSolicAdiantamentoViagem");
    var usuario = $("#solicitante").val()
    $("#usuario").val(usuario)
    $("#usuario" ).addClass("ViewOnly");
    $("#usuario").attr('readonly', true);
    BuscaFornecedor().then(fornecedor => {
      fornecedor.values.forEach(fornece => {
        if (fornece.CNPJ == "") {
          $("#datalistFornecedor").append("<option value='" + fornece.FORNECEDOR + "'></option>")
        }
        else {
          $("#datalistFornecedor").append("<option value='" + fornece.CNPJ + " - " + fornece.FORNECEDOR + "'></option>")
        }
      });
    });
    BuscaDepartamentos().then(options => {
      $("#DptoAdiantamentoFornece").html(options);
      $("#DptoAdiantamentoViagem").html(options);
    })
    $("#CentroDeCustoAdiantViagem").html(BuscaObras());
    $("#CentroDeCustoAdiantFornece").html(BuscaObras());

    $("#CategoriaAlteracao").on('change', function () {
      if ($("#CategoriaAlteracao").val() == '') {
        $("#divAntecipaPagamentos").slideUp();
        $("#divAntecipaAluguel").slideUp();
        $("#divAdiantamentoFornecedor").slideUp();
        $("#divAdiantamentoViagem").slideUp();
      }
      else if ($("#CategoriaAlteracao").val() == 'Antecipação de Pagamento') {
        $("#divAntecipaPagamentos").slideDown();
        $("#divAntecipaAluguel").slideUp();
        $("#divAdiantamentoFornecedor").slideUp();
        $("#divAdiantamentoViagem").slideUp();
        $("#CategoriaChamado").val("AntecipaPagamento")
        $("#IdentificadorMov").mask("00000000");
        $("#IdentificadorMov").on('change', function () {
          BuscaLancamentos();
          AtribuiSuperiores();
        })
      }
      else if ($("#CategoriaAlteracao").val() == 'Antecipação de Aluguel') {
        //console.log("Entrou no If show aluguel")
        $("#divAntecipaAluguel").slideDown();
        $("#divAntecipaPagamentos").slideUp();
        $("#divAdiantamentoFornecedor").slideUp();
        $("#divAdiantamentoViagem").slideUp();
        $("#IdentificadorMovAlug").mask("0000000000");
        $("#CategoriaChamado").val("AntecipaAluguel")
        $("#IdentificadorMovAlug").on('change', function () {
          BuscaLancamentosAlug();
          AtribuiSuperiores();
        })
      }
      else if ($("#CategoriaAlteracao").val() == 'Adiantamento de Pagamento de Fornecedores') {
        $("#divAdiantamentoFornecedor").slideDown();
        $("#divAntecipaAluguel").slideUp();
        $("#divAntecipaPagamentos").slideUp();
        $("#divAdiantamentoViagem").slideUp();
        $("#CentroDeCustoAdiantFornece").on('change', function() {
          AtribuiSuperiores();
        })
        $("#ValorAdiantamentoFornece").keypress(function() {
          $(this).mask('###.###.###.###,00', {reverse: true});
        });
        $("#NomeECnpjFornecedor").on('blur', function(){
          var ValorcGCGFO = $("#NomeECnpjFornecedor").val().split(" - ")[0];
          $("#HiddenCNPJ").val($("#NomeECnpjFornecedor").val().split(" - ")[0]);
          BuscaDestinoDePagamento(ValorcGCGFO, $("#CodColigada").val());
        })
        $("#CentroDeCustoAdiantFornece").on('blur', function () {
          $("#CentroCustoAdiantamento").val($("#CentroDeCustoAdiantFornece").val());
          $("#CodColigada").val($("#CentroDeCustoAdiantFornece").val().split(" - ")[0]);
          BuscaDestinoDePagamento($("#HiddenCNPJ").val(), $("#CodColigada").val());
        })
        $("#DptoAdiantamentoFornece").on('change', function () {
          $("#DepartamentoAdiantamento").val($("#DptoAdiantamentoFornece").val())
        })
        $("#FormaPgtoFornece").on("change", function () {
          if ($(this).val() == "009 - Depósito") {
            if ($("#spanNumeroBancoFornecedor").text() == '') {
              AbreModal();
              $("#modalPag2").on('change', function () {
                if ($("#modalPag2").val() == "") {
                  $("#modalPag1").val("")
                }
                else{
                  BuscaBancos()
                }
              })
            }
            else{
              $("#divInformacoesDeposito").slideDown();
              $("#FornecedorExistente").slideDown();
            }
          }
          else {
              $("#divInformacoesDeposito").slideUp();
              $("#FornecedorExistente").slideUp();
              $("#NovoFornecedor").slideUp();
          }

          if ($(this).val() == "001 - Cheque Curitiba") {
            FLUIGC.toast({
              message: "Favor Anexar o Boleto a ser pago na aba Anexos.",
              type: "info",
          });
          }
        });
        $("#botaoAtualizar").on('click', function() {
          AbreModalPreenchido();
          $("#modalPag2").on('change', function () {
            if ($("#modalPag2").val() == "") {
              $("#modalPag1").val("");
            }
            else{
              BuscaBancos()
            }
          })
        })
      }
      else if ($("#CategoriaAlteracao").val() == 'Adiantamento de Viagem') {
        $("#divAdiantamentoViagem").slideDown();
        $("#divAntecipaAluguel").slideUp();
        $("#divAntecipaPagamentos").slideUp();
        $("#divAdiantamentoFornecedor").slideUp(); 
        $("#CentroDeCustoAdiantViagem").on('change', function() {
          AtribuiSuperiores();
        })
        $("#ValorAdiantamentoViagem").keypress(function() {
          $(this).mask('###.###.###.###,00', {reverse: true});
        });
        $("#CentroDeCustoAdiantViagem").on('change', function () {
          $("#CentroCustoAdiantamento").val($("#CentroDeCustoAdiantViagem").val())
        })
        $("#DptoAdiantamentoViagem").on('change', function () {
          $("#DepartamentoAdiantamento").val($("#DptoAdiantamentoViagem").val())
        })
      }
    })
  }
  else if (formMode == 'MOD') {
    FLUIGC.calendar("#data_alteracao");
    FLUIGC.calendar("#data_alteracaoAluguel");
    FLUIGC.calendar("#DataSolicAdiantamento");
    FLUIGC.calendar("#DataSolicAdiantamentoViagem");
    BloqueiaCamposInfoChamado();
    $("#DptoAdiantamentoFornece").hide();
    $("#CentroDeCustoAdiantFornece").hide();
    $("#CentroDeCustoAdiantViagem").hide();
    $("#DptoAdiantamentoViagem").hide();
    $("#usuario").text($("#solicitante").val());
    $("#Aprov").show();

    if ($("#CategoriaAlteracao").val() == "Antecipação de Pagamento") {
      formatDateMobile($("#data_alteracao").val());
      if (atividade == 5) {
        FLUIGC.calendar("#data_alteracao");
        $("#Aprov").show();
        $("#Valida").hide();
        if ($("#opcaoValida").val() == 'sim') {
          $("#Validada").show()
        }
        else{
          $("#NaoValidada").show()
        }
      }
      $("#Opcoes, #StrongOpcoes").hide();
      BuscaLancamentos();
      $("#divAntecipaPagamentos").show();
    }
    else if ($("#CategoriaAlteracao").val() == "Antecipação de Aluguel") {
      formatDateMobile($("#data_alteracaoAluguel").val());
      if (atividade == 5) {
        FLUIGC.calendar("#data_alteracaoAluguel");
        $("#Aprov").show();
        $("#Valida").hide();
        if ($("#opcaoValida").val() == 'sim') {
          $("#AluguelValidada").show()
        }
        else{
          $("#AluguelNaoValidada").show()
        }
      }
      $("#Opcoes, #StrongOpcoes").hide();
      BuscaLancamentosAlug()
      $("#divAntecipaAluguel").show();
    }
    else if ($("#CategoriaAlteracao").val() == "Adiantamento de Pagamento de Fornecedores") {
      $("#Opcoes, #StrongOpcoes").hide();
      $("#SibCCustoAdiant").text($("#CentroCustoAdiantamento").val());
      $("#SibDptoAdiant").text($("#DepartamentoAdiantamento").val());
      $("#divAdiantamentoFornecedor").show();
      if ($("#FormaPgtoFornece").val() == "009 - Depósito") {
        $("#divInformacoesDeposito").show();
        BuscaDestinoDePagamento($("#HiddenCNPJ").val(), $("#CodColigada").val());
        $("#FornecedorExistente").show();
      }
    }
    else if ($("#CategoriaAlteracao").val() == "Adiantamento de Viagem"){
      if (atividade == 5) {
        FLUIGC.calendar("#DataSolicAdiantamentoViagem");
        $("#Aprov").show();
        $("#Valida").hide();
        if ($("#opcaoValida").val() == 'sim') {
          $("#ViagemAluguelValidada").show()
        }
        else{
          $("#ViagemAluguelNaoValidada").show()
        }
      }
      $("#Opcoes, #StrongOpcoes").hide();
      $("#SibCCustoViagem").text($("#CentroCustoAdiantamento").val());
      $("#SibDptoViagem").text($("#DepartamentoAdiantamento").val());
      $("#divAdiantamentoViagem").show();
    }

    $('input[type="radio"][name="aprovar"]').change(function() {
      radioValue = $(this).val(); // Armazena o valor selecionado na variável
      $("#opcaoSelec").val(radioValue);
    });

    $('input[type="radio"][name="validar"]').change(function() {
      radioValue = $(this).val(); // Armazena o valor selecionado na variável
      $("#opcaoValida").val(radioValue);
    });


    if (atividade == 14) {
      $("#Aprov").hide();
      $("#Valida").hide();
    }

    if (atividade == 21) {
      $("#Aprov").hide();
      $("#Valida").show();
    }

  }
  else if (formMode == 'VIEW') {
    $("#DptoAdiantamentoFornece").hide();
    $("#CentroDeCustoAdiantFornece").hide();
    if ($("#CategoriaAlteracao").text() == "Alteração de Data de Pagamento a Fornecedores") {
      $("#divAntecipaPagamentos").show();
      BuscaLancamentos();
    }
    else if ($("#CategoriaAlteracao").text() == "Alteração de Data de Pagamento de Aluguel") {
      $("#divAntecipaAluguel").show();
      BuscaLancamentosAlug();
    }
    else if ($("#CategoriaAlteracao").text() == "Adiantamento de Pagamento a Fornecedores") {
      $("#SibCCustoAdiant").text($("#CentroCustoAdiantamento").val());
      $("#SibDptoAdiant").text($("#DepartamentoAdiantamento").val());
      $("#divAdiantamentoFornecedor").show();
      if ($("#FormaPgtoFornece").text() == "009 - Depósito") {
        //console.log("Entrou no if show fornecedor")
        $("#divInformacoesDeposito").show();
        BuscaDestinoDePagamento($("#HiddenCNPJ").val(), $("#CodColigada").val());
        $("#divInformacoesDeposito").show();
        $("#FornecedorExistente").show();
      }
    }
    else if ($("#CategoriaAlteracao").text() == "Adiantamento de Viagem"){
      $("#divAdiantamentoViagem").show();
    }
  }

  bindings();
});

function bindings(){
  $("#coligadaMovAlug").on("change", function(){
    //Copia o valor da Coligada selecionada pro Campo CodColigada usado em Integrações e no Mecanismo do Aprovador
    $("#CodColigada").val($(this).val());
  });
}