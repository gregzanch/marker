export function throttle<FunctionSignature extends (...args: any[]) => any>(
  func: FunctionSignature,
  period: number,
  includeEnd: boolean = true
): (...args: Parameters<FunctionSignature>) => ReturnType<FunctionSignature> {
  let lastTimestamp = 0;
  let timeout: number;
  return function (...args: Parameters<FunctionSignature>) {
    const currentTimestamp = Date.now();
    if (timeout) {
      clearTimeout(timeout);
    }
    const timeElapsted = currentTimestamp - lastTimestamp;
    if (timeElapsted >= period) {
      lastTimestamp = currentTimestamp;
      return func(...args);
    } else if (includeEnd) {
      timeout = setTimeout(() => {
        lastTimestamp = currentTimestamp;
        func(...args);
      }, period - (currentTimestamp - lastTimestamp));
    }
  };
}
