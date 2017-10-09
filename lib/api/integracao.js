'use strict';

var request = require('request');

if (!Array.prototype.includes) {
    Array.prototype.includes = function() {
        'use strict';
        return Array.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

var APIParser = function(messageToUser, callback, partial) {

	var index = partial == undefined ? 0 : partial;
	var find = /PRINTINFO--(.*)--/g;
	var match = find.exec(messageToUser.output.text[index]);
	var api;

	// Verificação de palavrões, política e religião e outras instituições
	var palavrao = false;
	var politica = false;
	var outras = false;
	var finalizar_conversa = false;
	messageToUser.entities.forEach(function(entidade){
		if (entidade.entity == "outrasinstituicoes")
			outras = true;
		if (entidade.entity == "politica" || entidade.entity == "religiao")
			politica = true;
	    if (entidade.entity == "palavrao") {
			palavrao = true;
			messageToUser.context.palavroes != null ? messageToUser.context.palavroes = messageToUser.context.palavroes + 1 : messageToUser.context.palavroes = 1;
		}
		if(entidade.entity == "finalizar_conversa")
			finalizar_conversa = true;
	});
	if (messageToUser.context.palavroes > 1) {
		messageToUser.context.encerrar = true;
		messageToUser.output.text = "Infelizmente, terei que encerrar nossa conversa.";
		callback(null, messageToUser);
		return
	}
	if (palavrao) {
		messageToUser.output.text = "Ops! Identifiquei uma palavra que não é legal, caso isto se repita, estou treinada a encerrar nossa conversa. De quais informações do Senac você precisa?<br>";
		callback(null, messageToUser);
		return
	}
	if (outras && !politica) {
		// Verificar se é intenção institucional ou sobre o chat
		if (messageToUser.intents[0].intent == "onde_mora" ||
			messageToUser.intents[0].intent == "desconto" ||
			messageToUser.intents[0].intent == "politica_preco" ||
			messageToUser.intents[0].intent == "trabalhe_conosco" ||
			messageToUser.intents[0].intent == "novas_ues" ||
			messageToUser.intents[0].intent == "quem_somos" ||
			messageToUser.intents[0].intent == "gostos" ||
			messageToUser.intents[0].intent == "funcionalidades" ||
			messageToUser.intents[0].intent == "quem_e_voce")
		{
			messageToUser.output.text = "Desculpe, não acho ético falar de outras empresas. Podemos falar somente do Senac?<br>";
			callback(null, messageToUser);
			return
		} else {
			messageToUser.output.text = "Desculpe, não acho ético falar de outras empresas. Podemos falar somente do Senac?<br>";
			callback(null, messageToUser);
			return
		}
	}
	if (politica) {
		messageToUser.output.text = "Desculpe, não estou treinada para falar sobre assuntos que não sejam o Senac. Como posso te ajudar?<br>";
		callback(null, messageToUser);
		return
	}

	if ( (messageToUser.output.text[index].match(/.*atendente.*/) && (messageToUser.output.text[index].match(/.*transf.*/) || messageToUser.output.text[index].match(/.*aguarde.*/))) || messageToUser.output.text[index].match(/.*agradece seu contato.*/) || messageToUser.output.text[index].match(/.*canal de atendimento do Senac São Paulo.*/)) {
		messageToUser.context.encerrar = true;
		messageToUser.output.text[index] += "<div id='loading'></div>";
	}

	if (finalizar_conversa){
		messageToUser.output.text = "";
		messageToUser.context.tchau = true;
		callback(null, messageToUser);
		return
	}
	// Fim da verificação de palavrões


	if (match != null) {

	switch(match[1]){

	  case 'UNI.COD':
	    request('http://senac-mvp-api.mybluemix.net/unidade/'+messageToUser.context.unidade, function(error, response, body) {
	      if (error) {
	        console.log(error);
	      } else {
	        var bodyParsed = JSON.parse(body);
	        api = "A unidade fica na "+bodyParsed.dscEnder+", número "+bodyParsed.dscEnderNumero+", "
	        +bodyParsed.dscBairro+", "+bodyParsed.dscCidade+". O telefone é ("+bodyParsed.dddTelefone+") "+bodyParsed.numTelefone+".<br>Seu horário de funcionamento é: de segunda a sexta-feira, das 8 às 21 horas, e aos sábados, das 8 às 14 horas.";
	        var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	        messageToUser.output.text[index] = str2;
	        callback(null, messageToUser);
	      }
	    });                
	  	break;

	  case 'CURSOS.LIVRES':
	    request('http://senac-mvp-api.mybluemix.net/cursos/livre', function(error, response, body) {
	      if (error) {
	        console.log(error);
	      } else {
	        var bodyParsed = JSON.parse(body);
	        api = "";
	        bodyParsed.nomProduto.forEach(function(curso){
	          api = api + curso + ", ";
	        });

	        var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	        messageToUser.output.text[index] = str2;
	        callback(null, messageToUser);
	      }
	    });
	  break;

	  case 'CURSOS.TECNICOS':
	    request('http://senac-mvp-api.mybluemix.net/cursos/tecnico', function(error, response, body) {
	      if (error) {
	        console.log(error);
	      } else {
	        var bodyParsed = JSON.parse(body);
	        api = "";
	        bodyParsed.nomProduto.forEach(function(curso){
	          api = api + curso + ", ";
	        });

	        var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	        messageToUser.output.text[index] = str2;
	        callback(null, messageToUser);
	      }
	    });
	  break;

	  case 'RESPOSTA.TROCA.UNIDADE':
	  	var curso = messageToUser.context.curso;
	  	var siglaUnidade = messageToUser.context.unidade;
	  	var unidade;
	  	api = "";
	  	switch (siglaUnidade){
	  		case "TIT":
	  			unidade = 'Senac Lapa Tito';
	  		break;
	  		case "SJC":
	  			unidade = 'Senac São José dos Campos';
	  		break;
	  		case "TBS":
	  			unidade = 'Senac Taboão da Serra';
	  		break;
	  		case "MAR":
	  			unidade = 'Senac Marília';
	  		break;
	  		case "PPR":
	  			unidade = 'Senac Presidente Prudente';
	  		break;
	  		case "RIC":
	  			unidade = 'Senac Rio Claro';
	  		break;
	  	}
	  	api = "Você quer informações do curso "+curso+" na unidade "+unidade+" ou em outra unidade?";
	  	var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  	messageToUser.output.text[index] = str2;
	  	callback(null, messageToUser);
	  break;

	  case 'LISTAR.UNIDADES':
	    var curso = messageToUser.context.curso;
	    request('http://senac-mvp-api.mybluemix.net/cursos/unidades/'+curso, function(error, response, body) {
	      if (error) {
	        console.log(error);
	      } else {
	        var bodyParsed = JSON.parse(body);
	        api = "";
	        if(bodyParsed != null){
	        	api = "<br><ul>";
	        	var unidades = [];
	         	bodyParsed.nomUnidade.forEach(function(unidade){
	            	api = api +"<li> - "+ unidade + "</li>";
	            	unidades.push(unidade);
	         	});
     		  	messageToUser.context.siglas = unidades.map(function(unidade){
			  		switch (unidade){
			  			case 'Senac Lapa Tito':
			  				return "TIT";
			  			case 'Senac São José dos Campos':
			  				return "SJC";
			  			case 'Senac Taboão da Serra':
			  				return "TBS";
			  			case 'Senac Marília':
			  				return "MAR";
			  			case 'Senac Presidente Prudente':
			  				return "PPR";
			  			case 'Senac Rio Claro':
			  				return "RIC";
		  			}
			  	})
	         	api = api + "</ul>";
	        }
	        var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	        messageToUser.output.text[index] = str2;
	        callback(null, messageToUser);
	      }
	    });
	  break;

	  case 'RESPOSTA.SOBRE.CURSO.GERAL':
	  	var modalidade = messageToUser.context.modalidade;
	  	var intencao = messageToUser.context.intencao;
	  	var curso = messageToUser.context.curso;

	  	if (curso) {
	  		//Substituir modalidade, depois trocar pelas chamadas da API
	  		var cursos_livres = ["Excel 2016 - Avançado","Maquiador","Design De Sobrancelhas","Excel 2016"];
	  		var cursos_tecnicos = ["Técnico Em Estética","Técnico Em Administração","Técnico Em Segurança Do Trabalho","Técnico Em Informática","Técnico Em Podologia","Técnico Em Enfermagem"];

	  		modalidade = cursos_tecnicos.includes(curso) ? "técnico" : cursos_livres.includes(curso) ? "livre" : null;
	  		messageToUser.context.modalidade = modalidade;
	  	};

	  	switch(modalidade){
	  		case 'livre':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/livre/'+curso, function(error, response, body) {
	  			  	  if (error) {
	  			  	    console.log(error);
	  			  	  } else {
	  			  	    var bodyParsed = JSON.parse(body);
	  			  	    
	  			  	    //console.log(bodyParsed[0].descricao);	  	    
	  			  	    api = "";
	  			  	    if(bodyParsed != null){
	  						switch(intencao){
	  							case 'carga_horaria':
	  							api = 'A carga horária é de: '+bodyParsed[0].cargaHoraria+' horas';
	  							break;

	  							case 'certificacao':
	  							api = "O Senac confere certificado de conclusão do curso aos alunos aprovados.<br>";
	  							break;

	  							case 'materiais':
	  								if(bodyParsed[0].listaMateriais == null){
	  									api = "Para esse curso, não há lista de materiais prevista, informe-se com o professor no primeiro dia de aula sobre a necessidade de aquisição.<br>";
	  								} else {
	  									api = bodyParsed[0].listaMateriais;		
	  								}	  							
	  							break;

	  							case 'Método':
	  							api = bodyParsed[0].metodo;
	  							break;

	  							case 'objetivo':
	  							api = bodyParsed[0].descricao;
	  							break;

	  							case 'pre_requisitos':
	  							if(bodyParsed[0].preRequisito == null){
	  								if(bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima+", "+"idade: "+bodyParsed[0].idadeMinima+" anos";
	  								}
	  								if(bodyParsed[0].escolaridadeMinima && !bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima;
	  								}
	  								if(!bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Idade: "+bodyParsed[0].idadeMinima+" anos";
	  								}

	  							} else{
	  								if(bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima+", "+"idade: "+bodyParsed[0].idadeMinima+" anos";
	  								}
	  								if(bodyParsed[0].escolaridadeMinima && !bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima;
	  								}
	  								if(!bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  								api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>"+"Idade: "+bodyParsed[0].idadeMinima+" anos";	
	  								}
	  							}
	  							break;

	  							case 'programa':
	  							api = bodyParsed[0].programa;
	  							break;

	  							case 'unidade':
	  								messageToUser.output.text[index] = 'No momento, o curso está disponível em: PRINTINFO--LISTAR.UNIDADES-- <br>Para prosseguir escolha uma das unidades acima.<br>Caso essas opções não lhe atendam, clique <a href="http://www.sp.senac.br">aqui</a> para registrar seu interesse.';
	  								APIParser(messageToUser, callback, index);
	  								return;
	  							break;

	  							case 'estagio':
	  								api = "Esse curso não possui estágio.";
	  							break;

	  							case 'documentacao':
	  								api = "Para realizar a matrícula é necessário:<br>"+bodyParsed[0].documentos+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'existe':
	  								api = "Temos diversos cursos em diferentes áreas. Clique <a href=\" http://www.sp.senac.br\" target=\"_blank\"> aqui</a> e confira em nosso site  as áreas em que atuamos.<br>Qual desses cursos você se interessa?"
	  							break;

	  							default:
	  						}
	  			  	    }
	  			  	    
	  			  	    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  	    messageToUser.output.text[index] = str2;
	  			  	    callback(null, messageToUser);
	  			  	  }
	  			  	});
	  		break;

	  		case 'técnico':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/tecnico/'+curso, function(error, response, body) {
	  			  	  if (error) {
	  			  	    console.log(error);
	  			  	  } else {
	  			  	    var bodyParsed = JSON.parse(body);	  	    
	  			  	    api = "";
	  			  	    if(bodyParsed != null){
	  						switch(intencao){
	  							case 'carga_horaria':
	  							api = 'A carga horária é de: '+bodyParsed[0].cargaHoraria+' horas';
	  							break;

	  							case 'certificacao':
	  							api = "Àquele que concluir com aprovação todas as unidades curriculares do curso e comprovar a conclusão do Ensino Médio, será conferido o Diploma de Técnico, com validade nacional.<br>";
	  							break;

	  							case 'materiais':
	  								if(bodyParsed[0].listaMateriais == null){
	  									api = "Para esse curso, não há lista de materiais prevista, informe-se com o professor no primeiro dia de aula sobre a necessidade de aquisição.<br>";
	  								} else {
	  									api = bodyParsed[0].listaMateriais;		
	  								}
	  							break;

	  							case 'Método':
	  							api = bodyParsed[0].metodo;
	  							break;

	  							case 'objetivo':
	  							api = bodyParsed[0].descricao;
	  							break;

	  							case 'pre_requisitos':
	  								if(bodyParsed[0].preRequisito == null){
	  									if(bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  										api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima+", "+"idade: "+bodyParsed[0].idadeMinima+" anos";
	  									}
	  									if(bodyParsed[0].escolaridadeMinima && !bodyParsed[0].idadeMinima){
	  										api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima;
	  									}
	  									if(!bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  										api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>Idade: "+bodyParsed[0].idadeMinima+" anos";
	  									}

	  								} else{
	  									if(bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  										api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima+", "+"idade: "+bodyParsed[0].idadeMinima+" anos";
	  									}
	  									if(bodyParsed[0].escolaridadeMinima && !bodyParsed[0].idadeMinima){
	  										api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>Escolaridade: "+bodyParsed[0].escolaridadeMinima;
	  									}
	  									if(!bodyParsed[0].escolaridadeMinima && bodyParsed[0].idadeMinima){
	  									api ="Para realizar o curso, é necessário atender aos seguintes pré-requisitos:<br>"+bodyParsed[0].preRequisito+"<br>"+"Idade: "+bodyParsed[0].idadeMinima+" anos";	
	  									}
	  								}  							
	  							break;

	  							case 'programa':
	  							api = bodyParsed[0].programa;
	  							break;

	  							case 'unidade':
	  								messageToUser.output.text[index] = 'No momento, o curso está disponível em: PRINTINFO--LISTAR.UNIDADES-- <br>Para prosseguir escolha uma das unidades acima.<br>Caso essas opções não lhe atendam, clique <a href="http://www.sp.senac.br">aqui</a> para registrar seu interesse.';
	  								APIParser(messageToUser, callback, index);
	  								return;	  								
	  							break;

	  							case 'estagio':
	  							switch(curso){
	  								case "Técnico Em Informática":
	  								case "Técnico Em Administração":
	  								case "Técnico Em Estética":
	  								case "Técnico Em Segurança Do Trabalho":
	  								case "Técnico Em Podologia":
	  									api = "Para esse curso o estágio não é obrigatório.<br>O aluno que optar por realizá-lo será orientado pela Coordenação do Curso diretamente na unidade.<br>"
	  								break;

	  								case"Técnico Em Enfermagem":
	  									api = bodyParsed[0].estagio;
	  								break;
	  							}
	  							break;

	  							case 'documentacao':
	  								api = "Para realizar a matrícula é necessário:<br>"+bodyParsed[0].documentos+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'existe':
	  								api = "Temos diversos cursos técnicos em diferentes áreas. Clique <a href=\" http://www.sp.senac.br\" target=\"_blank\"> aqui</a> e confira as áreas em que atuamos em nosso site.<br>Qual desses cursos você se interessa?"
	  							break;

	  							default:
	  						}
	  			  	    }
	  			  	    
	  			  	    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  	    messageToUser.output.text[index] = str2;
	  			  	    callback(null, messageToUser);
	  			  	  }
	  			  	});
	  		break;

	  		default:
	  	}
	  break;

	  case 'INPUT.TURMA':
	  	var turmas = messageToUser.context.turmas;
	  	var regex = /(\d+)/g;
	  	if (messageToUser.context.turmas != null){
		var selecionada = regex.exec(messageToUser.input.text)[1] - 1;
		messageToUser.context.turma = turmas[selecionada].codOferta;
		}
		messageToUser.context.turmas = null;
		messageToUser.output.text[index] = null;
		APIParser(messageToUser, callback, 1);
	  break

	  case 'LISTAR.TURMAS':
	  	var modalidade = messageToUser.context.modalidade;
	  	var intencao = messageToUser.context.intencao;
	  	var curso = messageToUser.context.curso;
	  	var unidade = messageToUser.context.unidade;

	  	if (curso) {
	  		//Substituir modalidade, depois trocar pelas chamadas da API
	  		var cursos_livres = ["Excel 2016 - Avançado","Maquiador","Design De Sobrancelhas","Excel 2016"];
	  		var cursos_tecnicos = ["Técnico Em Estética","Técnico Em Administração","Técnico Em Segurança Do Trabalho","Técnico Em Informática","Técnico Em Podologia","Técnico Em Enfermagem"];
	  		modalidade = cursos_tecnicos.includes(curso) ? "técnico" : cursos_livres.includes(curso) ? "livre" : null;
	  		messageToUser.context.modalidade = modalidade;
	  	};

	  	switch(modalidade){
	  		case 'livre':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/livre/'+unidade+'/'+curso, function(error, response, body) {
	  			  	  if (error) {
	  			  	    console.log(error);
	  			  	  } else {
	  			  	    var bodyParsed = JSON.parse(body); 	    
	  			  	    api = "";
	  			  	    if(bodyParsed != null){
	  			  	    	if (bodyParsed.length == 0) {
	  			  	    	    //api =  "O curso não está disponível na unidade de seu interesse.<br>";
	  			  	    	    messageToUser.output.text[index] = 'O curso não está disponível na unidade de seu interesse.<br>Seguem abaixo as unidades com turmas disponíveis:<br> PRINTINFO--LISTAR.UNIDADES-- <br>Para prosseguir escolha uma das unidades acima.<br>Caso essas opções não lhe atendam, clique <a href="http://www.sp.senac.br">aqui</a> para registrar seu interesse.';
	  			  	    	    APIParser(messageToUser, callback, index);
	  			  	    	    return;	  	
	  			  	    	} else { 
	  			  	    		api = "As turmas disponíveis são:<br><ul>";
	  			  	    		for (var i =0;i<bodyParsed.length;i++) {
	  			  	    	   		api = api + "<li> " + (i+1) + " - " +" Data de início: "+bodyParsed[i].datInicio+" Data de término: "+bodyParsed[i].datFim+" <br>"+bodyParsed[i].diasDaSemana+", das "+bodyParsed[i].horaInicio.slice(11)+" até as "+bodyParsed[i].horaTermino.slice(11)+";</li>";
	  			  	    	   	}
	  			  	    	   	api = api +'<br>Digite o número da turma de interesse para prosseguir.<br>Caso essas opções não lhe atendam, clique<a href="http://www.sp.senac.br" target="_blank"> aqui</a> para registrar seu interesse.';
	  			  	    	}
	  			  	    	api = api + "<br>";
	  			  	    	messageToUser.context.turmas = bodyParsed;
	  			  	    }	  	    
	  			  	    
	  			  	    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  	    messageToUser.output.text[index] = str2;
	  			  	    callback(null, messageToUser);
	  			  	  }
	  			  	});
	  		break;

	  		case 'técnico':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/tecnico/'+unidade+'/'+curso, function(error, response, body) {
	  			  		  if (error) {
	  			  		    console.log(error);
	  			  		  } else {
	  			  		    var bodyParsed = JSON.parse(body); 	    
	  			  		    api = "";
	  			  		    if(bodyParsed != null){
	  			  		    	if (bodyParsed.length == 0) {
	  			  		    	    //api =  "O curso não está disponível na unidade de seu interesse.<br>";
	  			  		    	    messageToUser.output.text[index] = 'O curso não está disponível na unidade de seu interesse.<br>Seguem abaixo as unidades com turmas disponíveis:<br> PRINTINFO--LISTAR.UNIDADES-- <br>Para prosseguir escolha uma das unidades acima.<br>Caso essas opções não lhe atendam, clique <a href="http://www.sp.senac.br">aqui</a> para registrar seu interesse.';
	  			  		    	    APIParser(messageToUser, callback, index);
	  			  		    	    return;
	  			  		    	} else { 
	  			  		    		api = "As turmas disponíveis são:<br><ul>";
	  			  		    		for (var i =0;i<bodyParsed.length;i++) {
	  			  		    	   		api = api + "<li> " + (i+1) + " - " +" Data de início: "+bodyParsed[i].datInicio+" Data de término: "+bodyParsed[i].datFim+" <br>"+bodyParsed[i].diasDaSemana+", das "+bodyParsed[i].horaInicio.slice(11)+" até as "+bodyParsed[i].horaTermino.slice(11)+";</li>";
	  			  		    	   	}
	  			  		    	   	api = api +'<br>Digite o número da turma de interesse para prosseguir.<br>Caso essas opções não lhe atendam, clique<a href="http://www.sp.senac.br" target="_blank"> aqui</a> para registrar seu interesse.';
	  			  		    	}
	  			  		    	api = api + "<br>";
	  			  		    	messageToUser.context.turmas = bodyParsed;
	  			  		    }	  			  	    
	  			  		    
	  			  		    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  		    messageToUser.output.text[index] = str2;
	  			  		    callback(null, messageToUser);
	  			  		  }
	  			  		});
	  		break;

	  		default:
	  	}
	  break;

	  case 'RESPOSTA.SOBRE.CURSO.ESPECIFICO':
	  	var modalidade = messageToUser.context.modalidade;
	  	var intencao = messageToUser.context.intencao;
	  	var curso = messageToUser.context.curso;
	  	var unidade = messageToUser.context.unidade;
	  	var informacoes_oferecimento = messageToUser.context.informacoes_oferecimento;
	  	//turma eh o codigoOferta selecionado pelo usuario quando eles seleciona uma das turmas listadas
	  	var turma = messageToUser.context.turma;

	  	if (curso) {
	  		//Substituir modalidade, depois trocar pelas chamadas da API
	  		var cursos_livres = ["Excel 2016 - Avançado","Maquiador","Design De Sobrancelhas","Excel 2016"];
	  		var cursos_tecnicos = ["Técnico Em Estética","Técnico Em Administração","Técnico Em Segurança Do Trabalho","Técnico Em Informática","Técnico Em Podologia","Técnico Em Enfermagem"];

	  		modalidade = cursos_tecnicos.includes(curso) ? "técnico" : cursos_livres.includes(curso) ? "livre" : null;
	  		messageToUser.context.modalidade = modalidade;
	  	};

	  	switch(modalidade){
	  		case 'livre':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/livre/'+unidade+'/'+curso+'/'+turma, function(error, response, body) {
	  			  	  if (error) {
	  			  	    console.log(error);
	  			  	  } else {
	  			  	    var bodyParsed = JSON.parse(body);
	  			  	    api = "";
	  			  	    if(bodyParsed != null){
	  			  	    	// teste trocar o indice
	  						switch(intencao){
	  							case 'data':
	  							api = "Data de início: "+bodyParsed[0].datInicio+", Data de término: "+bodyParsed[0].datFim+"<br>" + bodyParsed[0].diasDaSemana + ", das " + bodyParsed[0].horaInicio.slice(11)+" até as "+bodyParsed[0].horaTermino.slice(11)+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'dias_da_semana':
	  							api = "Data de início: "+bodyParsed[0].datInicio+", Data de término: "+bodyParsed[0].datFim+"<br>" + bodyParsed[0].diasDaSemana + ", das " + bodyParsed[0].horaInicio.slice(11)+" até as "+bodyParsed[0].horaTermino.slice(11)+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'horario':
	  							api = "Data de início: "+bodyParsed[0].datInicio+", Data de término: "+bodyParsed[0].datFim+"<br>" + bodyParsed[0].diasDaSemana + ", das " + bodyParsed[0].horaInicio.slice(11)+" até as "+bodyParsed[0].horaTermino.slice(11)+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'valor':
	  							api ="O investimento desse curso é (preço promocional: de R<span>&#36</span> "+bodyParsed[0].vlrOferta+" por R<span>&#36</span> "+bodyParsed[0].vlrOfertaFinal+").<br>"+bodyParsed[0].dscCondWeb+"<br>"+"Você gostaria de receber o link para realizar sua matrícula?<br>";
	  							break;

	  							case 'venda':
	  							api = bodyParsed[0].indVendaWeb;
	  							break;

	  							case 'tem_bolsa':
	  								if (bodyParsed[0].dscTipoBolsaStb == "PSG" || bodyParsed[0].dscTipoBolsaStb == "RS") {
	  									messageToUser.output.text[index] = "Para informações sobre a disponibilidade de bolsas de estudo, por favor, aguarde enquanto transfiro para um de nossos atendentes.";
	  									messageToUser.context.encerrar = true;
										messageToUser.output.text[index] += "<div id='loading'></div>";
										callback(null, messageToUser);
										return
	  								}
	  							break;

	  							case 'unidade':
	  							api = "O que mais você gostaria de saber sobre a turma?";
	  							break;

	  							case 'existe':
	  							api = bodyParsed[0].descricao;
	  							break;

	  							case 'estagio':
	  								api = "Esse curso não possui estágio.";
	  							break;

	  							case 'documentacao':
	  								api = "Para realizar a matrícula é necessário:<br>"+bodyParsed[0].documentos+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							default:
	  						}
	  			  	    }
	  			  	    
	  			  	    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  	    messageToUser.output.text[index] = str2;
	  			  	    callback(null, messageToUser);
	  			  	  }
	  			  	});
	  		break;

	  		case 'técnico':
	  			  	request('http://senac-mvp-api.mybluemix.net/cursos/tecnico/'+unidade+'/'+curso+'/'+turma, function(error, response, body) {
	  			  	  if (error) {
	  			  	    console.log(error);
	  			  	  } else {
	  			  	    var bodyParsed = JSON.parse(body);	  	    
	  			  	    api = "";
	  			  	    if(bodyParsed != null){
	  						switch(intencao){
	  							case 'data':
	  							api = "Data de início: "+bodyParsed[0].datInicio+", Data de término: "+bodyParsed[0].datFim+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'dias_da_semana':
	  							api = bodyParsed[0].diasDaSemana+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'horario':
	  							api = "Horário de início: "+bodyParsed[0].horaInicio.slice(11)+", Horário de término: "+bodyParsed[0].horaTermino.slice(11)+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							case 'valor':
	  							api ="O investimento desse curso é (preço promocional: de R<span>&#36</span> "+bodyParsed[0].vlrOferta+" por R<span>&#36</span> "+bodyParsed[0].vlrOfertaFinal+").<br>"+bodyParsed[0].dscCondWeb+"<br>"+"Você gostaria de receber o link para realizar sua matrícula?.<br>";
	  							break;

	  							case 'venda':
	  							api = bodyParsed[0].indVendaWeb;
	  							break;

	  							case 'tem_bolsa':
		  							if (bodyParsed[0].dscTipoBolsaStb == "PSG" || bodyParsed[0].dscTipoBolsaStb == "RS") {
		  								messageToUser.output.text[index] = "Para informações sobre a disponibilidade de bolsas de estudo, por favor, aguarde enquanto transfiro para um de nossos atendentes.";
	  									messageToUser.context.encerrar = true;
										messageToUser.output.text[index] += "<div id='loading'></div>";
										callback(null, messageToUser);
										return
		  							}
	  							break;

	  							case 'unidade':
	  							api = "O que mais você gostaria de saber sobre a turma?";
	  							break;

	  							case 'existe':
	  								api = bodyParsed[0].descricao;
	  							break;

	  							case 'estagio':
									switch(curso){
										case "Técnico Em Informática":
										case "Técnico Em Administração":
										case "Técnico Em Estética":
										case "Técnico Em Segurança Do Trabalho":
										case "Técnico Em Podologia":
											api = "Para esse curso o estágio não é obrigatório.<br>O aluno que optar por realizá-lo será orientado pela Coordenação do Curso diretamente na unidade.<br>"
										break;

										case"Técnico Em Enfermagem":
											api = bodyParsed[0].estagio;
										break;
									}
	  							break;

	  							case 'documentacao':
	  								api = "Para realizar a matrícula é necessário:<br>"+bodyParsed[0].documentos+"<br><br>O que mais gostaria de saber sobre a turma?";
	  							break;

	  							default:
	  						}
	  			  	    }
	  			  	    
	  			  	    var str2 = messageToUser.output.text[index].replace(/PRINTINFO--(.*)--/g, api);
	  			  	    messageToUser.output.text[index] = str2;
	  			  	    callback(null, messageToUser);
	  			  	  }
	  			  	});
	  		break;

	  		default:
	  	}
	  break;

	  default:
	}

	} else {
		callback(null, messageToUser);
	}
}

module.exports = APIParser;