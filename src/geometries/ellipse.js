import Vector2d from "./../math/vector2.js";
import * as pool from "./../system/pooling.js";

/**
 * @classdesc
 * an ellipse Object
 */
class Ellipse {
    /**
     * @param {number} x the center x coordinate of the ellipse
     * @param {number} y the center y coordinate of the ellipse
     * @param {number} w width (diameter) of the ellipse
     * @param {number} h height (diameter) of the ellipse
     */
    constructor(x, y, w, h) {
        /**
         * the center coordinates of the ellipse
         * @public
         * @type {Vector2d}
         * @name pos
         * @memberof Ellipse.prototype
         */
        this.pos = new Vector2d();

        /**
         * The bounding rectangle for this shape
         * @private
         */
        this._bounds = undefined;

        /**
         * Maximum radius of the ellipse
         * @public
         * @type {number}
         * @name radius
         * @memberof Ellipse.prototype
         */
        this.radius = NaN;

        /**
         * Pre-scaled radius vector for ellipse
         * @public
         * @type {Vector2d}
         * @name radiusV
         * @memberof Ellipse.prototype
         */
        this.radiusV = new Vector2d();

        /**
         * Radius squared, for pythagorean theorom
         * @public
         * @type {Vector2d}
         * @name radiusSq
         * @memberof Ellipse.prototype
         */
        this.radiusSq = new Vector2d();

        /**
         * x/y scaling ratio for ellipse
         * @public
         * @type {Vector2d}
         * @name ratio
         * @memberof Ellipse.prototype
         */
        this.ratio = new Vector2d();

        // the shape type
        this.shapeType = "Ellipse";
        this.setShape(x, y, w, h);
    }

    /** @ignore */
    onResetEvent(x, y, w, h) {
        this.setShape(x, y, w, h);
    }

    /**
     * set new value to the Ellipse shape
     * @name setShape
     * @memberof Ellipse.prototype
     * @function
     * @param {number} x the center x coordinate of the ellipse
     * @param {number} y the center y coordinate of the ellipse
     * @param {number} w width (diameter) of the ellipse
     * @param {number} h height (diameter) of the ellipse
     * @returns {Ellipse} this instance for objecf chaining
     */
    setShape(x, y, w, h) {
        var hW = w / 2;
        var hH = h / 2;

        this.pos.set(x, y);
        this.radius = Math.max(hW, hH);
        this.ratio.set(hW / this.radius, hH / this.radius);
        this.radiusV.set(this.radius, this.radius).scaleV(this.ratio);
        var r = this.radius * this.radius;
        this.radiusSq.set(r, r).scaleV(this.ratio);

        // update the corresponding bounds
        this.getBounds().setMinMax(x, y, x + w, x + h);
        // elipse position is the center of the cirble, bounds position are top left
        this.getBounds().translate(-this.radiusV.x, -this.radiusV.y);

        return this;
    }

    /**
     * Rotate this Ellipse (counter-clockwise) by the specified angle (in radians).
     * @name rotate
     * @memberof Ellipse.prototype
     * @function
     * @param {number} angle The angle to rotate (in radians)
     * @param {Vector2d|ObservableVector2d} [v] an optional point to rotate around
     * @returns {Ellipse} Reference to this object for method chaining
     */
    rotate(angle, v) {
        // TODO : only works for circle
        this.pos.rotate(angle, v);
        this.getBounds().shift(this.pos);
        this.getBounds().translate(-this.radiusV.x, -this.radiusV.y);
        return this;
    }

    /**
     * Scale this Ellipse by the specified scalar.
     * @name scale
     * @memberof Ellipse.prototype
     * @function
     * @param {number} x
     * @param {number} [y=x]
     * @returns {Ellipse} Reference to this object for method chaining
     */
    scale(x, y) {
        y = typeof (y) !== "undefined" ? y : x;
        return this.setShape(
            this.pos.x,
            this.pos.y,
            this.radiusV.x * 2 * x,
            this.radiusV.y * 2 * y
        );
    }

    /**
     * Scale this Ellipse by the specified vector.
     * @name scale
     * @memberof Ellipse.prototype
     * @function
     * @param {Vector2d} v
     * @returns {Ellipse} Reference to this object for method chaining
     */
    scaleV(v) {
        return this.scale(v.x, v.y);
    }

    /**
     * apply the given transformation matrix to this ellipse
     * @name transform
     * @memberof Ellipse.prototype
     * @function
     * @param {Matrix2d} matrix the transformation matrix
     * @returns {Polygon} Reference to this object for method chaining
     */
    transform(/* m */) {
        // TODO
        return this;
    }

    /**
     * translate the circle/ellipse by the specified offset
     * @name translate
     * @memberof Ellipse.prototype
     * @function
     * @param {number} x x offset
     * @param {number} y y offset
     * @returns {Ellipse} this ellipse
     */
    /**
     * translate the circle/ellipse by the specified vector
     * @name translate
     * @memberof Ellipse.prototype
     * @function
     * @param {Vector2d} v vector offset
     * @returns {Ellipse} this ellipse
     */
    translate() {
        var _x, _y;

        if (arguments.length === 2) {
            // x, y
            _x = arguments[0];
            _y = arguments[1];
        } else {
            // vector
            _x = arguments[0].x;
            _y = arguments[0].y;
        }

        this.pos.x += _x;
        this.pos.y += _y;
        this.getBounds().translate(_x, _y);

        return this;
    }

    /**
     * check if this circle/ellipse contains the specified point
     * @name contains
     * @memberof Ellipse.prototype
     * @function
     * @param {Vector2d} point
     * @returns {boolean} true if contains
     */

    /**
     * check if this circle/ellipse contains the specified point
     * @name contains
     * @memberof Ellipse.prototype
     * @function
     * @param  {number} x x coordinate
     * @param  {number} y y coordinate
     * @returns {boolean} true if contains
     */
    contains() {
        var _x, _y;

        if (arguments.length === 2) {
          // x, y
          _x = arguments[0];
          _y = arguments[1];
        } else {
          // vector
          _x = arguments[0].x;
          _y = arguments[0].y;
        }

        // Make position relative to object center point.
        _x -= this.pos.x;
        _y -= this.pos.y;
        // Pythagorean theorem.
        return (
            ((_x * _x) / this.radiusSq.x) +
            ((_y * _y) / this.radiusSq.y)
        ) <= 1.0;
    }

    /**
     * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
     * @name getBounds
     * @memberof Ellipse.prototype
     * @function
     * @returns {Bounds} this shape bounding box Rectangle object
     */
    getBounds() {
        if (typeof this._bounds === "undefined") {
            this._bounds = pool.pull("Bounds");
        }
        return this._bounds;
    }

    /**
     * clone this Ellipse
     * @name clone
     * @memberof Ellipse.prototype
     * @function
     * @returns {Ellipse} new Ellipse
     */
    clone() {
        return new Ellipse(
            this.pos.x,
            this.pos.y,
            this.radiusV.x * 2,
            this.radiusV.y * 2
        );
    }
};

export default Ellipse;
