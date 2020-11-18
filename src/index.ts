import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
// import { memory } from '@tensorflow/tfjs-core';
import './utils';

// setInterval(() => {
//   console.log('memory', memory());
// }, 2000);

// Core library
export * from './core';
export * from './backend';
export { throwError } from './utils/error-handling';

// Dashboards & Wizards
export { dashboard } from './dashboard';
export type { DashboardOptions, Dashboard } from './dashboard';
export { wizard } from './wizard';
export type { Wizard } from './wizard';

// Modules
export * from './modules';
