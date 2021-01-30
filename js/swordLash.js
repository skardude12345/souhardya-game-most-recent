class SwordLash {


    constructor(b1, b2) {
        var options = {
            bodyA: b1,
            bodyB: b2,
            stiffness: 0.5,
            length: 50
        }

        this.lash = Constraint.create(options)
        World.add(world, this.lash);
    }

    display() {
        var p1 = this.lash.bodyA.position;
        var p2 = this.lash.bodyB.position;
        line(p1.x, p1.y, p2.x, p2.y);
    }



}