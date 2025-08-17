#!/usr/bin/env node

// Test spécifique pour getSummary
import fs from 'fs'
import { QuestionnaireParser } from './src/utils/questionnaireParser.js'

console.log('🔍 Test de la méthode getSummary')
console.log('=' .repeat(50))

async function testSummary() {
  try {
    const questionnaireText = fs.readFileSync('./surveyQuestions.js', 'utf8')
    const parser = new QuestionnaireParser()
    const result = await parser.parse(questionnaireText)
    
    console.log('✅ Parsing réussi')
    
    // Tester getSummary
    console.log('\n📊 Test de getSummary...')
    const summary = parser.getSummary()
    
    console.log('Summary:', JSON.stringify(summary, null, 2))
    
    // Tester spécifiquement les question_types
    console.log('\n🔍 Question types:')
    if (summary.statistics && summary.statistics.question_types) {
      console.log('Object.keys(question_types):', Object.keys(summary.statistics.question_types))
      console.log('question_types:', summary.statistics.question_types)
    } else {
      console.log('❌ question_types est undefined ou null')
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message)
    console.error('Stack:', error.stack)
  }
}

testSummary();
