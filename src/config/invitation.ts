/**
 * Barcha matnlar va shaxsiy ma'lumotlar shu yerda saqlanadi.
 * Saytni o‘zgartirish uchun faqat shu faylni tahrirlash kifoya.
 *
 * Matnlar ichida `{name}` yozsangiz, u `girlName` qiymati bilan almashtiriladi.
 */
export interface InvitationConfig {
  /** Qizning ismi. Standart qiymat "go‘zal inson" — ism yozsangiz, salomlashuvda ko‘rinadi. */
  girlName: string

  envelope: {
    /** Konvert tepasidagi qisqa xabar. */
    teaser: string
    /** Konvertni ochish tugmasi matni. */
    openLabel: string
    /** Konvert tugmasi uchun ekran o‘qish vositalariga mo‘ljallangan matn. */
    ariaLabel: string
  }

  invitation: {
    /** Sarlavha. `{name}` o‘rniga qizning ismi qo‘yiladi. */
    greeting: string
    /** Asosiy savol. */
    question: string
    /** "Ha" tugmasi matni. */
    yesText: string
    /** "Yo‘q" tugmasi matni. */
    noText: string
    /** "Yo‘q" tugmasi qochganda ko‘rinadigan hazil gaplar (navbat bilan almashadi). */
    noTeasers: string[]
  }

  celebration: {
    title: string
    subtitle: string
    footer: string
    replayLabel: string
    /** Uchrashuv sanasi yorlig‘i. */
    dateLabel: string
    /** Uchrashuv joyi yorlig‘i. */
    locationLabel: string
    /** "Vaqt va joyni tanlash" tugmasi matni. */
    planLabel: string
    /** Uchrashuv tanlangach ko‘rsatiladigan sarlavha. */
    confirmedTitle: string
    /** Uchrashuv tanlangach ko‘rsatiladigan qisqa matn. */
    confirmedSubtitle: string
  }

  /** Qiz uchrashuv vaqti va joyini tanlaydigan ekran. */
  planning: {
    title: string
    subtitle: string
    dateLabel: string
    timeLabel: string
    placeLabel: string
    /** Sana tanlash uchun nechta kun ko‘rsatilsin (bugundan boshlab). */
    daysAhead: number
    /** Tayyor vaqt variantlari ("SS:DD" ko‘rinishida). */
    times: string[]
    /** Tayyor joy variantlari. */
    places: string[]
    otherDateLabel: string
    otherTimeLabel: string
    otherPlaceLabel: string
    otherPlacePlaceholder: string
    confirmLabel: string
    /** Hali hammasi tanlanmaganda tugma tagida ko‘rinadigan eslatma. */
    incompleteHint: string
  }

  /** Javoblar va statistikani sizga (Telegram orqali) yuborish. */
  notifications: {
    /** `false` qilsangiz, hech narsa yuborilmaydi. */
    enabled: boolean
    /** Server funksiyasi manzili (o‘zgartirish shart emas). */
    endpoint: string
  }
}

export const invitation: InvitationConfig = {
  girlName: 'Matluba',

  envelope: {
    teaser: 'Sizga kichik bir xabarim bor...',
    openLabel: 'Xatni ochish',
    ariaLabel: 'Xatni ochish',
  },

  invitation: {
    greeting: 'Salom, {name}! ❤️',
    question: 'Men bilan uchrashuvga borasizmi?',
    yesText: 'Ha, albatta! ❤️',
    noText: 'Yo‘q 🙈',
    noTeasers: [
      'Voy, tugma uyalib qochib ketdi 🙈',
      'Ushlab ko‘ring-chi, baribir ulgurmaysiz 😄',
      'Bugun “Yo‘q” tugmasi ishlamaydi, kechiring 💕',
      'Balki “Ha” deb qo‘ya qolarsiz? 😉',
      'Bu tugma juda tez yuguradi! 🏃',
      'Yuragim “Ha” degan javobni kutyapti ❤️',
    ],
  },

  celebration: {
    title: 'Yeeee! ❤️ Bilardim, rozi bo‘lishingizni!',
    subtitle: 'Unda bizni chiroyli uchrashuv kutmoqda!',
    footer: 'Bu kunni esda qolarli qilamiz! 🌷',
    replayLabel: 'Yana bir bor ko‘rish',
    dateLabel: 'Qachon',
    locationLabel: 'Qayerda',
    planLabel: 'Vaqt va joyni tanlaymiz 📅',
    confirmedTitle: 'Hammasi tayyor! ❤️',
    confirmedSubtitle: 'Uchrashuvimiz belgilandi — endi kutish qoldi!',
  },

  planning: {
    title: 'Qachon va qayerda uchrashamiz?',
    subtitle: 'O‘zingizga qulay vaqt va joyni tanlang 🌷',
    dateLabel: 'Sana',
    timeLabel: 'Vaqt',
    placeLabel: 'Joy',
    daysAhead: 14,
    times: ['12:00', '14:00', '16:00', '18:00', '20:00'],
    places: ['Kafe ☕', 'Park 🌳', 'Kino 🎬', 'Restoran 🍽️', 'Ko‘l bo‘yi 🌅'],
    otherDateLabel: 'Boshqa sana',
    otherTimeLabel: 'Boshqa vaqt',
    otherPlaceLabel: 'Boshqa joy',
    otherPlacePlaceholder: 'Qayerni xohlaysiz?',
    confirmLabel: 'Tasdiqlash ❤️',
    incompleteHint: 'Sana, vaqt va joyni tanlang',
  },

  notifications: {
    enabled: true,
    endpoint: '/api/notify',
  },
}

/** `{name}` belgisini qizning ismi bilan almashtiradi. */
export const personalize = (text: string, name: string): string =>
  text.replace(/\{name\}/g, name)
