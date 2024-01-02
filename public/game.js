const canvas = document.querySelector('canvas')

const ctx = canvas.getContext('2d')

const socket = io()

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

class Wall {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }


}

function colisionCheck(player, powerUp) {
    return !powerUp.collected &&
        player.x < powerUp.x + powerUp.size &&
        player.x + player.size > powerUp.x &&
        player.y < powerUp.y + powerUp.size &&
        player.y + player.size > powerUp.y
}

function wallCheck(player, wall) {
    return player.x < wall.x + wall.width &&
        player.x + player.size > wall.x &&
        player.y < wall.y + wall.height &&
        player.y + player.size > wall.y
}

function updateGame() {
    if (colisionCheck(player, speedBoost)) {
        speedBoost.collected = true
        playerSpeed *= 2

        setTimeout(() => {
            playerSpeed /= 2;
        }, 5000)

    }

    walls.forEach(wall => {
        if (wallCheck(player, wall)) {
            // Detects player colision with walls
            const overlapLeft = (player.x + player.size) - wall.x;
            const overlapRight = (wall.x + wall.width) - player.x;
            const overlapTop = (player.y + player.size) - wall.y;
            const overlapBottom = (wall.y + wall.height) - player.y;

            // Find the minimum overlap
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Adjust the player's position based on the minimum overlap
            if (minOverlap == overlapLeft) {
                player.x = wall.x - player.size;
            } else if (minOverlap == overlapRight) {
                player.x = wall.x + wall.width;
            } else if (minOverlap == overlapTop) {
                player.y = wall.y - player.size;
            } else if (minOverlap == overlapBottom) {
                player.y = wall.y + wall.height;
            }
        }
    })

    // if (wallCheck(player, wall_1)) {
    //     const overlapLeft = (player.x + player.size) - wall_1.x;
    //     const overlapRight = (wall_1.x + wall_1.width) - player.x;
    //     const overlapTop = (player.y + player.size) - wall_1.y;
    //     const overlapBottom = (wall_1.y + wall_1.height) - player.y;

    //     // Find the minimum overlap
    //     const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    //     // Adjust the player's position based on the minimum overlap
    //     if (minOverlap == overlapLeft) {
    //         player.x = wall_1.x - player.size;
    //     } else if (minOverlap == overlapRight) {
    //         player.x = wall_1.x + wall_1.width;
    //     } else if (minOverlap == overlapTop) {
    //         player.y = wall_1.y - player.size;
    //     } else if (minOverlap == overlapBottom) {
    //         player.y = wall_1.y + wall_1.height;
    //     }

    // }
}

const projectiles = []

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.update()
    speedBoost.draw()
    wall.draw()
    updateGame()

    projectiles.forEach((projectile, index) => {
        projectile.update()
        if (projectile.x + projectile.size < 0 || projectile.x > canvas.width || projectile.y + projectile.size > canvas.height || projectile.y < 0) {
            projectiles.splice(index, 1)
        }
        walls.forEach(wall => {
            if (wallCheck(projectile, wall)) {
                //projectiles.splice(index, 1)
                projectile.velocity.x = -projectile.velocity.x
            }
        })
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
        4, 'red', {
        x: velocity.x * 10,
        y: velocity.y * 10
    }))
})


const player = new Player(200, 200, 20, 'black')
const speedBoost = new PowerUp(500, 500, 10, 'red')
const centerWallSize = 600
const walls = []
const wall = new Wall(canvas.width / 2, (canvas.height / 2) - (centerWallSize / 2), 10, centerWallSize)
walls.push(wall)




animate()


