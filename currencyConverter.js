$(document).ready(() => {
    let date = ""
    let queryString = ""
    let symbol = "EUR"
    let currencySelect = $('#currencySelect');

    /**
     * Dynamically changes html on input
     */
    $('#currencyInput').on('input', (event) => {
        setValue(event.currentTarget.value)
    })

    /**
     * Populates dropdown list with available currencies from fixer.io
     */
    $.get('/supportedCurrencies', (response) => {
        for (let currency in response) {
            if (response.hasOwnProperty(currency)) {
                queryString = queryString.concat(`${currency},`)
                currencySelect.append(`<option value="${currency}">${response[currency]}</option>`)
                currencySelect.val(symbol)
            }
        }
        date = setHistoricalRates(queryString)
        selectRate(date, symbol)
    })

    /**
     * Selects currency rate on change
     */
    currencySelect.on('change', (event) => {
        symbol = event.currentTarget.value
        selectRate(date, symbol).then(() => {
            setValue($('#currencyInput').val())
        })
    })

    /**
     * Sets historical date on click.
     */
    $('#setDateButton').click(() => {
        date = setHistoricalRates(queryString)
        selectRate(date, symbol).then(() => {
            setValue($('#currencyInput').val())
        })
    })
});

function setValue(value) {
    $('#convertedCurrency').html(value * parseFloat($('#rateValue').html()))
}

/**
 * Sets the rates for currency conversion
 * @param date The historical date provided
 * @param value the symbol attributed to the rate
 * @returns Promise used for async purposes really. Kinda jank, but I'm on a time crunch
 */
function selectRate(date, value) {
    return $.get(`/rate?date=${date}`).then((response) => {
        $('#rateField').html(`x <span id="rateValue">${response[value]}</span>`)
    })
}

/**
 * Sets the historical rates by the date provided, validates for peroper date input
 * @param symbols the currency symbol, CAD, USD, etc.
 * @returns {string}
 */
function setHistoricalRates(symbols) {
    let day = $('#days').val()
    let month = $('#months').val()
    let year = $('#years').val()
    let querySymbols = symbols.replace(/,\s*$/, "");
    console.log()
    if (Date.parse(`${year}-${month}-${day}`) && Date.parse(`${year}-${month}-${day}`) <= Date.now()) {
        $.get(`/historicalRates?date=${year}-${month}-${day}&symbols=${querySymbols}`).fail((error) => {
            console.log(error)
        })
        $('#dateInput').css('border', 'none')
        return `${year}-${month}-${day}`
    } else {
        $('#dateInput').css('border', 'red thin solid')
    }
}