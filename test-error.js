#!/usr/bin/env node

// Test pour reproduire l'erreur "Cannot convert undefined or null to object"
import fs from 'fs'
import { QuestionnaireParser } from './src/utils/questionnaireParser.js'

console.log('🔍 Test de reproduction de l\'erreur')
console.log('=' .repeat(50))

async function testError() {
  try {
    console.log('📋 1. Test avec le fichier surveyQuestions.js...')
    const questionnaireText = fs.readFileSync('./surveyQuestions.js', 'utf8')
    const parser = new QuestionnaireParser()
    const result = await parser.parse(questionnaireText)
    
    console.log('✅ Parsing réussi')
    console.log(`Questions: ${result?.questions ? Object.keys(result.questions).length : 'UNDEFINED'}`)
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message)
    console.error('Stack:', error.stack)
    
    // Analyser l'erreur plus en détail
    if (error.message.includes('Cannot convert undefined or null to object')) {
      console.log('\n🔍 Analyse de l\'erreur Object.keys:')
      console.log('Cette erreur se produit quand Object.keys() reçoit undefined ou null')
    }
  }
}

testError();
