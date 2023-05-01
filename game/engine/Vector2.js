/**
 * A two-dimension vector.
 */
class Vector2 {
  x = 0
  y = 0

  /**
   * Static reference to `new Vector2(0,0)`
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-zero.html
   * </p>
   */
  static zero = new Vector2();

  /**
   * Static reference to `new Vector2(1,1)`
   * 
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-one.html
   * </p>
   */
  static one = new Vector2(1, 1)

  /**
   * Static reference to `new Vector2(1,0)`
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-right.html
   * </p>
   */
  static right = new Vector2(1, 0);

  /**
   * Static reference to `new Vector2(-1,0)`
   * 
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-left.html
   * </p>
   */
  static left = new Vector2(-1, 0)

  /**
   * Static reference to `new Vector2(0,1)`
   * 
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-up.html
   * </p>
   */
  static up = new Vector2(0, 1)

  /**
   * Static reference to `new Vector2(0,-1)`
   * 
   * <p>
   * Compare to https://docs.unity3d.com/ScriptReference/Vector2-down.html
   * </p>
   */
  static down = new Vector2(0, -1)

  /**
   * Creates a new Vector2
   * @param {Number} x The x value of the vector. Defaults to 0.
   * @param {Number} y The y value of the vector. Defaults to 0.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

//Add Vector2 to the global window object.
window.Vector2 = Vector2