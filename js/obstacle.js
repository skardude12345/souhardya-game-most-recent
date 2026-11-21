class Obstacle {

    constructor() {
        this.width = 60;
        this.height = 40;

        this.body = Bodies.rectangle(width + this.width, 340, this.width, this.height, {
            isStatic: true,
            isSensor: true
        });
        World.add(world, this.body);

        this.image = spikesImg;
    }

    update(speed) {
        Body.setPosition(this.body, {
            x: this.body.position.x - speed,
            y: this.body.position.y
        });
    }

    isOffScreen() {
        return this.body.position.x < -this.width;
    }

    display() {
        push();
        translate(this.body.position.x, this.body.position.y);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
    }

}
