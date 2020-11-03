import '@tensorflow/tfjs-backend-webgl';
import './utils';

// Core library
export * from './core/stream';
export * from './core/module';
export { default as ModuleBase } from './core/ModuleBase.svelte';
export * from './core/model';
export * from './core/classifier';
export * from './core/types';
export * from './core/logger';
export * from './backend';
export { throwError } from './utils/error-handling';

// Dashboards & Wizards
export { createDashboard } from './dashboard';
export type { DashboardOptions, Dashboard } from './dashboard';
export { createWizard } from './wizard';
export type { Wizard } from './wizard';

// Modules
export * from './modules/account';
export * from './modules/batch-prediction';
export * from './modules/browser';
export * from './modules/button';
export * from './modules/chart';
export * from './modules/confusion';
export * from './modules/dataset';
export * from './modules/faker';
export * from './modules/image-drop';
export * from './modules/mobilenet';
export * from './modules/parameters';
export * from './modules/prediction-plot';
export * from './modules/progress';
export * from './modules/sketchpad';
export * from './modules/text';
export * from './modules/textfield';
export * from './modules/toggle';
export * from './modules/training-plot';
export * from './modules/select';
export * from './modules/slider';
export * from './modules/webcam';

// Models
export * from './modules/dnn';
export * from './modules/mlp';
export * from './modules/knn';
