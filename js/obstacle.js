class Obstacle {

    constructor() {
        this.body = Bodies.rectangle(width, height - 30, 60, 40)
        World.add(world, this.body);

        this.image = loadImage('./images/spikes.png');
        this.width = 60;
        this.height = 40;

        this.velocityX = -5;

        this.timeCreated = frameCount;
    }


    display() {

        if (this.body !== undefined) {

            var angle = this.body.angle;

            push();

            translate(this.body.position.x, this.body.position.y);
            angleMode(RADIANS);
            rotate(angle);
            imageMode(CENTER);
            image(this.image, 0, 0, this.width, this.height);
            Body.setVelocity(this.body, { x: this.velocityX, y: 0 });
            pop();

            //console.log('test');

            if (frameCount - this.timeCreated > 200) {
                World.remove(world, this.body);
            
            }

        }




    }





}