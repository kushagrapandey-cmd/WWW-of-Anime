import naruto from './naruto.json';
import onepiece from './onepiece.json';
import bleach from './bleach.json';
export const quizBanks = { naruto, onepiece, bleach };
export const quizQuestions = Object.values(quizBanks).flat();
