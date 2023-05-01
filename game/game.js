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
        this.transform.LX = window.innerWidth / 2 - this.transform.size / 2
        this.transform.RX = this.transform.LX + this.transform.size
        this.transform.BY = this.floor - 1
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
        // check if you have passed max jumping time
        if (this.time <= 0) {
            this.jumping = false
        }

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
                this.transform.BY -= 3
                this.transform.TY -= 3
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
                        this.transform.VY -= 0.5
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
        this.transform.BY += this.transform.VY
        this.transform.TY = this.transform.BY - this.transform.size
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
    if (player.transform.BY < platform.transform.TY && (player.transform.RX >= platform.transform.LX - player.transform.size) && (player.transform.LX <= platform.transform.RX + player.transform.size)) {
        if (player.transform.BY + player.transform.VY > platform.transform.TY) {
            player.transform.VY = 0
            playerComponent.grounded = true
            player.transform.BY = platform.transform.TY
            player.transform.TY = player.transform.BY - player.transform.size
            // land on platform
            platform.hasPlayer = true
        }

        // if statement if the player bumps their head on the platform from below
    } else if (player.transform.TY >= platform.transform.BY) {
        if (player.transform.TY + player.transform.VY <= platform.transform.BY  // would jumping through the platform
            && (player.transform.RX + player.transform.RV > platform.transform.LX && player.transform.LX + player.transform.LV < platform.transform.RX)) { // player position is within bounds of the platform
            player.transform.VY = 0
            playerComponent.falling = true
            playerComponent.time = -1
            // bump head
        }

        // make it so that it has to be on that platform first before it can slip off
    } else if ((player.transform.RX <= platform.transform.LX - player.transform.size / 2 || player.transform.LX >= platform.transform.RX) && platform.hasPlayer) {
        playerComponent.grounded = false
        //slip off
        platform.hasPlayer = false
    }

    // handles collisions if you don't clear the jump and hit the side
    let downDist = Math.abs(player.transform.BY - platform.transform.TY)

    if ((player.transform.LX + player.transform.LV < platform.transform.RX) && //if player would move left past the right side of a platform
        ((downDist <= player.transform.size * 2) && player.transform.LX >= platform.transform.RX) && !platform.hasPlayer) { // the player is within a certain range of the platform vertically and is to the right of the platform

        player.transform.LV = 0
        player.transform.LX = platform.transform.RX + 1
        player.transform.RX = player.transform.LX + player.transform.size
    } else if ((player.transform.RX + player.transform.RV > platform.transform.LX) &&
        ((downDist <= player.transform.size * 2) && player.transform.LX <= platform.transform.LX) && !platform.hasPlayer) {

        player.transform.RV = 0
        player.transform.RX = platform.transform.LX - 1
        player.transform.LX = player.transform.RX - player.transform.size
    }
}


class PlatformsComponent extends Component {
    name = "PlatformComponent"
    start() {

        // variable to track if the player is currently on this platform
        let hasPlayer = false
    }

    update() {
        let player1 = GameObject.getObjectByName("PlayerGameObject1")
        let player2 = GameObject.getObjectByName("PlayerGameObject2")

        detectPlatformCollision(this, player1)
        detectPlatformCollision(this, player2)
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
    name = "WallsComponent"
    update() {
        let player1 = GameObject.getObjectByName("PlayerGameObject1")
        let player2 = GameObject.getObjectByName("PlayerGameObject2")

        detectWallsCollision(this, player1)
        detectWallsCollision(this, player2)
    }

    draw(ctx) {

        drawPlatform(this.transform.TY, this.transform.BY, this.transform.LX, this.transform.RX)
    }
}

// creates platform game objects and components given coordinates
function createPlatform(TY, BY, LX, RX) {

    let platformGameObject = new GameObject("PlatformGameObject")
    platformGameObject.addComponent(new PlatformsComponent())
    platformGameObject.transform.BY = BY
    platformGameObject.transform.TY = TY
    platformGameObject.transform.LX = LX
    platformGameObject.transform.RX = RX

    return platformGameObject
}

class MainCameraComponent extends Component {
    start() {

    }

    update() {
        this.transform.x = 50
    }
}

class MainScene extends Scene {
    start() {
        // add all game objects into scene
        let wallsGameObject1 = new GameObject("WallsGameObject")
        wallsGameObject1.addComponent(new WallsComponent())
        wallsGameObject1.name = "WallsGameObject1"
        let wallsComponent1 = wallsGameObject1.getComponent("WallsComponent")
        wallsComponent1.transform.TY = window.innerHeight / 5
        wallsComponent1.transform.LX = window.innerWidth * .1
        wallsComponent1.transform.RX = window.innerWidth * .9
        wallsComponent1.transform.BY = window.innerHeight / 1.25
        this.addGameObject(wallsGameObject1)
        
        let floor = window.innerHeight / 1.25
        
        // figure out how to change the platform locations to be absolute locations instead of according to the window size
        let platform1GameObject = createPlatform(floor * .88, floor * .88 + 10, window.innerWidth * .1 * 2, window.innerWidth * .1 * 3)
        platform1GameObject.name = "Platform1"
        this.addGameObject(platform1GameObject)
        
        let platform2GameObject = createPlatform(floor * .77, floor * .77 + 10, window.innerWidth * .1 * 4, window.innerWidth * .1 * 5)
        platform2GameObject.name = "Platform2"
        this.addGameObject(platform2GameObject)
        
        let platform3GameObject = createPlatform(floor * .66, floor * .66 + 10, window.innerWidth * .1 * 6, window.innerWidth * .1 * 7)
        platform3GameObject.name = "Platform3"
        this.addGameObject(platform3GameObject)
        
        let playerGameObject1 = new GameObject("PlayerGameObject1")
        playerGameObject1.addComponent(new PlayerComponent("PlayerComponent"))
        playerGameObject1.getComponent("PlayerComponent").color = "red"
        playerGameObject1.getComponent("PlayerComponent").playerNum = 1
        this.addGameObject(playerGameObject1)
        
        let playerGameObject2 = new GameObject("PlayerGameObject2")
        playerGameObject2.addComponent(new PlayerComponent("PlayerComponent"))
        playerGameObject2.getComponent("PlayerComponent").color = "blue"
        playerGameObject2.getComponent("PlayerComponent").playerNum = 2
        this.addGameObject(playerGameObject2)
        
        Camera.main.parent.addComponent(new MainCameraComponent())
    }
}

let mainScene = new MainScene()
SceneManager.addScene(mainScene)

// TODO: ASPECT RATIO STUFF STOP USING WINDOW WIDTH AND HEIGHT


