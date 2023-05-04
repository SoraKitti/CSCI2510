import "./Component.js"
import "./Camera.js"
import "./Vector2.js"

class Globals {
    static requestedAspectRatio = 16/9
    static logicalWidth = 1
}

let letterboxColor = "gray"

class SceneManager {
    static scenes = []
    static currentSceneIndex = 0
    static changedSceneFlag = true
    static previousSceneIndex = -1

    static startScenes(scenes, title) {
        SceneManager.setScenes(scenes)
        start(title)
    }

    static setScenes(scenes) {
        SceneManager.currentSceneIndex = 0
        SceneManager.changedSceneFlag = true
        SceneManager.sce = []
        SceneManager.addScenes(scenes)
    }
    static addScenes(scenes) {
        for (let scene of scenes) {

            SceneManager.addScene(scene)
        }
    }

    static addScene (scene) {
        SceneManager.scenes.push(scene)
    }
    static getActiveScene() {
        return SceneManager.scenes[SceneManager.currentSceneIndex];
    }
    static getPreviousScene() {
        if(SceneManager.previousSceneIndex == -1) {
            return
        } else {
            return SceneManager.scenes[SceneManager.previousSceneIndex]
        }

    }
    static changeScene(index) {
        SceneManager.previousSceneIndex = SceneManager.currentSceneIndex
        SceneManager.currentSceneIndex = index
        SceneManager.changedSceneFlag = true
    }
}

class Scene {
    gameObjects = []
    constructor(fillStyle){
        this.addGameObject(new GameObject("CameraGameObject").addComponent(new Camera(fillStyle)))
      }
      addGameObject(gameObject, translate = Vector2.zero, scale = Vector2.one, rotation = 0, layer = 0){
        this.gameObjects.push(gameObject);
        gameObject.transform.x = translate.x;
        gameObject.transform.y = translate.y;
        gameObject.transform.sx = scale.x;
        gameObject.transform.sy = scale.y;
        gameObject.transform.r = rotation;
        gameObject.layer = layer;
  
        if(gameObject.start && !gameObject.started){
            gameObject.started = true
            gameObject.start()
        }
  
        return gameObject;
    }

    addGameObjectTransform(gameObject, transform = new Transform()){
        this.gameObjects.push(gameObject);
        gameObject.transform = transform;
      }
}

class Component {
    name = ""
    parent
    started = false
    get transform() {
        return this.parent.components[0]
    }
}

class Transform extends Component {
    name = "Transform"
    LX = 0
    RX = 0
    TY = 0
    BY = 0
    size = 1
    sx = 1
    sy = 1
}

class GameObject{
    name = ""
    components = []
    started = false

    constructor(name) {
        this.name = name
        this.addComponent(new Transform())
    }

    get transform() {
        return this.components[0]
    }
    addComponent(component){
        this.components.push(component);
        component.parent = this;
        return this;
    }
    static getObjectByName(name){
        return SceneManager.getActiveScene().gameObjects.find(gameObject=>gameObject.name == name)
    }
    getComponent(name){
        return this.components.find(c=>c.name == name)
    }

    static instantiate(gameObject) {
        SceneManager.getActiveScene().gameObjects.push(gameObject);
        if (gameObject.start && !gameObject.started) {
            gameObject.started = true
            gameObject.start()
        }
    }
}

// grab id of variable
let canvas = document.querySelector("#canv")

//Tell canvas how to draw (context)
let ctx = canvas.getContext("2d")

// Listen for keyboard events
let keysDown = [] // all elements are listed as "falsey" which is undefined
let keysUp = []
document.addEventListener("keydown", keyDown)
document.addEventListener("keyup", keyUp)

let isPaused = false

// Key up is more reliable
function keyUp(e) {

    keysDown[e.key] = false
    keysUp[e.key] = true

    if (e.key == "p") {
        isPaused = !isPaused
    }

}

// Keydown used to keep track of state of key
function keyDown(e) {
    // Get key information using JavaScript's key->code
    // using either keycode or key "ArrowLeft"

    keysDown[e.key] = true
    keysUp[e.key] = false
}

function engineDraw() {
    ctx.fillStyle = Camera.main.fillStyle
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let browserAspectRatio = canvas.width / canvas.height;
    let offsetX = 0
    let offsetY = 0
    let browserWidth = canvas.width

    if (Globals.requestedAspectRatio > browserAspectRatio) {
        let desiredHeight = canvas.width / Globals.requestedAspectRatio;
        let amount = (canvas.height - desiredHeight) / 2;
        offsetY = amount;
    }
    else {
        let desiredWidth = canvas.height * Globals.requestedAspectRatio
        let amount = (canvas.width - desiredWidth) / 2;
        offsetX = amount
        browserWidth -= 2 * amount
    }
    
    let scene = SceneManager.getActiveScene()

    ctx.save()

    let logicalScaling = Camera.getLogicalScaleZoomable(ctx);
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
    ctx.scale(logicalScaling, logicalScaling)
    ctx.translate(-Camera.main.transform.x, -Camera.main.transform.y)
    
    for(let gameObject of scene.gameObjects){
        for(let component of gameObject.components){
            if(component.draw){
                component.draw(ctx)
            }
        }
    }
    ctx.restore()

    // draw letter boxes
    let zeroX = 0
    let zeroY = 0

    if (Globals.requestedAspectRatio > browserAspectRatio) {
        let desiredHeight = canvas.width / Globals.requestedAspectRatio;
        let amount = (canvas.height - desiredHeight) / 2;
        zeroY = amount;
        ctx.fillStyle = letterboxColor
        ctx.fillRect(0, 0, canvas.width, amount);
        ctx.fillRect(0, canvas.height - amount, canvas.width, amount);
    }
    else {
        let desiredWidth = canvas.height * Globals.requestedAspectRatio
        let amount = (canvas.width - desiredWidth) / 2;
        zeroX = amount;
        ctx.fillStyle = letterboxColor
        ctx.fillRect(0, 0, amount, canvas.height);
        ctx.fillRect(canvas.width - amount, 0, amount, canvas.height);
    }
}

function engineUpdate() {
    if (isPaused) {
        return
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let scene = SceneManager.getActiveScene()
    if (SceneManager.changedSceneFlag && scene.start) {
        let camera = scene.gameObjects[0]
        scene.gameObjects = []
        scene.gameObjects.push(camera) // adding this breaks line 329??
        
        scene.start(ctx)
        SceneManager.changedSceneFlag = false
    }

    // start unstarted GOs
    for (let gameObject of scene.gameObjects) {
        if (gameObject.start && !gameObject.started) {
            gameObject.start(ctx)
            gameObject.started = true
        }
    }

    // start unstarted components
    for(let gameObject of scene.gameObjects){
        for(let component of gameObject.components){
            if(component.start && !component.started){
                component.start(ctx)
                component.started = true
            }
        }
    }

    // update all components
    for(let gameObject of scene.gameObjects){
        for(let component of gameObject.components){
            if(component.update){
                component.update(ctx)
            }
        }
    }
}



function start(title, settings = {}) {

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    document.title = title
    if (settings) {
        Globals.requestedAspectRatio = settings.aspectRatio ? settings.aspectRatio: 16/9
        letterboxColor = settings.letterboxColor ? settings.letterboxColor : "white"
        Globals.logicalWidth = settings.logicalWidth ? settings.logicalWidth : 100
    }
    
    function gameLoop() {
        engineUpdate()
        engineDraw()
    }

    setInterval(gameLoop, 1000 / 60)
}

window.Scene = Scene
window.SceneManager = SceneManager
window.start = start
window.GameObject = GameObject
window.keysDown = keysDown
window.keysUp = keysUp
window.canvas = canvas
window.ctx = ctx
window.Globals = Globals
