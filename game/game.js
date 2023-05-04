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
class PlayerComponent extends Component {
    name = "PlayerComponent"
    start() {
        let wallsGameObject = GameObject.getObjectByName("WallsGameObject1")
        this.floor = wallsGameObject.transform.BY
        this.transform.size = 10
        // this.transform.BY = this.floor
        this.transform.TY = this.transform.BY - this.transform.size
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
    }

    update() {

        // prevents double jumping by creating canJump flag
        if (!this.grounded && !this.jumping) {
            this.canJump = false
            this.transform.VY = this.transform.VY + 2 * this.accel
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
                this.transform.BY -= 1
                this.transform.TY -= 1
                this.transform.VY = -2
                this.jumping = true
                this.canJump = false
                this.grounded = false
            }

            // if jumping, increase velocity 
            if (this.jumping) {

                if (this.time < 20 && this.time > 0) {
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


        // update player position based on horizontal velocity
        this.transform.LX += this.transform.LV
        this.transform.LX += this.transform.RV

        this.transform.RX = this.transform.LX + this.transform.size

        // update position based on vertical velocity
        if (!this.grounded) {
            this.transform.BY += this.transform.VY
            this.transform.TY = this.transform.BY - this.transform.size
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

    // console.log("Checking collisions for: " + platform.parent.name)
    let playerComponent = player.getComponent("PlayerComponent")

    // if statements to catch if the player lands on a platform  
    if (player.transform.BY <= platform.transform.TY && (player.transform.RX >= platform.transform.LX - player.transform.size) && (player.transform.LX <= platform.transform.RX + player.transform.size)) {
        /* ***Fails if you hold jump???***  */
        if ((player.transform.BY + player.transform.VY >= platform.transform.TY) && !platform.hasPlayer) {
            player.transform.VY = 0
            playerComponent.grounded = true
            player.transform.BY = platform.transform.TY
            player.transform.TY = player.transform.BY - player.transform.size
            // land on platform
            platform.hasPlayer = true
            console.log("Landed on " + platform.parent.name)
        }

        // if statement if the player bumps their head on the platform from below
    } else if (player.transform.TY >= platform.transform.BY) {
        if (player.transform.TY + player.transform.VY <= platform.transform.BY  // would jumping through the platform
            && (player.transform.RX + player.transform.RV > platform.transform.LX && player.transform.LX + player.transform.LV < platform.transform.RX)) { // player position is within bounds of the platform
            player.transform.VY = 0
            playerComponent.falling = true
            playerComponent.time = -1
            // bump head
            console.log("bump")
        }

        // make it so that it has to be on that platform first before it can slip off
    } else if ((player.transform.RX <= platform.transform.LX || player.transform.LX >= platform.transform.RX) && platform.hasPlayer) {
        playerComponent.grounded = false
        //slip off
        platform.hasPlayer = false
        console.log("Slipped off of " + platform.parent.name)
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
        // player.transform.VY = 0
    } else if ((player.transform.RX + player.transform.RV > platform.transform.LX) &&
        ((downDist <= player.transform.size * 1.5) && player.transform.LX <= platform.transform.LX) && !platform.hasPlayer) {

        player.transform.RV = 0
        player.transform.RX = platform.transform.LX - 1
        player.transform.LX = player.transform.RX - player.transform.size
    }
}

class PlatformsComponent extends Component {
    name = "PlatformComponent"
    start() {
    }

    update() {

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
    }
}

class WallsComponent extends Component {
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

    let platformGameObject = new GameObject("PlatformGameObject")
    platformGameObject.addComponent(new PlatformsComponent())
    platformGameObject.transform.TY = TY
    platformGameObject.transform.BY = BY
    platformGameObject.transform.LX = LX
    platformGameObject.transform.RX = RX

    return platformGameObject
}

function randomize() {
    let x = Math.floor(Math.random() * (350 - 75 + 1) + 75)

    return x
}

function randomizePlatforms (prevX, prevY, scene) {

    let numPlatforms = 0

    while (numPlatforms < 4) {
        let randomX = randomize()
        while (randomX > prevX && randomX < (prevX + 100)) {
            randomX = randomize()
        }
        let platform1GameObject = createPlatform(prevY - 70, prevY - 60, randomX - 50, randomX + 50)
        numPlatforms++
        platform1GameObject.playerNum = 1
        platform1GameObject.name = "BluePlatform"

        let platform2GameObject = createPlatform(prevY - 70, prevY - 60, -(randomX + 50), -(randomX - 50))
        platform2GameObject.playerNum = 2
        platform2GameObject.name = "RedPlatform"
        
        prevY = platform1GameObject.transform.TY
        prevX = platform1GameObject.transform.LX

        scene.addGameObject(platform1GameObject)
        scene.addGameObject(platform2GameObject)
        
    }
}

class MainCameraComponent extends Component {
    start() {
        this.transform.sx = 0.1
        this.transform.sy = 0.1
    }

    update() {
        this.transform.x = 0
        this.transform.y = -275
    }
}

class MainScene extends Scene {
    start() {
        // add all game objects into scene
        
        // WALLS GO FROM 25 - 450 HALF WAY IN BETWEEN IS 237.5
        // Draw starting walls to confine players
        let wallsGameObject1 = new GameObject("WallsGameObject")
        wallsGameObject1.addComponent(new WallsComponent())
        wallsGameObject1.name = "WallsGameObject1"
        let wallsComponent1 = wallsGameObject1.getComponent("WallsComponent")
        wallsComponent1.transform.TY = -550
        wallsComponent1.transform.LX = -450
        wallsComponent1.transform.RX = -25
        wallsComponent1.transform.BY = 0
        this.addGameObject(wallsGameObject1)
        
        let wallsGameObject2 = new GameObject("WallsGameObject")
        wallsGameObject2.addComponent(new WallsComponent())
        wallsGameObject2.name = "WallsGameObject2"
        let wallsComponent2 = wallsGameObject2.getComponent("WallsComponent")
        wallsComponent2.transform.TY = -550
        wallsComponent2.transform.LX = 25
        wallsComponent2.transform.RX = 450
        wallsComponent2.transform.BY = 0
        this.addGameObject(wallsGameObject2)
        

        // Create platforms, try to figure out how to randomize this stuff to make the game dynamic
        
        // starting platform | 4 platforms per "screen" move the camera up and reposition the platforms

        // Red starter platform
        let platform1GameObject = createPlatform(-50, -40, -287.5, -187.5)
        platform1GameObject.name = "Platform1"
        platform1GameObject.playerNum = 2
        this.addGameObject(platform1GameObject)

        
        // Blue platforms starter platform
        let platform2GameObject = createPlatform(-50, -40, 187.5, 287.5)
        platform2GameObject.name = "Platform2"
        platform2GameObject.playerNum = 1
        this.addGameObject(platform2GameObject)        
        
        // randomizePlatforms(287.5,-50, this)

        // Add players
        let playerGameObject2 = new GameObject("PlayerGameObject2")
        playerGameObject2.addComponent(new PlayerComponent("PlayerComponent"))
        let playerComponent2 = playerGameObject2.getComponent("PlayerComponent")
        playerComponent2.color = "red"
        playerComponent2.playerNum = 2
        playerComponent2.transform.LX = -237.5 - (playerComponent2.transform.size / 2)
        playerComponent2.transform.RX = playerComponent2.transform.LX + playerComponent2.transform.size
        playerComponent2.transform.BY = 0
        this.addGameObject(playerGameObject2)
        
        let playerGameObject1 = new GameObject("PlayerGameObject1")
        playerGameObject1.addComponent(new PlayerComponent("PlayerComponent"))
        let playerComponent1 = playerGameObject1.getComponent("PlayerComponent")
        playerComponent1.color = "blue"
        playerComponent1.playerNum = 1
        playerComponent1.transform.LX = 237.5 - (playerComponent1.transform.size / 2)
        playerComponent1.transform.RX = playerComponent1.transform.LX + playerComponent1.transform.size
        playerComponent1.transform.BY = 0
        this.addGameObject(playerGameObject1)
        
        let camera = Camera.main.parent.addComponent(new MainCameraComponent())
    }

    update() {

    }
}

let mainScene = new MainScene()
SceneManager.addScene(mainScene)

