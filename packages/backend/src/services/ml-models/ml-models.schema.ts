// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const mlModelsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    files: Type.Array(Type.Tuple([Type.String(), Type.String()])),
    format: Type.String(),
    metadata: Type.Record(Type.String(), Type.Unknown()),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
  },
  { $id: 'MlModels', additionalProperties: true },
);
export type MlModels = Static<typeof mlModelsSchema>;
export const mlModelsValidator = getValidator(mlModelsSchema, dataValidator);
export const mlModelsResolver = resolve<MlModels, HookContext>({});

export const mlModelsExternalResolver = resolve<MlModels, HookContext>({});

// Schema for creating new entries
export const mlModelsDataSchema = Type.Pick(
  mlModelsSchema,
  ['name', 'files', 'format', 'metadata'],
  {
    $id: 'MlModelsData',
  },
);
export type MlModelsData = Static<typeof mlModelsDataSchema>;
export const mlModelsDataValidator = getValidator(mlModelsDataSchema, dataValidator);
export const mlModelsDataResolver = resolve<MlModels, HookContext>({});

// Schema for updating existing entries
export const mlModelsPatchSchema = Type.Partial(mlModelsSchema, {
  $id: 'MlModelsPatch',
});
export type MlModelsPatch = Static<typeof mlModelsPatchSchema>;
export const mlModelsPatchValidator = getValidator(mlModelsPatchSchema, dataValidator);
export const mlModelsPatchResolver = resolve<MlModels, HookContext>({});

// Schema for allowed query properties
export const mlModelsQueryProperties = Type.Pick(mlModelsSchema, [
  '_id',
  'name',
  'files',
  'format',
  'metadata',
  'createdAt',
  'updatedAt',
]);
export const mlModelsQuerySchema = Type.Intersect(
  [
    querySyntax(mlModelsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: true }),
  ],
  { additionalProperties: true },
);
export type MlModelsQuery = Static<typeof mlModelsQuerySchema>;
export const mlModelsQueryValidator = getValidator(mlModelsQuerySchema, queryValidator);
export const mlModelsQueryResolver = resolve<MlModelsQuery, HookContext>({});
