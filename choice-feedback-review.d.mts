import type {Question} from './types.ts';
export function correctQuestionFeedback(published:Question[],sourceQuestions:Question[]):{
 questions:Question[];
 counts:{focused:number;linked:number;comparison:number;outcome:number;direct:number;individual:number;preserved:number};
};
