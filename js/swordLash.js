class SwordLash {

    // One-way tether: it only keeps the sword within `length` of the player.
    // It never applies any force to the player (no flying, no standing on it).
    constructor(playerBody, swordBody) {
        this.a = playerBody;
        this.b = swordBody;
        this.length = 90;
        this.lash = null;   // no Matter constraint anymore
    }

    apply() {
        var pa = this.a.position;
        var pb = this.b.position;
        var dx = pb.x - pa.x;
        var dy = pb.y - pa.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;

        if (d > this.length) {
            var nx = dx / d;
            var ny = dy / d;
            Body.setPosition(this.b, { x: pa.x + nx * this.length, y: pa.y + ny * this.length });

            // remove only the outward part of the velocity (keeps the swing)
            var v = this.b.velocity;
            var vr = v.x * nx + v.y * ny;
            if (vr > 0) {
                Body.setVelocity(this.b, { x: v.x - nx * vr, y: v.y - ny * vr });
            }
        }

        // floor (ground top edge is y=360)
        var floorY = 360 - this.b.circleRadius;
        if (this.b.position.y > floorY) {
            Body.setPosition(this.b, { x: this.b.position.x, y: floorY });
            Body.setVelocity(this.b, { x: this.b.velocity.x * 0.9, y: Math.min(0, this.b.velocity.y) });
        }
    }

    display() {
        push();
        stroke(30);
        strokeWeight(2);
        line(this.a.position.x, this.a.position.y, this.b.position.x, this.b.position.y);
        pop();
    }

}