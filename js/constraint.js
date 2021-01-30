class Constraint1 {

    constructor(body1, body2) {
        this.constraint = Constraint.create({
            bodyA: body1,
            bodyB: body2,
            stiffness: 5,
            length: 3
        });

        World.add(world, this.constraint);


    }



}