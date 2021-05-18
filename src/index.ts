import '@tensorflow/tfjs-backend-webgl';
import './utils';
import './ui/css/styles.css';

// Core library
export * from './core';
export * from './data-store';
export * from './dataset';
export * from './utils';

// Dashboards & Wizards
export { dashboard } from './dashboard';
export type { DashboardOptions, Dashboard } from './dashboard';
export { wizard } from './wizard';
export type { Wizard } from './wizard';

// Modules
export * from './modules';
