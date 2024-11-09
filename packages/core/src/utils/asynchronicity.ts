export const preventConcurrentCalls = (propertyName: string) =>
  function preventConcurrentCallsDecorator(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function checkMethod(...args: unknown[]): unknown {
      const res = ((this as Record<string, unknown>)[propertyName] as Promise<unknown>).then(() =>
        originalMethod.apply(this, args),
      );
      ((this as Record<string, unknown>)[propertyName] as Promise<unknown>) = res;
      return res;
    };

    return descriptor;
  };
