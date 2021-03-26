let MBIT_UART_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase(); //to send TO the microbit
let MBIT_UART_RX_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase(); //to send TO the microbit
let MBIT_UART_TX_CHARACTERISTIC = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase(); //to receive data FROM the microbit

// HTML elements
let connectButton = document.getElementById("connectButton");
let helloButton = document.getElementById("helloButton");
let logRegion = document.createElement("transient");
document.querySelector("#ui").append(logRegion);
let canvas = document.querySelector("#theCanvas");
let context = canvas.getContext('2d');
context.fillStyle  = "Red";

let logCount = 0;
function appendToLog(moreText) {
    logCount += 1;
    logRegion.innerHTML += `${logCount}:  ${moreText}  <br>`;
}
let ourMicrobitUART;
let bluetoothSearchOptions = {
    filters: [{
            namePrefix: "BBC micro:bit",
        }],
    optionalServices: [MBIT_UART_SERVICE]
};
class MicroBitUART {
    constructor(rxCharacteristic, txCharacteristic) {
        this.messageSubscribers = [];
        this.rxCharacteristic = rxCharacteristic;
        this.txCharacteristic = txCharacteristic;
        this.decoder = new TextDecoder();
        this.txCharacteristic.startNotifications().then(characteristic => {
            characteristic.addEventListener('characteristicvaluechanged', ev => {
                let value = (event.target).value;
                let valueAsString = new TextDecoder().decode(value);
                this.handleNewMessage(valueAsString);
            });
        });
    }
    subscribeToMessages(receiver) {
        this.messageSubscribers.push(receiver);
    }
    handleNewMessage(message) {
        this.messageSubscribers.forEach(subscriber => {
            subscriber(message);
        });
    }
    send(key, value) {
        let kvstring = `${key}^${value}#`;
        let encoder = new TextEncoder('utf-8');
        let encoded = encoder.encode(kvstring);
        this.rxCharacteristic.writeValue(encoded);
        appendToLog("Sent >>>> " + kvstring);
    }
}

//On Connect-button click
function connectClicked(e) {
    navigator.bluetooth.requestDevice(bluetoothSearchOptions).then(device => {
        appendToLog(`Found:  ${device.name}`);
        return device.gatt.connect();
    }).then(server => {
        appendToLog("...connected!");
        return server.getPrimaryService(MBIT_UART_SERVICE);
    }).then(service => {
        return Promise.all([service.getCharacteristic(MBIT_UART_RX_CHARACTERISTIC),
            service.getCharacteristic(MBIT_UART_TX_CHARACTERISTIC)]);
    }).then(rxandtx => {
        let rx;
        let tx;
        [rx, tx] = rxandtx;
        ourMicrobitUART = new MicroBitUART(rx, tx);
        appendToLog("Made a UART!!");
        startReadingFromUART(ourMicrobitUART);
    }).catch(error => {
        console.log(error);
    });
}
function startReadingFromUART(mbit) {
    mbit.subscribeToMessages(handleData);
}
function helloClicked(e) {
    ourMicrobitUART.send("hello", "microsoft");
}

// Called everytime something is recieved from the micro:bit
function handleData(message) {
	if (message === "Button A") {
    console.log("Buttton A");
  } else if (message === "Button B") {
    
  } else {
    let data = message.split(",");
    let x = Number(data[0]);
    let y = Number(data[1]);
    let z = Number(data[2]);
    let speed = Number(data[3]);

    // Update canvas based on data from the micro:bit
    context.clearRect(0, 0, canvas.width, canvas.height);
    x = (canvas.width / 2) + (x / 1024) * canvas.width;
    y = (canvas.height / 2) + (y / 1024) * canvas.height;
    context.fillRect(x, y, 10, 10);
  }
}

// Hook up buttons with functions
connectButton.onclick = connectClicked;
helloButton.onclick = helloClicked;