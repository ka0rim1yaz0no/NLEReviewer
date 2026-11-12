import type {Question} from './types.ts';
export function reviewReferenceDifficulty(bank:Question[]):{
 questions:Question[];
 counts:{reviewed:number;closerAlternatives:number;twoCueComparisons:number;answerCuesRemoved:number};
};
