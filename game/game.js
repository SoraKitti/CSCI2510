import "./engine/gameEngine.js"

class Input {

    static getLeft() {
        if (keysDown["ArrowLeft"]) {
            return true
        } else {
            return false
        }
    }

    static getLeft2() {
        if (keysDown["a"]) {
            return true
        } else {
            return false
        }
    }
    static getUp() {
        if (keysDown["ArrowUp"]) {
            return true
        } else {
            return false
        }
    }

    static getUp2() {
        if (keysDown["w"]) {
            return true
        } else {
            return false
        }
    }
    static getRight() {
        if (keysDown["ArrowRight"]) {
            return true
        } else {
            return false
        }
    }
    static getRight2() {
        if (keysDown["d"]) {
            return true
        } else {
            return false
        }
    }

}

let winner = 0
let flag = 0
class PlayerComponent extends Component {
    name = "PlayerComponent"
    start() {
        let wallsGameObject = GameObject.getObjectByName("WallsGameObject1")
        this.floor = wallsGameObject.transform.BY
        this.transform.size = 10
        this.jumping = false
        this.canJump = true
        this.grounded = true
        this.transform.VY = 0
        this.transform.RV = 0
        this.transform.LV = 0
        this.platform = 0
        this.time = 0
        this.accel = 0.33
        this.LdecreaseFlag = 0
        this.RdecreaseFlag = 0
        this.parent.started = true
    }

    update() {
        // update player position based on horizontal velocity
        this.transform.LX += this.transform.LV
        this.transform.LX += this.transform.RV

        this.transform.RX = this.transform.LX + this.transform.size


        // prevents double jumping by creating canJump flag
        if (!this.grounded && !this.jumping) {
            this.canJump = false
            if (this.transform.VY < 8) {
                this.transform.VY = this.transform.VY + 2 * this.accel
            } else {
                this.transform.VY = 8
            }
        }

        // update position based on vertical velocity
        if (!this.grounded) {
            this.transform.BY += this.transform.VY
            this.transform.TY = this.transform.BY - this.transform.size
        }

        // handle movement keys based on which player number you are
        if (this.playerNum == 1) {
            this.left = Input.getLeft()
            this.up = Input.getUp()
            this.right = Input.getRight()
        } else {
            this.left = Input.getLeft2()
            this.up = Input.getUp2()
            this.right = Input.getRight2()
        }

        if (this.right) {
            this.LdecreaseFlag = 1
            // increment movement horizontally
            if (this.transform.RV < 6) {
                this.transform.RV += 0.1
            }
        }

        if (!this.right) {
            this.RdecreaseFlag = 1
        }

        if (this.RdecreaseFlag) {
            // logic responsible for "slowing" the player down when the horizontal movement key is released instead of instantly stopping
            if (this.transform.RV > 0 && this.transform.LV == 0) {
                this.transform.RV = this.transform.RV - 1.5 * this.accel
            } else {
                this.transform.RV = 0
                this.RdecreaseFlag = 0
            }
        }

        if (this.left) {
            this.RdecreaseFlag = 1
            if (this.transform.LV > -6) {
                this.transform.LV -= 0.1
            }
        }

        if (!this.left) {
            this.LdecreaseFlag = 1
        }

        if (this.LdecreaseFlag) {
            // logic responsible for "slowing" the player down when the horizontal movement key is released instead of instantly stopping
            if (this.transform.LV < 0 && this.transform.RV == 0) {
                this.transform.LV = this.transform.LV + 1.5 * this.accel
            } else {
                this.transform.LV = 0
                this.LdecreaseFlag = 0
            }

        }

        if (this.up) {
            this.time += 1

            // initial jump, increase the position off of the ground and change initial velocity
            if (this.canJump && this.grounded) {
                this.transform.BY--
                this.transform.TY--
                this.transform.VY = -2
                this.jumping = true
                this.canJump = false
                this.grounded = false
            }

            // if jumping, increase velocity 
            if (this.jumping) {

                if (this.time < 20 && this.time > 0) { // originally 20
                    this.jumping = true

                    // give slight speeding up to jumping to make it feel more "dynamic?" to a certain max speed
                    if (this.transform.VY > -5) {
                        this.transform.VY -= 0.33
                    } else {
                        this.transform.VY = -5
                    }
                } else {
                    this.time = -1
                    this.jumping = false
                    this.falling = true
                }
            } else {
                this.time = 0
            }


        } else {
            if (!this.up && this.jumping) {
                this.jumping = false
                this.time = 0
            }
            if (this.grounded && !this.canJump) {
                this.canJump = true
                this.jumping = false
            }
            this.jumping = false
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color

        ctx.fillRect(this.transform.LX, this.transform.TY, this.transform.size, this.transform.size)
    }
}

function drawPlatform(TY, BY, LX, RX) {

    ctx.strokeStyle = "white"
    ctx.beginPath()
    ctx.moveTo(LX, TY)
    ctx.lineTo(RX, TY)
    ctx.lineTo(RX, BY)
    ctx.lineTo(LX, BY)
    ctx.lineTo(LX, TY)
    ctx.stroke()
}

// detects collsion between platform and player
function detectPlatformCollision(platform, player) {

    let playerComponent = player.getComponent("PlayerComponent")

    // if statements to catch if the player lands on a platform  
    if (player.transform.BY <= platform.transform.TY && (player.transform.RX >= platform.transform.LX) && (player.transform.LX <= platform.transform.RX)) {

        if ((player.transform.BY + player.transform.VY >= platform.transform.TY) && !platform.hasPlayer) {
            player.transform.VY = 0
            playerComponent.grounded = true
            playerComponent.falling = false
            player.transform.BY = platform.transform.TY
            player.transform.TY = player.transform.BY - player.transform.size
            // land on platform
            platform.hasPlayer = true
            console.log("Landed on " + platform.parent.name)
        }


        // make it so that it has to be on that platform first before it can slip off
    }
    if ((player.transform.RX <= platform.transform.LX || player.transform.LX >= platform.transform.RX) && platform.hasPlayer) {
        playerComponent.grounded = false
        playerComponent.falling = true
        //slip off
        platform.hasPlayer = false
        console.log("Slipped off of " + platform.parent.name)

        // if statement if the player bumps their head on the platform from below
    }
    if (player.transform.TY >= platform.transform.BY) {
        if (player.transform.TY + player.transform.VY <= platform.transform.BY  // would jumping through the platform
            && (player.transform.RX + player.transform.RV > platform.transform.LX && player.transform.LX + player.transform.LV < platform.transform.RX)) { // player position is within bounds of the platform
            player.transform.VY = 0
            playerComponent.falling = true
            playerComponent.time = -1
            // bump head
            console.log("bump")
        }
    }


    // handles collisions if you don't clear the jump and hit the side
    let downDist = Math.abs(player.transform.BY - platform.transform.TY)

    if (downDist >= player.transform.size) {
        platform.hasPlayer = false
    }

    if ((player.transform.LX + player.transform.LV < platform.transform.RX) && //if player would move left past the right side of a platform
        ((downDist <= player.transform.size * 1.5) && player.transform.LX >= platform.transform.RX) && !platform.hasPlayer) { // the player is within a certain range of the platform vertically and is to the right of the platform

        player.transform.LV = 0
        player.transform.LX = platform.transform.RX + 1
        player.transform.RX = player.transform.LX + player.transform.size
        playerComponent.time = 21
    } else if ((player.transform.RX + player.transform.RV > platform.transform.LX) &&
        ((downDist <= player.transform.size * 1.5) && player.transform.LX <= platform.transform.LX) && !platform.hasPlayer) {

        player.transform.RV = 0
        player.transform.RX = platform.transform.LX - 1
        player.transform.LX = player.transform.RX - player.transform.size
    }
}

let numPlatforms = 0
let skip = 0
let ranNum = 0

class PlatformsComponent extends Component {
    name = "PlatformComponent"
    start() {
        this.parent.started = true
        this.onScreen = true
    }

    update() {
        let cameraGameObject = GameObject.getObjectByName("CameraGameObject")
        let cameraComponent = cameraGameObject.getComponent("MainCameraComponent")
        let threshold = cameraComponent.transform.y + offset

        if (this.transform.TY > threshold && this.onScreen) {
            console.log(this.name + " has gone off screen")
            this.onScreen = false
        }

        if (!this.onScreen) {
            let prevNumber = 0

            if (this.number == 1) {
                prevNumber = 9
            } else {
                prevNumber = this.number - 1
            }

            if (!skip) {
                let prevPlatformName = "PlatformGameObject" + (prevNumber)
                let prevPlatformGameObject = GameObject.getObjectByName(prevPlatformName)
                let string = "PlatformComponent" + (prevNumber)
                let prevPlatformComponent = prevPlatformGameObject.getComponent(string)
    
                let prevX = prevPlatformComponent.transform.LX + 50
    
                ranNum = randomize()
                let diff = Math.abs(ranNum - prevX)
    
                while (diff < 100 || diff > 250) {
                    ranNum = randomize()
                    diff = Math.abs(ranNum - prevX)
                }
    
                while (ranNum > (prevX - 100) && ranNum < (prevX + 100)) {
                    ranNum = randomize()
                }
                skip = 1
            } else {
                skip = 0
            }

            if (this.parent.playerNum == 1) {
                this.transform.BY -= 550
                this.transform.TY -= 550

                this.transform.LX = ranNum - 50
                this.transform.RX = ranNum + 50

            } else if (this.parent.playerNum == 2) {
                this.transform.BY -= 550
                this.transform.TY -= 550
                this.transform.LX = -(ranNum + 50)
                this.transform.RX = -(ranNum - 50)
            }
            this.onScreen = true
        }

        if (this.parent.playerNum == 1) {
            let player = GameObject.getObjectByName("PlayerGameObject1")
            detectPlatformCollision(this, player)
        } else {
            let player = GameObject.getObjectByName("PlayerGameObject2")
            detectPlatformCollision(this, player)
        }


    }

    draw(ctx) {
        drawPlatform(this.transform.TY, this.transform.BY, this.transform.LX, this.transform.RX)
    }
}

function detectWallsCollision(walls, player) {

    let playerComponent = player.getComponent("PlayerComponent")
    if (player.transform.LX + player.transform.LV < walls.transform.LX) {
        player.transform.LX = walls.transform.LX + 1
        player.transform.RX = player.transform.LX + player.transform.size
        player.transform.LV = 0
    }

    if (player.transform.RX + player.transform.RV > walls.transform.RX) {
        player.transform.RV = 0
        player.transform.RX = walls.transform.RX - 1
        player.transform.LX = player.transform.RX - player.transform.size
    }

    // if the player would move below the floor, set it's position to be the floor
    if (player.transform.BY + player.transform.VY > walls.transform.BY) {
        playerComponent.grounded = true
        player.transform.BY = walls.transform.BY - 1
        player.transform.TY = player.transform.BY - player.transform.size
        player.transform.VY = 0
        console.log("hit floor")
    }
}

class WallsComponent extends Component {
    start() {
        this.parent.started = true
    }
    update() {
        if (this.parent.name == "WallsGameObject1") {
            let player = GameObject.getObjectByName("PlayerGameObject2")
            detectWallsCollision(this, player)
        } else {
            let player = GameObject.getObjectByName("PlayerGameObject1")
            detectWallsCollision(this, player)
        }

    }

    draw(ctx) {
        drawPlatform(this.transform.TY, this.transform.BY, this.transform.LX, this.transform.RX)
    }
}

// creates platform game objects and components given coordinates
function createPlatform(TY, BY, LX, RX) {

    let platformComponentName = "PlatformComponent" + (numPlatforms + 1)
    let platformGameObjectName = "PlatformGameObject" + (numPlatforms + 1)
    let platformGameObject = new GameObject(platformGameObjectName)
    platformGameObject.addComponent(new PlatformsComponent("PlatformComponent"))
    let platformComponent = platformGameObject.getComponent("PlatformComponent")
    platformComponent.name = platformComponentName
    platformComponent.number = numPlatforms + 1

    platformGameObject.transform.TY = TY
    platformGameObject.transform.BY = BY
    platformGameObject.transform.LX = LX
    platformGameObject.transform.RX = RX

    return platformGameObject
}

function randomize() {
    let x = Math.floor(Math.random() * (390 - 85 + 1) + 85)

    return x
}

function randomizePlatforms(prevX, prevY, scene, requestedNum) {

    while (numPlatforms < requestedNum) {
        let randomX = randomize()
        let diff = Math.abs(randomX - prevX)

        while (diff < 100 || diff > 250) {
            randomX = randomize()
            diff = Math.abs(randomX - prevX)
        }

        while (randomX > (prevX - 100) && randomX < (prevX + 100)) {
            randomX = randomize()
        }

        let platform1GameObject = createPlatform(prevY - 60, prevY - 50, randomX - 50, randomX + 50)
        platform1GameObject.playerNum = 1

        let platform2GameObject = createPlatform(prevY - 60, prevY - 50, -(randomX + 50), -(randomX - 50))

        platform2GameObject.playerNum = 2

        numPlatforms++

        prevY = platform1GameObject.transform.TY
        prevX = randomX

        scene.addGameObject(platform1GameObject)
        scene.addGameObject(platform2GameObject)
    }
}

let offset = 280
let i = 0

class MainCameraComponent extends Component {
    start() {
        this.transform.sx = 0.1
        this.transform.sy = 0.1
        this.parent.started = true
        this.transform.y = -275
        this.transform.x = 0
        this.buffer = 7.5
        flag = 0
        this.speed = 0.1
        this.timer = 0
        this.timerFlag = 0
    }

    update() {
        console.log(i)

        let player1 = GameObject.getObjectByName("PlayerGameObject1")
        let player2 = GameObject.getObjectByName("PlayerGameObject2")

        let player1Component = player1.getComponent("PlayerComponent")
        let player2Component = player2.getComponent("PlayerComponent")

        if (i < this.buffer) {
            this.speed = 0.1
            this.timer = 0
        }

        if (i > this.buffer && !flag) {

            this.timer += Time.deltaTime
            if (this.timer % 5 > 0 && this.timer % 5 < 1 && !this.timerFlag) {
                this.speed += 0.05 
                this.timerFlag = 1
            }
            if (this.timer % 5 > 1) {
                this.timerFlag = 0
            }
            this.transform.y -= this.speed

            if (player1Component.transform.TY - 5 > this.transform.y + 275) {
                // console.log("Blue Loses")
                flag = 1
                winner = 2
            }
            if (player2Component.transform.TY - 5 > this.transform.y + 275) {
                // console.log("Red Loses")
                flag = 1
                winner = 1
            }
            if (player1Component.transform.TY - 5 > this.transform.y + 275 && player2Component.transform.TY - 5 > this.transform.y + 275) {
                flag = 1
                winner = 3
            }

        }
        i += Time.deltaTime
    }
}

class MainController extends Component {
    start() {

    }

    update() {

        if (flag != 0) {
            SceneManager.changeScene(1)
        }
    }
}

class MainScene extends Scene {
    start() {
        // add all game objects into scene
        winner = 0
        flag = 0
        numPlatforms = 0
        i = 0

        // WALLS GO FROM 25 - 450 HALF WAY IN BETWEEN IS 237.5
        // Draw starting walls to confine players
        let wallsGameObject1 = new GameObject("WallsGameObject")
        wallsGameObject1.addComponent(new WallsComponent())
        wallsGameObject1.name = "WallsGameObject1"
        let wallsComponent1 = wallsGameObject1.getComponent("WallsComponent")
        wallsComponent1.transform.TY = -99999
        wallsComponent1.transform.LX = -450
        wallsComponent1.transform.RX = -25
        wallsComponent1.transform.BY = 0
        this.addGameObject(wallsGameObject1)

        let wallsGameObject2 = new GameObject("WallsGameObject")
        wallsGameObject2.addComponent(new WallsComponent())
        wallsGameObject2.name = "WallsGameObject2"
        let wallsComponent2 = wallsGameObject2.getComponent("WallsComponent")
        wallsComponent2.transform.TY = -9999
        wallsComponent2.transform.LX = 25
        wallsComponent2.transform.RX = 450
        wallsComponent2.transform.BY = 0
        this.addGameObject(wallsGameObject2)

        // Add players
        let playerGameObject2 = new GameObject("PlayerGameObject2")
        playerGameObject2.addComponent(new PlayerComponent("PlayerComponent"))
        let playerComponent2 = playerGameObject2.getComponent("PlayerComponent")
        playerComponent2.color = "red"
        playerComponent2.playerNum = 2
        playerComponent2.transform.LX = -242.5
        playerComponent2.transform.RX = -232.5
        playerGameObject2.transform.BY = 0
        playerGameObject2.transform.TY = -10
        this.addGameObject(playerGameObject2)

        let playerGameObject1 = new GameObject("PlayerGameObject1")
        playerGameObject1.addComponent(new PlayerComponent("PlayerComponent"))
        let playerComponent1 = playerGameObject1.getComponent("PlayerComponent")
        playerComponent1.color = "blue"
        playerComponent1.playerNum = 1
        playerComponent1.transform.LX = 232.5
        playerComponent1.transform.RX = 242.5
        playerGameObject1.transform.BY = 0
        playerGameObject1.transform.TY = -10
        this.addGameObject(playerGameObject1)

        // Blue platforms starter platform
        let platform2GameObject = createPlatform(-50, -40, 187.5, 287.5)
        platform2GameObject.name = "PlatformGameObject1"
        platform2GameObject.playerNum = 1
        this.addGameObject(platform2GameObject)

        // Red starter platform
        let platform1GameObject = createPlatform(-50, -40, -287.5, -187.5)
        platform1GameObject.name = "PlatformGameObject1"
        platform1GameObject.playerNum = 2
        this.addGameObject(platform1GameObject)
        numPlatforms++

        randomizePlatforms(287.5 - 50, -50, this, 9)

        this.addGameObject(new GameObject("MainConttrollerGameObject").addComponent(new MainController()))
        let camera = Camera.main.parent.addComponent(new MainCameraComponent())
    }
}

class EndController extends Component {
    start() {

    }

    update() {
        if (keysDown["Enter"]) {
            console.log("Hello")
            SceneManager.changeScene(0)
        }
    }
}
class EndScene extends Scene {
    start() {

        if (winner == 1) {
            this.addGameObject(new GameObject("EndTextGameObject").addComponent(new Text("Blue Wins", "white")), new Vector2(-15, -2))
            this.addGameObject(new GameObject("EndTextGameObject2").addComponent(new Text("Press Enter to Continue", "white")), new Vector2(-40, 7))
        } else if (winner == 2) {
            this.addGameObject(new GameObject("EndTextGameObject").addComponent(new Text("Red Wins", "white")), new Vector2(-15, -2))
            this.addGameObject(new GameObject("EndTextGameObject2").addComponent(new Text("Press Enter to Continue", "white")), new Vector2(-40, 7))
        } else {
            this.addGameObject(new GameObject("EndTextGameObject").addComponent(new Text("Tie Game", "white")), new Vector2(-15, -2))
            this.addGameObject(new GameObject("EndTextGameObject2").addComponent(new Text("Press Enter to Continue", "white")), new Vector2(-40, 7))
        }

        this.addGameObject(new GameObject("EndConttrollerGameObject").addComponent(new EndController()))
    }
}

let mainScene = new MainScene()
SceneManager.addScene(mainScene)

let endScene = new EndScene()
SceneManager.addScene(endScene)
