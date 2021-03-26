// Add edit button to page that opens up the Cauldron editor
let button = cQuery("<button>Edit</button>");
button[0].style.position = "fixed";
button[0].style.top = "1em";
button[0].style.right = "1em";
button[0].id = "cauldron-edit-button";

let transient = cQuery("<transient></transient>");
transient.append(button);

cQuery(document.body).append(transient);

button.on("click", ()=>{
    cauldronEditor();
});

// Uncomment below to load additional Codestrates packages
await WPMv2.require(
    [
    //{package: "fragment_python", repository: "/codestrates-repos?raw"},
    //{package: "fragment_latex", repository: "/codestrates-repos?raw"},
    //{package: "fragment_markdown", repository: "/codestrates-repos?raw"},
    //{package: "fragment_ruby", repository: "/codestrates-repos?raw"},
    //{package: "fragment_scss", repository: "/codestrates-repos?raw"}, 
    //{package: "fragment_svg", repository: "/codestrates-repos?raw"},
    //{package: "fragment_ts", repository: "/codestrates-repos?raw"},
    //{package: "fragment_p5", repository: "/codestrates-repos?raw"},
    //{package: "fragment_lua", repository: "/codestrates-repos?raw"},
    //{package: "fragment_whenjs", repository: "/codestrates-repos?raw"},
    //{package: "editor_codemirror", repository: "/codestrates-repos?raw"},
    //{package: "editor_ace", repository: "/codestrates-repos?raw"},
    ]
);

//Run when/if Cauldron is initialized
EventSystem.registerEventCallback("Cauldron.OnInit", ()=>{
    //Insert Cauldron view menu item
    MenuSystem.MenuManager.registerMenuItem("Cauldron.View", {
        label: "Popout editor",
        order: 1000, //Order us very low priority, so near the end of the menu
        onAction: ()=>{
            window.open(location.href+"?edit");
        }
    });
});

const urlParams = new URLSearchParams(window.location.search);
const editorMode = urlParams.get('edit');

if(editorMode != null && editorMode !== false) {
    Fragment.disableAutorun = true;
    EventSystem.registerEventCallback("Cauldron.OnInit", ({detail: {cauldron: cauldron}})=>{
        EventSystem.triggerEvent("Cauldron.Dock", {
            pos: EdgeDocker.MODE.MAXIMIZED
        });
    });
    await cauldronEditor();
}

//Now unhide body
let style = cQuery('<style>body { opacity: 1 !important; }</style>');
transient.append(style);