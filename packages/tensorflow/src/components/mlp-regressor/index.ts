import { MLPRegressor } from './mlp-regressor.component';

export function mlpRegressor(...args: ConstructorParameters<typeof MLPRegressor>): MLPRegressor {
  return new MLPRegressor(...args);
}

export * from './mlp-regressor.component';
