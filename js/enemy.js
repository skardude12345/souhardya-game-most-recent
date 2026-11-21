class Enemy {

    constructor() {
        // FIX: Enemy had no width/height, so checkCollision returned NaN comparisons
        // and monsters could never hit the player. Body now matches the drawn size.
        this.width = 50;
        this.height = 50;

        this.body = Bodies.rectangle(width + this.width, 250, this.width, this.height, {
            isStatic: true,
            isSensor: true
        });
        World.add(world, this.body);

        this.image = monsterImg;
    }

    update() {
        Body.setPosition(this.body, {
            x: this.body.position.x - 1,
            y: this.body.position.y - 0.3
        });
    }

    isOffScreen() {
        return this.body.position.x < -this.width || this.body.position.y < -this.height;
    }

    display() {
        push();
        translate(this.body.position.x, this.body.position.y);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
    }

}
