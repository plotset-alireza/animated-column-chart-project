/**
 * Handles axis calculations and rendering for RaceColumns visualization
 */
export class Axis {
  constructor(canvas, width, height, config) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.config = config;
    this._marginTop = 0;
    this._marginBottom = 0;
    this._marginLeft = 0;
    this._marginRight = 0;
  }

  setMargins(top, bottom, left, right) {
    this._marginTop = top;
    this._marginBottom = bottom;
    this._marginLeft = left;
    this._marginRight = right;
  }

  draw(dataFrame) {
    const marginTop =
      this._marginTop +
      (parseFloat(this.config.raceColumn.yAxis.topPadding) * this.height) / 100;
    const marginLeft = this._marginLeft;
    const marginBottom = this._marginBottom + this.height * 0.1;
    const marginRight = this._marginRight + 0;

    const maxTextWidth = 50;
    const axisLeftMargin =
      maxTextWidth + parseFloat(this.config.raceColumn.yAxis.labelsPadding);
    const axisBottomMargin = 0;

    const yScale = new linear2()
      .domain([dataFrame.axisConfig.yAxis.min, dataFrame.axisConfig.yAxis.max])
      .range([this.height - axisBottomMargin - marginBottom, marginTop]);

    const xScale = new linear2()
      .domain([0, parseInt(this.config?.raceColumn?.columnCount)])
      .range([axisLeftMargin + marginLeft, this.width - marginRight]);

    const ctx = this.canvas.getContext('2d');
    
    // Draw y-axis line if enabled
    if (this.config?.raceColumn?.yAxis?.axisLine) {
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(yScale.domain()[0]));
      ctx.lineTo(xScale(0), yScale(yScale.domain()[1]));
      ctx.strokeStyle = this.config?.raceColumn?.yAxis?.axisLinesColor;
      ctx.lineWidth = parseFloat(this.config?.raceColumn?.yAxis?.axisLineWidth);
      ctx.stroke();
    }

    // Draw x-axis line if enabled
    if (this.config?.raceColumn?.xAxis?.axisLine) {
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(yScale.domain()[0]));
      ctx.lineTo(xScale(xScale.domain()[1]), yScale(yScale.domain()[0]));
      ctx.strokeStyle = this.config?.raceColumn?.xAxis?.axisLinesColor;
      ctx.lineWidth = parseFloat(this.config?.raceColumn?.xAxis?.axisLineWidth);
      ctx.stroke();
    }

    // Draw y-axis labels and ticks if enabled
    if (this.config.raceColumn.yAxis.showLabels) {
      dataFrame.axisConfig.yAxis.yAxisTicks.forEach((tick) => {
        ctx.font = '18px serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.config.raceColumn.yAxis.labelsColor;
        ctx.fillText(tick.value, maxTextWidth + marginLeft, yScale(tick.value));

        if (this.config.raceColumn.yAxis.tickLineShow) {
          ctx.beginPath();
          ctx.moveTo(xScale(0), yScale(tick.value));
          ctx.lineTo(
            xScale(0) + this.config.raceColumn.yAxis.tickLineSize,
            yScale(tick.value)
          );
          ctx.strokeStyle = this.config.raceColumn.yAxis.tickLineColor;
          ctx.lineWidth = parseFloat(
            this.config?.raceColumn?.yAxis?.tickLineStrokeWidth
          );
          ctx.stroke();
        }

        if (this.config?.raceColumn?.yAxis?.gridLines) {
          ctx.beginPath();
          ctx.moveTo(xScale(0), yScale(tick.value));
          ctx.lineTo(xScale(xScale.domain()[1]), yScale(tick.value));
          ctx.strokeStyle = this.config?.raceColumn?.yAxis?.gridLinesColor;
          ctx.lineWidth = parseFloat(
            this.config?.raceColumn?.yAxis?.gridLinesWidth
          );
          ctx.stroke();
        }
      });
    }

    return { xScale, yScale };
  }

  static calculate(chartConfig, data, col_rel, frames) {
    if (frames) {
      if (chartConfig?.raceColumn?.yAxis.scaleType === 'custom') {
        const min = chartConfig.raceColumn.yAxis.customScaleMin;
        const max = chartConfig.raceColumn.yAxis.customScaleMax;
        frames.forEach((frame) => {
          frame.axisConfig = {
            yAxis: {
              min,
              max,
            },
          };
        });
      } else if (chartConfig?.raceColumn?.yAxis.scaleType === 'dynamic1') {
        frames.forEach((frame) => {
          let min = Number.MAX_VALUE,
            max = Number.MIN_VALUE;
          frame.idata.forEach((d) => {
            const n = d.frameValue;
            if (n > max) max = n;
            if (n < min) min = n;
          });
          if (min !== Number.MAX_VALUE && min !== 0) min -= 0.1 * min;
          if (max !== Number.MIN_VALUE) max += 0.1 * max;
          frame.axisConfig = {
            yAxis: {
              min,
              max,
            },
          };
        });
      } else {
        let min = Number.MAX_VALUE,
          max = Number.MIN_VALUE;
        data.forEach((d) => {
          col_rel['values'].forEach((c) => {
            const n = parseFloat(d[c]);
            if (!isNaN(n)) {
              if (n > max) max = n;
              if (n < min) min = n;
            }
          });
        });
        if (min !== Number.MAX_VALUE && min !== 0) min -= 0.1 * min;
        if (max !== Number.MIN_VALUE) max += 0.1 * max;
        frames.forEach((frame) => {
          frame.axisConfig = {
            yAxis: {
              min,
              max,
            },
          };
        });
      }
      this.processTickTransitions(frames, chartConfig);
    }
  }

  static processTickTransitions(frames, chartConfig) {
    const transitionFrames = 40;
    let ticksCount = 5;
    if (chartConfig?.raceColumn?.yAxis?.labelsSamplingType === 'custom') {
      ticksCount = parseInt(
        chartConfig?.raceColumn?.yAxis?.labelsSamplingInterval
      );
    }

    const currentTickValues = ticks(
      frames[0].axisConfig.yAxis.min,
      frames[0].axisConfig.yAxis.max,
      ticksCount
    );
    const previousTicks = currentTickValues;

    const ticksToAdd = currentTickValues.filter(
      (v) => !previousTicks.includes(v)
    );
    const ticksToRemove = previousTicks.filter(
      (v) => !currentTickValues.includes(v)
    );

    frames.forEach((frame, frameIndex) => {
      let yAxisTicks = currentTickValues.map((t) => ({
        value: t,
        opacity: ticksToAdd.includes(t) ? 0 : 1,
      }));

      ticksToRemove.forEach((tickValue) => {
        yAxisTicks.push({
          value: tickValue,
          opacity: 1,
          isRemoving: true,
        });
      });

      const transitionProgress = Math.min(frameIndex / transitionFrames, 1);
      yAxisTicks = yAxisTicks.map((tick) => {
        if (ticksToAdd.includes(tick.value)) {
          return {
            ...tick,
            opacity: transitionProgress,
          };
        } else if (tick.isRemoving) {
          return {
            ...tick,
            opacity: 1 - transitionProgress,
          };
        }
        return tick;
      });

      if (frameIndex >= transitionFrames) {
        yAxisTicks = yAxisTicks.filter((tick) => !tick.isRemoving);
      }

      frame.axisConfig.yAxis.yAxisTicks = yAxisTicks;
    });
  }
}
