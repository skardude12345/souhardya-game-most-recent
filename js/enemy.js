class Enemy {

    constructor() {
        this.width = 50;
        this.height = 50;

        this.body = Bodies.rectangle(width + this.width, 250, this.width, this.height, {
            isStatic: true,
            isSensor: true
        });
        World.add(world, this.body);

        this.image = monsterImg;
    }

    update(targetY, speed) {
        var pos = this.body.position;
        Body.setPosition(this.body, {
            x: pos.x - (2 + speed * 0.25),
            y: pos.y + (targetY - pos.y) * 0.03 + Math.sin(frameCount * 0.1) * 1.5
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