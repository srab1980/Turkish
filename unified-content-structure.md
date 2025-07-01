# Unified Content Structure for Turkish Learning App

## Hierarchical Structure

```
Course (e.g., "Turkish for Beginners")
├── Level: A1, A2, B1, B2, C1, C2
└── Units (e.g., "Unit 1: MERHABA - Hello")
    └── Lessons (e.g., "Lesson 1: Tanışma - Introduction")
        ├── Sub-lessons (Skill-based sections)
        │   ├── HAZIRLIK (Preparation)
        │   ├── OKUMA (Reading)
        │   ├── DİLBİLGİSİ (Grammar)
        │   ├── DİNLEME (Listening)
        │   ├── KONUŞMA (Speaking)
        │   ├── YAZMA (Writing)
        │   ├── KELİME (Vocabulary)
        │   └── KÜLTÜR (Culture)
        └── Exercises (grouped by sub-lesson)
            ├── Reading Exercises
            ├── Grammar Exercises
            ├── Listening Exercises
            ├── Speaking Exercises
            ├── Writing Exercises
            └── Vocabulary Exercises
```

## New Entity Structure

### 1. Course Entity (Updated)
- Represents a complete course (e.g., "Turkish A1 Course")
- Contains multiple units
- Has a CEFR level (A1, A2, B1, B2, C1, C2)

### 2. Unit Entity (Updated)
- Represents a thematic unit (e.g., "MERHABA - Hello")
- Contains multiple lessons
- Has learning objectives and cultural notes

### 3. Lesson Entity (Updated)
- Represents a main lesson topic (e.g., "Tanışma - Introduction")
- Contains multiple sub-lessons
- Has overall learning objectives

### 4. SubLesson Entity (NEW)
- Represents skill-based sections within a lesson
- Types: PREPARATION, READING, GRAMMAR, LISTENING, SPEAKING, WRITING, VOCABULARY, CULTURE
- Contains specific content and exercises for that skill

### 5. Exercise Entity (Updated)
- Belongs to a specific sub-lesson
- Grouped by skill type
- Has difficulty progression within each skill

## Sub-lesson Types

```typescript
export enum SubLessonType {
  PREPARATION = 'preparation',     // HAZIRLIK ÇALIŞMALARI
  READING = 'reading',            // OKUMA
  GRAMMAR = 'grammar',            // DİLBİLGİSİ
  LISTENING = 'listening',        // DİNLEME
  SPEAKING = 'speaking',          // KONUŞMA
  WRITING = 'writing',            // YAZMA
  VOCABULARY = 'vocabulary',      // KELİME LİSTESİ
  CULTURE = 'culture',           // KÜLTÜRDEN KÜLTÜRE
  REVIEW = 'review',             // NELER ÖĞRENDİK
  ASSESSMENT = 'assessment'       // ÖZ DEĞERLENDİRME
}
```

## Content Organization

### Course Level
- **A1**: Basic user level
- **A2**: Elementary level
- **B1**: Intermediate level
- **B2**: Upper intermediate level
- **C1**: Advanced level
- **C2**: Proficiency level

### Unit Structure (Based on curriculum_structure.md)
Each unit follows the Turkish curriculum structure:
1. **HAZIRLIK ÇALIŞMALARI** (Preparation Activities)
2. **OKUMA** (Reading)
3. **YA SİZ** (What About You) - Interactive content
4. **DİLBİLGİSİ** (Grammar)
5. **DİNLEME** (Listening)
6. **KONUŞMA** (Speaking)
7. **YAZMA** (Writing)
8. **KÜLTÜRDEN KÜLTÜRE** (Culture to Culture)
9. **SINIF DİLİ** (Classroom Language)
10. **EĞLENELİM ÖĞRENELİM** (Let's Have Fun and Learn)
11. **NELER ÖĞRENDİK** (What Did We Learn)
12. **ÖZ DEĞERLENDİRME** (Self-Assessment)
13. **KELİME LİSTESİ** (Vocabulary List)

## Interface Consistency

### Frontend (Student View)
- Course browser shows courses by level (A1, A2, etc.)
- Unit view shows all lessons in the unit
- Lesson view shows all sub-lessons as tabs or sections
- Progress tracking per sub-lesson and overall lesson
- Exercises grouped by sub-lesson type

### Admin Panel
- Course management with level organization
- Unit creation with lesson templates
- Lesson editor with sub-lesson sections
- Exercise builder organized by sub-lesson type
- Content analytics by skill area

## Benefits of This Structure

1. **Consistency**: Both interfaces use the same hierarchical structure
2. **Pedagogical Alignment**: Matches Turkish language curriculum standards
3. **Skill-based Learning**: Clear separation of language skills
4. **Progress Tracking**: Granular tracking by skill area
5. **Content Management**: Easier for admins to organize content
6. **Scalability**: Easy to add new sub-lesson types or reorganize content
