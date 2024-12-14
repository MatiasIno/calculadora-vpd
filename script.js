let currentUnit = 'C';

function setUnit(unit) {
    currentUnit = unit;
    const btnC = document.getElementById('btnC');
    const btnF = document.getElementById('btnF');
    const temperatureField = document.getElementById('temperature');
    const temperatureLabel = document.getElementById('temperatureLabel');

    if (unit === 'C') {
        btnC.classList.add('active');
        btnF.classList.remove('active');
        temperatureField.placeholder = "Ingresa la temperatura en °C";
        temperatureLabel.textContent = "Temperatura (°C):";
    } else {
        btnF.classList.add('active');
        btnC.classList.remove('active');
        temperatureField.placeholder = "Ingresa la temperatura en °F";
        temperatureLabel.textContent = "Temperatura (°F):";
    }
    validateInputs();
}

function validateInputs() {
    const temperature = parseFloat(document.getElementById('temperature').value);
    const humidity = parseInt(document.getElementById('humidity').value);
    const button = document.getElementById('calculateButton');

    const isTemperatureValid = !isNaN(temperature) &&
        ((currentUnit === 'C' && temperature >= -30 && temperature <= 50) ||
         (currentUnit === 'F' && temperature >= -22 && temperature <= 999.9));
    const isHumidityValid = !isNaN(humidity) && humidity >= 1 && humidity <= 100;

    if (isTemperatureValid && isHumidityValid) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', 'true');
    }
}

document.getElementById('temperature').addEventListener('input', validateInputs);
document.getElementById('temperature').addEventListener('blur', function() {
    let value = parseFloat(this.value);
    if (!isNaN(value)) {
        this.value = value.toFixed(1).replace(',', '.');
    }
    validateInputs();
});

document.getElementById('humidity').addEventListener('input', function() {
    const maxLength = 3;
    if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength);
    }
    validateInputs();
});

function calculateVPD() {
    const stage = document.getElementById('stage').value;
    let temperature = parseFloat(document.getElementById('temperature').value);
    const humidity = parseInt(document.getElementById('humidity').value);

    if (currentUnit === 'F') {
        temperature = (temperature - 32) * 5 / 9; // Convertir a °C
    }

    const saturationVaporPressure = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const actualVaporPressure = saturationVaporPressure * (humidity / 100);
    const vpd = (saturationVaporPressure - actualVaporPressure).toFixed(2);

    const resultBox = document.getElementById('result');
    const suggestionBox = document.getElementById('suggestion');
    const warningBox = document.getElementById('warning');

    let minVPD, maxVPD, tempRange, humidityRange;
    switch (stage) {
        case 'clonacion':
            minVPD = 0.4; maxVPD = 0.8;
            tempRange = [20, 25]; humidityRange = [70, 85];
            break;
        case 'vegetacion':
            minVPD = 0.8; maxVPD = 1.2;
            tempRange = [22, 28]; humidityRange = [60, 75];
            break;
        case 'floracion_estiramiento':
            minVPD = 1.0; maxVPD = 1.4;
            tempRange = [24, 29]; humidityRange = [50, 70];
            break;
        case 'floracion_engorde':
            minVPD = 1.2; maxVPD = 1.6;
            tempRange = [24, 30]; humidityRange = [45, 60];
            break;
    }

    const tempIdeal = temperature >= tempRange[0] && temperature <= tempRange[1];
    const humidityIdeal = humidity >= humidityRange[0] && humidity <= humidityRange[1];

    let emoji = vpd >= minVPD && vpd <= maxVPD ? "✔️" : "❌"; // Determinar el emoji
    let vpdMessage = `<p>VPD Calculado: <strong>${vpd} kPa ${emoji}</strong></p>`;

    if (vpd >= minVPD && vpd <= maxVPD) {
        if (!tempIdeal) {
            let tempSuggestion = temperature < tempRange[0]
                ? `Sube la temperatura a al menos ${currentUnit === 'F' ? ((tempRange[0] + 1) * 9 / 5 + 32).toFixed(1) : tempRange[0] + 1}°${currentUnit}.`
                : `Baja la temperatura a menos de ${currentUnit === 'F' ? ((tempRange[1] - 1) * 9 / 5 + 32).toFixed(1) : tempRange[1] - 1}°${currentUnit}.`;
            vpdMessage += `<p>${tempSuggestion}</p>`;
        }
        if (!humidityIdeal) {
            let humiditySuggestion = humidity < humidityRange[0]
                ? `Sube la humedad relativa a al menos ${humidityRange[0] + 1}%.`
                : `Baja la humedad relativa a menos de ${humidityRange[1] - 1}%.`;
            vpdMessage += `<p>${humiditySuggestion}</p>`;
        }
    } else {
        if (!tempIdeal) {
            let tempSuggestion = temperature < tempRange[0]
                ? `Sube la temperatura a al menos ${currentUnit === 'F' ? ((tempRange[0] + 1) * 9 / 5 + 32).toFixed(1) : tempRange[0] + 1}°${currentUnit}.`
                : `Baja la temperatura a menos de ${currentUnit === 'F' ? ((tempRange[1] - 1) * 9 / 5 + 32).toFixed(1) : tempRange[1] - 1}°${currentUnit}.`;
            vpdMessage += `<p>${tempSuggestion}</p>`;
        }
        if (!humidityIdeal) {
            let humiditySuggestion = humidity < humidityRange[0]
                ? `Sube la humedad relativa a al menos ${humidityRange[0] + 1}%.`
                : `Baja la humedad relativa a menos de ${humidityRange[1] - 1}%.`;
            vpdMessage += `<p>${humiditySuggestion}</p>`;
        }
    }

    resultBox.innerHTML = `<p class="${vpd >= minVPD && vpd <= maxVPD ? "success" : "error"}">${vpdMessage}</p>`;

    warningBox.innerHTML = "";
    if (humidity > 80 && temperature < 20) {
        warningBox.innerHTML = `<p>⚠️ Alta humedad y baja temperatura favorecen hongos. Ventila.</p>`;
    } else if (humidity > 80 && temperature > 30) {
        warningBox.innerHTML = `<p>⚠️ Alta humedad y alta temperatura favorecen plagas. Reduce humedad.</p>`;
    } else if (humidity < 40 && temperature > 30) {
        warningBox.innerHTML = `<p>⚠️ Baja humedad y alta temperatura generan estrés hídrico. Aumenta humedad.</p>`;
    } else if (humidity < 40 && temperature < 20) {
        warningBox.innerHTML = `<p>⚠️ Baja temperatura y humedad ralentizan el crecimiento. Ajusta ambos.</p>`;
    }
}

function updateVPDInfo() {
    const stage = document.getElementById('stage').value;
    const vpdInfo = document.getElementById('vpdInfo');

    let minVPD, maxVPD;
    switch (stage) {
        case 'clonacion':
            minVPD = 0.4; maxVPD = 0.8;
            break;
        case 'vegetacion':
            minVPD = 0.8; maxVPD = 1.2;
            break;
        case 'floracion_estiramiento':
            minVPD = 1.0; maxVPD = 1.4;
            break;
        case 'floracion_engorde':
            minVPD = 1.2; maxVPD = 1.6;
            break;
    }

    vpdInfo.textContent = `VPD rango óptimo ${minVPD} - ${maxVPD} kPa`;
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registrado con éxito.'))
        .catch((error) => console.error('Error al registrar el Service Worker:', error));
}

