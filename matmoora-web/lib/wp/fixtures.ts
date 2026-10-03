/**
 * Fixture data used when there is no live WPGraphQL endpoint (dev preview,
 * CI screenshots, offline demos). Real content is drawn from the Matmoora
 * Drive materials; the shape matches what a live GraphQL response would
 * carry, so page components work against a single type.
 *
 * Toggle via env: MATMOORA_FIXTURES=1 or missing WORDPRESS_GRAPHQL_ENDPOINT.
 */
import type { Locale } from '@/lib/i18n/config';

export type Bilingual = { ar: string; en?: string };
export type ContentType = 'investigation' | 'article' | 'story' | 'publication' | 'video' | 'audio';

export interface InvestigationFx {
  slug: string;
  title: Bilingual;
  location: Bilingual;
  eventYear: string;
  publicationYear: string;
  timeframe: Bilingual;
  methodology: Bilingual;
  partners: string[];
  languages: ('ar' | 'en')[];
  summary: Bilingual;
  relatedContentSlugs: string[];
  activities: { title: Bilingual; date: string; city: string }[];
  relatedInvestigationSlugs: string[];
  cover: { hue: string };
}

export interface ContentPieceFx {
  slug: string;
  type: ContentType;
  title: Bilingual;
  location: Bilingual;
  eventDate?: string;
  publicationDate: string;
  language: 'ar' | 'en' | 'both';
  contributors?: string;
  investigationSlug?: string;
  themes: string[];
  excerpt?: Bilingual;
  downloadable?: boolean;
}

export const investigations: InvestigationFx[] = [
  {
    slug: 'el-geneina-attack-2023',
    title: { ar: 'تقرير حول الهجوم على الجنينة', en: 'Report on the attack on El Geneina' },
    location: { ar: 'ولاية غرب دارفور', en: 'West Darfur' },
    eventYear: '2023',
    publicationYear: '2024',
    timeframe: { ar: 'أبريل – نوفمبر 2023', en: 'April – November 2023' },
    methodology: {
      ar: 'خمسون مقابلة مع ناجين في تشاد، تحليل صور أقمار صناعية، مقاطعة إفادات بتقارير أممية.',
      en: '50 interviews with survivors in Chad, satellite imagery analysis, cross-verification with UN reports.',
    },
    partners: [],
    languages: ['ar', 'en'],
    summary: {
      ar: 'يوثّق هذا التقرير الانتهاكات التي رافقت هجوم قوات الدعم السريع والمليشيات المتحالفة معها على مدينة الجنينة بين 24 أبريل و22 يونيو 2023، وتقدر الأمم المتحدة عدد القتلى فيها بين 12 و15 ألفًا.',
      en: 'Documents the violations that accompanied the RSF and allied militias’ attack on El Geneina between 24 April and 22 June 2023. UN estimates place the death toll at 12,000–15,000.',
    },
    relatedContentSlugs: ['snipers', 'mastari-fire', 'wadi-kaja', 'genocide'],
    activities: [
      { title: { ar: 'إحياء الذكرى الأولى — كمبالا', en: 'First anniversary — Kampala' }, date: '2024', city: 'Kampala' },
      { title: { ar: 'إحياء الذكرى الأولى — نيروبي', en: 'First anniversary — Nairobi' }, date: '2024', city: 'Nairobi' },
      { title: { ar: 'إحياء الذكرى الثانية — كمبالا', en: 'Second anniversary — Kampala' }, date: '2025', city: 'Kampala' },
    ],
    relatedInvestigationSlugs: ['west-darfur-humanitarian-2023'],
    cover: { hue: 'orange' },
  },
  {
    slug: 'west-darfur-humanitarian-2023',
    title: { ar: 'تقرير الأوضاع الإنسانية في غرب دارفور', en: 'Humanitarian situation in West Darfur' },
    location: { ar: 'غرب دارفور', en: 'West Darfur' },
    eventYear: '2023',
    publicationYear: '2024',
    timeframe: { ar: 'أبريل 2023 – أبريل 2024', en: 'April 2023 – April 2024' },
    methodology: {
      ar: 'مقابلات مع لاجئين ومسؤولي معسكرات في تشاد، إسناد لبيانات المنظمات الدولية.',
      en: 'Interviews with refugees and camp officials in Chad, triangulated with international agency data.',
    },
    partners: [],
    languages: ['ar'],
    summary: {
      ar: 'يوثّق التقرير الأوضاع الإنسانية داخل الجنينة تحت الحصار ثم في معسكرات اللجوء بشرق تشاد بعد سقوط الولاية.',
      en: 'Documents humanitarian conditions inside besieged El Geneina and later in refugee camps in eastern Chad.',
    },
    relatedContentSlugs: ['humanitarian-chad', 'humanitarian-west-darfur', 'children-west-darfur'],
    activities: [],
    relatedInvestigationSlugs: ['el-geneina-attack-2023'],
    cover: { hue: 'navy' },
  },
  {
    slug: 'central-darfur-hassahisa-2023',
    title: { ar: 'أحداث ولاية وسط دارفور — معسكر الحصاحيصا', en: 'Central Darfur — Hassahisa camp' },
    location: { ar: 'ولاية وسط دارفور', en: 'Central Darfur' },
    eventYear: '2023',
    publicationYear: '2024',
    timeframe: { ar: 'سبتمبر – أكتوبر 2023', en: 'September – October 2023' },
    methodology: {
      ar: 'منهجية مزدوجة: 24 مقابلة صوتية و71 مصدرًا مفتوحًا خضعت للتحقق الجغرافي والزماني.',
      en: 'Dual methodology: 24 audio interviews and 71 open-source items geolocated and time-verified.',
    },
    partners: ['حكايات', 'عوافي'],
    languages: ['ar'],
    summary: {
      ar: 'يوثّق التقرير الحصار الذي فرضته قوات الدعم السريع على معسكر الحصاحيصا في زالنجي، والهجوم الذي أعقب سقوط الفرقة 21 في 30 أكتوبر 2023.',
      en: 'Documents the RSF siege on Hassahisa IDP camp in Zalingei and the assault following the fall of the 21st Division on 30 October 2023.',
    },
    relatedContentSlugs: ['habob-al-daratia'],
    activities: [{ title: { ar: 'إحياء الذكرى — كمبالا', en: 'Anniversary — Kampala' }, date: '2024', city: 'Kampala' }],
    relatedInvestigationSlugs: [],
    cover: { hue: 'cream' },
  },
  {
    slug: 'sennar-2024',
    title: { ar: 'انتهاكات حقوق الإنسان في ولاية سنار', en: 'Human rights violations in Sennar' },
    location: { ar: 'ولاية سنار', en: 'Sennar' },
    eventYear: '2024',
    publicationYear: '2025',
    timeframe: { ar: 'يونيو – يوليو 2024', en: 'June – July 2024' },
    methodology: {
      ar: '21 مقابلة مع نازحين، ورصد 218 رابطًا من المصادر المفتوحة مع تحقق جغرافي.',
      en: '21 interviews with IDPs and open-source verification of 218 links with geolocation.',
    },
    partners: ['شركاء محليين في القضارف'],
    languages: ['ar'],
    summary: {
      ar: 'يوثّق التقرير هجوم قوات الدعم السريع على ولاية سنار الذي بدأ في 26 يونيو 2024 وأدّى إلى نزوح أكثر من 50,000 شخص في الأسبوع الأول.',
      en: 'Documents the RSF attack on Sennar State starting 26 June 2024, which displaced 50,000+ people in the first week.',
    },
    relatedContentSlugs: ['sennar-al-aziza'],
    activities: [{ title: { ar: 'السلطنة الزرقاء — كمبالا', en: 'The Blue Sultanate — Kampala' }, date: '2025', city: 'Kampala' }],
    relatedInvestigationSlugs: [],
    cover: { hue: 'orange' },
  },
  {
    slug: 'el-fasher-siege-2024',
    title: { ar: 'حصار الدعم السريع على الفاشر', en: 'The RSF siege of El Fasher' },
    location: { ar: 'ولاية شمال دارفور', en: 'North Darfur' },
    eventYear: '2024',
    publicationYear: '2025',
    timeframe: { ar: 'مايو – أغسطس 2024', en: 'May – August 2024' },
    methodology: {
      ar: '15 رصدًا ميدانيًا و5 مقابلات، أرشفة وتحقق وفق بروتوكول بيركلي.',
      en: '15 field observations and 5 interviews, archived and verified using the Berkeley Protocol.',
    },
    partners: ['مجموعة مناصرة دارفور'],
    languages: ['ar', 'en'],
    summary: {
      ar: 'يوثّق التقرير الحصار الذي فرضته قوات الدعم السريع على الفاشر بين مايو وأغسطس 2024، مع أكثر من 500 قتيل وقصف ممنهج للمرافق الطبية.',
      en: 'Documents the RSF siege on El Fasher between May and August 2024, with 500+ killed and systematic strikes on medical facilities.',
    },
    relatedContentSlugs: ['saudi-hospital', 'wandering-shell', 'unspoken', 'where-do-we-go'],
    activities: [],
    relatedInvestigationSlugs: ['saudi-hospital-2024'],
    cover: { hue: 'navy' },
  },
  {
    slug: 'saudi-hospital-2024',
    title: { ar: 'الهجوم على المستشفى السعودي', en: 'The attack on the Saudi Hospital' },
    location: { ar: 'ولاية شمال دارفور', en: 'North Darfur' },
    eventYear: '2024',
    publicationYear: '2025',
    timeframe: { ar: 'ديسمبر 2024', en: 'December 2024' },
    methodology: {
      ar: '25 مقابلة، وتحقق من 463 رابطًا، تحليل تقني للسلاح والمنصة.',
      en: '25 interviews, verification of 463 open-source items, technical analysis of the weapon system.',
    },
    partners: ['أصوات دارفور', 'الأرشيف السوداني'],
    languages: ['ar'],
    summary: {
      ar: 'يوثّق التحقيق الهجوم بطائرة مسيّرة على المستشفى السعودي فجر 13 ديسمبر 2024، ويرجّح المسؤولية على قوات الدعم السريع.',
      en: 'Documents the drone strike on Al-Saudi Hospital in the early hours of 13 December 2024 and traces likely responsibility to the RSF.',
    },
    relatedContentSlugs: ['saudi-hospital-video'],
    activities: [{ title: { ar: 'حملة المدن المحاصرة', en: 'Besieged Cities Campaign' }, date: '2025', city: '—' }],
    relatedInvestigationSlugs: ['el-fasher-siege-2024'],
    cover: { hue: 'orange' },
  },
  {
    slug: 'women-markets-2026',
    title: { ar: 'أثر الحرب على النساء العاملات في الأسواق', en: 'War, gender, and women market workers' },
    location: { ar: 'الخرطوم وجنوب دارفور', en: 'Khartoum & South Darfur' },
    eventYear: '2023–2026',
    publicationYear: '2026',
    timeframe: { ar: 'أبريل 2023 – 2026', en: 'April 2023 – 2026' },
    methodology: {
      ar: 'منهجية نوعية تشاركية، 25 مقابلة نصف مهيكلة، وتحليل اجتماعي-مكاني.',
      en: 'Qualitative participatory methodology, 25 semi-structured interviews, socio-spatial analysis.',
    },
    partners: ['بحيريات', 'مجموعة اليرموك'],
    languages: ['ar'],
    summary: {
      ar: 'تتتبّع الدراسة تحوّل أدوار النساء العاملات في أسواق الخرطوم ونيالا منذ أبريل 2023، وآليات التكيّف والاقتصاد البديل التي طوّرنها.',
      en: 'Tracks how women market workers in Khartoum and Nyala have reshaped their economic roles since April 2023, and the coping and alternative-economy strategies they have built.',
    },
    relatedContentSlugs: ['home-agriculture', 'blue-nile-care-economy'],
    activities: [],
    relatedInvestigationSlugs: [],
    cover: { hue: 'cream' },
  },
];

export const contentPieces: ContentPieceFx[] = [
  { slug: 'snipers', type: 'article', title: { ar: 'القناصة', en: 'The snipers' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['sniper-attacks', 'siege'], excerpt: { ar: 'لم يكن الحصار في الجنينة مجرد إغلاق للطرق ونقص في الغذاء، بل كان أيضًا خوفًا يوميًا من قنّاصين استهدفوا المدنيين أثناء بحثهم عن الماء والغذاء.', en: 'Life inside besieged El Geneina was shaped daily by snipers targeting civilians on the way to water and food.' } },
  { slug: 'mastari-fire', type: 'article', title: { ar: 'حريق مستري', en: 'Mastari burns' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['arson', 'ethnic-targeting'], excerpt: { ar: 'في أواخر مايو 2023، اجتاح العنف مستري تاركًا وراءه أحياءً محروقة ومقابر جماعية.', en: 'In late May 2023, violence overran Mastari — burnt neighborhoods and mass graves in its wake.' } },
  { slug: 'wadi-kaja', type: 'article', title: { ar: 'وادي كاجا — لا طريق للنجاة', en: 'Wadi Kaja — no way out' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['massacre'] },
  { slug: 'genocide', type: 'article', title: { ar: 'الإبادة الجماعية', en: 'Genocide' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['genocide', 'ethnic-targeting'] },
  { slug: 'humanitarian-chad', type: 'article', title: { ar: 'الوضع الإنساني في معسكرات تشاد', en: 'The humanitarian crisis in Chad camps' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'west-darfur-humanitarian-2023', themes: ['humanitarian-crisis'] },
  { slug: 'humanitarian-west-darfur', type: 'article', title: { ar: 'الوضع الإنساني في غرب دارفور بعد ٢٤ أبريل', en: 'Humanitarian conditions in West Darfur after 24 April' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'west-darfur-humanitarian-2023', themes: ['humanitarian-crisis'] },
  { slug: 'children-west-darfur', type: 'article', title: { ar: 'الأطفال في غرب دارفور', en: 'Children in West Darfur' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024-12-14', language: 'ar', investigationSlug: 'west-darfur-humanitarian-2023', themes: ['children'] },
  { slug: 'sennar-al-aziza', type: 'article', title: { ar: 'سنار العزيزة', en: 'Beloved Sennar' }, location: { ar: 'سنار', en: 'Sennar' }, eventDate: '2024', publicationDate: '2025-08-20', language: 'ar', investigationSlug: 'sennar-2024', themes: ['displacement', 'testimony'] },
  { slug: 'habob-al-daratia', type: 'publication', title: { ar: 'هبوب الضراتية: أصوات من معسكر الحصاحيصا', en: 'Habob Al-Daratia: voices from Hassahisa camp' }, location: { ar: 'وسط دارفور', en: 'Central Darfur' }, eventDate: '2023', publicationDate: '2024', language: 'ar', investigationSlug: 'central-darfur-hassahisa-2023', themes: ['testimony', 'idp'], downloadable: true },
  { slug: 'war-tales-adre', type: 'publication', title: { ar: 'حكاوي الحرب: أصوات من مخيم أدري', en: 'War tales: voices from Adré camp' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['testimony', 'refugees'], downloadable: true },
  { slug: 'wandering-shell', type: 'publication', title: { ar: 'قذيفة حائرة في سماء الفاشر', en: 'A wandering shell over El Fasher' }, location: { ar: 'شمال دارفور', en: 'North Darfur' }, eventDate: '2024', publicationDate: '2025', language: 'both', investigationSlug: 'el-fasher-siege-2024', themes: ['comic', 'shelling'], downloadable: true },
  { slug: 'unspoken', type: 'publication', title: { ar: 'المسكوت عنه', en: 'Unspoken' }, location: { ar: 'شمال دارفور', en: 'North Darfur' }, eventDate: '2024', publicationDate: '2025', language: 'both', investigationSlug: 'el-fasher-siege-2024', themes: ['comic', 'sexual-violence'], downloadable: true },
  { slug: 'where-do-we-go', type: 'publication', title: { ar: 'نقبل وين؟', en: 'Where do we go?' }, location: { ar: 'شمال دارفور', en: 'North Darfur' }, eventDate: '2024', publicationDate: '2025', language: 'both', investigationSlug: 'el-fasher-siege-2024', themes: ['comic', 'siege'], downloadable: true },
  { slug: 'saudi-hospital-video', type: 'video', title: { ar: 'قصف المستشفى السعودي: جريمة بطائرة مسيّرة', en: 'The Saudi Hospital strike: a drone crime' }, location: { ar: 'شمال دارفور', en: 'North Darfur' }, eventDate: '2024-12-13', publicationDate: '2025', language: 'ar', investigationSlug: 'saudi-hospital-2024', themes: ['medical-facilities', 'osint'] },
  { slug: 'genocide-scenario-doc', type: 'video', title: { ar: 'سيناريو الإبادة الجماعية — وثائقي', en: 'A scenario of genocide — documentary' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2023', publicationDate: '2024', language: 'ar', investigationSlug: 'el-geneina-attack-2023', themes: ['documentary'] },
  { slug: 'kadari', type: 'video', title: { ar: 'كداري: من سنار للقضارف', en: 'Kadari: from Sennar to Gedaref' }, location: { ar: 'سنار', en: 'Sennar' }, eventDate: '2024', publicationDate: '2025', language: 'ar', investigationSlug: 'sennar-2024', themes: ['displacement'] },
  { slug: 'home-agriculture', type: 'article', title: { ar: 'الزراعة المنزلية: ملامح لعقد اجتماعي جديد في ريف السودان', en: 'Home farming: outline of a new social contract in rural Sudan' }, location: { ar: 'الجزيرة', en: 'Al-Jazira' }, eventDate: '2023', publicationDate: '2026-06', language: 'ar', contributors: 'أسامة حسن', investigationSlug: 'women-markets-2026', themes: ['economic-justice', 'women'] },
  { slug: 'blue-nile-care-economy', type: 'article', title: { ar: 'اقتصاد الرعاية المنزلية خلال الحرب في السودان', en: 'The home care economy during Sudan’s war' }, location: { ar: 'النيل الأزرق', en: 'Blue Nile' }, eventDate: '2023', publicationDate: '2026', language: 'ar', contributors: 'رزان أبوبكر', investigationSlug: 'women-markets-2026', themes: ['economic-justice', 'care-work'] },
  { slug: 'kelinkabi-weino', type: 'story', title: { ar: 'كِلنكابي وينو؟', en: 'Where is my Kelinkab?' }, location: { ar: 'غرب دارفور', en: 'West Darfur' }, eventDate: '2018', publicationDate: '2021', language: 'ar', themes: ['land-rights', 'displacement'], excerpt: { ar: 'شهادة مزارع من مَجمري بغرب دارفور عن فقدان أرضه بعد 2018.', en: 'A farmer from Majmari, West Darfur, testifies about losing his land after 2018.' } },
  { slug: 'bit-hyban', type: 'story', title: { ar: 'بت هيبان', en: 'Bit Hyban' }, location: { ar: 'جنوب كردفان', en: 'South Kordofan' }, eventDate: '2011', publicationDate: '2021', language: 'ar', themes: ['nuba-mountains', 'genocide'] },
  { slug: 'blood-party', type: 'story', title: { ar: 'حفلة الدم', en: 'The blood party' }, location: { ar: 'جنوب دارفور', en: 'South Darfur' }, publicationDate: '2021', language: 'ar', themes: ['sexual-violence', 'testimony'] },
];

export const shouldUseFixtures = (): boolean => {
  if (process.env.MATMOORA_FIXTURES === '1') return true;
  if (process.env.NEXT_PUBLIC_MATMOORA_FIXTURES === '1') return true;
  if (!process.env.WORDPRESS_GRAPHQL_ENDPOINT) return true;
  return false;
};

export function localizedTitle(b: Bilingual, locale: Locale): string {
  return locale === 'ar' ? b.ar : b.en ?? b.ar;
}
