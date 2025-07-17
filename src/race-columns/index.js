/**
 * Main RaceColumns visualization class that manages the animation and rendering
 */
export class RaceColumns {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.axis = new Axis(canvas, canvas.width, canvas.height, config);
    this.frames = [];
    this.currentFrameIndex = 0;
    this.animationId = null;
    this.isPlaying = false;
    this.columnCount = parseInt(config?.raceColumn?.columnCount) || 10;
    this.columnWidth = 0;
    this.columnGap = 0;
    this.columnRoundness = 0;
    this.columnColors = [];
    this.labels = [];
    this.values = [];
    this.columnLabelFont = '16px Arial';
    this.columnValueFont = '14px Arial';
    this.columnLabelColor = '#000000';
    this.columnValueColor = '#000000';
    this.columnLabelPadding = 10;
    this.columnValuePadding = 5;
    this.columnLabelMaxWidth = 100;
    this.columnValueMaxWidth = 50;
    this.columnLabelAlign = 'left';
    this.columnValueAlign = 'right';
    this.columnLabelBaseline = 'middle';
    this.columnValueBaseline = 'middle';
    this.columnLabelRotation = 0;
    this.columnValueRotation = 0;
    this.columnLabelOffsetX = 0;
    this.columnValueOffsetX = 0;
    this.columnLabelOffsetY = 0;
    this.columnValueOffsetY = 0;
    this.columnLabelClip = false;
    this.columnValueClip = false;
    this.columnLabelOverflow = 'ellipsis';
    this.columnValueOverflow = 'ellipsis';
    this.columnLabelWrap = false;
    this.columnValueWrap = false;
    this.columnLabelWrapWidth = 100;
    this.columnValueWrapWidth = 50;
    this.columnLabelWrapHeight = 20;
    this.columnValueWrapHeight = 20;
    this.columnLabelWrapLineHeight = 1.2;
    this.columnValueWrapLineHeight = 1.2;
    this.columnLabelWrapAlign = 'left';
    this.columnValueWrapAlign = 'right';
    this.columnLabelWrapBaseline = 'top';
    this.columnValueWrapBaseline = 'top';
    this.columnLabelWrapRotation = 0;
    this.columnValueWrapRotation = 0;
    this.columnLabelWrapOffsetX = 0;
    this.columnValueWrapOffsetX = 0;
    this.columnLabelWrapOffsetY = 0;
    this.columnValueWrapOffsetY = 0;
    this.columnLabelWrapClip = false;
    this.columnValueWrapClip = false;
    this.columnLabelWrapOverflow = 'ellipsis';
    this.columnValueWrapOverflow = 'ellipsis';
  }

  /**
   * Initializes the visualization with data
   */
  init(data, valueHeaders) {
    this.frames = DataFrame.generateAllFrames(
      data,
      valueHeaders,
      this.config?.raceColumn?.frames || 100,
      this.config?.raceColumn?.sort !== false
    );
    Axis.calculate(this.config, data, { values: valueHeaders }, this.frames);
    this.calculateColumnDimensions();
    this.currentFrameIndex = 0;
  }

  /**
   * Calculates column dimensions based on canvas size and config
   */
  calculateColumnDimensions() {
    const marginTop =
      parseFloat(this.config?.raceColumn?.marginTop) || 0;
    const marginBottom =
      parseFloat(this.config?.raceColumn?.marginBottom) || 0;
    const marginLeft =
      parseFloat(this.config?.raceColumn?.marginLeft) || 0;
    const marginRight =
      parseFloat(this.config?.raceColumn?.marginRight) || 0;

    const availableWidth =
      this.canvas.width - marginLeft - marginRight;
    const availableHeight =
      this.canvas.height - marginTop - marginBottom;

    this.columnWidth =
      (availableWidth - (this.columnCount - 1) * this.columnGap) /
      this.columnCount;
    this.columnHeight = availableHeight;
  }

  /**
   * Draws the current frame
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const frame = this.frames[this.currentFrameIndex];
    if (!frame) return;

    const { xScale, yScale } = this.axis.draw(frame);

    // Draw columns
    frame.idata.slice(0, this.columnCount).forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(0);
      const width = this.columnWidth;
      const height = yScale(d.frameValue) - yScale(0);

      // Draw column
      this.ctx.fillStyle = this.getColumnColor(i);
      this.ctx.beginPath();
      this.ctx.roundRect(
        x,
        y,
        width,
        height,
        this.columnRoundness
      );
      this.ctx.fill();

      // Draw label
      this.ctx.font = this.columnLabelFont;
      this.ctx.fillStyle = this.columnLabelColor;
      this.ctx.textAlign = this.columnLabelAlign;
      this.ctx.textBaseline = this.columnLabelBaseline;
      this.ctx.fillText(
        d.element[this.config?.raceColumn?.labelField || 'name'],
        x + this.columnLabelOffsetX,
        y + this.columnLabelOffsetY
      );

      // Draw value
      this.ctx.font = this.columnValueFont;
      this.ctx.fillStyle = this.columnValueColor;
      this.ctx.textAlign = this.columnValueAlign;
      this.ctx.textBaseline = this.columnValueBaseline;
      this.ctx.fillText(
        d.frameValue.toFixed(2),
        x + width - this.columnValueOffsetX,
        y + this.columnValueOffsetY
      );
    });
  }

  /**
   * Gets color for column based on index
   */
  getColumnColor(index) {
    if (this.columnColors.length > index) {
      return this.columnColors[index];
    }
    return `hsl(${(index * 30) % 360}, 70%, 60%)`;
  }

  /**
   * Starts the animation
   */
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.animate();
  }

  /**
   * Stops the animation
   */
  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.isPlaying) return;

    this.draw();
    this.currentFrameIndex =
      (this.currentFrameIndex + 1) % this.frames.length;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Goes to a specific frame
   */
  goToFrame(index) {
    this.currentFrameIndex = Math.min(
      Math.max(0, index),
      this.frames.length - 1
    );
    this.draw();
  }

  /**
   * Resizes the visualization
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.calculateColumnDimensions();
    this.draw();
  }
}
