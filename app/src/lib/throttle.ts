export function throttle<FunctionSignature extends (...args: any[]) => any>(
  func: FunctionSignature,
  period: number
): (...args: Parameters<FunctionSignature>) => ReturnType<FunctionSignature> {
  let lastTimestamp = 0;
  return function (...args: Parameters<FunctionSignature>) {
    const currentTimestamp = Date.now();
    const timeElapsted = currentTimestamp - lastTimestamp;
    if (timeElapsted > period) {
      lastTimestamp = currentTimestamp;
      return func(...args);
    }
  };
}
