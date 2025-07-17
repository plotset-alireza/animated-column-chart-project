import { ticks } from 'd3-array';
import { scaleLinear } from 'd3-scale';
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
    const marginTop = parseFloat(this.config?.raceColumn?.marginTop) || 0;
    const marginBottom = parseFloat(this.config?.raceColumn?.marginBottom) || 0;
    const marginLeft = parseFloat(this.config?.raceColumn?.marginLeft) || 0;
    const marginRight = parseFloat(this.config?.raceColumn?.marginRight) || 0;

    const axisLeftMargin = 60; // Space for y-axis labels
    const axisBottomMargin = 30; // Space for x-axis labels

    // Validate yAxis config
    if (!dataFrame.axisConfig?.yAxis || 
        typeof dataFrame.axisConfig.yAxis.min !== 'number' || 
        typeof dataFrame.axisConfig.yAxis.max !== 'number') {
      console.error('Invalid yAxis configuration in dataFrame');
      return { xScale: null, yScale: null };
    }

    // Validate xAxis config
    const columnCount = parseInt(this.config?.raceColumn?.columnCount || '0');
    if (isNaN(columnCount) || columnCount <= 0) {
      console.error('Invalid columnCount in config');
      return { xScale: null, yScale: null };
    }

    // Calculate chart area
    const chartLeft = marginLeft + axisLeftMargin;
    const chartTop = marginTop;
    const chartWidth = this.width - marginLeft - marginRight - axisLeftMargin;
    const chartHeight = this.height - marginTop - marginBottom - axisBottomMargin;

    const yScale = scaleLinear()
      .domain([dataFrame.axisConfig.yAxis.min, dataFrame.axisConfig.yAxis.max])
      .range([chartTop + chartHeight, chartTop]);

    const xScale = scaleLinear()
      .domain([0, columnCount])
      .range([chartLeft, chartLeft + chartWidth]);

    const ctx = this.canvas.getContext('2d');
    
    // Draw y-axis line if enabled
    if (this.config?.raceColumn?.yAxis?.axisLine) {
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartTop);
      ctx.lineTo(chartLeft, chartTop + chartHeight);
      ctx.strokeStyle = this.config?.raceColumn?.yAxis?.axisLinesColor || '#999';
      ctx.lineWidth = parseFloat(this.config?.raceColumn?.yAxis?.axisLineWidth) || 1;
      ctx.stroke();
    }

    // Draw x-axis line (always draw for proper chart structure)
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartTop + chartHeight);
    ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
    ctx.strokeStyle = this.config?.raceColumn?.yAxis?.axisLinesColor || '#999';
    ctx.lineWidth = parseFloat(this.config?.raceColumn?.yAxis?.axisLineWidth) || 1;
    ctx.stroke();

    // Draw y-axis labels and ticks if enabled
    if (this.config.raceColumn.yAxis.showLabels) {
      dataFrame.axisConfig.yAxis.yAxisTicks.forEach((tick) => {
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.config.raceColumn.yAxis.labelsColor;
        ctx.fillText(tick.value, chartLeft - 5, yScale(tick.value));

        if (this.config.raceColumn.yAxis.tickLineShow) {
          ctx.beginPath();
          ctx.moveTo(chartLeft - 3, yScale(tick.value));
          ctx.lineTo(chartLeft, yScale(tick.value));
          ctx.strokeStyle = this.config.raceColumn.yAxis.tickLineColor || '#999';
          ctx.lineWidth = parseFloat(this.config?.raceColumn?.yAxis?.tickLineStrokeWidth) || 1;
          ctx.stroke();
        }

        if (this.config?.raceColumn?.yAxis?.gridLines) {
          ctx.beginPath();
          ctx.moveTo(chartLeft, yScale(tick.value));
          ctx.lineTo(chartLeft + chartWidth, yScale(tick.value));
          ctx.strokeStyle = this.config?.raceColumn?.yAxis?.gridLinesColor || '#eee';
          ctx.lineWidth = parseFloat(this.config?.raceColumn?.yAxis?.gridLinesWidth) || 1;
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
