// Seed lessons to blob storage

const lessons = [
  {
    filename: '01.first-lesson.md',
    content: `---
title: "Primera Lección de Español"
language: "es"
difficulty: "beginner"
topics: ["greetings", "basics"]
order: 1
description: "Learn basic Spanish greetings"
---

# Primera Lección de Español

¡Hola! Welcome to your first Spanish lesson.

## Greetings

- **Hola** - Hello
- **Buenos días** - Good morning  
- **Buenas tardes** - Good afternoon
- **Buenas noches** - Good evening

## Practice

Try saying these greetings out loud!

### Exercise 1
Respond to these greetings:
1. ¡Hola! → ?
2. ¡Buenos días! → ?
3. ¡Buenas tardes! → ?
`,
  },
  {
    filename: '02.second-lesson.md',
    content: `---
title: "Los Números"
language: "es"
difficulty: "beginner"
topics: ["numbers", "counting"]
order: 2
description: "Learn numbers 1-10 in Spanish"
---

# Los Números (Numbers)

Let's learn numbers in Spanish!

## Numbers 1-10

- **uno** - one
- **dos** - two
- **tres** - three
- **cuatro** - four
- **cinco** - five
- **seis** - six
- **siete** - seven
- **ocho** - eight
- **nueve** - nine
- **diez** - ten

## Practice Counting

Count from 1 to 10 in Spanish:
*Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez*
`,
  },
  {
    filename: '03.third-lesson.md',
    content: `---
title: "Los Colores"
language: "es"
difficulty: "beginner"
topics: ["colors", "vocabulary"]
order: 3
description: "Learn basic colors in Spanish"
---

# Los Colores (Colors)

Time to learn colors in Spanish!

## Basic Colors

- **rojo** - red
- **azul** - blue
- **verde** - green
- **amarillo** - yellow
- **naranja** - orange
- **morado** - purple
- **negro** - black
- **blanco** - white
- **gris** - gray
- **rosado** - pink

## Practice

What color is...?
- El cielo (the sky) → **azul**
- La hierba (the grass) → **verde**
- El sol (the sun) → **amarillo**
`,
  },
]

async function seedLessons() {
  const baseUrl = 'http://localhost:3000'

  console.log('🌱 Seeding lessons to blob storage...')

  for (const lesson of lessons) {
    try {
      const response = await fetch(`${baseUrl}/api/_hub/blob/lessons/demo-user/es/${lesson.filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/markdown',
        },
        body: lesson.content,
      })

      if (response.ok) {
        console.log(`✅ Uploaded: ${lesson.filename}`)
      }
      else {
        console.error(`❌ Failed to upload ${lesson.filename}: ${response.status} ${response.statusText}`)
      }
    }
    catch (error) {
      console.error(`❌ Error uploading ${lesson.filename}:`, error.message)
    }
  }

  console.log('🎉 Lesson seeding completed!')
}

seedLessons().catch(console.error)
