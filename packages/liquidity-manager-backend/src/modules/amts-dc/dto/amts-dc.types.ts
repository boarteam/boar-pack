export enum MTCalcMode {
  FOREX = 'FOREX',
  FUTURES = 'FUTURES',
  CFD = 'CFD',
  CFDINDEX = 'CFDINDEX',
  CFDLEVERAGE = 'CFDLEVERAGE',
  FOREX_NO_LEVERAGE = 'FOREX_NO_LEVERAGE',
  EXCH_STOCKS = 'EXCH_STOCKS',
  EXCH_FUTURES = 'EXCH_FUTURES',
  EXCH_FUTURES_FORTS = 'EXCH_FUTURES_FORTS',
  EXCH_OPTIONS = 'EXCH_OPTIONS',
  EXCH_OPTIONS_MARGIN = 'EXCH_OPTIONS_MARGIN',
  EXCH_BONDS = 'EXCH_BONDS',
  EXCH_STOCKS_MOEX = 'EXCH_STOCKS_MOEX',
  EXCH_BONDS_MOEX = 'EXCH_BONDS_MOEX',
  SERV_COLLATERAL = 'SERV_COLLATERAL',
}

export const MTSector = {
  0: 'Undefined',
  1: 'Basic Materials',
  2: 'Communication Services',
  3: 'Consumer Cyclical',
  4: 'Consumer Defensive',
  5: 'Energy',
  6: 'Financial',
  7: 'Healthcare',
  8: 'Industrials',
  9: 'Real Estate',
  10: 'Technology',
  11: 'Utilities',
  12: 'Currency',
  13: 'Crypto Currency',
  14: 'Index',
  15: 'Commodities',
};
export const MTIndustry = {
  0: 'Undefined',
  1: 'Agricultural inputs',
  2: 'Aluminium',
  3: 'Building materials',
  4: 'Chemicals',
  5: 'Coking coal',
  6: 'Copper',
  7: 'Gold',
  8: 'Lumber and wood production',
  9: 'Other industrial metals and mining',
  10: 'Other precious metals and mining',
  11: 'Paper and paper products',
  12: 'Silver',
  13: 'Specialty chemicals',
  14: 'Steel',
  51: 'Advertising agencies',
  52: 'Broadcasting',
  53: 'Electronic gaming and multimedia',
  54: 'Entertainment',
  55: 'Internet content and information',
  56: 'Publishing',
  57: 'Telecom services',
  101: 'Apparel manufacturing',
  102: 'Apparel retail',
  103: 'Auto manufacturers',
  104: 'Auto parts',
  105: 'Auto and truck dealerships',
  106: 'Department stores',
  107: 'Footwear and accessories',
  108: 'Furnishing, fixtures and appliances',
  109: 'Gambling',
  110: 'Home improvement retail',
  111: 'Internet retail',
  112: 'Leisure',
  113: 'Lodging',
  114: 'Luxury goods',
  115: 'Packaging and containers',
  116: 'Personal services',
  117: 'Recreational vehicles',
  118: 'Residential construction',
  119: 'Resorts and casinos',
  120: 'Restaurants',
  121: 'Specialty retail',
  122: 'Textile manufacturing',
  123: 'Travel services',
  151: 'Beverages - Brewers',
  152: 'Beverages - Non-alcoholic',
  153: 'Beverages - Wineries and distilleries',
  154: 'Confectioners',
  155: 'Discount stores',
  156: 'Education and training services',
  157: 'Farm products',
  158: 'Food distribution',
  159: 'Grocery stores',
  160: 'Household and personal products',
  161: 'Packaged foods',
  162: 'Tobacco',
  201: 'Oil and gas drilling',
  202: 'Oil and gas extraction and processing',
  203: 'Oil and gas equipment and services',
  204: 'Oil and gas integrated',
  205: 'Oil and gas midstream',
  206: 'Oil and gas refining and marketing',
  207: 'Thermal coal',
  208: 'Uranium',
  251: 'Exchange traded fund',
  252: 'Assets management',
  253: 'Banks - Diversified',
  254: 'Banks - Regional',
  255: 'Capital markets',
  256: 'Closed-End fund - Debt',
  257: 'Closed-end fund - Equity',
  258: 'Closed-end fund - Foreign',
  259: 'Credit services',
  260: 'Financial conglomerates',
  261: 'Financial data and stock exchange',
  262: 'Insurance brokers',
  263: 'Insurance - Diversified',
  264: 'Insurance - Life',
  265: 'Insurance - Property and casualty',
  266: 'Insurance - Reinsurance',
  267: 'Insurance - Specialty',
  268: 'Mortgage finance',
  269: 'Shell companies',
  301: 'Biotechnology',
  302: 'Diagnostics and research',
  303: 'Drugs manufacturers - general',
  304: 'Drugs manufacturers - Specialty and generic',
  305: 'Healthcare plans',
  306: 'Health information services',
  307: 'Medical care facilities',
  308: 'Medical devices',
  309: 'Medical distribution',
  310: 'Medical instruments and supplies',
  311: 'Pharmaceutical retailers',
  351: 'Aerospace and defense',
  352: 'Airlines',
  353: 'Airports and air services',
  354: 'Building products and equipment',
  355: 'Business equipment and supplies',
  356: 'Conglomerates',
  357: 'Consulting services',
  358: 'Electrical equipment and parts',
  359: 'Engineering and construction',
  360: 'Farm and heavy construction machinery',
  361: 'Industrial distribution',
  362: 'Infrastructure operations',
  363: 'Integrated freight and logistics',
  364: 'Marine shipping',
  365: 'Metal fabrication',
  366: 'Pollution and treatment controls',
  367: 'Railroads',
  368: 'Rental and leasing services',
  369: 'Security and protection services',
  370: 'Specialty business services',
  371: 'Specialty industrial machinery',
  372: 'Stuffing and employment services',
  373: 'Tools and accessories',
  374: 'Trucking',
  375: 'Waste management',
  401: 'Real estate - Development',
  402: 'Real estate - Diversified"},',
  403: 'Real estate services',
  404: 'REIT - Diversified',
  405: 'REIT - Healthcase facilities',
  406: 'REIT - Hotel and motel',
  407: 'REIT - Industrial',
  408: 'REIT - Mortgage',
  409: 'REIT - Office',
  410: 'REIT - Residential',
  411: 'REIT - Retail',
  412: 'REIT - Specialty',
  451: 'Communication equipment',
  452: 'Computer hardware',
  453: 'Consumer electronics',
  454: 'Electronic components',
  455: 'Electronics and computer distribution',
  456: 'Information technology services',
  457: 'Scientific and technical instruments',
  458: 'Semiconductor equipment and materials',
  459: 'Semiconductors',
  460: 'Software - Application',
  461: 'Software - Infrastructure',
  462: 'Solar',
  501: 'Utilities - Diversified',
  502: 'Utilities - Independent power producers',
  503: 'Utilities - Renewable',
  504: 'Utilities - Regulated electric',
  505: 'Utilities - Regulated gas',
  506: 'Utilities - Regulated water',
  551: 'Agriculture',
  552: 'Energy',
  553: 'Metals',
  554: 'Precious metals',
}

export enum MTTradeMode {
  TRADE_DISABLED = 0,
  ONLY_LONG_POSITIONS_ALLOWED = 1,
  ONLY_SHORT_POSITIONS_ALLOWED = 2,
  ONLY_POSITION_CLOSURE = 3,
  ALL_TRADE_OPERATIONS_ARE_ALLOWED = 4,
}

export class MTInstrument {
  /**
   * Symbol name
   */
  n: string;

  /**
   * Symbol description
   */
  dsc: string;

  /**
   * Minimum trading volume
   */
  mi: number;

  /**
   * Maximum trading volume
   */
  ma: number;

  /**
   * Limited trading volume*
   */
  li: number;

  /**
   * Volume change step
   */
  s: number;

  /**
   * Contract size
   */
  cs: number;

  /**
   * Currency base
   * @example AUD for AUDCAD
   */
  cbs: string;

  /**
   * Currency profit
   * @example CAD for AUDCAD
   */
  cpr: string;

  /**
   * Tick size
   */
  ts: number;

  /**
   * Tick price
   */
  tp: number;

  /**
   * Calc mode
   */
  cm: MTCalcMode;

  /**
   * Price digits
   */
  d: number;

  /**
   * Market book depth
   */
  md: number;

  /**
   * optional, if last bid price > 0
   */
  lb?: number;

  /**
   * optional, if last ask price > 0
   */
  la?: number;

  /**
   * optional, if last update price time > 0, msec.
   */
  lt?: number;

  /**
   * allowed trade modes
   */
  tm: MTTradeMode;

  /**
   * stops level
   */
  sl: number;

  /**
   * OrderFlags (see above), uses as bit flags
   */
  of: number;

  /**
   * Sector (see above), api version >= 4
   */
  sct: number;

  /**
   * Industry (see above), api version >= 4
   */
  ind: number;

  /**
   * symbol path, example: "Forex\\Majors\\EURUSD", api version >= 5
   */
  p: string;

  /**
   * margin hedged, needs to calc margin, api version >= 7
   */
  mh: number;

  /**
   * margin initial, needs to calc margin, api version >= 7
   */
  mint: number;

  /**
   * margin rate initial buy, needs to calc margin, api version >= 9
   */
  mrib: number;

  /**
   * margin rate initial sell, needs to calc margin, api version >= 9
   */
  mris: number;

  /**
   * margin rate initial buy limit, needs to calc margin, api version >= 9
   */
  mribl: number;

  /**
   * margin rate initial sell limit, needs to calc margin, api version >= 9
   */
  mrisl: number;

  /**
   * margin rate initial buy stop, needs to calc margin, api version >= 9
   */
  mribs: number;

  /**
   * margin rate initial sell stop, needs to calc margin, api version >= 9
   */
  mriss: number;

  /**
   * weekly schedule list
   * @example
   * [
   *  [[<uint, uint>],[5, 1439]], // sunday, the list of daily intervals, the opening/closing time of the session in
   *  minutes from 00:00, for example 100 minutes means 01:40.
   *  [],                         // monday
   *  [],                         // tuesday
   *  [],                         // wednesday
   *  [],                         // thursday
   *  [],                         // friday
   *  []                          // saturday
   *  ]
   */
  sh: number[][][];
}
