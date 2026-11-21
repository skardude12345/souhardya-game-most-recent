class Player {

    constructor() {
        this.width = 50;
        this.height = 70;

        this.body = Bodies.rectangle(400, 200, this.width, this.height, {
            inertia: Infinity,                 
            collisionFilter: { group: -1 }    
        });
        World.add(world, this.body);

        this.image = playerImg;
        this.health = 100;
    }

    display() {
        Body.setPosition(this.body, { x: 400, y: this.body.position.y });
        Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
        Body.setAngle(this.body, 0);

        push();
        translate(this.body.position.x, this.body.position.y);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
    }

    jump() {
        if (keyDown("space") && this.body.position.y >= 320) {
            Body.setVelocity(this.body, { x: 0, y: -10 });
        }

        if (keyDown(DOWN_ARROW) && this.body.position.y <= 320) {
            Body.setVelocity(this.body, { x: 0, y: 7 });
        }
    }

}