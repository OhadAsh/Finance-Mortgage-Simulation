# סימולטור נכסים ומשכנתא

אפליקציית ווב לתכנון פיננסי אישי — סימולציית תזרים, משכנתא ותרחישי הכנסה, עם תובנות AI אופציונליות.

**דמו חי:** [ohadash.github.io/Finance-Mortgage-Simulation](https://ohadash.github.io/Finance-Mortgage-Simulation/)

---

## מה האפליקציה עושה

- **ניהול נכסים** — הוספה, עריכה, מחיקה וייבוא מ-Excel
- **משכנתא** — שווי דירה, הון עצמי, ריבית, מועד כניסה
- **תרחישי הכנסה** — שלושה פרופילים (מלא / חלקי / מינימלי) עם הכנסה ראשית ומשנית
- **גרפים** — נכסים, הון עצמי נטו, מד LTV לאורך 30 חודשים
- **תובנות AI** — שאלות מוכנות ושאלה חופשית (דרך OpenRouter, אופציונלי)
- **שמירה מקומית** — כל הנתונים נשמרים ב-`localStorage` בדפדפן בלבד
- **ייצוא** — דוח PDF עם גרפים, או Excel עם הנתונים כפי שהוזנו (חסכונות / משכנתא / תרחישים)

> **פרטיות:** אין שרת. הנתונים שלך לא עולים לשום מקום (מלבד קריאות AI אם תזין מפתח API).

---

## התחלה מהירה

### שימוש באתר (ללא התקנה)

1. היכנס ל-[הדמו החי](https://ohadash.github.io/Finance-Mortgage-Simulation/)
2. הוסף נכסים ידנית או ייבא מ-Excel (ראה למטה)
3. מלא פרמטרי משכנתא ותרחיש הכנסה
4. עקוב אחרי הגרפים והמדדים

### הרצה מקומית

```bash
git clone https://github.com/OhadAsh/Finance-Mortgage-Simulation.git
cd Finance-Mortgage-Simulation
npm install
npm run dev
```

האפליקציה תיפתח בכתובת `http://localhost:5173`

### בנייה לפרודקשן

```bash
npm run build
npm run preview
```

---

## ייבוא נכסים — Excel

האפליקציה תומכת ב-**Excel (`.xlsx`)** בלבד.

### תבנית מוכנה

[assets-template.xlsx](public/assets-template.xlsx)

מהאתר החי: `https://ohadash.github.io/Finance-Mortgage-Simulation/assets-template.xlsx`

---

### פורמט הגיליון (`חסכונות`)

מבנה טבלאי — **עמודה לכל שותף**:

| מוצר/שם | שותף א׳ | שותף ב׳ | נזיל/לא נזיל | הערות |
|---------|---------|---------|--------------|--------|
| קרן השתלמות | 150000 | 120000 | לא נזיל | נפתח בעתיד |
| עובר ושב | 25000 | 8000 | נזיל | |

**כללים:**
- שורת כותרות ראשונה — שמות העמודות כמתואר
- עמודות השותפים: כל עמודה עם סכום > 0 הופכת לנכס נפרד
- `נזיל` → נזיל | `לא נזיל` → חצי נזיל
- אם בהערות מופיע **"לא כולל מיסים"** — מס 25% מוחל אוטומטית
- שורות סיכום (`סך הכל`, `ביחד` וכו') מדולגות אוטומטית
- ניתן להוסיף עמודות שותפים נוספות (שותף ג׳, שותף ד׳...)

**שימוש:**
1. הורד `assets-template.xlsx` או שכפל את המבנה בקובץ קיים
2. מלא נתונים בגיליון **חסכונות** (או בגיליון הראשון)
3. באפליקציה: **נכסים פיננסיים → ייבוא Excel**
4. בחר **החלף הכל** או **מזג**

---

## תובנות AI (אופציונלי)

1. צור מפתח ב-[OpenRouter](https://openrouter.ai/)
2. באפליקציה: לחץ **מפתח API** והדבק את המפתח
3. המפתח נשמר רק בדפדפן שלך
4. בחר שאלה מוכנה או כתוב שאלה חופשית

---

## פריסה ל-GitHub Pages

הריפו כולל workflow אוטומטי (`.github/workflows/deploy.yml`).

1. דחוף לענף `main`
2. ב-GitHub: **Settings → Pages → Source:** Deploy from branch → `gh-pages` / root
3. האתר יתעדכן אוטומטית בכל push

---

## טכנולוגיות

- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state + persist)
- Recharts (גרפים)
- SheetJS / xlsx (Excel)
- OpenRouter API (AI)

---

## מבנה הפרויקט

```
src/
├── components/   # UI — נכסים, משכנתא, תרחישים, גרפים, AI
├── hooks/        # useSimulation, useAiInsights
├── lib/          # calculations, excelParser, aiInsights
├── store/        # Zustand stores
└── types/        # TypeScript interfaces
```

---

## רישיון

פרויקט קוד פתוח לשימוש אישי ולמידה.
