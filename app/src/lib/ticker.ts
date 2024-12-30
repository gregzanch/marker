export class Ticker {
  value = 0;
  constructor(public wrap: number = Infinity) {}
  increment() {
    this.value++;
    if (this.value > this.wrap) {
      this.value = 0;
    }
    return this.value;
  }
}
