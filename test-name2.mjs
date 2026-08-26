import fs from 'fs';
import { analyzeCvText } from './src/apps/entrevistas/services/cvAnalysisEngine.ts';

const text1 = `Pelayo Garcia Garcia Fecha de nacimiento: 12/09/2002`;
const text2 = `PELAYO GARCIA GARCIA Fecha de nacimiento: 12/09/2002`;

console.log('Result 1:', analyzeCvText(text1, 'Pelayo.cv-5.pdf').fullName);
console.log('Result 2:', analyzeCvText(text2, 'Pelayo.cv-5.pdf').fullName);
