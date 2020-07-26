import { Faker, FakerOptions } from './faker.module';

export function faker(options: FakerOptions): Faker {
  return new Faker(options);
}

export type { Faker, FakerOptions };
