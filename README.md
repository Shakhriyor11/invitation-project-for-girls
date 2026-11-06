# Romantik taklifnoma 💌

React + TypeScript + Vite + Framer Motion asosidagi interaktiv taklifnoma sayti.

**Oqim:** yopiq konvert → 3D ochilish va xat chiqishi → taklif ("Yo‘q" tugmasi qochadi) →
"Ha" bosilganda tantana → **uchrashuv sanasi, vaqti va joyini tanlash** → tasdiq ekrani.

Javoblar va statistika sizga **Telegram** orqali yuboriladi (pastda: "Hisobotni Telegram'ga olish").

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:5173
```

Boshqa buyruqlar:

```bash
npm run build      # tsc tekshiruvi + production build (dist/)
npm run preview    # production build'ni lokal ko‘rish (hisobot yuborish ishlamaydi)
```

Node.js 18 yoki undan yangisi kerak.

## Matnlarni o‘zgartirish

Barcha matnlar va variantlar **`src/config/invitation.ts`** faylida. Komponentlarga matn yozilmagan.

| Nimani o‘zgartirasiz | Qayerda |
| --- | --- |
| Qizning ismi | `girlName` (salomlashuvda `{name}` o‘rniga qo‘yiladi) |
| Konvert matni | `envelope.teaser`, `envelope.openLabel` |
| Taklif matni | `invitation.greeting`, `invitation.question` |
| "Ha" / "Yo‘q" tugmalari | `invitation.yesText`, `invitation.noText` |
| "Yo‘q" qochganda chiqadigan hazillar | `invitation.noTeasers` |
| Tantana matnlari | `celebration.title`, `.subtitle`, `.footer`, `.replayLabel` |
| Tasdiqdan keyingi matn | `celebration.confirmedTitle`, `.confirmedSubtitle` |
| Tanlash ekrani matnlari | `planning.title`, `.subtitle`, `.confirmLabel` … |
| Tayyor **vaqt** variantlari | `planning.times` (masalan `['12:00', '18:00']`) |
| Tayyor **joy** variantlari | `planning.places` (masalan `['Kafe ☕', 'Park 🌳']`) |
| Nechta kun ko‘rsatilsin | `planning.daysAhead` (standart 14) |
| Hisobot yuborishni o‘chirish | `notifications.enabled: false` |

Misol — ism va o‘z joylaringizni qo‘shish:

```ts
girlName: 'Madina',   // "Salom, Madina! ❤️"
// ...
planning: {
  places: ['Sevimli kafemiz ☕', 'Alisher Navoiy bog‘i 🌳', 'Kino 🎬'],
  times: ['15:00', '17:30', '19:00'],
  // ...
}
```

Har bir tanlovda qiz tayyor variantlardan tashqari **"Boshqa sana / vaqt / joy"** tugmasi orqali
o‘zi xohlagan qiymatni kiritishi ham mumkin (o‘tib ketgan sanani tanlab bo‘lmaydi).

## Hisobotni Telegram'ga olish

Sizga ikkita xabar keladi:

1. **Qiz "Ha" bosganda** — javob va statistika.
2. **Qiz uchrashuvni tasdiqlaganda** — tanlangan sana, vaqt, joy (+ shu statistika).

Namuna:

```text
📅 Uchrashuv tanlandi!

🗓 Sana: Shanba, 7-noyabr
🕒 Vaqt: 18:00
📍 Joy: Kafe ☕

🙈 “Yo‘q” tugmasini bosishga urinish: 3 marta
🏃 Tugma qochib ketgan: 12 marta (yaqinlashganda ham)
⏱ Javob berish vaqti: 25 soniya
```

**Statistika nimani anglatadi:**
- *Bosishga urinish* — qiz "Yo‘q" tugmasiga tegishga/bosishga necha marta urinib ko‘rgani.
- *Qochib ketgan* — tugma jami necha marta qochgani. Kompyuterda tugma sichqoncha yaqinlashishi bilan
  qochadi, shuning uchun u yerda bosishdan ko‘ra bu raqam kattaroq bo‘ladi.
- *Javob berish vaqti* — taklif ko‘ringanidan "Ha" bosilguncha.

### Sozlash (bir marta, ~5 daqiqa)

1. Telegram'da **@BotFather** ga yozing → `/newbot` → bot nomi va username kiriting →
   u sizga **token** beradi (`123456:ABC...`).
2. Yaratilgan botingizni toping, ochib **Start** tugmasini bosing.
   *(Muhim: bosmasangiz, bot sizga xabar yubora olmaydi.)*
3. **@userinfobot** ga yozing — u sizning **ID** raqamingizni aytadi (masalan `123456789`).
4. Ikkala qiymatni saytga kiriting:
   - **Vercel'da:** Project → Settings → Environment Variables →
     `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` qo‘shing, so‘ng **Redeploy** qiling
     (o‘zgaruvchilar faqat yangi deploy'dan keyin kuchga kiradi).
   - **Lokal sinash uchun:** `.env.example` faylini `.env.local` deb nusxalang, qiymatlarni yozing,
     `npm run dev` ni qayta ishga tushiring.

> Token xavfsiz: u faqat serverda (`api/notify.ts`) saqlanadi, brauzerga chiqmaydi.
> Tokenni hech kimga bermang va GitHub'ga yuklamang (`.env*` fayllari `.gitignore` da).

Sozlanmagan bo‘lsa ham sayt odatdagidek ishlayveradi — shunchaki hisobot yuborilmaydi.

**Hisobot kelmasa:** botga *Start* bosilganini; `TELEGRAM_CHAT_ID` to‘g‘riligini; o‘zgaruvchilar
kiritilgach *Redeploy* qilinganini; Vercel → Project → Logs bo‘limidagi `/api/notify` xatolarini tekshiring.

## Loyiha tuzilmasi

```text
api/
└── notify.ts               # Vercel server funksiyasi: hisobotni Telegram'ga yuboradi
src/
├── components/
│   ├── Envelope.tsx        # 3D konvert, qopqoq ochilishi, xat chiqishi
│   ├── Invitation.tsx      # Taklif kartasi, "Ha" va qochuvchi "Yo‘q"
│   ├── Celebration.tsx     # Tantana va tasdiq ekrani
│   ├── Planning.tsx        # Sana, vaqt va joyni tanlash
│   ├── FloatingHearts.tsx  # Suzuvchi yuraklar
│   └── Confetti.tsx        # Konfetti (portlash + yog‘ish)
├── config/
│   └── invitation.ts       # Barcha matnlar va sozlamalar
├── hooks/
│   └── useEscapingButton.ts  # "Yo‘q" tugmasining qochish mantiqi va hisoblagichlari
├── services/
│   └── report.ts           # Hisobotni serverga yuborish
├── utils/
│   ├── dates.ts            # Sanalarni o‘zbekcha formatlash
│   ├── geometry.ts         # Qochish joyini tanlash (ekran ichida, boshqa elementlarsiz)
│   └── viewport.ts
├── styles/
│   └── global.css
├── App.tsx                 # Ekranlar almashinuvi
└── main.tsx
.env.example                # Telegram sozlamalari namunasi
```

## "Yo‘q" tugmasi qanday ishlaydi

- **Kompyuterda:** sichqoncha tugmaga ~90px yaqinlashishi bilan qochadi.
- **Telefonda:** tegilgan zahoti boshqa joyga o‘tadi.
- Yangi joy har safar ekran ichidan tanlanadi va "Ha" tugmasi, sarlavha, savol matni ustiga tushmaydi.
- Ekran o‘lchami yoki yo‘nalishi o‘zgarsa, tugma ekranda qoladi.
- "Ha" tugmasi doim bosiladigan holatda; tugma qochgan sari u biroz kattalashadi.

## Harakatni kamaytirish

`prefers-reduced-motion` yoqilgan qurilmalarda 3D animatsiyalar, konfetti va suzuvchi yuraklar
harakati o‘chiriladi; barcha tugmalar va oqim avvalgidek ishlaydi.

## Vercel'ga joylash

### Variant 1 — GitHub orqali (tavsiya etiladi)

1. Loyihani GitHub'ga yuklang:
   ```bash
   git init
   git add .
   git commit -m "Romantik taklifnoma"
   git branch -M main
   git remote add origin https://github.com/<foydalanuvchi>/<repo>.git
   git push -u origin main
   ```
2. [vercel.com/new](https://vercel.com/new) ga kiring va repozitoriyni tanlang (**Import**).
3. Vercel Vite'ni avtomatik aniqlaydi. Sozlamalar shunday bo‘lishi kerak:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** bo‘limiga `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` ni kiriting
   (yuqoridagi "Sozlash" 4-qadam).
5. **Deploy** tugmasini bosing. Bir necha daqiqadan so‘ng sayt `https://<loyiha>.vercel.app` manzilida tayyor bo‘ladi.

Keyingi har bir `git push` saytni avtomatik yangilaydi.

### Variant 2 — Vercel CLI

```bash
npm i -g vercel
vercel          # birinchi marta: savollarga javob bering (sozlamalarni o‘zgartirmang)
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel --prod   # production'ga chiqarish
```

Tayyor havolani qizga yuboring 💕
