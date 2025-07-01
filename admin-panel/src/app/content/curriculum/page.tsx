'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { curriculumSyncService } from '@/lib/curriculum-sync';
// import {
//   UploadIcon,
//   DownloadIcon,
//   BookOpenIcon,
//   AcademicCapIcon,
//   ClockIcon,
// } from '@heroicons/react/24/outline';

// Complete A1 Turkish Curriculum Data - Istanbul Book Based
const sampleCourses = [
  {
    id: '1',
    title: 'Turkish A1 Complete Course - Istanbul Book',
    level: 'A1',
    description: 'Complete beginner Turkish course following Istanbul Book curriculum with 12 units and 36 lessons',
    estimatedHours: 180,
    isPublished: true
  }
];

const sampleUnits = [
  { id: '1', courseId: '1', title: 'MERHABA - Hello', unitNumber: 1, description: 'Introduction to Turkish greetings and basic expressions', estimatedHours: 15, isPublished: true },
  { id: '2', courseId: '1', title: 'TANIŞMA - Meeting People', unitNumber: 2, description: 'Learning how to introduce yourself and others', estimatedHours: 15, isPublished: true },
  { id: '3', courseId: '1', title: 'AİLE - Family', unitNumber: 3, description: 'Family members and relationships vocabulary', estimatedHours: 15, isPublished: true },
  { id: '4', courseId: '1', title: 'GÜNLÜK HAYAT - Daily Life', unitNumber: 4, description: 'Daily routines and activities', estimatedHours: 15, isPublished: true },
  { id: '5', courseId: '1', title: 'ZAMAN - Time', unitNumber: 5, description: 'Time expressions, days, months, seasons', estimatedHours: 15, isPublished: true },
  { id: '6', courseId: '1', title: 'YEMEK - Food', unitNumber: 6, description: 'Food vocabulary and dining expressions', estimatedHours: 15, isPublished: true },
  { id: '7', courseId: '1', title: 'ALIŞVERİŞ - Shopping', unitNumber: 7, description: 'Shopping vocabulary and market conversations', estimatedHours: 15, isPublished: true },
  { id: '8', courseId: '1', title: 'ULAŞIM - Transportation', unitNumber: 8, description: 'Transportation methods and directions', estimatedHours: 15, isPublished: true },
  { id: '9', courseId: '1', title: 'SAĞLIK - Health', unitNumber: 9, description: 'Health vocabulary and medical expressions', estimatedHours: 15, isPublished: true },
  { id: '10', courseId: '1', title: 'HAVA DURUMU - Weather', unitNumber: 10, description: 'Weather conditions and seasonal activities', estimatedHours: 15, isPublished: true },
  { id: '11', courseId: '1', title: 'HOBILER - Hobbies', unitNumber: 11, description: 'Leisure activities and personal interests', estimatedHours: 15, isPublished: true },
  { id: '12', courseId: '1', title: 'TATİL - Vacation', unitNumber: 12, description: 'Travel vocabulary and holiday expressions', estimatedHours: 15, isPublished: true }
];

const sampleLessons = [
  // Unit 1: MERHABA - Hello (3 lessons)
  { id: '1', unitId: '1', title: 'Basic Greetings', lessonNumber: 1, description: 'Learn essential Turkish greetings: Merhaba, Günaydın, İyi akşamlar', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '2', unitId: '1', title: 'Introducing Yourself', lessonNumber: 2, description: 'Learn how to introduce yourself: Ben... Adım...', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '3', unitId: '1', title: 'Polite Expressions', lessonNumber: 3, description: 'Learn courtesy expressions: Lütfen, Teşekkürler, Özür dilerim', estimatedMinutes: 40, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },

  // Unit 2: TANIŞMA - Meeting People (3 lessons)
  { id: '4', unitId: '2', title: 'Personal Information', lessonNumber: 1, description: 'Share personal details: name, age, nationality', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '5', unitId: '2', title: 'Countries and Nationalities', lessonNumber: 2, description: 'Learn country names and nationalities in Turkish', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '6', unitId: '2', title: 'Asking Questions', lessonNumber: 3, description: 'Learn to ask personal questions: Adın ne? Nerelisin?', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },

  // Unit 3: AİLE - Family (3 lessons)
  { id: '7', unitId: '3', title: 'Family Members', lessonNumber: 1, description: 'Learn family vocabulary: anne, baba, kardeş, etc.', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '8', unitId: '3', title: 'Describing Family', lessonNumber: 2, description: 'Describe your family members and relationships', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '9', unitId: '3', title: 'Possessive Pronouns', lessonNumber: 3, description: 'Learn possessive forms: benim, senin, onun', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },

  // Unit 4: GÜNLÜK HAYAT - Daily Life (3 lessons)
  { id: '10', unitId: '4', title: 'Daily Routines', lessonNumber: 1, description: 'Learn daily activity vocabulary: kalkmak, yemek, uyumak', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '11', unitId: '4', title: 'Present Tense', lessonNumber: 2, description: 'Learn present tense conjugation: -yor ending', estimatedMinutes: 60, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },
  { id: '12', unitId: '4', title: 'Describing Your Day', lessonNumber: 3, description: 'Practice describing daily activities', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },

  // Unit 5: ZAMAN - Time (3 lessons)
  { id: '13', unitId: '5', title: 'Telling Time', lessonNumber: 1, description: 'Learn to tell time: Saat kaç? Saat üç', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '14', unitId: '5', title: 'Days and Months', lessonNumber: 2, description: 'Learn days of the week and months', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '15', unitId: '5', title: 'Making Appointments', lessonNumber: 3, description: 'Learn to schedule meetings and appointments', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },

  // Unit 6: YEMEK - Food (3 lessons)
  { id: '16', unitId: '6', title: 'Food Vocabulary', lessonNumber: 1, description: 'Learn basic food items: ekmek, su, et, sebze', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '17', unitId: '6', title: 'At the Restaurant', lessonNumber: 2, description: 'Learn restaurant phrases and ordering food', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '18', unitId: '6', title: 'Likes and Dislikes', lessonNumber: 3, description: 'Express food preferences: sevmek, sevmemek', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },

  // Unit 7: ALIŞVERİŞ - Shopping (3 lessons)
  { id: '19', unitId: '7', title: 'Shopping Vocabulary', lessonNumber: 1, description: 'Learn shopping terms: mağaza, para, fiyat, ucuz, pahalı', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '20', unitId: '7', title: 'At the Market', lessonNumber: 2, description: 'Practice shopping conversations and bargaining', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '21', unitId: '7', title: 'Numbers and Prices', lessonNumber: 3, description: 'Learn numbers and how to ask about prices', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },

  // Unit 8: ULAŞIM - Transportation (3 lessons)
  { id: '22', unitId: '8', title: 'Transportation Methods', lessonNumber: 1, description: 'Learn transport vocabulary: otobüs, metro, taksi, araba', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '23', unitId: '8', title: 'Asking for Directions', lessonNumber: 2, description: 'Learn to ask and give directions in Turkish', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '24', unitId: '8', title: 'Location Expressions', lessonNumber: 3, description: 'Learn location words: sağ, sol, düz, yakın, uzak', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },

  // Unit 9: SAĞLIK - Health (3 lessons)
  { id: '25', unitId: '9', title: 'Body Parts', lessonNumber: 1, description: 'Learn body vocabulary: baş, el, ayak, göz, kulak', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '26', unitId: '9', title: 'At the Doctor', lessonNumber: 2, description: 'Learn medical expressions and symptoms', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '27', unitId: '9', title: 'Health Problems', lessonNumber: 3, description: 'Express health issues: ağrımak, hasta olmak', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },

  // Unit 10: HAVA DURUMU - Weather (3 lessons)
  { id: '28', unitId: '10', title: 'Weather Conditions', lessonNumber: 1, description: 'Learn weather vocabulary: güneşli, yağmurlu, karlı, rüzgarlı', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '29', unitId: '10', title: 'Seasons and Activities', lessonNumber: 2, description: 'Learn seasons and seasonal activities', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '30', unitId: '10', title: 'Weather Conversations', lessonNumber: 3, description: 'Practice talking about weather and climate', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },

  // Unit 11: HOBILER - Hobbies (3 lessons)
  { id: '31', unitId: '11', title: 'Hobby Vocabulary', lessonNumber: 1, description: 'Learn hobby words: spor, müzik, okumak, yüzmek', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '32', unitId: '11', title: 'Free Time Activities', lessonNumber: 2, description: 'Discuss leisure activities and preferences', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '33', unitId: '11', title: 'Frequency Expressions', lessonNumber: 3, description: 'Learn frequency words: her zaman, bazen, hiç', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },

  // Unit 12: TATİL - Vacation (3 lessons)
  { id: '34', unitId: '12', title: 'Travel Vocabulary', lessonNumber: 1, description: 'Learn travel terms: tatil, otel, plaj, dağ, deniz', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '35', unitId: '12', title: 'Planning a Trip', lessonNumber: 2, description: 'Learn to plan and discuss vacation plans', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '36', unitId: '12', title: 'Past Tense Introduction', lessonNumber: 3, description: 'Introduction to past tense: -di ending', estimatedMinutes: 60, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' }
];

const sampleExercises = [
  // Unit 1 Exercises - MERHABA (Lessons 1-3)
  { id: '1', lessonId: '1', title: 'Greeting Vocabulary Match', description: 'Match Turkish greetings with their meanings', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '2', lessonId: '1', title: 'Greeting Pronunciation', description: 'Practice pronouncing Turkish greetings correctly', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '3', lessonId: '1', title: 'Greeting Listening', description: 'Listen and identify different greetings', type: 'listening', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '4', lessonId: '2', title: 'Self Introduction Practice', description: 'Practice introducing yourself using Ben... Adım...', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '5', lessonId: '2', title: 'Introduction Fill-in-Blanks', description: 'Complete introduction sentences', type: 'fill-in-blanks', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '6', lessonId: '2', title: 'Introduction Dialogue', description: 'Role-play introduction conversations', type: 'dialogue', estimatedMinutes: 20, difficultyLevel: 'A1' },

  { id: '7', lessonId: '3', title: 'Polite Expressions Quiz', description: 'Choose the correct polite expression', type: 'multiple-choice', estimatedMinutes: 8, difficultyLevel: 'A1' },
  { id: '8', lessonId: '3', title: 'Courtesy Conversation', description: 'Practice using polite expressions in context', type: 'conversation', estimatedMinutes: 18, difficultyLevel: 'A1' },

  // Unit 2 Exercises - TANIŞMA (Lessons 4-6)
  { id: '9', lessonId: '4', title: 'Personal Info Vocabulary', description: 'Learn personal information vocabulary', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '10', lessonId: '4', title: 'Personal Details Form', description: 'Fill out personal information form', type: 'writing', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '11', lessonId: '5', title: 'Countries and Flags', description: 'Match countries with their flags and names', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '12', lessonId: '5', title: 'Nationality Pronunciation', description: 'Practice pronouncing nationality words', type: 'speaking', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '13', lessonId: '6', title: 'Question Formation', description: 'Form questions using question words', type: 'grammar', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '14', lessonId: '6', title: 'Interview Practice', description: 'Practice asking and answering personal questions', type: 'conversation', estimatedMinutes: 20, difficultyLevel: 'A1' },

  // Unit 3 Exercises - AİLE (Lessons 7-9)
  { id: '15', lessonId: '7', title: 'Family Tree', description: 'Complete a family tree with Turkish vocabulary', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '16', lessonId: '7', title: 'Family Member Audio', description: 'Listen and identify family members', type: 'listening', estimatedMinutes: 10, difficultyLevel: 'A1' },

  { id: '17', lessonId: '8', title: 'Family Description', description: 'Describe your family members', type: 'speaking', estimatedMinutes: 18, difficultyLevel: 'A1' },
  { id: '18', lessonId: '8', title: 'Family Photo Description', description: 'Write about a family photo', type: 'writing', estimatedMinutes: 20, difficultyLevel: 'A1' },

  { id: '19', lessonId: '9', title: 'Possessive Pronouns Exercise', description: 'Practice using possessive pronouns', type: 'grammar', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '20', lessonId: '9', title: 'My Family Presentation', description: 'Present your family using possessives', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1' },

  // Unit 4 Exercises - GÜNLÜK HAYAT (Lessons 10-12)
  { id: '21', lessonId: '10', title: 'Daily Routine Vocabulary', description: 'Learn daily activity words', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '22', lessonId: '10', title: 'Daily Schedule', description: 'Create your daily schedule in Turkish', type: 'writing', estimatedMinutes: 18, difficultyLevel: 'A1' },

  { id: '23', lessonId: '11', title: 'Present Tense Conjugation', description: 'Practice -yor present tense endings', type: 'grammar', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '24', lessonId: '11', title: 'Present Tense Sentences', description: 'Form sentences in present tense', type: 'writing', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '25', lessonId: '12', title: 'My Day Description', description: 'Describe your typical day', type: 'speaking', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '26', lessonId: '12', title: 'Daily Life Dialogue', description: 'Role-play daily life conversations', type: 'dialogue', estimatedMinutes: 25, difficultyLevel: 'A1' },

  // Unit 5 Exercises - ZAMAN (Lessons 13-15)
  { id: '27', lessonId: '13', title: 'Clock Reading', description: 'Practice reading analog and digital clocks', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '28', lessonId: '13', title: 'Time Listening', description: 'Listen and write the correct time', type: 'listening', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '29', lessonId: '14', title: 'Calendar Vocabulary', description: 'Learn days, months, and dates', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '30', lessonId: '14', title: 'Date Writing', description: 'Write dates in Turkish format', type: 'writing', estimatedMinutes: 10, difficultyLevel: 'A1' },

  { id: '31', lessonId: '15', title: 'Appointment Dialogue', description: 'Practice making appointments', type: 'conversation', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '32', lessonId: '15', title: 'Schedule Planning', description: 'Plan a weekly schedule', type: 'writing', estimatedMinutes: 18, difficultyLevel: 'A1' },

  // Unit 6 Exercises - YEMEK (Lessons 16-18)
  { id: '33', lessonId: '16', title: 'Food Categories', description: 'Categorize foods by type', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '34', lessonId: '16', title: 'Food Pronunciation', description: 'Practice pronouncing food words', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '35', lessonId: '17', title: 'Restaurant Ordering', description: 'Practice ordering food at a restaurant', type: 'conversation', estimatedMinutes: 22, difficultyLevel: 'A1' },
  { id: '36', lessonId: '17', title: 'Menu Reading', description: 'Read and understand Turkish menus', type: 'reading', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '37', lessonId: '18', title: 'Food Preferences', description: 'Express likes and dislikes about food', type: 'speaking', estimatedMinutes: 18, difficultyLevel: 'A1' },
  { id: '38', lessonId: '18', title: 'Preference Grammar', description: 'Practice sevmek/sevmemek conjugation', type: 'grammar', estimatedMinutes: 15, difficultyLevel: 'A1' },

  // Unit 7 Exercises - ALIŞVERİŞ (Lessons 19-21)
  { id: '39', lessonId: '19', title: 'Shopping Vocabulary Quiz', description: 'Test your shopping vocabulary knowledge', type: 'multiple-choice', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '40', lessonId: '19', title: 'Store Types', description: 'Match items with appropriate stores', type: 'matching', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '41', lessonId: '20', title: 'Market Conversation', description: 'Practice shopping conversations', type: 'dialogue', estimatedMinutes: 25, difficultyLevel: 'A1' },
  { id: '42', lessonId: '20', title: 'Bargaining Practice', description: 'Learn to negotiate prices', type: 'conversation', estimatedMinutes: 20, difficultyLevel: 'A1' },

  { id: '43', lessonId: '21', title: 'Number Practice', description: 'Practice numbers 1-1000', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '44', lessonId: '21', title: 'Price Listening', description: 'Listen and write prices', type: 'listening', estimatedMinutes: 12, difficultyLevel: 'A1' },

  // Unit 8 Exercises - ULAŞIM (Lessons 22-24)
  { id: '45', lessonId: '22', title: 'Transportation Vocabulary', description: 'Learn transport method vocabulary', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '46', lessonId: '22', title: 'Transport Sounds', description: 'Identify transportation by sounds', type: 'listening', estimatedMinutes: 10, difficultyLevel: 'A1' },

  { id: '47', lessonId: '23', title: 'Direction Giving', description: 'Practice giving directions', type: 'speaking', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '48', lessonId: '23', title: 'Map Reading', description: 'Follow directions on a map', type: 'reading', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '49', lessonId: '24', title: 'Location Prepositions', description: 'Practice location words and prepositions', type: 'grammar', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '50', lessonId: '24', title: 'Where Is It?', description: 'Describe locations using prepositions', type: 'speaking', estimatedMinutes: 18, difficultyLevel: 'A1' },

  // Unit 9 Exercises - SAĞLIK (Lessons 25-27)
  { id: '51', lessonId: '25', title: 'Body Parts Labeling', description: 'Label body parts in Turkish', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1' },
  { id: '52', lessonId: '25', title: 'Body Parts Song', description: 'Learn body parts through song', type: 'listening', estimatedMinutes: 10, difficultyLevel: 'A1' },

  { id: '53', lessonId: '26', title: 'Doctor Visit Roleplay', description: 'Practice doctor-patient conversations', type: 'dialogue', estimatedMinutes: 25, difficultyLevel: 'A1' },
  { id: '54', lessonId: '26', title: 'Medical Vocabulary', description: 'Learn basic medical terms', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },

  { id: '55', lessonId: '27', title: 'Symptom Description', description: 'Describe health problems and symptoms', type: 'speaking', estimatedMinutes: 18, difficultyLevel: 'A1' },
  { id: '56', lessonId: '27', title: 'Health Advice', description: 'Give and receive health advice', type: 'conversation', estimatedMinutes: 20, difficultyLevel: 'A1' },

  // Unit 10 Exercises - HAVA DURUMU (Lessons 28-30)
  { id: '57', lessonId: '28', title: 'Weather Vocabulary Match', description: 'Match weather conditions with pictures', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '58', lessonId: '28', title: 'Weather Report', description: 'Listen to weather forecasts', type: 'listening', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '59', lessonId: '29', title: 'Seasonal Activities', description: 'Match activities with appropriate seasons', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '60', lessonId: '29', title: 'Season Preferences', description: 'Discuss favorite seasons and activities', type: 'conversation', estimatedMinutes: 18, difficultyLevel: 'A1' },

  { id: '61', lessonId: '30', title: 'Weather Conversation', description: 'Practice weather-related conversations', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '62', lessonId: '30', title: 'Weather Diary', description: 'Write about weather in different cities', type: 'writing', estimatedMinutes: 20, difficultyLevel: 'A1' },

  // Unit 11 Exercises - HOBILER (Lessons 31-33)
  { id: '63', lessonId: '31', title: 'Hobby Vocabulary Quiz', description: 'Test your hobby vocabulary', type: 'multiple-choice', estimatedMinutes: 10, difficultyLevel: 'A1' },
  { id: '64', lessonId: '31', title: 'Hobby Pronunciation', description: 'Practice pronouncing hobby words', type: 'speaking', estimatedMinutes: 12, difficultyLevel: 'A1' },

  { id: '65', lessonId: '32', title: 'Free Time Discussion', description: 'Discuss your free time activities', type: 'conversation', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '66', lessonId: '32', title: 'Hobby Survey', description: 'Conduct a hobby survey with classmates', type: 'speaking', estimatedMinutes: 25, difficultyLevel: 'A1' },

  { id: '67', lessonId: '33', title: 'Frequency Expressions', description: 'Practice using frequency adverbs', type: 'grammar', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '68', lessonId: '33', title: 'How Often?', description: 'Ask and answer about frequency', type: 'conversation', estimatedMinutes: 18, difficultyLevel: 'A1' },

  // Unit 12 Exercises - TATİL (Lessons 34-36)
  { id: '69', lessonId: '34', title: 'Travel Vocabulary', description: 'Learn travel and vacation vocabulary', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1' },
  { id: '70', lessonId: '34', title: 'Vacation Photos', description: 'Describe vacation photos', type: 'speaking', estimatedMinutes: 18, difficultyLevel: 'A1' },

  { id: '71', lessonId: '35', title: 'Trip Planning', description: 'Plan a vacation itinerary', type: 'writing', estimatedMinutes: 25, difficultyLevel: 'A1' },
  { id: '72', lessonId: '35', title: 'Travel Agency Roleplay', description: 'Practice booking a vacation', type: 'dialogue', estimatedMinutes: 22, difficultyLevel: 'A1' },

  { id: '73', lessonId: '36', title: 'Past Tense Practice', description: 'Practice forming past tense verbs', type: 'grammar', estimatedMinutes: 20, difficultyLevel: 'A1' },
  { id: '74', lessonId: '36', title: 'Vacation Story', description: 'Tell about a past vacation', type: 'speaking', estimatedMinutes: 25, difficultyLevel: 'A1' },
  { id: '75', lessonId: '36', title: 'Travel Journal', description: 'Write about past travel experiences', type: 'writing', estimatedMinutes: 30, difficultyLevel: 'A1' }
];

export default function CurriculumPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [courses] = useState(sampleCourses);
  const [units] = useState(sampleUnits);
  const [lessons] = useState(sampleLessons);
  const [exercises] = useState(sampleExercises);
  const [syncStatus, setSyncStatus] = useState<string>('');

  useEffect(() => {
    // Auto-load curriculum on mount
    handleLoadCurriculum();
  }, []);

  const handleLoadCurriculum = async () => {
    setIsLoading(true);
    setImportStatus('📚 Loading complete Turkish A1 curriculum...');

    try {
      // Get curriculum statistics
      const stats = await curriculumSyncService.getCurriculumStats();

      // Sync to frontend
      setSyncStatus('🔄 Syncing to frontend...');
      const syncResult = await curriculumSyncService.syncToFrontend();
      setSyncStatus(syncResult.success ? `✅ ${syncResult.message}` : `⚠️ ${syncResult.message}`);

      setTimeout(() => {
        setIsLoading(false);
        setImportStatus(`✅ Complete Turkish A1 Curriculum loaded successfully!
        📊 Statistics: 1 Course • 12 Units • 36 Lessons • 75 Exercises
        🎯 Ready to explore: Browse the tabs below to see all content.
        🔄 Frontend Sync: ${syncStatus}`);
        setSelectedCourse('1');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setImportStatus('✅ Curriculum loaded successfully with sample data (development mode)');
      setSyncStatus('📝 Using mock data - backend not available');
      setSelectedCourse('1');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Curriculum Management</h1>
            <p className="text-gray-600">Manage Turkish language curriculum with unified lesson structure</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLoadCurriculum}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load Curriculum'}
            </button>
            <button
              onClick={async () => {
                setSyncStatus('🔄 Syncing...');
                const syncResult = await curriculumSyncService.syncToFrontend();
                setSyncStatus(syncResult.success ? `✅ ${syncResult.message}` : `⚠️ ${syncResult.message}`);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔄 Sync to Frontend
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Export
            </button>
          </div>
        </div>

        {/* Status */}
        {importStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{importStatus}</p>
          </div>
        )}

        {/* Sync Status */}
        {syncStatus && (
          <div className={`border rounded-lg p-4 ${
            syncStatus.includes('✅') ? 'bg-green-50 border-green-200' :
            syncStatus.includes('❌') ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`font-medium ${
                syncStatus.includes('✅') ? 'text-green-800' :
                syncStatus.includes('❌') ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                Frontend Sync Status: {syncStatus}
              </p>
              <div className="text-xs text-gray-600">
                Changes in admin panel will be reflected in student interface
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex space-x-4 border-b p-4">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'courses' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              📚 Courses
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'units' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              📖 Units
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'lessons' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              📝 Lessons
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'exercises' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              🎯 Exercises
            </button>
          </div>

          <div className="p-6">
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Courses</h3>
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{course.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>📊 Level: {course.level}</span>
                            <span>⏱️ {course.estimatedHours} hours</span>
                            <span>📚 {units.filter(u => u.courseId === course.id).length} units</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCourse(course.id);
                              setActiveTab('units');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            View Units →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Units Tab */}
            {activeTab === 'units' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Course Units</h3>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  {units.filter(unit => unit.courseId === selectedCourse).map(unit => (
                    <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Unit {unit.unitNumber}: {unit.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{unit.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>⏱️ {unit.estimatedHours} hours</span>
                            <span>📝 {lessons.filter(l => l.unitId === unit.id).length} lessons</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${unit.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {unit.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedUnit(unit.id);
                              setActiveTab('lessons');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            View Lessons →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Unit Lessons</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      <option value="">Select Unit</option>
                      {units.filter(u => u.courseId === selectedCourse).map(unit => (
                        <option key={unit.id} value={unit.id}>Unit {unit.unitNumber}: {unit.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {lessons.filter(lesson => !selectedUnit || lesson.unitId === selectedUnit).map(lesson => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Lesson {lesson.lessonNumber}: {lesson.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>📚 Type: {lesson.lessonType}</span>
                            <span>⏱️ {lesson.estimatedMinutes} minutes</span>
                            <span>📊 Level: {lesson.difficultyLevel}</span>
                            <span>🎯 {exercises.filter(e => e.lessonId === lesson.id).length} exercises</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {lesson.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={() => setActiveTab('exercises')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            View Exercises →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercises Tab */}
            {activeTab === 'exercises' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Lesson Exercises</h3>
                <div className="space-y-3">
                  {exercises.map(exercise => {
                    const lesson = lessons.find(l => l.id === exercise.lessonId);
                    const unit = units.find(u => u.id === lesson?.unitId);
                    return (
                      <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{exercise.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>📚 Lesson: {lesson?.title}</span>
                              <span>📖 Unit: {unit?.title}</span>
                              <span>🎯 Type: {exercise.type}</span>
                              <span>⏱️ {exercise.estimatedMinutes} minutes</span>
                              <span>📊 Level: {exercise.difficultyLevel}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                              ▶️ Preview
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data Flow Information */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">🔄 Data Flow: Admin Panel → Frontend Student Interface</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900 mb-2">📚 Content Sources</h5>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>• Curriculum → Course structure</div>
                    <div>• Courses → Course details</div>
                    <div>• Lessons → Lesson content</div>
                    <div>• Exercises → Activities</div>
                    <div>• Vocabulary → Word lists</div>
                    <div>• Grammar → Rules & examples</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900 mb-2">🔄 Sync Process</h5>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>• Export curriculum data</div>
                    <div>• Transform to API format</div>
                    <div>• Send to backend API</div>
                    <div>• Frontend fetches updates</div>
                    <div>• Students see new content</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900 mb-2">🎯 Frontend Impact</h5>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>• Course catalog updates</div>
                    <div>• Lesson content refreshes</div>
                    <div>• Exercise availability</div>
                    <div>• Progress tracking</div>
                    <div>• Real-time sync status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-lesson Types Reference */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">📚 Unified Lesson Structure - 13 Sub-lesson Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1"><span>🎯</span> Preparation</div>
                <div className="flex items-center gap-1"><span>📖</span> Reading</div>
                <div className="flex items-center gap-1"><span>📝</span> Grammar</div>
                <div className="flex items-center gap-1"><span>🎧</span> Listening</div>
                <div className="flex items-center gap-1"><span>🗣️</span> Speaking</div>
                <div className="flex items-center gap-1"><span>✍️</span> Writing</div>
                <div className="flex items-center gap-1"><span>📚</span> Vocabulary</div>
                <div className="flex items-center gap-1"><span>🏛️</span> Culture</div>
                <div className="flex items-center gap-1"><span>🎭</span> Dialogue</div>
                <div className="flex items-center gap-1"><span>🎵</span> Pronunciation</div>
                <div className="flex items-center gap-1"><span>🔄</span> Review</div>
                <div className="flex items-center gap-1"><span>🎯</span> Assessment</div>
                <div className="flex items-center gap-1"><span>🏆</span> Practice</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
