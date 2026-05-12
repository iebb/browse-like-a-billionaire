(function initBrowseLikeABillionaire(global) {
  "use strict";

  const ZWD_PER_USD = 3.5e41;
  const LARGE_NUMBER_RATE_THRESHOLD = 1_000_000;
  const SKIP_SELECTOR = [
    "script",
    "style",
    "noscript",
    "textarea",
    "input",
    "select",
    "option",
    "pre",
    "code",
    "kbd",
    "samp",
    "ruby",
    ".blab-zwd-ruby",
    "[contenteditable='true']",
    "[contenteditable='']"
  ].join(",");

  const SYMBOL_TO_CODE = new Map([
    ["US$", "usd"],
    ["U.S.$", "usd"],
    ["$", "usd"],
    ["CA$", "cad"],
    ["C$", "cad"],
    ["A$", "aud"],
    ["AU$", "aud"],
    ["NZ$", "nzd"],
    ["HK$", "hkd"],
    ["S$", "sgd"],
    ["SG$", "sgd"],
    ["NT$", "twd"],
    ["R$", "brl"],
    ["Mex$", "mxn"],
    ["€", "eur"],
    ["£", "gbp"],
    ["¥", "jpy"],
    ["JP¥", "jpy"],
    ["CN¥", "cny"],
    ["₹", "inr"],
    ["₩", "krw"],
    ["₽", "rub"],
    ["₺", "try"],
    ["₴", "uah"],
    ["₫", "vnd"],
    ["฿", "thb"],
    ["₪", "ils"],
    ["₦", "ngn"],
    ["₱", "php"],
    ["₡", "crc"],
    ["₲", "pyg"],
    ["₵", "ghs"],
    ["₸", "kzt"],
    ["₭", "lak"],
    ["₮", "mnt"],
    ["₾", "gel"],
    ["₿", "btc"]
  ]);

  const SUFFIX_SYMBOL_TO_CODE = new Map([
    ["zł", "pln"],
    ["Kč", "czk"],
    ["Ft", "huf"],
    ["円", "jpy"],
    ["元", "cny"],
    ["kr", "sek"],
    ["Fr", "chf"]
  ]);

  const SYMBOL_CONTEXT_CURRENCIES = new Map([
    ["$", new Set(["usd", "cad", "aud", "nzd", "hkd", "sgd", "twd", "mxn", "brl", "ars", "clp", "cop", "uyu"])],
    ["US$", new Set(["usd"])],
    ["U.S.$", new Set(["usd"])],
    ["C$", new Set(["cad", "nio"])],
    ["A$", new Set(["aud"])],
    ["AU$", new Set(["aud"])],
    ["NZ$", new Set(["nzd"])],
    ["HK$", new Set(["hkd"])],
    ["S$", new Set(["sgd"])],
    ["SG$", new Set(["sgd"])],
    ["NT$", new Set(["twd"])],
    ["¥", new Set(["jpy", "cny"])],
    ["CN¥", new Set(["cny"])],
    ["JP¥", new Set(["jpy"])],
    ["円", new Set(["jpy"])],
    ["元", new Set(["cny", "twd", "sgd"])],
    ["£", new Set(["gbp", "egp", "lbp", "syp", "sdg"])],
    ["kr", new Set(["sek", "nok", "dkk", "isk"])],
    ["Fr", new Set(["chf", "xaf", "xof", "cdf"])]
  ]);

  const COUNTRY_TO_CURRENCY = {
    ae: "aed",
    ar: "ars",
    au: "aud",
    bh: "bhd",
    br: "brl",
    ca: "cad",
    ch: "chf",
    cl: "clp",
    cn: "cny",
    co: "cop",
    cz: "czk",
    de: "eur",
    dk: "dkk",
    eg: "egp",
    es: "eur",
    eu: "eur",
    fi: "eur",
    fr: "eur",
    gb: "gbp",
    gi: "gbp",
    gh: "ghs",
    hk: "hkd",
    hu: "huf",
    id: "idr",
    ie: "eur",
    il: "ils",
    in: "inr",
    it: "eur",
    jp: "jpy",
    ke: "kes",
    kr: "krw",
    kw: "kwd",
    mx: "mxn",
    my: "myr",
    ng: "ngn",
    nl: "eur",
    no: "nok",
    nz: "nzd",
    om: "omr",
    pe: "pen",
    ph: "php",
    pl: "pln",
    qa: "qar",
    ro: "ron",
    rs: "rsd",
    ru: "rub",
    sa: "sar",
    se: "sek",
    sg: "sgd",
    th: "thb",
    tr: "try",
    tw: "twd",
    ua: "uah",
    uk: "gbp",
    us: "usd",
    vn: "vnd",
    za: "zar",
    zw: "zwg"
  };

  const LANGUAGE_TO_CURRENCY = {
    "ar-ae": "aed",
    "en-au": "aud",
    "pt-br": "brl",
    "en-ca": "cad",
    "fr-ca": "cad",
    "de-ch": "chf",
    "fr-ch": "chf",
    "it-ch": "chf",
    "zh-cn": "cny",
    "zh-hans": "cny",
    "zh-sg": "sgd",
    "en-hk": "hkd",
    "zh-hk": "hkd",
    "da-dk": "dkk",
    "de-de": "eur",
    "es-es": "eur",
    "fi-fi": "eur",
    "fr-fr": "eur",
    "it-it": "eur",
    "nl-nl": "eur",
    "en-gb": "gbp",
    "en-in": "inr",
    "ja-jp": "jpy",
    "ko-kr": "krw",
    "es-mx": "mxn",
    "nb-no": "nok",
    "nn-no": "nok",
    "en-nz": "nzd",
    "pl-pl": "pln",
    "ru-ru": "rub",
    "sv-se": "sek",
    "en-sg": "sgd",
    "th-th": "thb",
    "tr-tr": "try",
    "zh-tw": "twd",
    "uk-ua": "uah",
    "en-us": "usd",
    "vi-vn": "vnd"
  };

  const COUNTRY_NAME_TO_CURRENCY = {
    argentina: "ars",
    australia: "aud",
    bahrain: "bhd",
    brazil: "brl",
    canada: "cad",
    chile: "clp",
    china: "cny",
    colombia: "cop",
    "czech republic": "czk",
    czechia: "czk",
    denmark: "dkk",
    egypt: "egp",
    france: "eur",
    germany: "eur",
    gibraltar: "gbp",
    ireland: "eur",
    italy: "eur",
    netherlands: "eur",
    spain: "eur",
    finland: "eur",
    ghana: "ghs",
    "hong kong": "hkd",
    hungary: "huf",
    india: "inr",
    indonesia: "idr",
    israel: "ils",
    japan: "jpy",
    kenya: "kes",
    kuwait: "kwd",
    malaysia: "myr",
    mexico: "mxn",
    nigeria: "ngn",
    norway: "nok",
    "new zealand": "nzd",
    oman: "omr",
    peru: "pen",
    philippines: "php",
    poland: "pln",
    qatar: "qar",
    romania: "ron",
    russia: "rub",
    "saudi arabia": "sar",
    singapore: "sgd",
    "south africa": "zar",
    "south korea": "krw",
    sweden: "sek",
    switzerland: "chf",
    taiwan: "twd",
    thailand: "thb",
    turkey: "try",
    ukraine: "uah",
    "united arab emirates": "aed",
    "united kingdom": "gbp",
    "united states": "usd",
    "united states of america": "usd",
    usa: "usd",
    vietnam: "vnd",
    zimbabwe: "zwg"
  };

  const LOCALIZED_UNIT_RULESET_BY_LANGUAGE = {
    en: {
      usd: ["US dollars", "US dollar", "U.S. dollars", "U.S. dollar", "American dollars", "American dollar", "dollars", "dollar", "bucks", "buck"],
      cad: ["Canadian dollars", "Canadian dollar"],
      aud: ["Australian dollars", "Australian dollar"],
      nzd: ["New Zealand dollars", "New Zealand dollar"],
      hkd: ["Hong Kong dollars", "Hong Kong dollar"],
      sgd: ["Singapore dollars", "Singapore dollar"],
      twd: ["Taiwan dollars", "Taiwan dollar"],
      mxn: ["Mexican pesos", "Mexican peso"],
      brl: ["Brazilian reais", "Brazilian real"],
      eur: ["euros", "euro"],
      gbp: ["pounds sterling", "pound sterling", "British pounds", "British pound", "Gibraltar pounds", "Gibraltar pound", "pounds", "pound"],
      jpy: ["yen"],
      cny: ["yuan", "renminbi"],
      inr: ["rupees", "rupee"],
      krw: ["won"],
      chf: ["Swiss francs", "Swiss franc", "francs", "franc"],
      zar: ["rand"]
    },
    zh: {
      usd: ["美元", "美金", "美圆", "美圓"],
      eur: ["欧元", "歐元"],
      gbp: ["英镑", "英鎊"],
      jpy: ["日元", "日圆", "日圓", "日幣"],
      cny: ["人民币", "人民幣", "人民币元", "人民幣元", "中国元", "中國元", "元", "圆", "圓"],
      twd: ["台币", "臺幣", "台幣", "新台币", "新臺幣", "台湾元", "臺灣元"],
      hkd: ["港币", "港幣", "港元"],
      sgd: ["新加坡元", "新币", "新幣", "坡元"],
      aud: ["澳元", "澳币", "澳幣"],
      cad: ["加元", "加币", "加幣"],
      chf: ["瑞士法郎", "瑞郎"],
      krw: ["韩元", "韓元", "韩币", "韓幣"],
      thb: ["泰铢", "泰銖"],
      vnd: ["越南盾"],
      inr: ["印度卢比", "印度盧比"],
      rub: ["卢布", "盧布"]
    },
    ja: {
      usd: ["米ドル", "アメリカドル", "ドル"],
      eur: ["ユーロ"],
      gbp: ["英ポンド", "ポンド"],
      jpy: ["円", "日本円"],
      cny: ["人民元", "中国元", "元"],
      twd: ["台湾ドル", "ニュー台湾ドル"],
      hkd: ["香港ドル"],
      sgd: ["シンガポールドル"],
      aud: ["豪ドル", "オーストラリアドル"],
      cad: ["加ドル", "カナダドル"],
      chf: ["スイスフラン"],
      krw: ["ウォン", "韓国ウォン"],
      thb: ["バーツ"],
      inr: ["ルピー"],
      rub: ["ルーブル"]
    },
    ko: {
      usd: ["달러", "미국달러"],
      eur: ["유로"],
      gbp: ["파운드"],
      jpy: ["엔"],
      cny: ["위안", "위앤"],
      krw: ["원", "한국원"],
      sgd: ["싱가포르달러"],
      hkd: ["홍콩달러"],
      twd: ["대만달러"],
      cad: ["캐나다달러"],
      aud: ["호주달러"],
      chf: ["스위스프랑"]
    },
    es: {
      usd: ["dólares estadounidenses", "dólar estadounidense", "dolares estadounidenses", "dolar estadounidense", "dólares", "dólar"],
      eur: ["euros", "euro"],
      gbp: ["libras esterlinas", "libra esterlina"],
      jpy: ["yenes", "yen"],
      cny: ["yuanes", "yuan"],
      brl: ["reales brasileños", "real brasileño"],
      mxn: ["pesos mexicanos", "peso mexicano"]
    },
    fr: {
      usd: ["dollars américains", "dollar américain"],
      cad: ["dollars canadiens", "dollar canadien"],
      eur: ["euros", "euro"],
      gbp: ["livres sterling", "livre sterling"],
      jpy: ["yens", "yen"],
      cny: ["yuans", "yuan"],
      chf: ["francs suisses", "franc suisse"]
    },
    de: {
      usd: ["US-Dollar", "US-Dollars", "Dollar", "Dollars"],
      eur: ["Euro"],
      gbp: ["Pfund Sterling", "Pfund"],
      jpy: ["Yen"],
      cny: ["Yuan", "Renminbi"],
      chf: ["Schweizer Franken", "Franken"]
    },
    pt: {
      usd: ["dólares americanos", "dólar americano", "dolares americanos", "dolar americano", "dólares", "dólar", "dolares", "dolar"],
      brl: ["reais", "real"],
      eur: ["euros", "euro"],
      gbp: ["libras esterlinas", "libra esterlina"],
      jpy: ["ienes", "iene"],
      cny: ["yuanes", "yuan"],
      cad: ["dólares canadenses", "dólar canadense"],
      aud: ["dólares australianos", "dólar australiano"],
      chf: ["francos suíços", "franco suíço", "francos suicos", "franco suico"]
    },
    ru: {
      usd: ["доллары США", "доллар США", "долларов США", "доллары", "доллар", "долларов"],
      eur: ["евро"],
      gbp: ["фунты стерлингов", "фунт стерлингов", "фунтов стерлингов", "фунты", "фунт", "фунтов"],
      jpy: ["иены", "иена", "иен"],
      cny: ["юани", "юань", "юаней"],
      rub: ["рубли", "рубль", "рублей"],
      chf: ["швейцарские франки", "швейцарский франк", "швейцарских франков", "франки", "франк", "франков"]
    },
    ar: {
      usd: ["دولارات أمريكية", "دولار أمريكي", "دولارات اميركية", "دولار اميركي", "دولارات", "دولار"],
      eur: ["يورو"],
      gbp: ["جنيهات إسترلينية", "جنيه إسترليني", "جنيهات استرلينية", "جنيه استرليني"],
      egp: ["جنيهات مصرية", "جنيه مصري"],
      jpy: ["ين ياباني", "ين"],
      cny: ["يوان صيني", "يوان"],
      sar: ["ريالات سعودية", "ريال سعودي"],
      aed: ["دراهم إماراتية", "درهم إماراتي", "دراهم اماراتية", "درهم اماراتي"],
      ils: ["شيكل إسرائيلي", "شيكل اسرائيلي", "شيكل"]
    }
  };

  const LOCALIZED_UNIT_TO_CODE = new Map([
    ...flattenLocalizedUnitRules(LOCALIZED_UNIT_RULESET_BY_LANGUAGE),
    ["US dollars", "usd"],
    ["US dollar", "usd"],
    ["U.S. dollars", "usd"],
    ["U.S. dollar", "usd"],
    ["American dollars", "usd"],
    ["American dollar", "usd"],
    ["dollars", "usd"],
    ["dollar", "usd"],
    ["bucks", "usd"],
    ["buck", "usd"],
    ["Canadian dollars", "cad"],
    ["Canadian dollar", "cad"],
    ["Australian dollars", "aud"],
    ["Australian dollar", "aud"],
    ["New Zealand dollars", "nzd"],
    ["New Zealand dollar", "nzd"],
    ["Hong Kong dollars", "hkd"],
    ["Hong Kong dollar", "hkd"],
    ["Singapore dollars", "sgd"],
    ["Singapore dollar", "sgd"],
    ["Taiwan dollars", "twd"],
    ["Taiwan dollar", "twd"],
    ["Mexican pesos", "mxn"],
    ["Mexican peso", "mxn"],
    ["Brazilian reais", "brl"],
    ["Brazilian real", "brl"],
    ["euros", "eur"],
    ["euro", "eur"],
    ["pounds sterling", "gbp"],
    ["pound sterling", "gbp"],
    ["British pounds", "gbp"],
    ["British pound", "gbp"],
    ["Gibraltar pounds", "gbp"],
    ["Gibraltar pound", "gbp"],
    ["pounds", "gbp"],
    ["pound", "gbp"],
    ["yen", "jpy"],
    ["yuan", "cny"],
    ["renminbi", "cny"],
    ["rupees", "inr"],
    ["rupee", "inr"],
    ["won", "krw"],
    ["francs", "chf"],
    ["franc", "chf"],
    ["krona", "sek"],
    ["kronor", "sek"],
    ["krone", "nok"],
    ["pesos", "mxn"],
    ["peso", "mxn"],
    ["reais", "brl"],
    ["real", "brl"],
    ["lira", "try"],
    ["hryvnia", "uah"],
    ["baht", "thb"],
    ["dong", "vnd"],
    ["shekels", "ils"],
    ["shekel", "ils"],
    ["dirhams", "aed"],
    ["dirham", "aed"],
    ["riyals", "sar"],
    ["riyal", "sar"],
    ["rand", "zar"],

    ["米ドル", "usd"],
    ["アメリカドル", "usd"],
    ["ドル", "usd"],
    ["ユーロ", "eur"],
    ["英ポンド", "gbp"],
    ["ポンド", "gbp"],
    ["円", "jpy"],
    ["日本円", "jpy"],
    ["人民元", "cny"],
    ["中国元", "cny"],
    ["元", "cny"],
    ["台湾ドル", "twd"],
    ["ニュー台湾ドル", "twd"],
    ["香港ドル", "hkd"],
    ["シンガポールドル", "sgd"],
    ["豪ドル", "aud"],
    ["オーストラリアドル", "aud"],
    ["加ドル", "cad"],
    ["カナダドル", "cad"],
    ["スイスフラン", "chf"],
    ["ウォン", "krw"],
    ["韓国ウォン", "krw"],
    ["バーツ", "thb"],
    ["ルピー", "inr"],
    ["ルーブル", "rub"],

    ["美元", "usd"],
    ["美金", "usd"],
    ["美圆", "usd"],
    ["美圓", "usd"],
    ["欧元", "eur"],
    ["歐元", "eur"],
    ["英镑", "gbp"],
    ["英鎊", "gbp"],
    ["日元", "jpy"],
    ["日圆", "jpy"],
    ["日圓", "jpy"],
    ["日幣", "jpy"],
    ["人民币", "cny"],
    ["人民幣", "cny"],
    ["人民币元", "cny"],
    ["人民幣元", "cny"],
    ["中国元", "cny"],
    ["中國元", "cny"],
    ["元", "cny"],
    ["圆", "cny"],
    ["圓", "cny"],
    ["台币", "twd"],
    ["臺幣", "twd"],
    ["台幣", "twd"],
    ["新台币", "twd"],
    ["新臺幣", "twd"],
    ["台湾元", "twd"],
    ["臺灣元", "twd"],
    ["港币", "hkd"],
    ["港幣", "hkd"],
    ["港元", "hkd"],
    ["新加坡元", "sgd"],
    ["新币", "sgd"],
    ["新幣", "sgd"],
    ["坡元", "sgd"],
    ["澳元", "aud"],
    ["澳币", "aud"],
    ["澳幣", "aud"],
    ["加元", "cad"],
    ["加币", "cad"],
    ["加幣", "cad"],
    ["瑞士法郎", "chf"],
    ["瑞郎", "chf"],
    ["韩元", "krw"],
    ["韓元", "krw"],
    ["韩币", "krw"],
    ["韓幣", "krw"],
    ["泰铢", "thb"],
    ["泰銖", "thb"],
    ["越南盾", "vnd"],
    ["印度卢比", "inr"],
    ["印度盧比", "inr"],
    ["卢布", "rub"],
    ["盧布", "rub"],

    ["달러", "usd"],
    ["미국달러", "usd"],
    ["유로", "eur"],
    ["파운드", "gbp"],
    ["엔", "jpy"],
    ["위안", "cny"],
    ["위앤", "cny"],
    ["원", "krw"],
    ["한국원", "krw"],
    ["싱가포르달러", "sgd"],
    ["홍콩달러", "hkd"],
    ["대만달러", "twd"],
    ["캐나다달러", "cad"],
    ["호주달러", "aud"],
    ["스위스프랑", "chf"],

    ["dólares estadounidenses", "usd"],
    ["dólar estadounidense", "usd"],
    ["dolares estadounidenses", "usd"],
    ["dolar estadounidense", "usd"],
    ["dólares", "usd"],
    ["dólar", "usd"],
    ["euros", "eur"],
    ["libras esterlinas", "gbp"],
    ["libra esterlina", "gbp"],
    ["yenes", "jpy"],
    ["yen", "jpy"],
    ["reales brasileños", "brl"],
    ["real brasileño", "brl"],
    ["pesos mexicanos", "mxn"],
    ["peso mexicano", "mxn"],

    ["dollars américains", "usd"],
    ["dollar américain", "usd"],
    ["dollars canadiens", "cad"],
    ["dollar canadien", "cad"],
    ["euros", "eur"],
    ["livres sterling", "gbp"],
    ["livre sterling", "gbp"],
    ["yens", "jpy"],
    ["yen", "jpy"],
    ["francs suisses", "chf"],
    ["franc suisse", "chf"],

    ["US-Dollar", "usd"],
    ["US-Dollars", "usd"],
    ["Dollar", "usd"],
    ["Dollars", "usd"],
    ["Euro", "eur"],
    ["Pfund Sterling", "gbp"],
    ["Pfund", "gbp"],
    ["Yen", "jpy"],
    ["Schweizer Franken", "chf"],
    ["Franken", "chf"]
  ]);

  const LOCALIZED_UNIT_CONTEXT_CURRENCIES = new Map([
    ["dollars", new Set(["usd", "cad", "aud", "nzd", "hkd", "sgd", "twd"])],
    ["dollar", new Set(["usd", "cad", "aud", "nzd", "hkd", "sgd", "twd"])],
    ["bucks", new Set(["usd", "cad", "aud", "nzd", "sgd"])],
    ["buck", new Set(["usd", "cad", "aud", "nzd", "sgd"])],
    ["pounds", new Set(["gbp"])],
    ["pound", new Set(["gbp"])],
    ["francs", new Set(["chf", "xaf", "xof", "cdf"])],
    ["franc", new Set(["chf", "xaf", "xof", "cdf"])],
    ["krona", new Set(["sek", "isk"])],
    ["kronor", new Set(["sek", "isk"])],
    ["krone", new Set(["nok", "dkk"])],
    ["pesos", new Set(["mxn", "ars", "clp", "cop", "php"])],
    ["peso", new Set(["mxn", "ars", "clp", "cop", "php"])],
    ["ドル", new Set(["usd", "cad", "aud", "nzd", "hkd", "sgd", "twd"])],
    ["元", new Set(["cny", "twd", "sgd", "hkd"])],
    ["圆", new Set(["cny", "twd", "sgd", "hkd"])],
    ["圓", new Set(["cny", "twd", "sgd", "hkd"])],
    ["달러", new Set(["usd", "cad", "aud", "nzd", "hkd", "sgd", "twd"])],
    ["위안", new Set(["cny", "twd"])],
    ["위앤", new Set(["cny", "twd"])],
    ["dólares", new Set(["usd", "cad", "aud", "mxn"])],
    ["dólar", new Set(["usd", "cad", "aud", "mxn"])],
    ["dolares", new Set(["usd", "cad", "aud", "mxn"])],
    ["dolar", new Set(["usd", "cad", "aud", "mxn"])],
    ["Dollar", new Set(["usd", "cad", "aud"])],
    ["Dollars", new Set(["usd", "cad", "aud"])]
  ]);

  const CURRENCY_SYMBOLS = {
    aed: "AED",
    ars: "ARS",
    aud: "A$",
    brl: "R$",
    cad: "CA$",
    chf: "CHF",
    clp: "CLP",
    cny: "CN¥",
    cop: "COP",
    czk: "Kč",
    dkk: "kr",
    egp: "E£",
    eur: "€",
    gbp: "£",
    ghs: "GH₵",
    hkd: "HK$",
    huf: "Ft",
    idr: "IDR",
    ils: "₪",
    inr: "₹",
    jpy: "¥",
    kes: "KES",
    krw: "₩",
    mxn: "Mex$",
    myr: "RM",
    ngn: "₦",
    nok: "kr",
    nzd: "NZ$",
    pen: "PEN",
    php: "₱",
    pln: "zł",
    qar: "QAR",
    ron: "RON",
    rsd: "RSD",
    rub: "₽",
    sar: "SAR",
    sek: "kr",
    sgd: "S$",
    thb: "฿",
    try: "₺",
    twd: "NT$",
    uah: "₴",
    usd: "$",
    vnd: "₫",
    zar: "R",
    zwd: "Z$",
    zwg: "ZWG",
    zwl: "ZWL"
  };

  const SUPERSCRIPT_DIGITS = {
    "-": "⁻",
    "+": "⁺",
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹"
  };
  const DEFAULT_RENDERING_LOCALE = "en-US";
  const INTL_FORMATTERS = new Map();
  const CURRENCY_FRACTION_DIGITS = {
    bif: 0,
    byn: 2,
    bhd: 3,
    btc: 8,
    byr: 0,
    chf: 2,
    clp: 0,
    cny: 2,
    djf: 0,
    gnf: 0,
    isk: 0,
    jod: 3,
    jpy: 0,
    krw: 0,
    kwd: 3,
    mga: 0,
    omr: 3,
    pyg: 0,
    rwf: 0,
    tnd: 3,
    ugx: 0,
    usd: 2,
    uyu: 2,
    vnd: 0,
    vuv: 0,
    xaf: 0,
    xof: 0,
    xpf: 0
  };

  const CURRENCY_CODES = [
    "USD",
    "EUR",
    "GBP",
    "GIP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "HKD",
    "SGD",
    "NZD",
    "SEK",
    "NOK",
    "DKK",
    "ISK",
    "ZAR",
    "BRL",
    "MXN",
    "ARS",
    "CLP",
    "COP",
    "PEN",
    "INR",
    "KRW",
    "RUB",
    "TRY",
    "UAH",
    "VND",
    "THB",
    "TWD",
    "IDR",
    "MYR",
    "PHP",
    "ILS",
    "AED",
    "SAR",
    "QAR",
    "KWD",
    "BHD",
    "OMR",
    "EGP",
    "NGN",
    "KES",
    "GHS",
    "PLN",
    "CZK",
    "HUF",
    "RON",
    "BGN",
    "HRK",
    "RSD",
    "ZWD",
    "ZWL",
    "ZWG",
    "BTC",
    "ETH",
    "USDT",
    "USDC"
  ];

  const AMOUNT_SOURCE = String.raw`[+-]?(?:(?:\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.\d+)?|\.\d+)(?:\s*(?:trillion|billion|million|bn|[kKmMbB]))?`;
  const SYMBOL_ALT = regexAlternation([...SYMBOL_TO_CODE.keys()]);
  const SUFFIX_SYMBOL_ALT = regexAlternation([...SUFFIX_SYMBOL_TO_CODE.keys()]);
  const LOCALIZED_UNIT_ALT = regexAlternation([...LOCALIZED_UNIT_TO_CODE.keys()]);
  const CODE_ALT = regexAlternation(CURRENCY_CODES);
  const CURRENCY_CODE_SET = new Set(CURRENCY_CODES.map((code) => code.toLowerCase()));
  const LEFT_BOUNDARY = String.raw`(?<![\p{L}\p{N}_])`;
  const RIGHT_BOUNDARY = String.raw`(?![\p{L}\p{N}_])`;

  const MATCHERS = [
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${SYMBOL_ALT})\\s*(${AMOUNT_SOURCE})${RIGHT_BOUNDARY}`, "giu"),
      read(match, options) {
        return {
          text: match[0],
          currency: lookupSymbolCurrency(SYMBOL_TO_CODE, match[1], options),
          amountText: match[2]
        };
      }
    },
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${CODE_ALT})\\s+(${AMOUNT_SOURCE})${RIGHT_BOUNDARY}`, "gu"),
      read(match) {
        return {
          text: match[0],
          currency: match[1].toLowerCase(),
          amountText: match[2]
        };
      }
    },
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${AMOUNT_SOURCE})\\s*(${CODE_ALT})${RIGHT_BOUNDARY}`, "gu"),
      read(match) {
        return {
          text: match[0],
          currency: match[2].toLowerCase(),
          amountText: match[1]
        };
      }
    },
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${AMOUNT_SOURCE})\\s*(${SUFFIX_SYMBOL_ALT})${RIGHT_BOUNDARY}`, "giu"),
      read(match, options) {
        return {
          text: match[0],
          currency: lookupSymbolCurrency(SUFFIX_SYMBOL_TO_CODE, match[2], options),
          amountText: match[1]
        };
      }
    },
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${LOCALIZED_UNIT_ALT})\\s*(${AMOUNT_SOURCE})${RIGHT_BOUNDARY}`, "giu"),
      read(match, options) {
        return {
          text: match[0],
          currency: lookupLocalizedUnitCurrency(match[1], options),
          amountText: match[2]
        };
      }
    },
    {
      re: new RegExp(`${LEFT_BOUNDARY}(${AMOUNT_SOURCE})\\s*(${LOCALIZED_UNIT_ALT})${RIGHT_BOUNDARY}`, "giu"),
      read(match, options) {
        return {
          text: match[0],
          currency: lookupLocalizedUnitCurrency(match[2], options),
          amountText: match[1]
        };
      }
    }
  ];

  function flattenLocalizedUnitRules(ruleSetByLanguage) {
    const entries = [];
    for (const currencyRules of Object.values(ruleSetByLanguage)) {
      for (const [currency, terms] of Object.entries(currencyRules)) {
        for (const term of terms) {
          entries.push([term, currency]);
        }
      }
    }

    return entries;
  }

  function regexAlternation(values) {
    return values
      .sort((a, b) => b.length - a.length)
      .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
  }

  function normalizeSymbol(value) {
    return value.replace(/\s+/g, "");
  }

  function normalizeUnit(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function lookupSymbolCurrency(map, value, options) {
    const symbol = normalizeSymbol(value);
    const inferredCurrency = normalizeCurrencyCode(options && options.inferredCurrency);
    const contextualCurrencies = findContextualSymbolCurrencies(symbol);

    if (inferredCurrency && contextualCurrencies && contextualCurrencies.has(inferredCurrency)) {
      return inferredCurrency;
    }

    const exact = map.get(symbol);
    if (exact) {
      return exact;
    }

    const folded = symbol.toLocaleLowerCase("en-US");
    for (const [knownSymbol, code] of map.entries()) {
      if (knownSymbol.toLocaleLowerCase("en-US") === folded) {
        return code;
      }
    }

    return null;
  }

  function lookupLocalizedUnitCurrency(value, options) {
    const unit = normalizeUnit(value);
    const inferredCurrency = normalizeCurrencyCode(options && options.inferredCurrency);
    const contextualCurrencies = findContextualUnitCurrencies(unit);

    if (inferredCurrency && contextualCurrencies && contextualCurrencies.has(inferredCurrency)) {
      return inferredCurrency;
    }

    const exact = LOCALIZED_UNIT_TO_CODE.get(unit);
    if (exact) {
      return exact;
    }

    const folded = unit.toLocaleLowerCase("en-US");
    for (const [knownUnit, code] of LOCALIZED_UNIT_TO_CODE.entries()) {
      if (knownUnit.toLocaleLowerCase("en-US") === folded) {
        return code;
      }
    }

    return null;
  }

  function findContextualUnitCurrencies(unit) {
    const folded = normalizeUnit(unit).toLocaleLowerCase("en-US");
    for (const [knownUnit, currencies] of LOCALIZED_UNIT_CONTEXT_CURRENCIES.entries()) {
      if (knownUnit.toLocaleLowerCase("en-US") === folded) {
        return currencies;
      }
    }

    return null;
  }

  function findContextualSymbolCurrencies(symbol) {
    const folded = symbol.toLocaleLowerCase("en-US");
    for (const [knownSymbol, currencies] of SYMBOL_CONTEXT_CURRENCIES.entries()) {
      if (knownSymbol.toLocaleLowerCase("en-US") === folded) {
        return currencies;
      }
    }

    return null;
  }

  function normalizeRates(rawRates) {
    const source = rawRates && rawRates.usd ? rawRates.usd : rawRates;
    const normalized = {};
    for (const [code, rate] of Object.entries(source || {})) {
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
        normalized[code.toLowerCase()] = rate;
      }
    }
    normalized.usd = 1;
    return normalized;
  }

  function normalizeCurrencyCode(value) {
    if (typeof value !== "string") {
      return "";
    }

    const normalized = value.trim().toLowerCase();
    return /^[a-z0-9]{3,5}$/.test(normalized) ? normalized : "";
  }

  function canonicalCurrencyCode(value) {
    const normalized = normalizeCurrencyCode(value);
    return normalized === "gip" ? "gbp" : normalized;
  }

  function parseAmount(amountText) {
    const multiplierMatch = amountText.match(/\s*(trillion|billion|million|bn|[kKmMbB])\s*$/);
    const multiplierToken = multiplierMatch ? multiplierMatch[1].toLowerCase() : "";
    const numericText = (multiplierMatch ? amountText.slice(0, multiplierMatch.index) : amountText)
      .replace(/\s+/g, "")
      .replace(/,/g, "");
    const value = Number(numericText);

    if (!Number.isFinite(value)) {
      return null;
    }

    const multipliers = {
      k: 1e3,
      m: 1e6,
      b: 1e9,
      bn: 1e9,
      million: 1e6,
      billion: 1e9,
      trillion: 1e12
    };

    return value * (multipliers[multiplierToken] || 1);
  }

  function convertToZwd(amount, currency, rates) {
    if (currency === "zwd") {
      return amount;
    }

    const perUsd = rates[currency];
    if (!perUsd) {
      return null;
    }

    return amount / perUsd * ZWD_PER_USD;
  }

  function convertCurrency(amount, sourceCurrency, targetCurrency, rates) {
    const source = canonicalCurrencyCode(sourceCurrency);
    const target = canonicalCurrencyCode(targetCurrency);

    if (!source || !target) {
      return null;
    }

    if (target === "zwd") {
      return convertToZwd(amount, source, rates);
    }

    if (source === target) {
      return amount;
    }

    const sourcePerUsd = source === "zwd" ? ZWD_PER_USD : rates[source];
    const targetPerUsd = rates[target];
    if (!sourcePerUsd || !targetPerUsd) {
      return null;
    }

    return amount / sourcePerUsd * targetPerUsd;
  }

  function normalizeOptions(options) {
    const displayNotation = typeof options === "string" ? options : options && options.displayNotation;
    const configuredCurrency = normalizeCurrencyCode(options && options.displayCurrency);
    const inferredCurrency = normalizeCurrencyCode(options && options.inferredCurrency);
    return {
      displayCurrency: configuredCurrency || "zwd",
      displayNotation: displayNotation === "plain" ? "plain" : "scientific",
      inferredCurrency,
      allowLargeNumberFormat: options && options.allowLargeNumberFormat === true,
      renderingLocale: normalizeRenderingLocale(options && options.renderingLocale),
      resolvedDisplayCurrency: configuredCurrency === "page" ? inferredCurrency || "zwd" : configuredCurrency || "zwd"
    };
  }

  function normalizeRenderingLocale(locale) {
    if (typeof locale === "string" && locale.trim()) {
      try {
        return Intl.getCanonicalLocales(locale.trim())[0] || DEFAULT_RENDERING_LOCALE;
      } catch {
        return DEFAULT_RENDERING_LOCALE;
      }
    }

    return DEFAULT_RENDERING_LOCALE;
  }

  function getIntlFormatter(locale, options) {
    const normalizedLocale = normalizeRenderingLocale(locale);
    const key = `${normalizedLocale}:${JSON.stringify(options)}`;
    let formatter = INTL_FORMATTERS.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat(normalizedLocale, options);
      INTL_FORMATTERS.set(key, formatter);
    }

    return formatter;
  }

  function formatLocaleNumber(value, options, numberOptions = {}) {
    return getIntlFormatter(options && options.renderingLocale, {
      useGrouping: true,
      minimumFractionDigits: numberOptions.minimumFractionDigits ?? 0,
      maximumFractionDigits: numberOptions.maximumFractionDigits ?? 2
    }).format(value);
  }

  function currencyFractionDigits(currency) {
    const normalizedCurrency = canonicalCurrencyCode(currency);
    return CURRENCY_FRACTION_DIGITS[normalizedCurrency] ?? 2;
  }

  function getDecimalSeparator(locale) {
    const parts = getIntlFormatter(locale, {
      useGrouping: true,
      maximumFractionDigits: 1
    }).formatToParts(1.1);
    const decimal = parts.find((part) => part.type === "decimal");
    return decimal ? decimal.value : ".";
  }

  function formatZwd(value, options) {
    if (!Number.isFinite(value)) {
      return null;
    }

    if (Object.is(value, -0) || value === 0) {
      return "Z$0";
    }

    const normalizedOptions = normalizeOptions(options);
    if (normalizedOptions.displayNotation === "plain") {
      return `Z$${toPlainDecimal(value, normalizedOptions)}`;
    }

    const abs = Math.abs(value);
    if (abs >= 1e7 || abs < 0.01) {
      const exponent = Math.floor(Math.log10(abs));
      const mantissa = value / Math.pow(10, exponent);
      return `Z$${trimNumber(mantissa.toPrecision(3))}x10${toSuperscript(exponent)}`;
    }

    return `Z$${formatLocaleNumber(value, normalizedOptions, { maximumFractionDigits: 2 })}`;
  }

  function formatCurrency(value, currency, options) {
    const normalizedCurrency = canonicalCurrencyCode(currency) || "zwd";
    if (normalizedCurrency === "zwd") {
      return formatZwd(value, options);
    }

    if (!Number.isFinite(value)) {
      return null;
    }

    const symbol = CURRENCY_SYMBOLS[normalizedCurrency] || `${normalizedCurrency.toUpperCase()} `;
    const abs = Math.abs(value);
    const normalizedOptions = normalizeOptions(options);
    const allowLargeNumberFormat = normalizedOptions.allowLargeNumberFormat === true;
    const shouldUseScientific = allowLargeNumberFormat && normalizedOptions.displayNotation === "scientific" && (abs >= LARGE_NUMBER_RATE_THRESHOLD || abs < 0.0001 && abs !== 0);
    const amount = shouldUseScientific ? formatScientific(value) : formatLocaleNumber(value, normalizedOptions, {
      maximumFractionDigits: currencyFractionDigits(normalizedCurrency)
    });

    return symbol.endsWith(" ") ? `${symbol}${amount}` : `${symbol}${amount}`;
  }

  function shouldAllowLargeNumberFormat(currency, rates) {
    const normalizedCurrency = canonicalCurrencyCode(currency);
    if (normalizedCurrency === "zwd") {
      return true;
    }

    return Boolean(rates && rates[normalizedCurrency] > LARGE_NUMBER_RATE_THRESHOLD);
  }

  function inferPageCurrency(documentRef, locationRef) {
    return (
      inferCurrencyFromSelectedPageState(documentRef) ||
      inferCurrencyFromCctld(locationRef && locationRef.hostname) ||
      inferCurrencyFromLanguage(documentRef) ||
      ""
    );
  }

  function inferCurrencyFromSelectedPageState(documentRef) {
    if (!documentRef || !documentRef.querySelectorAll) {
      return "";
    }

    const selectedControls = [
      "select[name*='curr' i] option:checked",
      "select[id*='curr' i] option:checked",
      "select[name*='country' i] option:checked",
      "select[id*='country' i] option:checked",
      "select[name*='region' i] option:checked",
      "select[id*='region' i] option:checked",
      "select[name*='market' i] option:checked",
      "select[id*='market' i] option:checked",
      "input[name*='country' i]:checked",
      "input[name*='region' i]:checked",
      "input[name*='market' i]:checked",
      "input[name*='curr' i]:checked",
      "[aria-selected='true'][data-currency]",
      "[aria-selected='true'][data-country]",
      "[aria-selected='true'][data-locale]",
      "[data-selected='true'][data-currency]",
      "[data-selected='true'][data-country]",
      "[data-selected='true'][data-locale]",
      "[aria-selected='true']",
      "[aria-current='page']"
    ].join(",");

    for (const element of documentRef.querySelectorAll(selectedControls)) {
      const inferred = inferCurrencyFromElement(element);
      if (inferred) {
        return inferred;
      }
    }

    return "";
  }

  function inferCurrencyFromElement(element) {
    const values = [
      element.dataset && element.dataset.currency,
      element.dataset && element.dataset.country,
      element.dataset && element.dataset.locale,
      element.value,
      element.getAttribute && element.getAttribute("value"),
      element.textContent
    ];

    for (const value of values) {
      const inferred = inferCurrencyFromToken(value);
      if (inferred) {
        return inferred;
      }
    }

    return "";
  }

  function inferCurrencyFromToken(value) {
    if (typeof value !== "string") {
      return "";
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const currencyCode = trimmed.match(/\b([A-Z]{3})\b/);
    if (currencyCode && CURRENCY_CODE_SET.has(currencyCode[1].toLowerCase())) {
      return normalizeCurrencyCode(currencyCode[1]);
    }

    const countryCode = trimmed.match(/(?:^|[^a-z])([a-z]{2})(?:[^a-z]|$)/i);
    if (countryCode) {
      const currency = COUNTRY_TO_CURRENCY[countryCode[1].toLowerCase()];
      if (currency) {
        return currency;
      }
    }

    const normalizedName = trimmed
      .toLowerCase()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return COUNTRY_NAME_TO_CURRENCY[normalizedName] || "";
  }

  function inferCurrencyFromCctld(hostname) {
    if (typeof hostname !== "string") {
      return "";
    }

    const labels = hostname.toLowerCase().split(".").filter(Boolean);
    const lastLabel = labels[labels.length - 1];
    return COUNTRY_TO_CURRENCY[lastLabel] || "";
  }

  function inferCurrencyFromLanguage(documentRef) {
    const candidates = [];

    if (documentRef && documentRef.documentElement) {
      candidates.push(documentRef.documentElement.lang);
    }

    if (documentRef && documentRef.querySelector) {
      const localeMeta = documentRef.querySelector("meta[property='og:locale'], meta[name='locale'], meta[http-equiv='content-language']");
      if (localeMeta) {
        candidates.push(localeMeta.getAttribute("content"));
      }
    }

    if (global.navigator) {
      candidates.push(global.navigator.language, ...(global.navigator.languages || []));
    }

    for (const candidate of candidates) {
      const inferred = inferCurrencyFromLocale(candidate);
      if (inferred) {
        return inferred;
      }
    }

    return "";
  }

  function inferCurrencyFromLocale(locale) {
    if (typeof locale !== "string") {
      return "";
    }

    const normalized = locale.trim().toLowerCase().replace("_", "-");
    if (!normalized) {
      return "";
    }

    if (LANGUAGE_TO_CURRENCY[normalized]) {
      return LANGUAGE_TO_CURRENCY[normalized];
    }

    const region = normalized.split("-").pop();
    return COUNTRY_TO_CURRENCY[region] || "";
  }

  function formatScientific(value) {
    if (Object.is(value, -0) || value === 0) {
      return "0";
    }

    const abs = Math.abs(value);
    const exponent = Math.floor(Math.log10(abs));
    const mantissa = value / Math.pow(10, exponent);
    return `${trimNumber(mantissa.toPrecision(3))}x10${toSuperscript(exponent)}`;
  }

  function toSuperscript(value) {
    return String(value).replace(/[-+0-9]/g, (character) => SUPERSCRIPT_DIGITS[character] || character);
  }

  function trimNumber(value) {
    return String(value)
      .replace(/(\.\d*?)0+(e|$)/, "$1$2")
      .replace(/\.(e|$)/, "$1");
  }

  function toPlainDecimal(value, options) {
    const sign = value < 0 ? "-" : "";
    const normalized = Math.abs(value).toPrecision(3).replace(/\.?0+(e)/i, "$1");
    const match = normalized.match(/^(\d+)(?:\.(\d+))?e([+-]?\d+)$/i);

    if (!match) {
      return groupPlainDecimal(`${sign}${trimNumber(normalized)}`, options);
    }

    const integerPart = match[1];
    const fractionPart = match[2] || "";
    const exponent = Number(match[3]);
    const digits = `${integerPart}${fractionPart}`;
    const decimalIndex = integerPart.length + exponent;

    if (decimalIndex <= 0) {
      return groupPlainDecimal(`${sign}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`.replace(/0+$/, "").replace(/\.$/, ""), options);
    }

    if (decimalIndex >= digits.length) {
      return groupPlainDecimal(`${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`, options);
    }

    return groupPlainDecimal(`${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`.replace(/0+$/, "").replace(/\.$/, ""), options);
  }

  function groupPlainDecimal(value, options) {
    const [integerPart, fractionPart] = String(value).split(".");
    const sign = integerPart.startsWith("-") ? "-" : "";
    const unsignedInteger = sign ? integerPart.slice(1) : integerPart;
    const locale = options && options.renderingLocale;
    let grouped;

    try {
      grouped = getIntlFormatter(locale, {
        useGrouping: true,
        maximumFractionDigits: 0
      }).format(BigInt(unsignedInteger || "0"));
    } catch {
      grouped = unsignedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return fractionPart ? `${sign}${grouped}${getDecimalSeparator(locale)}${fractionPart}` : `${sign}${grouped}`;
  }

  function findCurrencyMatches(text, rates, options) {
    const candidates = [];
    const normalizedOptions = normalizeOptions(options);
    const outputOptions = {
      ...normalizedOptions,
      allowLargeNumberFormat: shouldAllowLargeNumberFormat(normalizedOptions.resolvedDisplayCurrency, rates)
    };

    for (const matcher of MATCHERS) {
      matcher.re.lastIndex = 0;
      for (const match of text.matchAll(matcher.re)) {
        const parsed = matcher.read(match, normalizedOptions);
        const amount = parseAmount(parsed.amountText);

        if (amount === null || !parsed.currency) {
          continue;
        }

        if (canonicalCurrencyCode(parsed.currency) === canonicalCurrencyCode(normalizedOptions.resolvedDisplayCurrency)) {
          continue;
        }

        const outputValue = convertCurrency(amount, parsed.currency, normalizedOptions.resolvedDisplayCurrency, rates);
        const outputText = outputValue === null ? null : formatCurrency(outputValue, normalizedOptions.resolvedDisplayCurrency, outputOptions);

        if (!outputText) {
          continue;
        }

        candidates.push({
          start: match.index,
          end: match.index + match[0].length,
          text: parsed.text,
          amount,
          currency: parsed.currency,
          outputCurrency: normalizedOptions.resolvedDisplayCurrency,
          outputText,
          zwdText: outputText
        });
      }
    }

    return removeOverlaps(candidates);
  }

  function removeOverlaps(candidates) {
    const selected = [];
    const sorted = candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));

    for (const candidate of sorted) {
      const previous = selected[selected.length - 1];
      if (!previous || candidate.start >= previous.end) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest(SKIP_SELECTOR));
  }

  function annotateTextNode(node, rates, rateDate, options) {
    if (!node.nodeValue || shouldSkipNode(node)) {
      return 0;
    }

    const matches = findCurrencyMatches(node.nodeValue, rates, options);
    if (matches.length === 0) {
      return 0;
    }

    const fragment = node.ownerDocument.createDocumentFragment();
    let cursor = 0;

    for (const match of matches) {
      if (match.start > cursor) {
        fragment.append(node.nodeValue.slice(cursor, match.start));
      }

      fragment.append(createRuby(node.ownerDocument, node.nodeValue.slice(match.start, match.end), match, rateDate));
      cursor = match.end;
    }

    if (cursor < node.nodeValue.length) {
      fragment.append(node.nodeValue.slice(cursor));
    }

    node.replaceWith(fragment);
    return matches.length;
  }

  function annotateSplitDecimalNodes(root, rates, rateDate, options) {
    if (root.nodeType === Node.TEXT_NODE) {
      return 0;
    }

    const nodes = collectTextNodes(root);
    let count = 0;

    for (let index = 0; index < nodes.length - 1; index += 1) {
      const node = nodes[index];

      if (!node.isConnected || shouldSkipNode(node)) {
        continue;
      }

      const continuation = collectSplitAmountContinuation(nodes, index + 1);
      if (!continuation.text) {
        continue;
      }

      const firstText = node.nodeValue;
      const combinedText = `${firstText}${continuation.text}`;
      const match = findCurrencyMatches(combinedText, rates, options)
        .find((candidate) => candidate.end === combinedText.length && candidate.start < firstText.length);

      if (!match || match.end <= firstText.length) {
        continue;
      }

      const fragment = node.ownerDocument.createDocumentFragment();
      if (match.start > 0) {
        fragment.append(firstText.slice(0, match.start));
      }

      fragment.append(createRuby(node.ownerDocument, firstText.slice(match.start), {
        ...match,
        text: combinedText.slice(match.start, match.end)
      }, rateDate));

      node.replaceWith(fragment);
      count += 1;
    }

    return count;
  }

  function collectSplitAmountContinuation(nodes, startIndex) {
    let text = "";
    let sawThousandsGroup = false;

    for (let index = startIndex; index < nodes.length && index < startIndex + 4; index += 1) {
      const node = nodes[index];
      if (!node || !node.isConnected || shouldSkipNode(node)) {
        break;
      }

      const value = node.nodeValue || "";
      const thousandsMatch = value.match(/^([,\u00a0\s]\d{3})/);
      if (thousandsMatch) {
        text += thousandsMatch[1].replace(/\u00a0/g, " ");
        sawThousandsGroup = true;
        continue;
      }

      const decimalMatch = value.match(/^(\.\d{1,4})/);
      if (decimalMatch) {
        text += decimalMatch[1];
      }

      break;
    }

    return {
      text,
      sawThousandsGroup
    };
  }

  function collectTextNodes(root) {
    const document = root.ownerDocument || root;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function createRuby(document, originalText, match, rateDate) {
    const ruby = document.createElement("ruby");
    ruby.className = "blab-zwd-ruby";
    ruby.dataset.blabCurrency = match.currency.toUpperCase();
    ruby.dataset.blabOutputCurrency = match.outputCurrency.toUpperCase();
    ruby.dataset.blabOriginal = originalText;
    ruby.title = `${match.text || originalText} ~= ${match.outputText}${rateDate ? `; rates ${rateDate}` : ""}`;

    const rt = document.createElement("rt");
    rt.textContent = match.outputText;

    ruby.append(document.createTextNode(originalText), rt);
    return ruby;
  }

  function annotateRoot(root, rates, rateDate, options) {
    let count = 0;

    if (root.nodeType === Node.TEXT_NODE) {
      return annotateTextNode(root, rates, rateDate, options);
    }

    count += annotateSplitDecimalNodes(root, rates, rateDate, options);

    for (const node of collectTextNodes(root)) {
      if (node.isConnected) {
        count += annotateTextNode(node, rates, rateDate, options);
      }
    }

    return count;
  }

  function unwrapAnnotations(root) {
    const document = root.ownerDocument || root;
    const annotations = [...document.querySelectorAll("ruby.blab-zwd-ruby")];

    for (const ruby of annotations) {
      ruby.replaceWith(document.createTextNode(ruby.dataset.blabOriginal || ""));
    }

    return annotations.length;
  }

  global.BrowseLikeABillionaire = {
    ZWD_PER_USD,
    annotateRoot,
    annotateTextNode,
    convertToZwd,
    convertCurrency,
    findCurrencyMatches,
    formatZwd,
    formatCurrency,
    inferCurrencyFromCctld,
    inferCurrencyFromLocale,
    inferCurrencyFromToken,
    inferPageCurrency,
    normalizeRates,
    normalizeOptions,
    parseAmount,
    toPlainDecimal,
    unwrapAnnotations
  };
})(globalThis);
