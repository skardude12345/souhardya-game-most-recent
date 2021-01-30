class Enemy {

    constructor() {
        this.body = Bodies.rectangle(750, 250, 100, 100);
        World.add(world, this.body);

        this.image = loadImage('./images/monster.png');
    }


    display() {
        
        var angle = this.body.angle;

        push();
        translate(this.body.position.x, this.body.position.y);
        angleMode(RADIANS);
        rotate(angle);
        imageMode(CENTER);
        image(this.image, 0, 0, 50, 50);
        pop();
       


        Body.setVelocity(this.body, { x: -1, y: -0.3 });
    }

}