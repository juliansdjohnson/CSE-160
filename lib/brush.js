

class Brush {
  // INPUT: options:
  //          shape = "triangle"
  //          size = 1
  //          color = vec3(1.0, 1.0, 1.0)
  //          segments = 3
  constructor(options = new Object()) {
    // initialize values
    this.shape = options.shape ? options.shape : "triangle";
    this.size = options.size ? options.size : 1;
    this.color = options.color ? options.color : new Vector4([1.0, 1.0, 1.0, 1.0]);
    this.segments = options.segments ? options.segments : 3;
  }

  getOptions() {
    return { shape : this.shape,
             size : this.size,
             color : new Vector4(this.color.elements),
             segments : this.segments };
  }
}
