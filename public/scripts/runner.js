/**
 * A vector for 2d space.
 * @param {integer} x - Center x coordinate.
 * @param {integer} y - Center y coordinate.
 * @param {integer} dx - Change in x.
 * @param {integer} dy - Change in y.
 */
function Vector(x, y, dx, dy) {
  // position
  this.x = x || 0;
  this.y = y || 0;
  // direction
  this.dx = dx || 0;
  this.dy = dy || 0;
}
/**
 * Advance the vectors position by dx,dy
 */
Vector.prototype.advance = function() {
  this.x += this.dx;
  this.y += this.dy;
};
/**
 * Get the minimum distance between two vectors
 * @param {Vector}
 * @return minDist
 */
Vector.prototype.minDist = function(vec) {
  var minDist = Infinity;
  var max     = Math.max( Math.abs(this.dx), Math.abs(this.dy),
                          Math.abs(vec.dx ), Math.abs(vec.dy ) );
  var slice   = 1 / max;
  var x, y, distSquared;
  // get the middle of each vector
  var vec1 = {}, vec2 = {};
  vec1.x = this.x + this.width/2;
  vec1.y = this.y + this.height/2;
  vec2.x = vec.x + vec.width/2;
  vec2.y = vec.y + vec.height/2;
  for (var percent = 0; percent < 1; percent += slice) {
    x = (vec1.x + this.dx * percent) - (vec2.x + vec.dx * percent);
    y = (vec1.y + this.dy * percent) - (vec2.y + vec.dy * percent);
    distSquared = x * x + y * y;

    minDist = Math.min(minDist, distSquared);
  }

  return Math.sqrt(minDist);
};

(function () {
  // define variables
  var canvas = document.getElementById('canvas');
  $(canvas).attr('width', '375').attr('height', '135');
  
  var player, score, stop, ticker;
  var ground = [], water = [], enemies = [], environment = [];
  // platform variables
  var platformHeight, platformLength, gapLength;
  var platformBase = canvas.height - platformWidth;  // bottom row of the game
  var platformSpacer = 64;

  var ctx = canvas.getContext('2d');
  var platformWidth = 390;
  var platformHeight = 135;

  /**
   * Asset pre-loader object. Loads all images
   */
  var assetLoader = (function() {
    // images dictionary
    this.imgs        = {                //sky, backdrop, backdrop2, grass, avatar_normal
      'clouds'   : '../obs/clouds.png',
      'lion'     : '../obs/lion.png',
      'owl'      : '../obs/owl.png',
      'penguin'  : '../obs/penguin.png',
      'pika'     : '../obs/pika.png',
      'road'     : '../obs/road.png',
      'run'      : '../obs/run.png',
      'snake'    : '../obs/snake.png'
    };

    var assetsLoaded = 0;                                // how many assets have been loaded
    var numImgs      = Object.keys(this.imgs).length;    // total number of image assets
    this.totalAssest = numImgs;                          // total number of assets

    /**
     * Ensure all assets are loaded before using them
     * @param {number} dic  - Dictionary name ('imgs', 'sounds', 'fonts')
     * @param {number} name - Asset name in the dictionary
     */
    function assetLoaded(dic, name) {
      // don't count assets that have already loaded
      if (this[dic][name].status !== 'loading') {
        return;
      }

      this[dic][name].status = 'loaded';
      assetsLoaded++;

      // finished callback
      if (assetsLoaded === this.totalAssest && typeof this.finished === 'function') {
        this.finished();
      }
    }

    /**
     * Create assets, set callback for asset loading, set asset source
     */
    this.downloadAll = function() {
      var _this = this;
      var src;

      // load images
      for (var img in this.imgs) {
        if (this.imgs.hasOwnProperty(img)) {
          src = this.imgs[img];

          // create a closure for event binding
          (function(_this, img) {
            _this.imgs[img] = new Image();
            _this.imgs[img].status = 'loading';
            _this.imgs[img].name = img;
            _this.imgs[img].onload = function() { assetLoaded.call(_this, 'imgs', img) };
            _this.imgs[img].src = src;
          })(_this, img);
        }
      }
    }

    return {
      imgs: this.imgs,
      totalAssest: this.totalAssest,
      downloadAll: this.downloadAll
    };
  })();

  assetLoader.finished = function() {
    startGame();
  }

  /**
   * Creates a Spritesheet
   * @param {string} - Path to the image.
   * @param {number} - Width (in px) of each frame.
   * @param {number} - Height (in px) of each frame.
   */
  function SpriteSheet(path, frameWidth, frameHeight) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    // calculate the number of frames in a row after the image loads
    var self = this;
    this.image.onload = function() {
      self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
    };

    this.image.src = path;
  }

  function Sprite(x, y, type) {
    this.x      = x;
    this.y      = y;
    this.width  = platformWidth;
    this.height = platformWidth;
    this.type   = type;
    Vector.call(this, x, y, 0, 0);
    /**
     * Update the Sprite's position by the player's speed
     */
    this.update = function() {
      this.dx = -player.speed;
      this.advance();
    };
    /**
     * Draw the sprite at it's current position
     */
    this.draw = function() {
      ctx.drawImage(assetLoader.imgs[this.type], this.x, this.y);
    };
  }
  Sprite.prototype = Object.create(Vector.prototype);

  /**
   * Creates an animation from a spritesheet.
   * @param {SpriteSheet} - The spritesheet used to create the animation.
   * @param {number}      - Number of frames to wait for before transitioning the animation.
   * @param {array}       - Range or sequence of frame numbers for the animation.
   * @param {boolean}     - Repeat the animation once completed.
   */
  function Animation(spritesheet, frameSpeed, startFrame, endFrame) {

    var animationSequence = [];  // array holding the order of the animation
    var currentFrame = 0;        // the current frame to draw
    var counter = 0;             // keep track of frame rate

    // start and end range for frames
    for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
      animationSequence.push(frameNumber);

    /**
     * Update the animation
     */
    this.update = function() {

      // update to the next frame if it is time
      if (counter == (frameSpeed - 1))
        currentFrame = (currentFrame + 1) % animationSequence.length;

      // update the counter
      counter = (counter + 1) % frameSpeed;
    };

    /**
     * Draw the current frame
     * @param {integer} x - X position to draw
     * @param {integer} y - Y position to draw
     */
    this.draw = function(x, y) {
      // get the row and col of the frame
      var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
      var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

      ctx.drawImage(
        spritesheet.image,
        col * spritesheet.frameWidth, row * spritesheet.frameHeight,
        spritesheet.frameWidth, spritesheet.frameHeight,
        x, y,
        spritesheet.frameWidth, spritesheet.frameHeight);
    };
  }

  /**
   * Create a parallax background
   */
  var background = (function() {
    var road = {};
    var clouds = {};

    /**
     * Draw the backgrounds to the screen at different speeds
     */
    this.draw = function() {

      // Pan background
      road.x -= road.speed;
      road.y = 0;
      clouds.x -= clouds.speed;

      // draw images side by side to loop

      ctx.drawImage(assetLoader.imgs.road, road.x, road.y);
      ctx.drawImage(assetLoader.imgs.road, road.x + canvas.width, road.y);

      ctx.drawImage(assetLoader.imgs.clouds, clouds.x, clouds.y);
      ctx.drawImage(assetLoader.imgs.clouds, clouds.x + canvas.width, clouds.y);

      // If the image scrolled off the screen, reset
      if (road.x + assetLoader.imgs.road.width <= 0)
        road.x = 0;
      if (clouds.x + assetLoader.imgs.clouds.width <= 0)
        clouds.x = 0;
    };

    /**
     * Reset background to zero
     */
    this.reset = function()  {

      road.x = 0;
      road.y = 0;
      road.speed = 0.6;

      clouds.x = 0;
      clouds.y = 0;
      clouds.speed = 0.3;
    }

    return {
      draw: this.draw,
      reset: this.reset
    };
  })();

  /**
 * The player object
 */
var player = (function(player) {
  // add properties directly to the player imported object
  player.width     = 36;
  player.height    = 46;
  player.speed     = 6;
  // jumping
  player.gravity   = 1;
  player.dy        = 0;
  player.jumpDy    = -10;
  player.isFalling = false;
  player.isJumping = false;
  // spritesheets
  player.sheet  = new SpriteSheet('../obs/run.png', player.width, player.height);
  player.walkAnim  = new Animation(player.sheet, 10, 0, 1);
  player.jumpAnim  = new Animation(player.sheet, 10, 1, 1);
  player.fallAnim  = new Animation(player.sheet, 10, 1, 1);
  player.anim      = player.walkAnim;
  Vector.call(player, 0, 0, 0, player.dy);
  var jumpCounter = 0;  // how long the jump button can be pressed down
  /**
   * Update the player's position and animation
   */
  player.update = function() {
    // jump if not currently jumping or falling
    if (KEY_STATUS.space && player.dy === 0 && !player.isJumping) {
      player.isJumping = true;
      player.dy = player.jumpDy;
      jumpCounter = 12;
    }
    // jump higher if the space bar is continually pressed
    if (KEY_STATUS.space && jumpCounter) {
      player.dy = player.jumpDy;
    }
    jumpCounter = Math.max(jumpCounter-1, 0);
    this.advance();
    // add gravity
    if (player.isFalling || player.isJumping) {
      player.dy += player.gravity;
    }
    // change animation if falling
    if (player.dy > 0) {
      player.anim = player.fallAnim;
    }
    // change animation is jumping
    else if (player.dy < 0) {
      player.anim = player.jumpAnim;
    }
    else {
      player.anim = player.walkAnim;
    }

    player.anim.update();
  };

  /**
   * Draw the player at it's current position
   */
  player.draw = function() {
    player.anim.draw(player.x, player.y);
  };

  /**
   * Reset the player's position
   */
  player.reset = function() {
    player.x = 25;
    player.y = 79;
  };

  return player;
})(Object.create(Vector.prototype));

/**
 * Keep track of the spacebar events
 */
var KEY_CODES = {
  32: "space"
};
var KEY_STATUS = {};
for (var code in KEY_CODES) {
  if (KEY_CODES.hasOwnProperty(code)) {
     KEY_STATUS[KEY_CODES[code]] = false;
  }
}
document.onkeydown = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
};
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
};

  /**
   * Game loop
   */
  function animate() {
    requestAnimFrame( animate );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();

    for (i = 0; i < ground.length; i++) {
      ground[i].x -= player.speed;
      //ctx.drawImage(assetLoader.imgs.grass, ground[i].x, ground[i].y);
    }

    if (ground[0].x <= -platformWidth) {
      ground.shift();
      ground.push({'x': ground[ground.length-1].x + platformWidth, 'y': platformHeight});
    }

    player.anim.update();
    player.anim.draw(25, 79);
  }

  /**
   * Request Animation Polyfill
   */
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  /**
   * Start the game - reset all variables and entities, spawn platforms and water.
   */
  function startGame() {
    // setup the player
    player.width  = 36;
    player.height = 46;
    player.speed  = 6;
    player.sheet  = new SpriteSheet('../obs/run.png', player.width, player.height);
    player.anim   = new Animation(player.sheet, 10, 0, 1);

    // create the ground tiles
    for (i = 0, length = Math.floor(canvas.width / platformWidth) + 5; i < length; i++) {
      ground[i] = {'x': i * platformWidth, 'y': platformHeight};
    }

    background.reset();

    animate();
  }

  assetLoader.downloadAll();
})();