let button = document.querySelector("#button");
var flipped = false;

button.addEventListener("click", (e) => {
    var video = document.getElementsByTagName("video")[0];
    if (flipped) {
        video.style.transform = "ScaleX(1)";
    } else {
        video.style.transform = "ScaleX(-1)";
    }
    flipped = !flipped;
});