// Sphere.Js

class Sphere {

    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.buffer = null;
        this.normalBuffer = null;
        this.vertices = null;
        this.normals = null;
        this.vertCount = 0;
        this.segments = 12;
        this.generateSphere();
    }

    generateSphere() {
        var verts = [];
        var norms = [];
        var d = Math.PI / this.segments;

        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < 2 * Math.PI; r += d) {
                var p1 = [Math.sin(t) * Math.cos(r), Math.cos(t), Math.sin(t) * Math.sin(r)];
                var p2 = [Math.sin(t + d) * Math.cos(r), Math.cos(t + d), Math.sin(t + d) * Math.sin(r)];
                var p3 = [Math.sin(t) * Math.cos(r + d), Math.cos(t), Math.sin(t) * Math.sin(r + d)];
                var p4 = [Math.sin(t + d) * Math.cos(r + d), Math.cos(t + d), Math.sin(t + d) * Math.sin(r + d)];

                verts.push(...p1, ...p2, ...p4);
                verts.push(...p1, ...p4, ...p3);

                norms.push(...p1, ...p2, ...p4);
                norms.push(...p1, ...p4, ...p3);
            }
        }

        this.vertices = new Float32Array(verts);
        this.normals = new Float32Array(norms);
        this.vertCount = verts.length / 3;
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.disableVertexAttribArray(a_UV);
        gl.vertexAttrib2f(a_UV, 0, 0);

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        if (this.normalBuffer === null) {
            this.normalBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);
    }
}