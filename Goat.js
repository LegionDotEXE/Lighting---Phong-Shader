// Goat.js

// Adapted from BlockyAnimal.js for the 3D world

class Goat {
  constructor() {
    this.position = [0, 0, 0]; // world position
    this.rotation = 0;       
    this.scale = 1.0;
    this.animation = true;
    this.seconds = 0;

    // Joint angles
    this.headAngle = 0;
    this.tailAngle = 0;
    this.flUpperAngle = 0;  // front left upper leg
    this.flLowerAngle = 0;  // front left lower leg
    this.flHoofAngle = 0;   // front left hoof (3rd level)
    this.frUpperAngle = 0;  // front right upper leg
    this.frLowerAngle = 0;  // front right lower leg
    this.frHoofAngle = 0;   // front right hoof
    this.blUpperAngle = 0;  // back left upper leg
    this.blLowerAngle = 0;  // back left lower leg
    this.blHoofAngle = 0;   // back left hoof
    this.brUpperAngle = 0;  // back right upper leg
    this.brLowerAngle = 0;  // back right lower leg
    this.brHoofAngle = 0;   // back right hoof
  }

  updateAnimation(seconds) {
    this.seconds = seconds;
    if (!this.animation) return;

    var t = seconds * 4;
    this.flUpperAngle = 25 * Math.sin(t);
    this.flLowerAngle = 15 * Math.sin(t + 0.5);
    this.flHoofAngle  = 10 * Math.sin(t + 1.0);

    this.frUpperAngle = 25 * Math.sin(t + Math.PI);
    this.frLowerAngle = 15 * Math.sin(t + Math.PI + 0.5);
    this.frHoofAngle  = 10 * Math.sin(t + Math.PI + 1.0);

    this.blUpperAngle = 25 * Math.sin(t + Math.PI);
    this.blLowerAngle = 15 * Math.sin(t + Math.PI + 0.5);
    this.blHoofAngle  = 10 * Math.sin(t + Math.PI + 1.0);

    this.brUpperAngle = 25 * Math.sin(t);
    this.brLowerAngle = 15 * Math.sin(t + 0.5);
    this.brHoofAngle  = 10 * Math.sin(t + 1.0);

    this.headAngle = 8 * Math.sin(seconds * 2);
    this.tailAngle = 20 * Math.sin(seconds * 6);
  }

  // function to draw a leg with 3 segments (upper, lower, hoof)
  drawLeg(baseM, upperAngle, lowerAngle, hoofAngle, xOff, zOff) {
    // Upper leg attaches to bottom of body
    var upperM = new Matrix4(baseM);
    upperM.translate(xOff, 0, zOff);                   // position on body
    upperM.rotate(parseFloat(upperAngle), 0, 0, 1);    // joint rotation

    var upper = new Cube();
    upper.color = [0.8, 0.7, 0.55, 1.0];
    upper.textureNum = -1; // solid color, no texture
    upper.matrix = new Matrix4(upperM);
    upper.matrix.translate(-0.04, -0.18, -0.04);
    upper.matrix.scale(0.08, 0.18, 0.08);
    upper.render();

    // Lower leg hangs from bottom of upper leg
    var lowerM = new Matrix4(upperM);
    lowerM.translate(0, -0.18, 0);
    lowerM.rotate(parseFloat(lowerAngle), 0, 0, 1);

    var lower = new Cube();
    lower.color = [0.75, 0.65, 0.5, 1.0];
    lower.textureNum = -1;
    lower.matrix = new Matrix4(lowerM);
    lower.matrix.translate(-0.035, -0.16, -0.035);
    lower.matrix.scale(0.07, 0.16, 0.07);
    lower.render();

    // Hoof at bottom of lower leg
    var hoofM = new Matrix4(lowerM);
    hoofM.translate(0, -0.16, 0);
    hoofM.rotate(parseFloat(hoofAngle), 0, 0, 1);

    var hoof = new Cube();
    hoof.color = [0.25, 0.2, 0.15, 1.0];
    hoof.textureNum = -1;
    hoof.matrix = new Matrix4(hoofM);
    hoof.matrix.translate(-0.045, -0.06, -0.045);
    hoof.matrix.scale(0.09, 0.06, 0.09);
    hoof.render();
  }

  render() {
    // Base transformation for the whole goat
    function goatBase(pos, rot, scl) {
      var m = new Matrix4();
      m.translate(pos[0], pos[1], pos[2]);
      m.rotate(rot, 0, 1, 0);
      m.scale(scl, scl, scl);
      return m;
    }

    var base = goatBase(this.position, this.rotation, this.scale);

    // Body
    var body = new Cube();
    body.color = [0.85, 0.75, 0.6, 1.0];
    body.textureNum = -1;
    body.matrix = new Matrix4(base);
    body.matrix.translate(-0.25, -0.05, -0.15);
    body.matrix.scale(0.5, 0.3, 0.3);
    body.render();

    // Head
    var headM = new Matrix4(base);
    headM.translate(0.25, 0.1, 0);     
    headM.rotate(parseFloat(this.headAngle), 0, 0, 1);

    var head = new Cube();
    head.color = [0.9, 0.8, 0.65, 1.0];
    head.textureNum = -1;
    head.matrix = new Matrix4(headM);
    head.matrix.translate(0, -0.05, -0.1);
    head.matrix.scale(0.18, 0.2, 0.2);
    head.render();

    // Snout
    var snout = new Cube();
    snout.color = [0.95, 0.85, 0.7, 1.0];
    snout.textureNum = -1;
    snout.matrix = new Matrix4(headM);
    snout.matrix.translate(0.14, -0.07, -0.06);
    snout.matrix.scale(0.1, 0.1, 0.12);
    snout.render();

    // Ears
    var earL = new Cube();
    earL.color = [0.75, 0.6, 0.45, 1.0];
    earL.textureNum = -1;
    earL.matrix = new Matrix4(headM);
    earL.matrix.translate(0.02, 0.14, -0.14);
    earL.matrix.rotate(-25, 1, 0, 0);
    earL.matrix.scale(0.06, 0.03, 0.07);
    earL.render();

    var earR = new Cube();
    earR.color = [0.75, 0.6, 0.45, 1.0];
    earR.textureNum = -1;
    earR.matrix = new Matrix4(headM);
    earR.matrix.translate(0.02, 0.14, 0.07);
    earR.matrix.rotate(25, 1, 0, 0);
    earR.matrix.scale(0.06, 0.03, 0.07);
    earR.render();

    // Horns
    var hornL = new Cone();
    hornL.color = [0.55, 0.5, 0.4, 1.0];
    hornL.matrix = new Matrix4(headM);
    hornL.matrix.translate(0.02, 0.12, -0.12);
    hornL.matrix.rotate(15, 0, 0, 1);
    hornL.matrix.rotate(-20, 1, 0, 0);
    hornL.matrix.scale(0.04, 0.14, 0.04);
    hornL.render();

    var hornR = new Cone();
    hornR.color = [0.55, 0.5, 0.4, 1.0];
    hornR.matrix = new Matrix4(headM);
    hornR.matrix.translate(0.02, 0.12, 0.08);
    hornR.matrix.rotate(15, 0, 0, 1);
    hornR.matrix.rotate(20, 1, 0, 0);
    hornR.matrix.scale(0.04, 0.14, 0.04);
    hornR.render();

    // Beard
    var beard = new Cube();
    beard.color = [0.7, 0.6, 0.45, 1.0];
    beard.textureNum = -1;
    beard.matrix = new Matrix4(headM);
    beard.matrix.translate(0.13, -0.12, -0.03);
    beard.matrix.scale(0.04, 0.08, 0.06);
    beard.render();

    // Tail
    var tail = new Cube();
    tail.color = [0.8, 0.7, 0.55, 1.0];
    tail.textureNum = -1;
    tail.matrix = new Matrix4(base);
    tail.matrix.translate(-0.25, 0.18, -0.03);
    tail.matrix.rotate(-40, 0, 0, 1);
    tail.matrix.rotate(parseFloat(this.tailAngle), 1, 0, 0);
    tail.matrix.translate(-0.12, 0, 0);
    tail.matrix.scale(0.12, 0.05, 0.05);
    tail.render();

    // LEGS (4 legs, each 3 levels deep)
    // Body goes from x: -0.25 to 0.25, y: -0.05, z: -0.15 to 0.15

    var legBase = new Matrix4(base);
    legBase.translate(0, -0.05, 0);

    // Front left
    this.drawLeg(legBase, this.flUpperAngle, this.flLowerAngle, this.flHoofAngle, 0.18, -0.1);

    // Front right
    this.drawLeg(legBase, this.frUpperAngle, this.frLowerAngle, this.frHoofAngle, 0.18, 0.1);

    // Back left
    this.drawLeg(legBase, this.blUpperAngle, this.blLowerAngle, this.blHoofAngle, -0.18, -0.1);

    // Back right
    this.drawLeg(legBase, this.brUpperAngle, this.brLowerAngle, this.brHoofAngle, -0.18, 0.1);
  }
}