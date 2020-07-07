import { Faker } from './faker.module';

export function faker(options: Record<string, unknown>): Faker {
  return new Faker(options);
}
