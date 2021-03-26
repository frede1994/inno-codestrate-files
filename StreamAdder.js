await wpm.requireExternal("https://libraries.projects.cavi.au.dk/javascript/CaviTouch/CaviTouch.js");

let LiveElement = (await Fragment.one("#LiveElement").require()).LiveElement;

cQuery("#addStreamButton").on("click", ()=>{
    requestStream();
});

cQuery("#addCameraButton").on("click", ()=>{
    requestCameraStream();
});

async function requestStream() {
    //Request screen sharing stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
    });

    let streamContainer = setupContainer(stream);

    enableStreamSharing(streamContainer, stream);
}

async function requestCameraStream() {
    //Request screen sharing stream
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });

    let streamContainer = setupContainer(stream, "camera");

    enableStreamSharing(streamContainer, stream);
}

function setupContainer(stream, extraClass) {
    let container = document.createElement("div", {approved: true});
    container.classList.add("streamContainer");
    if(extraClass != null) {
        container.classList.add(extraClass);
    }

    WPMv2.stripProtection(container);

    document.body.appendChild(container);

    addStream(stream, container);

    return container;
}

function addStream(stream, container) {
    let video = document.createElement("video");
    video.srcObject = stream;
    video.width = 320;
    video.height = 240;
    video.play();

    container.appendChild(video);
}

function enableStreamSharing(container, stream) {
    setTimeout(()=>{
        container.webstrate.signalStream((clientId, accept) => {
            console.log("Got stream request...");
            var conn = accept(stream, () => {
                console.log("Client accepted");
                // Connection has been established.
            });
        });
    }, 0);
}

let liveStreamers = new LiveElement("div.streamContainer");

liveStreamers.forEach((streamer)=>{
    setupToolbox(streamer);

    enableToTop(streamer);

    enableDragging(streamer);

    enableOpacityChange(streamer);

    if(streamer.querySelector("video") == null) {
        requestWebRTC(streamer);
    }
});

function setupToolbox(elm) {
    let toolbox = document.createElement("div");
    toolbox.classList.add("toolbox");

    let stopButton = document.createElement("button");
    toolbox.appendChild(stopButton);
    stopButton.textContent = "Stop";

    stopButton.addEventListener("click", ()=>{
        let video = cQuery(elm).find("video")[0];
        if(video != null) {
            video.srcObject.getTracks().forEach((track)=>{
                track.stop();
            });
        }
        elm.remove();
    });
    cQuery(elm).prepend(cQuery(toolbox));
}

function enableDragging(elm) {
    new CaviTouch(elm, {
        preventDefaultEvents: ["up", "move"],
    });

    let cElm = cQuery(elm);

    cElm.on("caviDrag", (evt)=>{
        let left = parseInt(elm.style.left, 10);
        let top = parseInt(elm.style.top, 10);

        if(isNaN(left)) {
            left = 0;
        }
        if(isNaN(top)) {
            top = 0;
        }

        elm.style.left = (left+evt.detail.caviEvent.deltaPosition.x) + "px";
        elm.style.top = (top+evt.detail.caviEvent.deltaPosition.y) + "px";
    });

    let resizeElement = document.createElement("div");
    resizeElement.classList.add("resizer");
    elm.appendChild(resizeElement);

    new CaviTouch(resizeElement);
    cQuery(resizeElement).on("caviDrag", (evt)=>{
        let width = parseFloat(elm.style.width, 10);
        let height = parseFloat(elm.style.height, 10);

        if(isNaN(width) || isNaN(height)) {
            let bounds = elm.getBoundingClientRect();

            width = elm.offsetWidth;
            height = elm.offsetHeight;
        }

        width += evt.detail.caviEvent.deltaPosition.x;
        height += evt.detail.caviEvent.deltaPosition.y;

        elm.style.width = width + "px";
        elm.style.height = height + "px";
    });
}

function enableOpacityChange(elm) {
    cQuery(elm).on("wheel", (evt)=>{
        let opacity = parseFloat(elm.style.opacity);

        if(isNaN(opacity)) {
            opacity = 1.0;
        }

        if(evt.deltaY < 0) {
            opacity += 0.1;
        } else {
            opacity -= 0.1;
        }

        if(opacity > 1) {
            opacity = 1;
        } else if(opacity < 0.2){
            opacity = 0.2;
        }

        console.log(evt, opacity);

        elm.style.opacity = opacity;

        evt.preventDefault();
    });
}

function enableToTop(elm) {
    elm.addEventListener("mousedown", ()=>{
        let highestIndex = -999999999999;

        let currentIndex = parseInt(elm.style.zIndex, 10);

        if(isNaN(currentIndex)){
            currentIndex = 0;
        }

        document.querySelectorAll("div.streamContainer").forEach((container)=>{
            let zIndex = parseInt(container.style.zIndex, 10);

            if(isNaN(zIndex)) {
                zIndex = 0;
            }

            highestIndex = Math.max(highestIndex, zIndex);
        });

        console.log("CurrentIndex: ", currentIndex, highestIndex);

        document.querySelectorAll("div.streamContainer").forEach((container)=>{
            let zIndex = parseInt(container.style.zIndex, 10);

            if(isNaN(zIndex)) {
                zIndex = 0;
            }

            if(zIndex >= currentIndex) {
                container.style.zIndex = zIndex - 1;
            }
        });

        elm.style.zIndex = highestIndex;
    });
}

function requestWebRTC(elm) {
    console.log("New streamContainer: ", elm, elm.__wid, elm.webstrate.id);
    setTimeout(()=>{
        elm.webstrate.on("signalStream", (clientId, meta, accept) => {
            console.log("Got signalStream...");
            var conn = accept((stream) => {
                console.log("Got stream...");
                addStream(stream, elm);
            });

            console.log(conn);
        });
    },0);
}