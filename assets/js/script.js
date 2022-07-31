const displayMessage = document.getElementById("displayMessage");
const newAmount = document.getElementById("newAmount");
const chosenCurrencyOption = document.getElementById("currency");
const btnConversion = document.getElementById("btnConversion");
const apiURL = "https://mindicador.cl/api";
const apiValues = [];
const container = document.getElementsByClassName("container");

/* llamado a función que renderiza la maqueta solicitada en el DOM*/
renderCurrencies();

// funcion asincrona para obtener monedas
async function getCurrencies() {
    try {
        const res = await fetch(apiURL);
        const data = await res.json();
        return data;
    /*Req N°4 - Se usa try catch para ejecutar el método fetch y capturar los posibles errores
                mostrando el error en el DOM en caso de que haya problemas.*/    
    } catch (e) { 
        container[0].innerHTML = `
        <div class="container"><h1 style="color: white; text-align: center; padding-top: 290px">
        Ups! <br> <br> 
        something went wrong while fetching API data... <br> <br> 
        try later!</h1></div>
        `;
    }
}

// funcion renderizar los tipos de moneda que tiene la api en el dom
async function renderCurrencies() {
    const currencies = await getCurrencies();
    let template = `<option value="empty" style="color: rgb(188, 188, 204) !important">Seleccione Moneda</option>`;
    for (let [key, value] of Object.entries(currencies)) {
        if (key == "dolar" || key == "euro") {

            /* Req N°1 - Se obtienen los tipos de cambio desde mindicador.cl*/
            apiValues.push({ apiCurrency: value.codigo, apiValue: value.valor});
            /* Req N°3 - El select implementa más de un tipo de moneda*/
            template += `<option style="color: black !important; background: white !important;" id="chosenCurrencyOption" value="${value.codigo}">${value.codigo}</option>`; //original
        }
    }
    chosenCurrencyOption.innerHTML = template;
    newAmount.value = "";
}

btnConversion.addEventListener("click", () => {
    let result = 0;
    console.log(`valores de listener ${newAmount.value} y ${chosenCurrencyOption.value}`); 
    if (newAmount.value != "" && (chosenCurrencyOption.value == "dolar" || chosenCurrencyOption.value == "euro")){
            if (newAmount.value < 1){ 
                displayMessage.innerHTML = "¡Intente un monto superior!";
                return false;
            } else {
                result = calc(newAmount.value, chosenCurrencyOption.value);
                //llamado a función que estira el container hacia abajo dejando espacio al grafico
                enlargeContainer();
                renderGrafica();
                if (chosenCurrencyOption.value == "dolar") {
                    result = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result);
                    displayMessage.innerHTML = `Resultado:  ${result}.-`;
                } else {
                    result = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(result);
                    displayMessage.innerHTML = `Resultado:  ${result}.-`;
                }
            }
     } else if (newAmount.value != "" && (chosenCurrencyOption.value == "empty")) {
            if (newAmount.value < 1) { 
                displayMessage.innerHTML = "¡Intente monto superior y escoja moneda!";
                return false;
            } else {
                displayMessage.innerHTML = "¡Escoja moneda para convertir!";
                return false;
            }
     } else if (newAmount.value == "" && (chosenCurrencyOption.value == "dolar" || chosenCurrencyOption.value == "euro")) {
        displayMessage.innerHTML = "¡Ingrese monto a convertir!";
       return false;
     } else if (newAmount.value == "" && chosenCurrencyOption.value == "empty") {
       displayMessage.innerHTML = "¡Ingrese monto y escoja moneda!";
       renderCurrencies();
       return false;
    }
});
validateKey = (evt) => {
    // code is the decimal ASCII representation of the pressed key.
    var code = (evt.which) ? evt.which : evt.keyCode;
    if(code==8 || (code>=48 && code<=57)) { 
      return true;
    } else{ // other keys.
        newAmount.innerHTML = "";
        displayMessage.innerHTML = "...";
      return false;
    }
};

newAmount.addEventListener("click", () => {
    newAmount.innerHTML = "";
    displayMessage.innerHTML = "...";
    const container = document.getElementsByClassName("containerPostEvent");
    container[0].setAttribute("class", "container");
    renderCurrencies();
});

/* Req N°2 - Se calcula correctamente el cambio y se muestra en el DOM */
calc = (amount, currencyOption) => {
let result = 0;
    apiValues.forEach(indexApiArray => {
        if (indexApiArray.apiCurrency == currencyOption) {
            result = amount / indexApiArray.apiValue;
        }
    });
    return result; 
};

//función que estira el container hacia abajo dejando espacio al grafico
enlargeContainer = () => {
container[0].setAttribute("class", "containerPostEvent");
};

/*****************************************************************************************************/
/*                             Req N°5 - Se Implementa el gráfico pedido                             */ 
/**************************************    GRAFICA   *************************************************/
/*           codigo implementado pero no integrado con el programa de buena manera                   */
/*****************************************************************************************************/

async function getMonedas() {
    const apiURLChart = "https://mindicador.cl/api";
    const res = await fetch(apiURLChart);
    const monedas = await res.json();
    return monedas;
}

function prepararConfiguracionParaLaGrafica(monedas) {
    // Creamos las variables necesarias para el objeto de configuración
    const tipoDeGrafica = "line";
    const titulo = "Fluctuación moneda";
    const colorDeLinea = "red";
    let fechas = [];
    let valores = [];
    let date = "";
    let day = ""; 
    let month = "";
    let year = "";

    for (let [key, value] of Object.entries(monedas)) {
        if (typeof value.fecha === 'undefined') {
            console.log(`soy undefined------->${fechas}`); 
         } else {
            date = new Date(value.fecha);
            date = date.toDateString();
            fechas.push(date);
            valores.push(value.valor);
         }
    }

    // Creamos el objeto de configuración usando las variables anteriores
        const config = {
            type: tipoDeGrafica,
            data: {
                labels: fechas,
                datasets: [{
                    label: titulo,
                    backgroundColor: colorDeLinea,
                    data: valores                    
                }]
            }
        };
        return config;
}

async function renderGrafica() {
    const monedas = await getMonedas();
    const config = prepararConfiguracionParaLaGrafica(monedas);
    const chartDOM = document.getElementById("myChart");
    new Chart(chartDOM, config);
    }
