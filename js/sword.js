class Sword {

    constructor() {
        this.body = Bodies.rectangle(450, 250, 5, 100, { isStatic: false });
        World.add(world, this.body);

        this.image = loadImage("./images/sword.png");

        //this.width = 5;
        //this.height = 100;

        
    }

    display() {

        var angle = this.body.angle;

        push();
        translate(this.body.position.x, this.body.position.y);
        angleMode(RADIANS);
        rotate(angle);
        imageMode(CENTER);
        image(this.image, 0, 0, 100, 100);
        pop();

        // rect(this.body.position.x, this.body.position.y, 50, 100);


        
    }

}