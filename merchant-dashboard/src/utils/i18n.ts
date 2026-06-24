import { useMerchantStore } from '../store/useMerchantStore';

export type AppLanguage = 'en' | 'sq' | 'sr';

type TranslationTree = {
  nav: {
    liveOrders: string;
    menuManagement: string;
    dailySales: string;
    notifications: string;
    settings: string;
  };
  shell: {
    title: string;
    description: string;
    session: string;
    signOut: string;
    hubTitle: string;
    hubDescription: string;
    liveConnectionReady: string;
  };
  login: {
    brandTitle: string;
    title: string;
    description: string;
    liveOperations: string;
    incomingOrderFlow: string;
    prepView: string;
    kitchenPace: string;
    netEarnings: string;
    dailySummary: string;
    merchantLogin: string;
    email: string;
    password: string;
    passwordPlaceholder: string;
    signIn: string;
    signingIn: string;
    loginFailed: string;
  };
  dashboard: {
    title: string;
    description: string;
    acceptingOrders: string;
    dailyRevenue: string;
    activeOrders: string;
    averagePrep: string;
    averagePrepValue: string;
    new: string;
    prep: string;
    ready: string;
    liveOrders: string;
    liveOrdersHint: string;
    inPrep: string;
    inPrepHint: string;
    firstResponse: string;
    firstResponseValue: string;
    firstResponseHint: string;
  };
  inventory: {
    section: string;
    title: string;
    badge: string;
    totalItems: string;
    totalItemsHint: string;
    inStock: string;
    inStockHint: string;
    outOfStock: string;
    outOfStockHint: string;
    markOutOfStock: string;
    markInStock: string;
  };
  financials: {
    section: string;
    title: string;
    summaryBadge: string;
    dailyRevenue: string;
    dailyRevenueHint: string;
    orderCount: string;
    orderCountHint: string;
    netEarnings: string;
    netEarningsHint: string;
    dailySummary: string;
    performanceOverview: string;
    commissionRate: string;
    formula: string;
    todayNet: string;
    note: string;
  };
  settings: {
    title: string;
    description: string;
    languageTitle: string;
    languageDescription: string;
    currentLanguage: string;
    english: string;
    albanian: string;
    serbian: string;
    englishDescription: string;
    albanianDescription: string;
    serbianDescription: string;
    wholeDashboard: string;
  };
  orderCard: {
    items: string;
    address: string;
    total: string;
  };
  statuses: {
    orderReceived: string;
    preparing: string;
    ready: string;
    approaching: string;
    atTheDoor: string;
  };
  actions: {
    accept: string;
    startPrep: string;
    ready: string;
  };
  catalog: {
    simit: string;
    pide: string;
    kunefe: string;
    cigKofte: string;
    ayran: string;
    bakery: string;
    mainDish: string;
    dessert: string;
    snack: string;
  };
  misc: {
    addressPending: string;
    customer: string;
    item: string;
    emailAndPasswordRequired: string;
    ordersLoadFailed: string;
  };
};

const translations: Record<AppLanguage, TranslationTree | undefined> = {
  en: {
    nav: {
      liveOrders: 'Live Orders',
      menuManagement: 'Menu Management',
      dailySales: 'Daily Sales',
      notifications: 'Notifications',
      settings: 'Settings'
    },
    shell: {
      title: 'Merchant Dashboard',
      description: 'Manage orders, stock, and daily revenue from one warm operations workspace.',
      session: 'Session',
      signOut: 'Sign Out',
      hubTitle: 'Tirana Merchant Hub',
      hubDescription: 'Warm operations interface adapted for Cabuk Albania',
      liveConnectionReady: 'Live connection ready'
    },
    login: {
      brandTitle: 'Cabuk Merchant Dashboard',
      title: 'Sign In',
      description:
        'Sign in to the merchant panel using the warm, fast operations style from the restaurant app reference.',
      liveOperations: 'Live operations',
      incomingOrderFlow: 'Incoming order flow',
      prepView: 'Prep view',
      kitchenPace: 'Kitchen pace',
      netEarnings: 'Net earnings',
      dailySummary: 'Daily summary',
      merchantLogin: 'Merchant Login',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      loginFailed: 'Login failed'
    },
    dashboard: {
      title: 'Live Orders',
      description: 'A live order view that adapts the fast restaurant app workflow to the merchant dashboard.',
      acceptingOrders: 'Accepting orders',
      dailyRevenue: 'Daily Revenue',
      activeOrders: 'Active Orders',
      averagePrep: 'Average Prep',
      averagePrepValue: '12 min',
      new: 'New',
      prep: 'Prep',
      ready: 'Ready',
      liveOrders: 'Live Orders',
      liveOrdersHint: 'Active orders currently being managed',
      inPrep: 'In Prep',
      inPrepHint: 'Orders currently being prepared',
      firstResponse: 'First Response',
      firstResponseValue: '2 min',
      firstResponseHint: 'Target time to accept an order'
    },
    inventory: {
      section: 'Operations',
      title: 'Menu Management',
      badge: 'Restaurant-style stock view',
      totalItems: 'Total Items',
      totalItemsHint: 'Menu items managed in the panel',
      inStock: 'In Stock',
      inStockHint: 'Items available for ordering',
      outOfStock: 'Out Of Stock',
      outOfStockHint: 'Items currently unavailable',
      markOutOfStock: 'Mark Out Of Stock',
      markInStock: 'Mark In Stock'
    },
    financials: {
      section: 'Finance Panel',
      title: 'Daily Sales',
      summaryBadge: 'Net earnings are calculated after a 10% commission',
      dailyRevenue: 'Daily Revenue',
      dailyRevenueHint: 'Total processed order value for today',
      orderCount: 'Order Count',
      orderCountHint: 'Total orders received today',
      netEarnings: 'Net Earnings',
      netEarningsHint: 'Revenue remaining after commission',
      dailySummary: 'Daily Summary',
      performanceOverview: "Today's performance overview",
      commissionRate: 'Commission Rate',
      formula: 'Net earnings formula',
      todayNet: "Today's Net",
      note: 'Accept orders faster to reduce prep time and make your daily earnings more predictable.'
    },
    settings: {
      title: 'Settings',
      description: 'Control dashboard preferences and switch the entire interface language.',
      languageTitle: 'Language',
      languageDescription: 'Choose the display language for the full merchant dashboard.',
      currentLanguage: 'Current Language',
      english: 'English',
      albanian: 'Albanian (Tosk)',
      serbian: 'Serbian',
      englishDescription: 'Show all interface text in English.',
      albanianDescription: 'Show all interface text in Albanian (Tosk).',
      serbianDescription: 'Show all interface text in Serbian.',
      wholeDashboard: 'Whole Dashboard Language'
    },
    orderCard: {
      items: 'Items',
      address: 'Address',
      total: 'Total'
    },
    statuses: {
      orderReceived: 'Order Received',
      preparing: 'Preparing',
      ready: 'Ready',
      approaching: 'Approaching',
      atTheDoor: 'At The Door'
    },
    actions: {
      accept: 'Accept',
      startPrep: 'Start Prep',
      ready: 'Ready'
    },
    catalog: {
      simit: 'Byrek',
      pide: 'Tave Kosi',
      kunefe: 'Trilece',
      cigKofte: 'Qofte',
      ayran: 'Dhalle',
      bakery: 'Bakery',
      mainDish: 'Main Dish',
      dessert: 'Dessert',
      snack: 'Snack'
    },
    misc: {
      addressPending: 'Address details pending',
      customer: 'Customer',
      item: 'Item',
      emailAndPasswordRequired: 'Email and password are required',
      ordersLoadFailed: 'Orders could not be loaded'
    }
  },
  sq: {
    nav: {
      liveOrders: 'Porosi Ne Kohe Reale',
      menuManagement: 'Menaxhimi i Menuse',
      dailySales: 'Shitjet Ditore',
      notifications: 'Njoftime',
      settings: 'Cilesimet'
    },
    shell: {
      title: 'Paneli i Tregtarit',
      description: 'Menaxho porosite, stokun dhe te ardhurat ditore nga nje hapesire e vetme operative.',
      session: 'Sesioni',
      signOut: 'Dil',
      hubTitle: 'Qendra e Tregtarit ne Tirane',
      hubDescription: 'Nderfaqe operative e pershtatur per Cabuk Albania',
      liveConnectionReady: 'Lidhja ne kohe reale eshte gati'
    },
    login: {
      brandTitle: 'Paneli i Tregtarit Cabuk',
      title: 'Hyr',
      description:
        'Hyr ne panelin e tregtarit me nje stil te shpejte dhe te ngrohte operativ per tregun shqiptar.',
      liveOperations: 'Operacione ne kohe reale',
      incomingOrderFlow: 'Rrjedha e porosive',
      prepView: 'Pamja e pergatitjes',
      kitchenPace: 'Ritmi i kuzhines',
      netEarnings: 'Fitimi neto',
      dailySummary: 'Permbledhja ditore',
      merchantLogin: 'Hyrja e Tregtarit',
      email: 'Email',
      password: 'Fjalekalimi',
      passwordPlaceholder: 'Shkruaj fjalekalimin',
      signIn: 'Hyr',
      signingIn: 'Duke hyre...',
      loginFailed: 'Hyrja deshtoi'
    },
    dashboard: {
      title: 'Porosite Ne Kohe Reale',
      description: 'Nje pamje e porosive aktive e pershtatur per operacionet e restoranteve ne Shqiperi.',
      acceptingOrders: 'Duke pranuar porosi',
      dailyRevenue: 'Xhiro Ditore',
      activeOrders: 'Porosi Aktive',
      averagePrep: 'Pergatitja Mesatare',
      averagePrepValue: '12 min',
      new: 'Te Reja',
      prep: 'Pergatitje',
      ready: 'Gati',
      liveOrders: 'Porosi Live',
      liveOrdersHint: 'Porosite aktive qe po menaxhohen tani',
      inPrep: 'Ne Pergatitje',
      inPrepHint: 'Porosite qe po pergatiten tani',
      firstResponse: 'Pergjigjja e Pare',
      firstResponseValue: '2 min',
      firstResponseHint: 'Koha e synuar per pranimin e nje porosie'
    },
    inventory: {
      section: 'Operacione',
      title: 'Menaxhimi i Menuse',
      badge: 'Pamje e stokut ne stil restoranti',
      totalItems: 'Artikuj Gjithsej',
      totalItemsHint: 'Artikujt e menuse qe menaxhohen ne panel',
      inStock: 'Ne Stok',
      inStockHint: 'Artikujt e disponueshem per porosi',
      outOfStock: 'Jashte Stokut',
      outOfStockHint: 'Artikujt qe mungojne perkohesisht',
      markOutOfStock: 'Shenoje Jashte Stokut',
      markInStock: 'Shenoje Ne Stok'
    },
    financials: {
      section: 'Paneli Financiar',
      title: 'Shitjet Ditore',
      summaryBadge: 'Fitimi neto llogaritet pas komisionit 10%',
      dailyRevenue: 'Xhiro Ditore',
      dailyRevenueHint: 'Vlera totale e porosive te perpunuara sot',
      orderCount: 'Numri i Porosive',
      orderCountHint: 'Porosite e marra sot',
      netEarnings: 'Fitimi Neto',
      netEarningsHint: 'Te ardhurat pas komisionit',
      dailySummary: 'Permbledhje Ditore',
      performanceOverview: 'Pamja e performances se sotme',
      commissionRate: 'Norma e Komisionit',
      formula: 'Formula e fitimit neto',
      todayNet: 'Neto Sot',
      note: "Prano porosite me shpejt per te ulur kohen e pergatitjes dhe per t'i bere fitimet me te parashikueshme."
    },
    settings: {
      title: 'Cilesimet',
      description: 'Menaxho preferencat e panelit dhe ndrysho gjuhen e tere nderfaqes.',
      languageTitle: 'Gjuha',
      languageDescription: 'Zgjidh gjuhen e shfaqjes per tere panelin e tregtarit.',
      currentLanguage: 'Gjuha Aktuale',
      english: 'Anglisht',
      albanian: 'Shqip (Tosk)',
      serbian: 'Serbisht',
      englishDescription: 'Shfaq te gjithe tekstin e nderfaqes ne anglisht.',
      albanianDescription: 'Shfaq te gjithe tekstin e nderfaqes ne shqip (Tosk).',
      serbianDescription: 'Shfaq te gjithe tekstin e nderfaqes ne serbisht.',
      wholeDashboard: 'Gjuha e Gjithe Panelit'
    },
    orderCard: {
      items: 'Artikujt',
      address: 'Adresa',
      total: 'Totali'
    },
    statuses: {
      orderReceived: 'Porosia U Mor',
      preparing: 'Duke Pergatitur',
      ready: 'Gati',
      approaching: 'Duke U Afuar',
      atTheDoor: 'Te Dera'
    },
    actions: {
      accept: 'Prano',
      startPrep: 'Fillo Pergatitjen',
      ready: 'Gati'
    },
    catalog: {
      simit: 'Byrek',
      pide: 'Tave Kosi',
      kunefe: 'Trilece',
      cigKofte: 'Qofte',
      ayran: 'Dhalle',
      bakery: 'Furre',
      mainDish: 'Pjate Kryesore',
      dessert: 'Embelsire',
      snack: 'Ushqim i Lehte'
    },
    misc: {
      addressPending: 'Detajet e adreses po priten',
      customer: 'Klienti',
      item: 'Artikulli',
      emailAndPasswordRequired: 'Emaili dhe fjalekalimi jane te detyrueshem',
      ordersLoadFailed: 'Porosite nuk mund te ngarkoheshin'
    }
  },
  sr: undefined
};

export const getTranslations = (language: AppLanguage) =>
  (translations[language] ?? translations.en) as TranslationTree;

export const translateCatalogValue = (value: string, language: AppLanguage) => {
  const t = getTranslations(language);

  const map: Record<string, string> = {
    Byrek: t.catalog.simit,
    'Tave Kosi': t.catalog.pide,
    Trilece: t.catalog.kunefe,
    Qofte: t.catalog.cigKofte,
    Dhalle: t.catalog.ayran,
    Bakery: t.catalog.bakery,
    'Main Dish': t.catalog.mainDish,
    Dessert: t.catalog.dessert,
    Snack: t.catalog.snack,
    Furre: t.catalog.bakery,
    'Pjate Kryesore': t.catalog.mainDish,
    Embelsire: t.catalog.dessert,
    'Ushqim i Lehte': t.catalog.snack
  };

  return map[value] ?? value;
};

export const useMerchantI18n = () => {
  const language = useMerchantStore((state) => state.language);
  const translationsForLanguage = getTranslations(language);

  return {
    language,
    t: translationsForLanguage
  };
};
