
class Camera extends Component {
  /** The name of the component */
  name = "Camera"

  /** The fill color of the component */
  fillStyle

  constructor(fillStyle = "black") {
    super();

    //Set the background to fillStyle
    this.fillStyle = fillStyle
  }

  static getLogicalScale(ctx) {
    let browserAspectRatio = ctx.canvas.width / ctx.canvas.height;
    let browserWidth = ctx.canvas.width
    if (Globals.requestedAspectRatio <= browserAspectRatio)
      browserWidth -= (ctx.canvas.width - ctx.canvas.height * Globals.requestedAspectRatio)

    return browserWidth / Globals.logicalWidth

  }

  static getLogicalScaleZoomable(ctx) {
    let browserAspectRatio = ctx.canvas.width / ctx.canvas.height;
    let browserWidth = ctx.canvas.width
    if (Globals.requestedAspectRatio <= browserAspectRatio)
      browserWidth -= (ctx.canvas.width - ctx.canvas.height * Globals.requestedAspectRatio)

    return browserWidth / Globals.logicalWidth * Camera.main.transform.sx;
  }

  static getZeros(ctx) {
    let browserAspectRatio = ctx.canvas.width / ctx.canvas.height;
    let zeroX = 0;
    let zeroY = 0;
    let browserWidth = ctx.canvas.width

    if (Globals.requestedAspectRatio > browserAspectRatio)
      zeroY = (ctx.canvas.height - ctx.canvas.width / Globals.requestedAspectRatio) / 2;
    else
      zeroX = (ctx.canvas.width - ctx.canvas.height * Globals.requestedAspectRatio) / 2;

    return { zeroX, zeroY };
  }

  static screenToWorldSpace(x, y, ctx) {
    let logicalScaling = Camera.getLogicalScaleZoomable(ctx);

    x -= ctx.canvas.width / 2;
    y -= ctx.canvas.height / 2;

    x /= logicalScaling;
    y /= logicalScaling;

    x *= Camera.main.transform.sx;
    y *= Camera.main.transform.sy;

    x += Camera.main.transform.x;
    y += Camera.main.transform.y;


    return { x, y };
  }

  static worldToLogicalScreenSpace(x, y, ctx) {

    let logicalScaling = Camera.getLogicalScale(ctx);

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
    ctx.scale(logicalScaling, logicalScaling)

    ctx.scale(Camera.main.transform.sx, Camera.main.transform.sy);
    ctx.translate(-Camera.main.transform.x, -Camera.main.transform.y)

    let m = ctx.getTransform();
    let mx = x * m.m11 + y * m.m21 + m.m41;
    let my = x * m.m12 + y * m.m22 + m.m42; 
    ctx.restore()
    
    let logical = Camera.screenToLogicalScreenSpace(mx, my, ctx);
    
    let toReturn = { x: logical.x, y: logical.y }
    return toReturn
  }
  static screenToLogicalScreenSpace(x, y, ctx) {
    let logicalScaling = Camera.getLogicalScale(ctx)
    let zeros = Camera.getZeros(ctx);

    x -= zeros.zeroX;
    y -= zeros.zeroY
    x /= logicalScaling;
    y /= logicalScaling;

    return {x,y};
  }


  static get main() {
    let scene = SceneManager.getActiveScene();

    return scene.gameObjects[0].components[1]
  }
}

//Add circle to the global namespace.
window.Camera = Camera;