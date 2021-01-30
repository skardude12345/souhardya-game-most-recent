class Player {

    constructor() {
        this.body = Bodies.rectangle(400, 200, 50, 70);
        World.add(world, this.body);

        this.image = loadImage('./images/sam.png')

        this.health = 100;

        this.width = 50;
        this.height = 70;



    }

    display() {

        this.body.angle = 0;
        this.body.position.x = 400;
        
        push();
        translate(this.body.position.x, this.body.position.y);
        angleMode(RADIANS);
        //rotate(angle);
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