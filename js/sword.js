class Sword {

    constructor(x, y) {
        this.body = Bodies.rectangle(x, y, 20, 100, {
            frictionAir: 0.05,
            collisionFilter: { group: -1 }  
        });
        World.add(world, this.body);

        this.image = swordImg;
    }

    display() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        imageMode(CENTER);
        image(this.image, 0, 0, 100, 100);
        pop();
    }

}
