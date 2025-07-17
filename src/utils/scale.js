/**
 * Linear scale implementation similar to d3-scale
 */
export class linear2 {
  constructor() {
    this._domain = [0, 1];
    this._range = [0, 1];
    this._clamp = false;
  }

  domain(domain) {
    this._domain = domain;
    return this;
  }

  range(range) {
    this._range = range;
    return this;
  }

  clamp(clamp) {
    this._clamp = clamp;
    return this;
  }

  /**
   * Maps a value from the domain to the range
   */
  __call(value) {
    const [d0, d1] = this._domain;
    const [r0, r1] = this._range;
    
    if (this._clamp) {
      if (value <= d0) return r0;
      if (value >= d1) return r1;
    }
    
    const t = (value - d0) / (d1 - d0);
    return r0 + t * (r1 - r0);
  }
}
