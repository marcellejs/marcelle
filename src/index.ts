import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
// import { memory } from '@tensorflow/tfjs-core';
import './utils';
import './ui/style/styles.css';

// setInterval(() => {
//   console.log('memory', memory());
// }, 2000);

// Core library
export * from './core';
export * from './data-store';
export { throwError } from './utils/error-handling';
export { notification } from './ui/util/notification';

// Dashboards & Wizards
export { dashboard } from './dashboard';
export type { DashboardOptions, Dashboard } from './dashboard';
export { wizard } from './wizard';
export type { Wizard } from './wizard';

// Modules
export * from './modules';
