export type Language = "en" | "zh";

export interface TranslationDictionary {
  common: {
    langName: string;
    langSwitchBtn: string;
    utc: string;
    justNow: string;
    minsAgo: (mins: number) => string;
    hoursAgo: (hours: number) => string;
    daysAgo: (days: number) => string;
  };
  header: {
    world: string;
    liveRadar: string;
    subtitle: string;
    notifyMe: string;
  };
  hero: {
    title: string;
    stageTag: string;
    sfxOn: string;
    sfxOff: string;
    hitBlockAria: string;
    hitBlockButtonActive: string;
    hitBlockButtonNormal: string;
    score: string;
    coins: string;
    days: string;
    hours: string;
    mins: string;
    secs: string;
    bankedReset: string;
    bankedDesc: string;
    regularReset: string;
    regularDesc: string;
    latestIntel: string;
    xPost: string;
    author: string;
    refId: string;
    bonusCoin: string;
    myCoins: string;
    worldCoins: string;
    worldCoinsLive: string;
  };
  stats: {
    title: string;
    subtitle: string;
    totalResets: {
      label: string;
      badge: string;
      desc: string;
      footer: string;
    };
    avgInterval: {
      label: string;
      badge: string;
      unit: string;
      desc: string;
      footer: string;
    };
    longestWait: {
      label: string;
      badge: string;
      unit: string;
      desc: string;
      footer: string;
    };
  };
  watch: {
    title: string;
    stageTag: string;
    subtitle: string;
    threatCritical: string;
    threatElevated: string;
    threatLow: string;
    refreshProbability: string;
    chance: string;
    criticalDesc: string;
    elevatedDesc: string;
    lowDesc: string;
    elapsed: string;
    avgCadence: string;
    maxRecord: string;
    radarGauge: string;
    gaugeMarks: {
      calm: string;
      mid: string;
      target: string;
      red: string;
    };
    radarAnalysisTitle: string;
    radarAnalysisText: (avg: string, elapsed: string, date: string, prob: number) => string;
    betTitle: string;
    totalBets: string;
    betDesc: string;
    yesLabel: string;
    yesSub: string;
    noLabel: string;
    noSub: string;
    yourBet: string;
    betLocked: (choiceText: string) => string;
    betPlaceholder: string;
    copyBet: string;
    copied: string;
    tweetBet: string;
    shareText: (prob: number, elapsed: string, avg: string, yesPct: number, noPct: number, betChoice: "yes" | "no" | null) => string;
  };
  heatmap: {
    title: string;
    stageTag: string;
    subtitle: string;
    view26: string;
    view52: string;
    dayLabels: string[];
    noReset: string;
    regularReset: (count: number) => string;
    bankedReset: (count: number) => string;
    windowResets: string;
    allTime: string;
    today: string;
    bankedBadge: string;
    regularBadge: string;
    emptyBadge: string;
    announced: string;
    viewTweet: string;
    author: string;
    quietDungeon: string;
  };
  log: {
    title: string;
    total: (count: number) => string;
    filterAll: (count: number) => string;
    filterRegular: string;
    filterBanked: string;
    questNum: (num: string) => string;
    bankedReset: string;
    regularReset: string;
    originalDispatch: string;
    expandAll: (count: number) => string;
    collapse: string;
    refreshIntel: string;
    refreshing: string;
  };
  sponsors: {
    title: string;
    subtitle: string;
    items: Record<
      string,
      {
        name: string;
        category: string;
        power: string;
        badge: string;
        description: string;
        ctaText: string;
      }
    >;
  };
  subscribe: {
    title: string;
    subtitle: string;
    tunedIn: string;
    change: string;
    successMsg: string;
    invalidEmail: string;
    inputLabel: string;
    placeholder: string;
    button: string;
    note: string;
    altChannels: string;
    telegramBeacon: string;
    xRadar: string;
    footerTip: string;
  };
  progression: {
    title: string;
    statusCleared: string;
    stage1Title: string;
    stage1Desc: string;
    stage2Title: string;
    stage2Desc: string;
    stage3Title: string;
    stage3Desc: string;
    complete: string;
  };
  footer: {
    quote: string;
    disclaimer: string;
  };
}
