/**
 * Handles data interpolation and frame generation for RaceColumns visualization
 */
export class DataFrame {
  constructor(index, data, totalFrames) {
    this.index = index;
    this.data = data;
    this.transitionFrames = 40;
    this.totalFrames = totalFrames;
    this.sort = true;
  }

  /**
   * Interpolates values between data points and calculates ranks
   */
  interpolateData(data) {
    const results = [];
    
    // Calculate interpolated values
    data.forEach((element) => {
      results.push({
        element,
        frameIndex: this.index,
        frameValue:
          element[this.data.d1.headerName] * (1 - this.data.d1.distance) +
          element[this.data.d2.headerName] * (1 - this.data.d2.distance),
      });
    });

    // Sort if enabled
    if (this.sort) {
      results.sort((a, b) => b.frameValue - a.frameValue);
    }

    // Calculate ranks and transitions
    results.forEach((element, i) => {
      element.newRank = i;
      
      // Initialize rank tracking if not present
      if (element.element.currentRank === undefined) {
        element.element.currentRank = i;
        element.element.destinationRank = i;
        element.element.transitionSpeed = 0;
      } else {
        // Update transition speed
        if (element.element.destinationRank !== i) {
          element.element.transitionSpeed =
            (i - element.element.currentRank) /
            Math.min(40, this.totalFrames - this.index - 1);
          element.element.destinationRank = i;
        }
        
        // Update current rank
        element.element.currentRank += element.element.transitionSpeed;
        
        // Snap to destination if close enough
        if (
          Math.abs(
            element.element.destinationRank - element.element.currentRank
          ) < 0.03
        ) {
          element.element.transitionSpeed = 0;
          element.element.currentRank = element.element.destinationRank;
        }
      }
      
      element.rank = element.element.currentRank;
    });

    return results;
  }

  /**
   * Generates all animation frames from the dataset
   */
  static generateAllFrames(data, valueHeaders, totalFrames, withSort = true) {
    // Clean up any existing rank data
    data.forEach((d) => {
      delete d.rank;
      delete d.currentRank;
      delete d.destinationRank;
      delete d.transitionSpeed;
    });

    // Create frames with interpolated data
    const frames = DataFrame.createFramesFromData(
      data,
      valueHeaders,
      totalFrames
    );

    // Process each frame
    frames.forEach((frame, index) => {
      frame.sort = withSort;
      frame.idata = frame.interpolateData(data);
    });

    return frames;
  }

  /**
   * Creates frames by distributing across value headers
   */
  static createFramesFromData(dataArray, valueHeaders, totalFrames) {
    const frames = [];
    const step = (valueHeaders.length - 1) / (totalFrames - 1);

    for (let i = 0; i < totalFrames; i++) {
      const frameIndex = Math.floor(step * i);
      const distance = step * i - frameIndex;

      const frameData = {
        d1: {
          headerName: valueHeaders[frameIndex],
          distance: distance
        },
        d2: {
          headerName: valueHeaders[frameIndex + 1] || valueHeaders[frameIndex],
          distance: 1 - distance
        }
      };

      frames.push(new DataFrame(i, frameData, totalFrames));
    }

    return frames;
  }
}
