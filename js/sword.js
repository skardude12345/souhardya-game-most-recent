class Sword {

    // Flail head. Sensor body: it never collides with anything physically,
    // so it can't push the player or be stood on. Hits are checked manually.
    constructor(x, y) {
        this.radius = 24;
        this.body = Bodies.circle(x, y, this.radius, {
            isSensor: true,
            frictionAir: 0.01,
            density: 0.0005
        });
        World.add(world, this.body);

        this.image = swordImg;
    }

    display() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        imageMode(CENTER);
        image(this.image, 0, 0, 56, 56);
        pop();
    }

}