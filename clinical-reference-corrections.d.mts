import type {Question} from './types.ts';
export const referenceCorrections:ReadonlyArray<{id:string;from:string;to:string;source:string;term?:readonly [string,string]}>;
export function reviseReferenceText(value:string):string;
export function applyClinicalReferenceCorrections(question:Question):Question;
