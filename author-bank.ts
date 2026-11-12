import judgmentData from './judgment-data.mjs';
import {installQuestionBank,validateQuestions,subjects} from './bank.ts';
import {isSituational} from './collections.ts';
import {questions as previousQuestions,clinicalCases} from './previous-authoring-bank.ts';
import {applyClinicalAudit} from './clinical-audit.ts';
import {applyChoiceReview} from './choice-review.ts';
import {applyBankReview} from './bank-review.ts';
import type {Question} from './types.ts';

export {originalQuestions,supplementalQuestions,conceptQuestions,situationalQuestions,challengeQuestions,clinicalCases,subjects,shuffled,validateQuestions} from './previous-authoring-bank.ts';
export {previousQuestions};

const edits=validateQuestions(judgmentData);
const editedById=new Map(edits.map(q=>[q.id,q]));
const priorSituationalIds=new Set(previousQuestions.filter(isSituational).map(q=>q.id));
if(edits.some(q=>!priorSituationalIds.has(q.id))){
 throw new Error('A revised question has no active situational record.');
}
export const judgmentQuestions:Question[]=previousQuestions.map(q=>editedById.get(q.id)||q);
export const clinicalAuditQuestions=applyClinicalAudit(judgmentQuestions);
export const choiceReviewedQuestions=applyChoiceReview(clinicalAuditQuestions);
export const questions=applyBankReview(choiceReviewedQuestions);
export const activeQuestions=questions.filter(q=>!q.retired);
export const revisedSituationalCount=activeQuestions.filter(isSituational).length;
export const questionMap=new Map(questions.map(q=>[q.id,q]));
export const topics=subjects.flatMap(subject=>[...new Set(activeQuestions.filter(q=>q.subject===subject.id).map(q=>q.topic))].map(name=>({id:subject.id+':'+name,name,subject:subject.id,count:activeQuestions.filter(q=>q.subject===subject.id&&q.topic===name).length})));

installQuestionBank(questions,clinicalCases);
