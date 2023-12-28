const canvas = document.querySelector('canvas')

const ctx = canvas.getContext('2d')

let playerSpeed = 4

canvas.width = innerWidth
canvas.height = innerHeight

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
}

class Player {
    constructor(x, y, size, color) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.size, this.size)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        if (keys.up) this.y -= playerSpeed;
        if (keys.down) this.y += playerSpeed;
        if (keys.left) this.x -= playerSpeed;
        if (keys.right) this.x += playerSpeed;
        this.draw()
    }
}

class PowerUp {
    constructor(x, y, size, color) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.collected = false
    }

    draw() {
        if (!this.collected) {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.size, this.size)
        }
    }

}

class Projectile {
    constructor(x, y, size, color, velocity) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

function colisionCheck(player, powerUp) {
    return !powerUp.collected &&
        player.x < powerUp.x + powerUp.size &&
        player.x + player.size > powerUp.x &&
        player.y < powerUp.y + powerUp.size &&
        player.y + player.size > powerUp.y
}

function updateGame() {
    if (colisionCheck(player, speedBoost)) {
        speedBoost.collected = true
        playerSpeed *= 2

        setTimeout(() => {
            playerSpeed /= 2;
        }, 5000)

    }
}

const projectiles = []

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.update()
    speedBoost.draw()
    updateGame()

    projectiles.forEach((projectile) => {
        projectile.update()
    })
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': keys.up = true; break;
        case 's': keys.down = true; break;
        case 'a': keys.left = true; break;
        case 'd': keys.right = true; break;
    }
})

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w': keys.up = false; break;
        case 's': keys.down = false; break;
        case 'a': keys.left = false; break;
        case 'd': keys.right = false; break;
    }
})

document.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - player.y - (player.size / 2), e.clientX - player.x - (player.size / 2))

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

    projectiles.push(new Projectile(player.x + (player.size / 2), player.y + (player.size / 2),
        2, 'red', {
        x: velocity.x * 3,
        y: velocity.y * 3
    }))
})


const player = new Player(200, 200, 20, 'black')
const speedBoost = new PowerUp(500, 500, 10, 'red')




animate()


