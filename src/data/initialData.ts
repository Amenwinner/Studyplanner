import { Course, QuizAttempt, WeeklyInsightReport, QuizQuestion } from '../types';

// Helper generator to ensure realistic high-yield question banks with 60+ questions per course week
function createQuestionsForCourse(
  courseCode: string,
  topics: { name: string; questions: { q: string; opts: string[]; correct: number; exp: string; ref: string }[] }[]
): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  let counter = 1;

  topics.forEach((t) => {
    t.questions.forEach((item) => {
      result.push({
        id: `q-${courseCode.toLowerCase()}-${counter++}`,
        question: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        explanation: item.exp,
        slideReference: item.ref,
        conceptTested: t.name,
        topic: t.name,
        difficulty: counter % 3 === 0 ? 'Exam-Level' : counter % 2 === 0 ? 'Application' : 'Foundational',
      });
    });
  });

  return result;
}

// B2C Question Bank (60 questions across topics)
const B2C_TOPICS = [
  {
    name: 'Consumer Decision Journey (CDJ)',
    questions: [
      {
        q: 'In the modern McKinsey Consumer Decision Journey model, what replaces the traditional linear sales funnel?',
        opts: [
          'A circular loop with an active evaluation stage and a post-purchase loyalty loop',
          'A binary path strictly between online search and checkout',
          'A static push-advertising ladder',
          'A single-touchpoint retail impulse model'
        ],
        correct: 0,
        exp: 'The modern CDJ is circular: Initial Consideration -> Active Evaluation -> Moment of Purchase -> Post-Purchase Experience -> Loyalty Loop, where consumers continuously evaluate brand touchpoints.',
        ref: 'Slide 2: Modern Consumer Decision Framework'
      },
      {
        q: 'What triggers a consumer to enter the "Active Evaluation" phase of the B2C journey?',
        opts: [
          'Direct post-purchase cognitive dissonance',
          'A stimulus or trigger leading them to research reviews, compare features, and solicit peer opinions',
          'Automated re-order subscriptions',
          'Solely viewing outdoor billboard advertising'
        ],
        correct: 1,
        exp: 'During active evaluation, consumers proactively seek information, user-generated reviews, and competitive pricing rather than passively absorbing brand claims.',
        ref: 'Slide 4: The Evaluation Stage'
      },
      {
        q: 'Which touchpoint exerts the highest influence on consumer trust during the active evaluation phase?',
        opts: [
          'Unsolicited banner display ads',
          'Verified consumer peer reviews and independent user feedback',
          'Celebrity endorsements on television',
          'Company press releases'
        ],
        correct: 1,
        exp: 'Over 88% of B2C buyers prioritize authentic peer validation and user-generated content over direct corporate promotion.',
        ref: 'Slide 7: Social Proof Dynamics'
      },
      {
        q: 'What is the primary objective of closing the "Loyalty Loop" in B2C e-commerce?',
        opts: [
          'To bypass the initial consideration and active evaluation phases on subsequent purchases',
          'To increase customer acquisition cost (CAC)',
          'To force customers into third-party retail stores',
          'To reduce product return windows'
        ],
        correct: 0,
        exp: 'A strong loyalty loop allows a repeat customer to repurchase directly without re-evaluating competitors, dramatically lowering Customer Acquisition Cost.',
        ref: 'Slide 9: The Loyalty Loop'
      },
      {
        q: 'How does cognitive dissonance manifest in B2C post-purchase behavior?',
        opts: [
          'Immediate brand advocacy on social media',
          'Post-purchase buyer regret or anxiety questioning whether the alternative choice was superior',
          'An increase in conversion rate on cart abandonment',
          'Automatic enrollment in VIP loyalty programs'
        ],
        correct: 1,
        exp: 'Cognitive dissonance is psychological discomfort from conflicting post-purchase attitudes. Brands combat this through post-purchase confirmation emails, tutorials, and onboarding.',
        ref: 'Slide 11: Post-Purchase Psychology'
      },
      {
        q: 'Which metric directly measures the velocity at which consumers move through the B2C purchase loop?',
        opts: [
          'Sales cycle duration / Time-to-convert',
          'Inventory turnover ratio',
          'Gross margin return on investment',
          'Debt-to-equity ratio'
        ],
        correct: 0,
        exp: 'Time-to-convert measures the elapsed time from initial trigger to checkout completion.',
        ref: 'Slide 13: Funnel Metrics'
      },
      {
        q: 'What is a "zero-moment-of-truth" (ZMOT) according to Google consumer research?',
        opts: [
          'The exact moment the physical package is unboxed at home',
          'The research phase occurring online between stimulus and point-of-sale',
          'The point when credit card details are cleared by the payment gateway',
          'The moment of customer churn'
        ],
        correct: 1,
        exp: 'ZMOT refers to when a consumer grabs their laptop or smartphone to research a product right after an initial stimulus before entering a store.',
        ref: 'Slide 15: ZMOT Framework'
      },
      {
        q: 'In omnichannel B2C retail, what does "showrooming" describe?',
        opts: [
          'Browsing products in a physical store to evaluate quality, but purchasing online for a lower price',
          'Buying online and picking up in-store (BOPIS)',
          'Setting up virtual 3D VR storefronts',
          'Wholesale clearance sales'
        ],
        correct: 0,
        exp: 'Showrooming occurs when shoppers inspect products physically in brick-and-mortar stores but buy online from cheaper e-commerce competitors.',
        ref: 'Slide 18: Omnichannel Dynamics'
      },
      {
        q: 'What characterizes "webrooming" in consumer behavior?',
        opts: [
          'Browsing online product specs, then visiting a local store to make the immediate physical purchase',
          'Buying goods only during flash digital sales',
          'Returning online goods to an automated locker',
          'Purchasing software as a service'
        ],
        correct: 0,
        exp: 'Webrooming is researching online and buying in a physical store, often driven by the desire for immediate possession or avoidance of shipping fees.',
        ref: 'Slide 19: Webrooming & Touchpoints'
      },
      {
        q: 'Why is touchpoint attribution modeling critical in multi-channel B2C campaigns?',
        opts: [
          'To allocate revenue credit accurately across search, social, email, and display ads',
          'To replace inventory accounting with cash-basis accounting',
          'To calculate depreciation on warehouse shelving',
          'To eliminate customer support staff'
        ],
        correct: 0,
        exp: 'Attribution modeling (e.g. data-driven, time-decay, or position-based) prevents last-click bias and reveals which marketing channels generate genuine assisted conversions.',
        ref: 'Slide 22: Attribution Modeling'
      }
    ]
  },
  {
    name: 'Customer Lifetime Value (LTV) & Acquisition Cost (CAC)',
    questions: [
      {
        q: 'What is the benchmark healthy ratio of Customer Lifetime Value (LTV) to Customer Acquisition Cost (CAC) for scalable B2C businesses?',
        opts: ['1:1', '3:1 or higher', '0.5:1', '10:1 minimum at launch'],
        correct: 1,
        exp: 'An LTV:CAC ratio of 3:1 is widely considered the golden benchmark. A 1:1 ratio is unprofitable after operating costs, while 5:1+ may indicate underinvestment in growth.',
        ref: 'Slide 25: Unit Economics'
      },
      {
        q: 'How is Customer Lifetime Value (LTV) calculated in its fundamental subscription form?',
        opts: [
          'Average Order Value × Churn Rate',
          '(Average Revenue Per User × Gross Margin %) / Churn Rate',
          'Total Marketing Spend / Total New Customers',
          'Total Revenue ÷ Fixed Overhead Costs'
        ],
        correct: 1,
        exp: 'LTV = (ARPU × Gross Margin %) / Churn Rate. Reducing churn or increasing gross margin directly expands LTV.',
        ref: 'Slide 27: LTV Mathematical Derivation'
      },
      {
        q: 'If a B2C direct-to-consumer brand spends $30,000 on ads to acquire 600 customers, what is their CAC?',
        opts: ['$20', '$50', '$100', '$150'],
        correct: 1,
        exp: 'CAC = Total Acquisition Spend / New Customers Acquired = $30,000 / 600 = $50.',
        ref: 'Slide 29: CAC Calculation Case'
      },
      {
        q: 'What is "CAC Payback Period" and why is it vital for cash flow?',
        opts: [
          'The months required for a customer to generate sufficient gross profit to recover their acquisition cost',
          'The total time a company has before repaying venture debt',
          'The warranty window for damaged goods',
          'The billing cycle of digital ad networks'
        ],
        correct: 0,
        exp: 'A payback period under 12 months allows a business to reinvest capital into customer acquisition without running out of cash.',
        ref: 'Slide 32: CAC Payback Analytics'
      },
      {
        q: 'Which strategy most effectively decreases CAC without inflating ad spend?',
        opts: [
          'Boosting organic referral programs and conversion rate optimization (CRO)',
          'Bidding higher on competitive keywords',
          'Doubling the sales commission percentage',
          'Increasing physical billboard placements'
        ],
        correct: 0,
        exp: 'CRO improves website conversion rates while viral referral programs generate customer acquisition with near-zero marginal ad cost.',
        ref: 'Slide 34: Organic Growth Levers'
      },
      {
        q: 'What is the relationship between customer churn rate and average customer lifespan?',
        opts: [
          'Lifespan = 1 / Churn Rate',
          'Lifespan = Churn Rate squared',
          'Lifespan = Churn Rate × Retention Rate',
          'There is no mathematical relationship'
        ],
        correct: 0,
        exp: 'If annual churn is 20% (0.20), the expected customer lifespan is 1 / 0.20 = 5 years.',
        ref: 'Slide 36: Churn & Retention Equations'
      },
      {
        q: 'In B2C cohort analysis, what indicates a "negative net churn" scenario?',
        opts: [
          'Expansion revenue from existing customers exceeds lost revenue from churned customers',
          'The company is losing 100% of customers monthly',
          'Customer acquisition cost has turned negative',
          'Gross margins have fallen below zero'
        ],
        correct: 0,
        exp: 'Net negative churn means upsells, cross-sells, and account expansions outweigh the revenue lost from cancellations.',
        ref: 'Slide 38: Cohort Retention Curves'
      },
      {
        q: 'Why does cohort analysis matter more than aggregate monthly retention?',
        opts: [
          'It isolates product changes and seasonality by tracking groups who joined during the same time window',
          'It eliminates the need for balance sheet audits',
          'It replaces customer lifetime value calculations',
          'It guarantees zero customer support tickets'
        ],
        correct: 0,
        exp: 'Cohort curves reveal whether newer user cohorts retain better or worse than older ones, exposing true product-market fit trends.',
        ref: 'Slide 40: Cohort Heatmaps'
      },
      {
        q: 'What is the primary danger of a company exhibiting a high LTV:CAC of 7:1 in an aggressive consumer market?',
        opts: [
          'They may be under-investing in marketing, leaving market share vulnerable to aggressive competitors',
          'They are legally violating pricing regulations',
          'Their customer churn rate must be 100%',
          'Their products are priced too cheaply'
        ],
        correct: 0,
        exp: 'An excessively high LTV:CAC often signals that a firm is under-spending on growth and conceding market share to rivals.',
        ref: 'Slide 42: Growth Capital Allocation'
      },
      {
        q: 'Which metric best represents repeat customer purchase habituation?',
        opts: [
          'Repeat Purchase Rate (RPR)',
          'Bounce Rate',
          'Cost per Mille (CPM)',
          'Operating Expense Ratio'
        ],
        correct: 0,
        exp: 'RPR measures the percentage of unique customers who place a second order within a given timeframe.',
        ref: 'Slide 45: Habituation & Retention'
      }
    ]
  },
  {
    name: 'B2C Segmentation & Behavioral Personalization',
    questions: [
      {
        q: 'What is RFM analysis in B2C customer segmentation?',
        opts: [
          'Recency, Frequency, Monetary Value segmentation',
          'Return on Fixed Margins',
          'Regulatory Financial Management',
          'Randomized Forecast Modeling'
        ],
        correct: 0,
        exp: 'RFM segments customers based on how recently they purchased, how frequently they buy, and how much money they spend.',
        ref: 'Slide 48: RFM Framework'
      },
      {
        q: 'Which customer group in an RFM matrix represents "Champions"?',
        opts: [
          'High Recency, High Frequency, High Monetary value',
          'Low Recency, Low Frequency, High Monetary value',
          'High Recency, Low Frequency, Low Monetary value',
          'Zero Recency, High Frequency'
        ],
        correct: 0,
        exp: 'Champions bought recently, buy often, and spend the most. They should receive VIP rewards and early access.',
        ref: 'Slide 50: RFM Customer Personas'
      },
      {
        q: 'What is dynamic pricing in B2C digital commerce?',
        opts: [
          'Real-time price adjustments driven by demand, competitor prices, inventory levels, and customer segment algorithms',
          'Setting one fixed price for ten years',
          'Printing flat coupons in daily newspapers',
          'Charging zero for all introductory products'
        ],
        correct: 0,
        exp: 'Dynamic pricing utilizes automated algorithms to optimize yield and profit based on instantaneous market variables (used heavily by airlines, Uber, Amazon).',
        ref: 'Slide 53: Pricing Algorithms'
      },
      {
        q: 'What is the primary objective of "Collaborative Filtering" in recommendation engines (e.g. Netflix, Amazon)?',
        opts: [
          'Predicting what user A likes based on preferences of similar users B and C',
          'Filtering out profane user comments',
          'Collaborating with competitor supply chains',
          'Removing duplicate customer accounts'
        ],
        correct: 0,
        exp: 'Collaborative filtering analyzes patterns among thousands of users with similar taste profiles to generate personalized recommendations.',
        ref: 'Slide 56: Recommendation Systems'
      },
      {
        q: 'In behavioral economics, what does the "Decoy Effect" (Asymmetric Dominance) accomplish in consumer pricing?',
        opts: [
          'Adding a third inferior option to make one of the other two options appear dramatically more attractive',
          'Offering random discounts to confuse competitors',
          'Removing product labels entirely',
          'Lowering prices until gross margins turn negative'
        ],
        correct: 0,
        exp: 'A decoy option is priced similarly to a premium option but offers noticeably fewer benefits, nudging the consumer toward the higher-margin premium product.',
        ref: 'Slide 59: Behavioral Nudges'
      },
      {
        q: 'What is "Loss Aversion" in B2C marketing psychology?',
        opts: [
          'The psychological principle that the pain of losing something is roughly twice as intense as the pleasure of gaining it',
          'Companies refusing to take accounting write-downs',
          'Customers actively seeking out defective products',
          'Retailers discounting seasonal clothing'
        ],
        correct: 0,
        exp: 'Kahneman and Tversky proved that losses loom larger than gains (e.g., "Don\'t miss out on losing your $20 credit!" converts better than "Save $20!").',
        ref: 'Slide 61: Prospect Theory'
      },
      {
        q: 'How does social proof impact conversion rates on checkout pages?',
        opts: [
          'Displaying live purchases or badges like "Over 10,000 sold" reassures cautious consumers and lowers perceived risk',
          'It distracts the buyer and lowers conversion',
          'It increases cart abandonment by 50%',
          'It requires customers to submit credit scores'
        ],
        correct: 0,
        exp: 'Social proof mitigates perceived transactional risk through validation from peers and institutional badges.',
        ref: 'Slide 64: Conversion Psychology'
      },
      {
        q: 'What does "Cart Abandonment Rate" typically average in global B2C e-commerce?',
        opts: ['10-15%', '65-75%', '95-99%', 'Under 5%'],
        correct: 1,
        exp: 'Industry-wide cart abandonment averages ~70%, driven by unexpected shipping fees, required account creation, and complicated checkout flows.',
        ref: 'Slide 67: Checkout Friction'
      },
      {
        q: 'Which technique is most effective in recovering abandoned carts?',
        opts: [
          'Automated multi-stage email / SMS remarketing sequences with one-click return links',
          'Shutting down the customer\'s account',
          'Immediately raising the price by 20%',
          'Removing product descriptions'
        ],
        correct: 0,
        exp: 'Triggered emails sent within 1 hour, 24 hours, and 48 hours recover 10-15% of otherwise lost revenue.',
        ref: 'Slide 70: Abandonment Recovery Flows'
      },
      {
        q: 'What does "Net Promoter Score" (NPS) measure?',
        opts: [
          'Customer loyalty and willingness to recommend a brand to friends or colleagues (-100 to +100)',
          'Net profit margin after taxes',
          'Social media follower growth percentage',
          'Inventory turnover velocity'
        ],
        correct: 0,
        exp: 'NPS = % Promoters (score 9-10) minus % Detractors (score 0-6), directly correlating with organic viral customer acquisition.',
        ref: 'Slide 73: NPS Benchmarks'
      }
    ]
  },
  {
    name: 'E-Commerce Analytics & Conversion Optimization',
    questions: [
      {
        q: 'How is Conversion Rate (CVR) mathematically calculated for an online store?',
        opts: [
          '(Total Completed Orders / Total Unique Sessions or Visitors) × 100',
          'Total Pageviews / Gross Revenue',
          'Customer Acquisition Cost / Average Order Value',
          'Bounce Rate × Click-Through Rate'
        ],
        correct: 0,
        exp: 'CVR = (Transactions / Visits) × 100. Standard B2C e-commerce conversion rates range between 2% and 4%.',
        ref: 'Slide 76: Conversion Funnel Math'
      },
      {
        q: 'What does Average Order Value (AOV) measure and how is it increased?',
        opts: [
          'Average revenue per transaction; increased via bundling, cross-sells, and free-shipping thresholds',
          'Total customer lifetime value divided by product weight',
          'The wholesale cost paid to manufacturers',
          'The return rate of electronics'
        ],
        correct: 0,
        exp: 'AOV = Total Revenue / Total Orders. Tactics like "Add $12 more for free shipping" directly boost AOV.',
        ref: 'Slide 79: AOV Optimization'
      },
      {
        q: 'What is an A/B test (split testing) in website optimization?',
        opts: [
          'A randomized controlled experiment comparing two versions (A and B) of a page to measure which yields higher conversions',
          'Alternating between debit and credit card processors',
          'Testing employees on company policies',
          'Changing store operating hours every other day'
        ],
        correct: 0,
        exp: 'A/B testing splits traffic evenly between a control (A) and a variant (B) to establish statistical significance for design or copy improvements.',
        ref: 'Slide 82: A/B Testing Principles'
      },
      {
        q: 'What statistical threshold (p-value) is customary before declaring an A/B test winning variant?',
        opts: ['p < 0.05 (95% confidence level)', 'p > 0.50', 'p = 1.00', 'p < 0.80'],
        correct: 0,
        exp: 'A 95% statistical confidence level (p < 0.05) ensures the observed difference is not due to random sampling variation.',
        ref: 'Slide 85: Statistical Significance'
      },
      {
        q: 'What is "Bounce Rate" in digital marketing analytics?',
        opts: [
          'The percentage of visitors who enter the site and leave without triggering any secondary interaction or pageview',
          'The rate at which physical rubber balls sell out',
          'The frequency of email bounces due to full inboxes',
          'The return rate of clothing apparel'
        ],
        correct: 0,
        exp: 'A high bounce rate on a landing page usually indicates mismatched ad messaging or slow loading speed.',
        ref: 'Slide 88: Engagement Metrics'
      },
      {
        q: 'How does mobile page speed latency affect B2C conversion rates?',
        opts: [
          'Each 1-second delay in page load time can reduce conversions by 7-20%',
          'Page speed has zero impact on mobile buyers',
          'Slower loading times actually increase trust',
          'Speed only impacts desktop users'
        ],
        correct: 0,
        exp: 'Consumer patience is fragile on mobile; every additional second of latency spikes bounce rates and suppresses conversion.',
        ref: 'Slide 91: Mobile Performance Impact'
      },
      {
        q: 'What is Return on Ad Spend (ROAS)?',
        opts: [
          'Gross Revenue Generated from Ads / Total Ad Spend',
          'Net Income / Total Assets',
          'Operating Profit / Inventory Value',
          'Marketing Headcount / Total Revenue'
        ],
        correct: 0,
        exp: 'ROAS measures the gross revenue generated per dollar spent on advertising (e.g. $4,000 revenue on $1,000 spend = 4x ROAS).',
        ref: 'Slide 94: Media Efficiency Metrics'
      },
      {
        q: 'What is the distinction between ROAS and ROI?',
        opts: [
          'ROAS measures gross revenue relative to ad cost alone; ROI incorporates COGS, fulfillment, overhead, and operating margins',
          'ROAS is for non-profit companies only',
          'ROI only measures email click rates',
          'There is no distinction; they are identical'
        ],
        correct: 0,
        exp: 'A business can have a positive ROAS (e.g. 2x) while experiencing a negative ROI if product margins and shipping costs exceed 50%.',
        ref: 'Slide 97: ROAS vs Net ROI'
      },
      {
        q: 'What is "Search Engine Optimization" (SEO) organic traffic vs "Paid Search" (SEM)?',
        opts: [
          'SEO generates non-paid traffic through relevancy and indexing; SEM bids for immediate top sponsored placements via PPC',
          'SEO requires paying Google for every single click',
          'SEM is completely free and requires no budget',
          'SEO is only used for video sharing platforms'
        ],
        correct: 0,
        exp: 'SEO builds long-term organic equity; SEM buys immediate visibility via paid auction bids.',
        ref: 'Slide 100: Organic vs Paid Search'
      },
      {
        q: 'In B2C email marketing, what is the typical benchmark range for open rates and click-through rates (CTR)?',
        opts: [
          '15-25% Open Rate, 2-5% CTR',
          '80-90% Open Rate, 50% CTR',
          '1-2% Open Rate, 0.01% CTR',
          '100% Open Rate, 10% CTR'
        ],
        correct: 0,
        exp: 'Standard retail B2C email open rates hover near 20%, with click-through rates between 2% and 4%.',
        ref: 'Slide 103: Email Benchmarks'
      }
    ]
  },
  {
    name: 'Brand Equity & Direct-to-Consumer (DTC) Strategy',
    questions: [
      {
        q: 'What is the core strategic advantage of a Direct-to-Consumer (DTC) model over traditional wholesale retail?',
        opts: [
          'Ownership of direct customer relationship, first-party data, and higher gross margin retention',
          'Zero fulfillment or shipping expenses',
          'Immunity from digital advertising costs',
          'Guaranteed shelf space in big-box department stores'
        ],
        correct: 0,
        exp: 'DTC brands bypass wholesale intermediaries, giving them direct access to customer behavioral data, custom pricing, and margin control.',
        ref: 'Slide 106: DTC Value Proposition'
      },
      {
        q: 'What is "First-Party Data" and why is it increasingly vital in modern B2C commerce?',
        opts: [
          'Data collected directly from consumer interactions with a brand\'s own properties (purchases, email clicks, preferences)',
          'Data purchased anonymously from third-party broker networks',
          'Government census publications',
          'Public stock market filings'
        ],
        correct: 0,
        exp: 'With third-party cookie deprecation and iOS privacy tracking restrictions, first-party data is the foundation of effective personalization and retention.',
        ref: 'Slide 109: Privacy & First-Party Data'
      },
      {
        q: 'What is Brand Equity in consumer perception?',
        opts: [
          'The commercial value derived from consumer perception of the brand name rather than the generic product itself',
          'The book value of physical factory machinery',
          'Total cash deposited in the corporate bank account',
          'The number of registered trademarks held'
        ],
        correct: 0,
        exp: 'Brand equity allows companies (like Apple or Nike) to command significant price premiums and enjoy higher customer retention over generic equivalents.',
        ref: 'Slide 112: Brand Equity Models'
      },
      {
        q: 'What is "Product-Market Fit" (PMF) in B2C commerce?',
        opts: [
          'Being in a good market with a product that can satisfy that market, evidenced by organic retention and word-of-mouth growth',
          'Getting a product patent approved by regulators',
          'Having an attractive logo and color scheme',
          'Hiring ten customer service agents'
        ],
        correct: 0,
        exp: 'PMF is characterized by strong organic pull from consumers who would be extremely disappointed if the product disappeared.',
        ref: 'Slide 115: Product-Market Fit Signals'
      },
      {
        q: 'How does the "Freemium" business model operate in B2C digital applications?',
        opts: [
          'Offering basic services free of charge while charging a premium for advanced proprietary features or capacity',
          'Charging customers an upfront fee with no free trial',
          'Selling products exclusively through physical distributors',
          'Donating 100% of profits to charity'
        ],
        correct: 0,
        exp: 'Freemium (e.g. Spotify, Canva) reduces friction for top-of-funnel customer acquisition, converting a predictable 2-5% into paying premium subscribers.',
        ref: 'Slide 118: Freemium Economics'
      },
      {
        q: 'What is the "K-factor" (viral coefficient) in consumer digital product growth?',
        opts: [
          'The number of new users generated by each existing active user (K = i × c)',
          'The ratio of capital expenditures to operational depreciation',
          'The interest rate charged by commercial banks',
          'The rate of inventory spoilage'
        ],
        correct: 0,
        exp: 'If K > 1, the product achieves viral exponential growth without paid advertising as each user brings in more than one new user.',
        ref: 'Slide 121: Virality & K-Factor'
      },
      {
        q: 'What role does "Unboxing Experience" play in modern DTC brand perception?',
        opts: [
          'Transforms a physical delivery into an emotional brand touchpoint that stimulates organic user-generated social media sharing',
          'It simply protects items from being crushed during transit',
          'It is an unnecessary cost center that should always be eliminated',
          'It replaces the need for product quality'
        ],
        correct: 0,
        exp: 'Premium packaging creates an unboxing ritual that customers photograph and post online, generating free organic social validation.',
        ref: 'Slide 124: Sensory Marketing'
      },
      {
        q: 'What is "Disintermediation" in consumer commerce supply chains?',
        opts: [
          'Removing intermediaries (wholesalers, brokers, agents) from the supply chain to sell directly to consumers',
          'Adding more middle-tier distributors to increase logistics costs',
          'Outsourcing executive management to consultancies',
          'Selling company assets during bankruptcy'
        ],
        correct: 0,
        exp: 'Disintermediation allows manufacturers to capture distributor margins and interact directly with consumers.',
        ref: 'Slide 127: Supply Chain Disintermediation'
      },
      {
        q: 'Why are subscription models (SaaS / recurring box) prized in B2C valuations?',
        opts: [
          'They offer predictable Recurring Revenue (ARR/MRR) and inherently higher customer lifetime value',
          'They eliminate all corporate income taxes',
          'They are legally immune to product returns',
          'They guarantee 0% churn forever'
        ],
        correct: 0,
        exp: 'Recurring revenue models provide predictable forward cash flows that justify higher valuation multiples from investors.',
        ref: 'Slide 130: Recurring Revenue Models'
      },
      {
        q: 'In consumer segmentation, what is "Psychographic Segmentation"?',
        opts: [
          'Grouping buyers based on shared values, lifestyle, interests, personality traits, and social attitudes',
          'Segmenting purely by postal zip code',
          'Categorizing customers by age and gender alone',
          'Tracking physical body weight'
        ],
        correct: 0,
        exp: 'Psychographics delve into the psychological motivations and core values driving purchase intent, beyond simple demographic age or income buckets.',
        ref: 'Slide 133: Psychographic Profiling'
      }
    ]
  },
  {
    name: 'Customer Experience (CX) & Service Operations',
    questions: [
      {
        q: 'What is Customer Effort Score (CES)?',
        opts: [
          'A metric evaluating how much effort a customer had to exert to resolve an issue, complete a purchase, or interact with service',
          'The number of push-ups required in a fitness loyalty app',
          'The total hours spent on a company website',
          'The speed of warehouse order packing'
        ],
        correct: 0,
        exp: 'CES measures frictional pain. Research shows reducing customer effort is the single strongest driver of customer loyalty.',
        ref: 'Slide 136: Customer Effort Analytics'
      },
      {
        q: 'What is "First Contact Resolution" (FCR) in B2C support operations?',
        opts: [
          'The percentage of incoming customer support requests resolved completely on the initial interaction without escalation or follow-up',
          'The very first marketing email sent to a prospective lead',
          'The time it takes for a customer to dial a phone number',
          'The initial pitch made by a salesperson'
        ],
        correct: 0,
        exp: 'High FCR directly correlates with higher customer satisfaction (CSAT) and lower overall support operating costs.',
        ref: 'Slide 139: FCR Benchmarks'
      },
      {
        q: 'What distinguishes an "Omnichannel" customer experience from a "Multichannel" experience?',
        opts: [
          'Omnichannel integrates customer data seamlessly across all channels so context persists across app, web, and physical store',
          'Multichannel uses computers while omnichannel uses only mobile phones',
          'Omnichannel means having only one retail channel',
          'There is no operational difference'
        ],
        correct: 0,
        exp: 'Multichannel means operating multiple disconnected channels; omnichannel synchronizes customer history and cart state across all touchpoints seamlessly.',
        ref: 'Slide 142: Omnichannel Architecture'
      },
      {
        q: 'What is the "Service Recovery Paradox"?',
        opts: [
          'A situation where a customer thinks more highly of a company after a service failure is corrected masterfully than if no failure occurred',
          'Companies going bankrupt by spending money on customer service',
          'Customers refusing refunds for damaged goods',
          'Automated bots replacing human agents'
        ],
        correct: 0,
        exp: 'When a company resolves a problem quickly and generously, it builds deeper emotional loyalty and positive word-of-mouth than standard nominal service.',
        ref: 'Slide 145: Service Recovery Dynamics'
      },
      {
        q: 'What does "Customer Churn Mitigation" prioritize first?',
        opts: [
          'Identifying early leading indicators of disengagement (e.g. drop in login frequency or unread notifications) before cancellation',
          'Sending a legal cease-and-desist letter to departing users',
          'Deleting customer accounts immediately upon dispute',
          'Ignoring cancellations and focusing only on new leads'
        ],
        correct: 0,
        exp: 'Proactive intervention based on behavioral drop-off triggers prevents cancellations before customers reach the exit door.',
        ref: 'Slide 148: Retention Engineering'
      },
      {
        q: 'What is "Hyper-Personalization" in modern e-commerce?',
        opts: [
          'Using real-time AI and contextual browsing data to tailor product grids, pricing, and messaging to an individual user at that specific moment',
          'Adding the customer\'s first name to a generic mass email subject line',
          'Having a human store clerk remember every single customer\'s face',
          'Printing personalized bumper stickers'
        ],
        correct: 0,
        exp: 'Hyper-personalization leverages predictive AI and behavioral data streams to deliver individualized experiences at scale.',
        ref: 'Slide 151: AI in Personalization'
      },
      {
        q: 'How does Social Commerce (e.g. TikTok Shop, Instagram Checkout) alter the B2C purchase path?',
        opts: [
          'Collapses the distance between discovery and checkout into an instantaneous frictionless in-app transaction',
          'Forces users to wait 30 days before purchasing',
          'Requires buyers to visit a traditional bank branch',
          'Restricts e-commerce to desktop personal computers'
        ],
        correct: 0,
        exp: 'Social commerce eliminates website redirect friction by allowing consumers to purchase directly inside social media content feeds.',
        ref: 'Slide 154: Social Commerce Convergence'
      },
      {
        q: 'What does "Brand Advocacy" represent at the highest tier of the customer loyalty pyramid?',
        opts: [
          'Customers actively championing, defending, and organically promoting the brand to their personal networks without paid incentives',
          'Customers who only buy when heavily discounted coupons are mailed',
          'Employees posting required corporate updates',
          'Paid micro-influencers reading scripts'
        ],
        correct: 0,
        exp: 'Advocates act as unpaid evangelists who generate authentic word-of-mouth and drive the highest-margin customer acquisition.',
        ref: 'Slide 157: Brand Advocacy Pyramids'
      },
      {
        q: 'What is a "Dark Pattern" in consumer user experience (UX) design, and why is it legally risky?',
        opts: [
          'Deceptive user interface tricks designed to coerce users into unintended actions (e.g. hidden recurring subscriptions, difficult cancellation loops)',
          'Using dark background color palettes in mobile apps',
          'Operating an online store during night hours',
          'Encoding software in binary code'
        ],
        correct: 0,
        exp: 'Dark patterns exploit cognitive biases to trap consumers and are increasingly penalized by regulatory bodies like the FTC and EU authorities.',
        ref: 'Slide 160: Ethical UX & Dark Patterns'
      },
      {
        q: 'What is the final metric that best synthesizes long-term sustainable B2C company health?',
        opts: [
          'Net Revenue Retention (NRR) and organic customer expansion rate',
          'Total gross impressions on TV commercials',
          'Total physical square footage of executive offices',
          'The number of patents pending'
        ],
        correct: 0,
        exp: 'High NRR proves that existing customer cohorts expand their spending over time, ensuring compounding organic enterprise growth.',
        ref: 'Slide 163: Sustainable Unit Economics'
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'b2c',
    code: 'B2C 101',
    name: 'B2C Marketing & Consumer Behavior',
    department: 'Marketing & Digital Commerce',
    color: 'blue',
    iconName: 'TrendingUp',
    professor: 'Prof. Marcus Vance',
    targetWeeklyHours: 4.5,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'Consumer Decision Journey, Unit Economics (LTV/CAC) & Personalization',
        slidesRaw: `--- Slide 1: Introduction to B2C Commerce & The Consumer Decision Journey ---
- Core shifts in Business-to-Consumer dynamics.
- Traditional linear sales funnel (Awareness -> Interest -> Decision -> Action) is obsolete.
- McKinsey Circular Consumer Decision Journey (CDJ):
  1. Initial Consideration Set (brand awareness & baseline recall)
  2. Active Evaluation (information gathering, peer reviews, social proof)
  3. Moment of Purchase (closing the transaction, frictionless checkout)
  4. Post-Purchase Experience (onboarding, unboxing, service touchpoints)
  5. The Loyalty Loop (repurchase without re-entering the evaluation phase)

--- Slide 2: Unit Economics in B2C Digital Commerce ---
- Customer Acquisition Cost (CAC) = Total Sales & Marketing Spend / Total New Customers Acquired.
- Customer Lifetime Value (LTV) = (Average Revenue Per User × Gross Margin %) / Churn Rate.
- Golden rule for sustainable DTC scaling: LTV / CAC >= 3.0x.
- CAC Payback Period: target < 12 months for healthy working capital velocity.
- The danger of high churn: a leaky bucket renders high ad spend unprofitable.

--- Slide 3: Segmentation, Personalization & Behavioral Economics ---
- RFM Framework: Recency, Frequency, Monetary Value.
- Segmentation matrix: Champions, Loyal Customers, Potential Loyalists, At Risk, Hibernating.
- Behavioral Nudges:
  - Loss Aversion (losses loom 2x larger than gains)
  - The Decoy Effect (asymmetric dominance to steer premium choice)
  - Social Proof (badges, verified review counts, live order ticker)
  - Scarcity & Urgency (low stock warnings, timed promotional countdowns)

--- Slide 4: Conversion Rate Optimization (CRO) & E-Commerce Metrics ---
- Conversion Rate (CVR) = (Orders / Sessions) × 100 (benchmark: 2-4%).
- Average Order Value (AOV) levers: minimum free shipping thresholds, bundle deals, dynamic post-purchase cross-sells.
- Cart Abandonment Rate: averages ~70% across e-commerce; mitigated by multi-stage email recovery flows.
- A/B Testing: Split testing with statistical confidence threshold (p < 0.05).

--- Slide 5: Brand Equity & Sustainable Direct-to-Consumer (DTC) Advantage ---
- Why DTC matters: ownership of first-party consumer data and customer relationships.
- Disintermediation: eliminating wholesaler markups to invest in customer experience.
- Net Promoter Score (NPS): Promoters (% 9-10) minus Detractors (% 0-6).
- Customer Effort Score (CES): reducing user friction is the #1 driver of customer retention.`,
        slidesCount: 5,
        studyMinutes: 240,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'B2C Marketing & Consumer Unit Economics',
          executiveSummary: 'This module establishes the analytical and behavioral foundations of Business-to-Consumer commerce. We evaluate the circular Consumer Decision Journey, the mathematical optimization of Customer Lifetime Value (LTV) relative to Customer Acquisition Cost (CAC), RFM behavioral customer segmentation, and conversion rate optimization (CRO) strategies.',
          keyTakeaways: [
            'The linear funnel is replaced by the circular Consumer Decision Journey with a continuous loyalty loop.',
            'Sustainable B2C scaling requires an LTV:CAC ratio of 3:1 or higher with payback under 12 months.',
            'RFM segmentation categorizes buyers by Recency, Frequency, and Monetary value to tailor marketing triggers.',
            'Behavioral economics principles (Loss Aversion, Decoy Effect, Social Proof) drive modern CRO and pricing architecture.',
            'First-party data ownership and frictionless customer experience (low Customer Effort Score) protect long-term margins.'
          ],
          coreDefinitions: [
            { term: 'Consumer Decision Journey (CDJ)', definition: 'The circular path consumers navigate through consideration, active evaluation, purchase, and the post-purchase loyalty loop.', importance: 'high' },
            { term: 'Customer Acquisition Cost (CAC)', definition: 'Total direct marketing and sales expenditures divided by the number of new customers acquired.', importance: 'high' },
            { term: 'Customer Lifetime Value (LTV)', definition: 'The net profit contribution anticipated from a customer over the entire duration of their relationship with the business.', importance: 'high' },
            { term: 'RFM Analysis', definition: 'Segmentation method scoring consumers on Recency of last purchase, Frequency of orders, and Monetary spend.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'Subscription LTV Equation', formulaOrRule: 'LTV = (ARPU × Gross Margin %) / Churn Rate', explanation: 'Demonstrates that cutting churn rate in half doubles the lifetime value of the customer base.' },
            { name: 'CAC Payback Formula', formulaOrRule: 'Payback (Months) = CAC / (Monthly ARPU × Gross Margin %)', explanation: 'Tracks the speed of capital recovery to support scalable ad reinvestment.' }
          ],
          examWatchouts: [
            'Do not confuse ROAS (Gross Revenue / Ad Spend) with net profitability (ROI). A high ROAS can still lose money if gross margins are thin.',
            'Avoid treating all churn equally; voluntary cancellation requires product intervention, while involuntary churn requires payment retry logic.'
          ],
          cheatSheetBullets: [
            'LTV:CAC Target: >= 3:1',
            'Average e-commerce CVR: 2% to 4%',
            'Global cart abandonment benchmark: ~70%',
            'Statistically significant A/B test requirement: p < 0.05',
            'NPS = % Promoters (9-10) - % Detractors (0-6)'
          ]
        },
        quizzes: [
          {
            id: 'quiz-b2c-comprehensive',
            title: 'B2C 101 Week 1: Comprehensive 60-Question Bank & Exam',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: createQuestionsForCourse('B2C', B2C_TOPICS)
          }
        ],
        flashcards: [
          {
            id: 'fc-b2c-1',
            courseId: 'b2c',
            weekNumber: 1,
            front: 'What are the 5 stages of the modern McKinsey Consumer Decision Journey (CDJ)?',
            back: '1. Initial Consideration Set, 2. Active Evaluation, 3. Moment of Purchase, 4. Post-Purchase Experience, 5. The Loyalty Loop.',
            category: 'Consumer Journey',
            difficulty: 'Medium',
            box: 4,
            nextReviewDate: '2026-10-28',
            reviewCount: 5,
            isStarred: false
          },
          {
            id: 'fc-b2c-2',
            courseId: 'b2c',
            weekNumber: 1,
            front: 'What is the benchmark LTV:CAC ratio for scalable consumer business models and why?',
            back: '3:1 or higher. 1:1 loses money after operating overhead; 3:1 balances profitability with aggressive market expansion.',
            category: 'Unit Economics',
            difficulty: 'Easy',
            box: 5,
            nextReviewDate: '2026-11-02',
            reviewCount: 7,
            isStarred: false
          },
          {
            id: 'fc-b2c-3',
            courseId: 'b2c',
            weekNumber: 1,
            front: 'Explain the Decoy Effect (Asymmetric Dominance) in B2C pricing.',
            back: 'Adding a third option that is clearly inferior to a target premium product, making the premium choice feel like an obvious, high-value bargain.',
            category: 'Pricing Psychology',
            difficulty: 'Medium',
            box: 3,
            nextReviewDate: '2026-10-26',
            reviewCount: 4,
            isStarred: true
          }
        ]
      }
    ]
  },
  {
    id: 'macro',
    code: 'ECON 202',
    name: 'Macro economics',
    department: 'Economics',
    color: 'emerald',
    iconName: 'TrendingUp',
    professor: 'Dr. Elena Rostova',
    targetWeeklyHours: 4.5,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'IS-LM Equilibrium, Fiscal & Monetary Multipliers, and Central Bank Policy',
        slidesRaw: `--- Slide 1: Aggregate Demand & Goods Market (The IS Curve) ---
- Equilibrium in goods market: Y = C(Y - T) + I(r) + G + NX.
- Consumption function: C = C0 + c1*(Y - T), where c1 is Marginal Propensity to Consume (MPC).
- Investment function: I(r) = I0 - d1*r. Higher interest rate r increases borrowing costs, dampening investment and aggregate output Y.
- Downward sloping IS curve in (Y, r) space.
- Fiscal policy shifts IS curve horizontally by delta Y = [1 / (1 - c1)] * delta G.

--- Slide 2: Financial Markets & Money Equilibrium (The LM Curve) ---
- Real money supply: M/P (fixed in short run by Central Bank).
- Real money demand: L(r, Y) = k*Y - h*r.
- Liquidity preference equilibrium: M/P = L(r, Y).
- Upward sloping LM curve: Higher Y expands transaction demand for money; with fixed supply, interest rate r must climb to restore equilibrium.
- Monetary expansion: Central bank increases M -> LM curve shifts right/downward, lowering r and increasing Y.

--- Slide 3: Policy Mix, Crowding Out & The Liquidity Trap ---
- Fiscal Expansion alone: Increases Y but bids up interest rates r, causing private investment crowding out.
- Accommodative Monetary Policy: Central bank expands M alongside G, keeping interest rate stable and eliminating crowding out.
- The Liquidity Trap (Zero Lower Bound): When nominal interest rate hits zero, LM curve becomes horizontal. Conventional monetary policy loses traction; fiscal multiplier is maximized.

--- Slide 4: Aggregate Demand (AD) and Aggregate Supply (AS) Integration ---
- Deriving AD from IS-LM by varying price level P. Higher P reduces real money balance (M/P), shifting LM left, raising r, and lowering Y.
- Short-Run Aggregate Supply (SRAS): upward sloping due to sticky wages and menu costs.
- Long-Run Aggregate Supply (LRAS): vertical at natural output level Y_n (determined by capital, labor, technology).`,
        slidesCount: 4,
        studyMinutes: 220,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'IS-LM Equilibrium & Macroeconomic Policy Dynamics',
          executiveSummary: 'This lecture examines the simultaneous equilibrium across the goods market (IS curve) and money market (LM curve). We analyze the transmission mechanisms of fiscal policy (government spending and taxation) and monetary policy (money supply adjustments and interest rate targeting), as well as crowding-out phenomena and liquidity trap constraints.',
          keyTakeaways: [
            'The IS curve reflects goods market equilibrium; it slopes downward because higher interest rates depress investment.',
            'The LM curve reflects money market equilibrium; it slopes upward because higher output increases transaction money demand.',
            'The expenditure multiplier equals 1 / (1 - MPC); higher MPC magnifies fiscal policy impact on aggregate output.',
            'Crowding out occurs when deficit-financed government spending drives up interest rates, curbing private capital investment.',
            'In a Liquidity Trap at the Zero Lower Bound, monetary policy is ineffective while the fiscal multiplier is at its peak.'
          ],
          coreDefinitions: [
            { term: 'Marginal Propensity to Consume (MPC)', definition: 'The proportion of an aggregate raise in pay that a consumer spends on goods and services rather than saving.', importance: 'high' },
            { term: 'IS Curve', definition: 'Investment-Savings schedule showing all combinations of real interest rate r and income Y that balance the goods market.', importance: 'high' },
            { term: 'LM Curve', definition: 'Liquidity preference-Money supply schedule showing combinations of r and Y that balance the money market.', importance: 'high' },
            { term: 'Crowding Out Effect', definition: 'The reduction in private investment caused by higher interest rates resulting from expansionary fiscal policy.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'Expenditure Multiplier', formulaOrRule: 'Multiplier = 1 / (1 - MPC)', explanation: 'Calculates the total change in aggregate equilibrium output for a $1 increase in autonomous government spending.' },
            { name: 'Tax Multiplier', formulaOrRule: 'Tax Multiplier = -MPC / (1 - MPC)', explanation: 'Reflects that a tax cut is partially saved rather than entirely spent in the first round.' }
          ],
          examWatchouts: [
            'Tax multiplier is always smaller in absolute magnitude than the spending multiplier because consumers save (1 - MPC) of tax cuts.',
            'Do not confuse shifts of the IS or LM curves with movements along the curves caused by interest rate adjustments.'
          ],
          cheatSheetBullets: [
            'Increase in G or decrease in T -> Shifts IS right',
            'Increase in M (Central Bank purchase) -> Shifts LM right/down',
            'Full Crowding Out: Classical vertical LM curve',
            'Zero Crowding Out: Horizontal LM curve (Liquidity Trap)'
          ]
        },
        quizzes: [
          {
            id: 'quiz-macro-comprehensive',
            title: 'ECON 202 Week 1: IS-LM & Monetary-Fiscal Policy Exam',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: [
              {
                id: 'q-macro-1',
                question: 'If the Marginal Propensity to Consume (MPC) is 0.80, what is the government spending expenditure multiplier?',
                options: ['1.25', '4.0', '5.0', '8.0'],
                correctAnswerIndex: 2,
                explanation: 'Multiplier = 1 / (1 - MPC) = 1 / (1 - 0.80) = 1 / 0.20 = 5.0.',
                slideReference: 'Slide 1: Multiplier Math',
                conceptTested: 'Expenditure Multiplier',
                topic: 'Goods Market Equilibrium',
                difficulty: 'Foundational'
              },
              {
                id: 'q-macro-2',
                question: 'Why does an increase in government spending (G) typically cause partial crowding out in the standard IS-LM model?',
                options: [
                  'Because higher income Y increases transaction money demand, bidding up interest rate r and suppressing private investment',
                  'Because the Central Bank immediately doubles tax rates',
                  'Because consumer MPC automatically drops to zero',
                  'Because exports immediately exceed imports'
                ],
                correctAnswerIndex: 0,
                explanation: 'As G shifts IS right, output Y rises. This expands money demand; with fixed money supply, interest rate r must rise, which crowds out interest-sensitive private investment I(r).',
                slideReference: 'Slide 3: Crowding Out Mechanism',
                conceptTested: 'Crowding Out Mechanism',
                topic: 'Fiscal Policy Dynamics',
                difficulty: 'Application'
              },
              {
                id: 'q-macro-3',
                question: 'In a Liquidity Trap scenario where nominal interest rates are at the Zero Lower Bound (horizontal LM curve), what is the effectiveness of fiscal policy?',
                options: [
                  'Fiscal policy is completely useless',
                  'Fiscal policy is at its maximum effectiveness with zero crowding out',
                  'The expenditure multiplier becomes zero',
                  'Tax cuts produce negative output'
                ],
                correctAnswerIndex: 1,
                explanation: 'When LM is horizontal, interest rates cannot rise in response to higher output. Consequently, private investment is not crowded out, and the full multiplier effect is realized.',
                slideReference: 'Slide 3: Zero Lower Bound',
                conceptTested: 'Liquidity Trap & Multiplier',
                topic: 'Monetary Policy & ZLB',
                difficulty: 'Exam-Level'
              }
            ]
          }
        ],
        flashcards: []
      }
    ]
  },
  {
    id: 'entr',
    code: 'ENTR 301',
    name: 'Entrepreneurship and innovation',
    department: 'Management & Venture Strategy',
    color: 'amber',
    iconName: 'Sparkles',
    professor: 'Prof. David Vance',
    targetWeeklyHours: 4.0,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'Lean Startup Methodology, Value Proposition Canvas & Business Model Innovation',
        slidesRaw: `--- Slide 1: The Lean Startup Methodology (Eric Ries) ---
- Traditional product development: long waterfall planning, high capital risk, high failure rate.
- Lean Startup core loop: Build -> Measure -> Learn.
- Minimum Viable Product (MVP): version of a new product which allows a team to collect the maximum amount of validated learning about customers with the least effort.
- Validated Learning: empirical testing of core venture assumptions rather than vanity metrics.
- Pivot vs. Persevere: structured course correction designed to test a new fundamental hypothesis about the product, strategy, and engine of growth.

--- Slide 2: Value Proposition Canvas (Osterwalder) ---
- Customer Profile:
  1. Customer Jobs (functional, social, emotional tasks they are trying to get done)
  2. Pains (obstacles, risks, and frustrations experienced before, during, or after job)
  3. Gains (outcomes and concrete benefits customers desire)
- Value Map:
  1. Products & Services (the bundle offered)
  2. Pain Relievers (how the product eliminates specific customer pains)
  3. Gain Creators (how the product creates expected or unexpected customer benefits)
- Problem-Solution Fit vs. Product-Market Fit.

--- Slide 3: Disruptive Innovation (Clayton Christensen) ---
- Low-End Disruption: attacks incumbent over-served customers with a simpler, cheaper, good-enough offering (e.g. Southwest Airlines, personal computers).
- New-Market Disruption: targets non-consumers who previously lacked money or skill to participate.
- Sustaining Innovation: improving existing products along dimensions of performance already valued by mainstream customers.
- Innovator's Dilemma: incumbents listen to their most profitable customers and ignore emerging disruptive threats until it is too late.

--- Slide 4: Venture Financing & Unit Economics ---
- Pre-seed & Seed funding: Angels, Accelerators (Y Combinator, Techstars), Friends & Family.
- Series A: scaling proven product-market fit with repeatable sales mechanics.
- Cap Table & Dilution: Pre-money valuation + Investment Amount = Post-money valuation.
- Burn Rate & Runway: Cash balance / Net monthly burn = Months of operational runway.`,
        slidesCount: 4,
        studyMinutes: 200,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'Lean Startup, Value Proposition & Disruptive Innovation',
          executiveSummary: 'This module covers modern venture creation frameworks: the Build-Measure-Learn feedback loop, Minimum Viable Products (MVPs), the Value Proposition Canvas for mapping customer pains and gains, and Clayton Christensen\'s theory of low-end and new-market disruptive innovation.',
          keyTakeaways: [
            'Lean startups prioritize speed of validated learning over comprehensive multi-year business plans.',
            'An MVP is an experiment designed to test fundamental business hypotheses with minimum resource expenditure.',
            'Value Proposition Fit requires matching Pain Relievers and Gain Creators directly to verified customer jobs.',
            'Disruptive innovations enter at the bottom of the market with simpler, cheaper alternatives before marching upmarket.',
            'Venture runway equals cash reserves divided by net monthly burn rate.'
          ],
          coreDefinitions: [
            { term: 'Minimum Viable Product (MVP)', definition: 'The smallest experiment enabling maximum validated learning about customer demand with minimum effort.', importance: 'high' },
            { term: 'Disruptive Innovation', definition: 'An innovation that transforms an expensive or complex product into one that is simpler, more accessible, and affordable.', importance: 'high' },
            { term: 'Burn Rate', definition: 'The rate at which a non-profitable venture spends cash reserves to fund monthly operating expenses.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'Venture Runway Equation', formulaOrRule: 'Runway (Months) = Total Cash Reserves / Monthly Net Burn', explanation: 'Determines the survival timeline available to reach cash flow breakeven or close next financing.' },
            { name: 'Post-Money Valuation', formulaOrRule: 'Post-Money = Pre-Money Valuation + New Capital Invested', explanation: 'Calculates investor ownership share: Investor % = Investment / Post-Money.' }
          ],
          examWatchouts: [
            'Do not confuse an MVP with a low-quality prototype; an MVP must deliver functional validated learning to a target user.',
            'Disruptive innovation is NOT merely breakthrough technology; it is a business model innovation targeting low-end or non-consumers.'
          ],
          cheatSheetBullets: [
            'Build-Measure-Learn cycle speed = #1 predictor of startup survival',
            'Vanity metrics: registered users, page impressions',
            'Actionable metrics: retention cohort, conversion %, referral rate',
            'Dilution = New Investment / Post-Money Valuation'
          ]
        },
        quizzes: [
          {
            id: 'quiz-entr-1',
            title: 'ENTR 301 Week 1: Lean Startup & Innovation Models',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: [
              {
                id: 'q-entr-1',
                question: 'According to Eric Ries, what is the primary objective of building a Minimum Viable Product (MVP)?',
                options: [
                  'To maximize initial quarter revenue',
                  'To collect the maximum amount of validated learning about customers with the least effort',
                  'To eliminate all technical debt before public launch',
                  'To impress venture capitalists during demo day'
                ],
                correctAnswerIndex: 1,
                explanation: 'An MVP is an active hypothesis-testing instrument designed to validate customer problems and solutions with minimal resource burn.',
                slideReference: 'Slide 1: The Lean Loop',
                conceptTested: 'MVP Definition & Purpose',
                topic: 'Lean Startup Principles',
                difficulty: 'Foundational'
              },
              {
                id: 'q-entr-2',
                question: 'If a startup has $600,000 in cash and experiences a monthly net burn of $50,000, what is its operating runway?',
                options: ['6 months', '12 months', '18 months', '24 months'],
                correctAnswerIndex: 1,
                explanation: 'Runway = Cash / Monthly Net Burn = $600,000 / $50,000 = 12 months.',
                slideReference: 'Slide 4: Burn Rate & Runway',
                conceptTested: 'Runway Calculation',
                topic: 'Venture Economics',
                difficulty: 'Application'
              }
            ]
          }
        ],
        flashcards: []
      }
    ]
  },
  {
    id: 'erp',
    code: 'ERP 320',
    name: 'Enterprise resource planning',
    department: 'Information Systems & Operations',
    color: 'violet',
    iconName: 'Database',
    professor: 'Dr. Raymond Zhao',
    targetWeeklyHours: 4.0,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'ERP Architecture, Business Process Integration & Order-to-Cash (O2C)',
        slidesRaw: `--- Slide 1: Fundamentals of Enterprise Resource Planning (ERP) ---
- Definition: Integrated suite of modular business software applications that manage core end-to-end processes across an entire enterprise via a single centralized relational database.
- Elimination of functional silos: Sales, Procurement, Manufacturing, Inventory, and Accounting share real-time transaction records.
- Core characteristics:
  - Single Source of Truth (no data duplication or reconciliation lag)
  - Standardized best-practice business processes
  - Enterprise-wide auditability and internal controls (Sarbanes-Oxley compliance)

--- Slide 2: Core ERP Process: Order-to-Cash (O2C) ---
1. Pre-sales Activities: Quotation and inquiry logging.
2. Sales Order Processing: Order entry creates document; automated credit limit check and ATP (Available-to-Promise) inventory query.
3. Inventory Sourcing & Outbound Delivery: Picking, packing, and staging of goods.
4. Goods Issue (GI): Physical shipment leaves warehouse. Accounting impact:
   - Debit: Cost of Goods Sold (COGS)
   - Credit: Inventory Asset account
5. Customer Invoicing / Billing: Creates legal billing document.
   - Debit: Accounts Receivable (AR)
   - Credit: Sales Revenue
6. Payment Receipt: Reconciles bank statement against AR balance.

--- Slide 3: Core ERP Process: Procure-to-Pay (P2P) ---
1. Purchase Requisition (internal demand from MRP or department).
2. Purchase Order (PO) creation and vendor dispatch.
3. Goods Receipt (GR) upon dock arrival:
   - Debit: Inventory
   - Credit: GR/IR (Goods Receipt/Invoice Receipt clearing account)
4. Invoice Verification (Three-Way Match): PO vs. Goods Receipt vs. Vendor Invoice.
5. Outgoing Payment execution.

--- Slide 4: Master Data vs. Transactional Data vs. Configuration Data ---
- Master Data: Long-term foundational data used across multiple transactions (Customer Master, Vendor Master, Material Master, General Ledger Chart of Accounts).
- Transactional Data: Time-stamped data generated by executing a process (Sales Order #8491, Goods Receipt #2049).
- Configuration Data: System rules set during implementation defining company code, fiscal year variant, and currency settings.`,
        slidesCount: 4,
        studyMinutes: 190,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'ERP Architecture, Process Integration & O2C/P2P Workflows',
          executiveSummary: 'This lecture explores how Enterprise Resource Planning (ERP) systems replace fragmented departmental silos with integrated, database-backed enterprise processes. We dissect the Order-to-Cash (O2C) and Procure-to-Pay (P2P) cycles, master data management, and the crucial Three-Way Matching accounting verification control.',
          keyTakeaways: [
            'ERP systems unify sales, manufacturing, logistics, and finance around a Single Source of Truth.',
            'Order-to-Cash automates the chain from inquiry to goods issue, billing, and cash reconciliation.',
            'Goods Issue triggers an immediate accounting posting: Debit COGS and Credit Inventory.',
            'Three-Way Matching prevents vendor invoice fraud by cross-referencing Purchase Order, Goods Receipt, and Invoice.',
            'Master Data constitutes persistent enterprise entities (materials, vendors, customers) while Transactional Data captures event records.'
          ],
          coreDefinitions: [
            { term: 'Available-to-Promise (ATP)', definition: 'An automated ERP calculation determining if uncommitted stock is available to satisfy a customer delivery date.', importance: 'high' },
            { term: 'Three-Way Match', definition: 'The internal accounting control verifying price and quantity consistency across Purchase Order, Goods Receipt, and Vendor Invoice.', importance: 'high' },
            { term: 'Master Data', definition: 'Core persistent business entities maintained centrally and referenced by multiple business transaction processes.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'O2C Accounting Journal Rule', formulaOrRule: 'Goods Issue: Dr COGS / Cr Inventory. Billing: Dr Accounts Receivable / Cr Revenue', explanation: 'Ensures instantaneous matching of expense with revenue recognition under accrual accounting.' }
          ],
          examWatchouts: [
            'Revenue is NOT recognized when a Sales Order is placed; revenue is recognized at Billing / Shipment under GAAP/IFRS.',
            'The GR/IR clearing account is a temporary liability until the vendor invoice arrives to balance the Three-Way Match.'
          ],
          cheatSheetBullets: [
            'Order-to-Cash: Order -> ATP Check -> Delivery -> Goods Issue -> Billing -> Payment',
            'Procure-to-Pay: Requisition -> PO -> Goods Receipt -> 3-Way Match -> Payment',
            'Goods Issue impact: COGS increases, Inventory decreases',
            'Single database schema = real-time financial reporting'
          ]
        },
        quizzes: [
          {
            id: 'quiz-erp-1',
            title: 'ERP 320 Week 1: Business Process Integration Exam',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: [
              {
                id: 'q-erp-1',
                question: 'At what exact step in the standard Order-to-Cash (O2C) process is Cost of Goods Sold (COGS) debited in the general ledger?',
                options: [
                  'When the sales order is initially entered',
                  'When the Goods Issue (physical shipment) is posted',
                  'When the customer clicks checkout on the website',
                  'When payment is deposited in the company bank account'
                ],
                correctAnswerIndex: 1,
                explanation: 'Posting Goods Issue transfers ownership from warehouse inventory to the customer, triggering: Debit Cost of Goods Sold and Credit Inventory.',
                slideReference: 'Slide 2: Order-to-Cash Accounting',
                conceptTested: 'Goods Issue Journal Posting',
                topic: 'Order-to-Cash (O2C)',
                difficulty: 'Application'
              },
              {
                id: 'q-erp-2',
                question: 'What three documents are compared in an ERP "Three-Way Match" before an accounts payable invoice is approved for vendor payment?',
                options: [
                  'Purchase Requisition, Credit Score, Bank Statement',
                  'Purchase Order, Goods Receipt Note, and Vendor Invoice',
                  'Sales Order, Bill of Lading, and Marketing Budget',
                  'Balance Sheet, Income Statement, and Cash Flow Statement'
                ],
                correctAnswerIndex: 1,
                explanation: 'The Three-Way Match verifies that the items billed on the Vendor Invoice match what was authorized on the Purchase Order and what was physically verified on the Goods Receipt.',
                slideReference: 'Slide 3: Procure-to-Pay Controls',
                conceptTested: 'Three-Way Match Control',
                topic: 'Procure-to-Pay (P2P)',
                difficulty: 'Foundational'
              }
            ]
          }
        ],
        flashcards: []
      }
    ]
  },
  {
    id: 'corp-fin',
    code: 'FIN 310',
    name: 'Corporate finance',
    department: 'Finance & Capital Markets',
    color: 'rose',
    iconName: 'Calculator',
    professor: 'Dr. Gregory Thorne',
    targetWeeklyHours: 5.0,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'Time Value of Money (TVM), Capital Budgeting (NPV/IRR) & Cost of Capital (WACC)',
        slidesRaw: `--- Slide 1: Time Value of Money & DCF Foundations ---
- Principle: A dollar today is worth more than a dollar tomorrow due to its potential earning capacity.
- Present Value (PV) = FV / (1 + r)^t.
- Future Value (FV) = PV * (1 + r)^t.
- Net Present Value (NPV) = Sum [ CF_t / (1 + r)^t ] - Initial Investment (CF0).
- NPV Decision Rule: Accept all independent projects with NPV > 0.
- Why NPV is superior to all other capital budgeting tools: Directly measures expected shareholder wealth creation.

--- Slide 2: Alternative Capital Budgeting Criteria & Conflicting Metrics ---
- Internal Rate of Return (IRR): The discount rate r that forces NPV = 0.
  - Decision Rule: Accept if IRR > hurdle rate (Cost of Capital).
  - Pitfalls of IRR: Multiple IRRs for non-conventional cash flows; fails to account for project scale; assumes reinvestment at IRR rather than WACC.
- Payback Period: Years required to recover initial investment. Ignores time value of money and cash flows beyond cutoff.
- Profitability Index (PI) = PV of Future Cash Flows / Initial Investment. Essential under capital rationing.

--- Slide 3: Weighted Average Cost of Capital (WACC) ---
- WACC formula: WACC = (E/V)*r_e + (D/V)*r_d*(1 - T_c) + (P/V)*r_p.
- Cost of Equity (CAPM): r_e = r_f + Beta * [ E(r_m) - r_f ].
  - r_f = risk-free rate (10-yr Treasury)
  - Beta = systematic market risk sensitivity
  - [ E(r_m) - r_f ] = Market Risk Premium (MRP)
- After-tax Cost of Debt: r_d * (1 - T_c) due to tax-deductibility of interest expense (Interest Tax Shield).

--- Slide 4: Modigliani-Miller Theorems & Capital Structure ---
- Proposition I (No Taxes): Capital structure is irrelevant to firm value. V_L = V_U.
- Proposition I (With Taxes): Debt financing increases firm value due to the present value of the interest tax shield: V_L = V_U + T_c * D.
- Trade-off Theory: Balances the tax shield of debt against the increasing expected costs of financial distress / bankruptcy.`,
        slidesCount: 4,
        studyMinutes: 260,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'Time Value of Money, Capital Budgeting & WACC',
          executiveSummary: 'This lecture covers the quantitative core of corporate financial decision-making: discounted cash flow (DCF) valuation, Net Present Value (NPV) vs. Internal Rate of Return (IRR), the Capital Asset Pricing Model (CAPM), and calculating the Weighted Average Cost of Capital (WACC) with interest tax shields.',
          keyTakeaways: [
            'NPV is the gold standard capital budgeting metric because it directly measures incremental shareholder wealth.',
            'IRR suffers from scale neglect and unrealistic reinvestment rate assumptions when comparing mutually exclusive projects.',
            'WACC incorporates equity, preferred stock, and tax-shielded after-tax debt costs.',
            'CAPM establishes the cost of equity by compensating investors for systematic risk (Beta).',
            'Trade-off theory establishes optimal capital structure by balancing tax shields against financial distress costs.'
          ],
          coreDefinitions: [
            { term: 'Net Present Value (NPV)', definition: 'The sum of discounted future cash inflows minus the initial capital cash outlay.', importance: 'high' },
            { term: 'Internal Rate of Return (IRR)', definition: 'The specific discount rate that equates the present value of future cash flows to the initial cost (NPV = 0).', importance: 'high' },
            { term: 'WACC', definition: 'The blended average rate of return a company must earn across debt and equity to satisfy all capital providers.', importance: 'high' },
            { term: 'Interest Tax Shield', definition: 'The tax savings resulting from the deductibility of interest expenses on corporate debt: Tax Shield = Debt × Interest Rate × Tax Rate.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'WACC Equation', formulaOrRule: 'WACC = (E/V)*Re + (D/V)*Rd*(1 - Tc)', explanation: 'Reflects the weighted cost of equity and after-tax cost of debt.' },
            { name: 'CAPM Cost of Equity', formulaOrRule: 'Re = Rf + Beta * (Rm - Rf)', explanation: 'Calculates the required equity return based on systematic market sensitivity (Beta).' }
          ],
          examWatchouts: [
            'Never discount nominal cash flows with real discount rates, or equity cash flows with WACC (use Free Cash Flow to Firm for WACC).',
            'When NPV and IRR conflict for mutually exclusive projects, ALWAYS choose the project with the higher NPV.'
          ],
          cheatSheetBullets: [
            'Accept project if NPV > 0',
            'Accept project if IRR > WACC',
            'After-tax cost of debt: Rd * (1 - Tax Rate)',
            'Higher beta -> higher required equity return -> higher WACC'
          ]
        },
        quizzes: [
          {
            id: 'quiz-corpfin-1',
            title: 'FIN 310 Week 1: Capital Budgeting & WACC Exam',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: [
              {
                id: 'q-fin-1',
                question: 'Why should a financial manager always choose the project with the highest NPV over the project with the highest IRR when projects are mutually exclusive?',
                options: [
                  'Because NPV directly measures the dollar increase in shareholder wealth, whereas IRR ignores project scale and assumes reinvestment at the IRR',
                  'Because IRR is illegal under GAAP guidelines',
                  'Because NPV ignores the cost of capital',
                  'Because banks require NPV to approve checking accounts'
                ],
                correctAnswerIndex: 0,
                explanation: 'A 50% IRR on a $10 investment produces only $5 in wealth, while a 20% IRR on a $1,000,000 investment produces $200,000 in wealth. NPV captures total scale and reinvestment at the realistic WACC.',
                slideReference: 'Slide 2: NPV vs IRR Conflicts',
                conceptTested: 'NPV Superiority & Scale',
                topic: 'Capital Budgeting Metrics',
                difficulty: 'Exam-Level'
              },
              {
                id: 'q-fin-2',
                question: 'If a company has a pre-tax cost of debt of 8% and the corporate tax rate is 25%, what is the after-tax cost of debt used in the WACC calculation?',
                options: ['2.0%', '6.0%', '8.0%', '10.0%'],
                correctAnswerIndex: 1,
                explanation: 'After-tax cost of debt = Pre-tax Rd * (1 - Tax Rate) = 8% * (1 - 0.25) = 8% * 0.75 = 6.0%.',
                slideReference: 'Slide 3: WACC Components',
                conceptTested: 'After-tax Cost of Debt',
                topic: 'Cost of Capital (WACC)',
                difficulty: 'Application'
              }
            ]
          }
        ],
        flashcards: []
      }
    ]
  },
  {
    id: 'bus-math',
    code: 'MATH 205',
    name: 'Business Mathematics',
    department: 'Applied Quantitative Methods',
    color: 'cyan',
    iconName: 'Calculator',
    professor: 'Prof. Katherine Vance',
    targetWeeklyHours: 4.5,
    weeks: [
      {
        weekNumber: 1,
        topicTitle: 'Linear Break-Even Analysis, Matrix Algebra & Marginal Optimization',
        slidesRaw: `--- Slide 1: Linear Cost, Revenue & Break-Even Analysis ---
- Cost Function: Total Cost C(x) = Fixed Costs (FC) + Variable Cost per unit (VC) * x.
- Revenue Function: Total Revenue R(x) = Price (P) * x.
- Profit Function: Pi(x) = R(x) - C(x) = (P - VC)*x - FC.
- Contribution Margin (CM) per unit = P - VC.
- Break-Even Quantity (Q_BE) = Fixed Costs / (Price - Variable Cost per unit) = FC / CM.
- Break-Even Revenue = Q_BE * P.

--- Slide 2: Matrix Operations & Systems of Linear Business Equations ---
- Representing supply chain and production blends as systems of linear equations: A * X = B.
- Matrix dimensions: m × n multiplied by n × p yields m × p product matrix.
- Determinants and Inverses:
  - For 2x2 matrix A = [a, b; c, d]: det(A) = ad - bc.
  - Inverse A^-1 = (1 / det(A)) * [d, -b; -c, a]. Exists iff det(A) != 0.
  - Solution vector: X = A^-1 * B.
- Input-Output Leontief models in inter-industry planning: X = (I - A)^-1 * D.

--- Slide 3: Differential Calculus in Business Optimization ---
- Marginal Cost (MC) = dC/dx (derivative of Total Cost function).
- Marginal Revenue (MR) = dR/dx (derivative of Total Revenue function).
- Profit Maximization Rule: Profit is maximized at production quantity x where Marginal Revenue = Marginal Cost (MR = MC) and second derivative d^2(Pi)/dx^2 < 0.
- Price Elasticity of Demand: E_d = (dQ/dP) * (P/Q).
  - |E_d| > 1: Elastic (lowering price increases revenue)
  - |E_d| < 1: Inelastic (raising price increases revenue)
  - |E_d| = 1: Unit elastic (revenue is maximized)`,
        slidesCount: 3,
        studyMinutes: 230,
        lastStudiedDate: '2026-10-23',
        summary: {
          title: 'Break-Even Economics, Matrix Equations & Marginal Optimization',
          executiveSummary: 'This lecture grounds essential quantitative tools for business decision-making: contribution margin and linear break-even models, matrix algebra for resource allocation and production blend systems, and first/second derivative calculus to determine profit-maximizing output where Marginal Revenue equals Marginal Cost.',
          keyTakeaways: [
            'Break-even quantity occurs where Total Revenue equals Total Cost: Q = FC / (P - VC).',
            'Contribution margin per unit represents the dollars available to cover fixed overhead after variable expenses.',
            'Matrix equations A*X = B model multi-product resource constraints; solved via matrix inverse X = A^-1 * B.',
            'Profit maximization strictly occurs where Marginal Revenue equals Marginal Cost (MR = MC).',
            'Demand elasticity dictates pricing power: when demand is inelastic (|Ed| < 1), raising prices increases total revenue.'
          ],
          coreDefinitions: [
            { term: 'Break-Even Point', definition: 'The production volume where total revenue matches total operating expenses, producing zero net profit.', importance: 'high' },
            { term: 'Contribution Margin', definition: 'Sales price minus variable cost per unit; the marginal profit per unit that covers fixed costs.', importance: 'high' },
            { term: 'Marginal Revenue (MR)', definition: 'The first derivative of total revenue with respect to output; the additional revenue generated by selling one extra unit.', importance: 'high' }
          ],
          formulasOrTheorems: [
            { name: 'Break-Even Quantity', formulaOrRule: 'Q_BE = Fixed Costs / (Price - Variable Cost)', explanation: 'Calculates the baseline sales units required to eliminate operating losses.' },
            { name: 'Profit Maximization Condition', formulaOrRule: 'd(Profit)/dx = 0  =>  MR(x) = MC(x)', explanation: 'The fundamental calculus criterion for maximizing corporate operating profit.' }
          ],
          examWatchouts: [
            'Break-even quantity Q is in units; Break-even revenue is Q * Price. Always verify whether the exam question asks for units or dollars.',
            'Remember that when MR > MC, the firm should expand production; when MR < MC, reducing output increases profit.'
          ],
          cheatSheetBullets: [
            'Break-even Q = FC / (P - VC)',
            'Profit = (P - VC)*Q - FC',
            'Profit Max: MR = MC',
            '2x2 matrix determinant: det(A) = ad - bc',
            'Inelastic demand (|Ed| < 1): Price hike -> Revenue rises'
          ]
        },
        quizzes: [
          {
            id: 'quiz-busmath-1',
            title: 'MATH 205 Week 1: Quantitative Break-Even & Calculus Exam',
            weekNumber: 1,
            difficulty: 'Balanced',
            createdAt: '2026-10-23',
            questions: [
              {
                id: 'q-math-1',
                question: 'A business sells a product for $100 per unit. Variable costs are $40 per unit, and annual fixed costs are $180,000. What is the break-even quantity in units?',
                options: ['1,800 units', '3,000 units', '4,500 units', '6,000 units'],
                correctAnswerIndex: 1,
                explanation: 'Contribution Margin = Price - VC = $100 - $40 = $60 per unit. Break-Even Q = Fixed Costs / CM = $180,000 / $60 = 3,000 units.',
                slideReference: 'Slide 1: Break-Even Equations',
                conceptTested: 'Break-Even Quantity Calculation',
                topic: 'Break-Even Analysis',
                difficulty: 'Application'
              },
              {
                id: 'q-math-2',
                question: 'If Total Revenue is R(x) = 120x - 2x^2 and Total Cost is C(x) = 20x + 100, what quantity x maximizes profit?',
                options: ['15 units', '20 units', '25 units', '30 units'],
                correctAnswerIndex: 2,
                explanation: 'MR = dR/dx = 120 - 4x. MC = dC/dx = 20. Setting MR = MC: 120 - 4x = 20 => 4x = 100 => x = 25 units.',
                slideReference: 'Slide 3: Marginal Optimization Calculus',
                conceptTested: 'Profit Maximization via Derivatives',
                topic: 'Marginal Calculus & Optimization',
                difficulty: 'Exam-Level'
              }
            ]
          }
        ],
        flashcards: []
      }
    ]
  }
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'attempt-b2c-1',
    courseId: 'b2c',
    weekNumber: 1,
    quizTitle: 'B2C 101: Consumer Decision Journey Check',
    date: '2026-10-23T14:20:00Z',
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    timeSpentSeconds: 240,
    topicBreakdown: {
      'Consumer Decision Journey (CDJ)': { correct: 9, total: 10 }
    },
    answers: [
      { questionId: 'q-b2c-1', selectedOption: 0, isCorrect: true },
      { questionId: 'q-b2c-2', selectedOption: 1, isCorrect: true },
      { questionId: 'q-b2c-3', selectedOption: 1, isCorrect: true },
      { questionId: 'q-b2c-4', selectedOption: 0, isCorrect: true },
      { questionId: 'q-b2c-5', selectedOption: 1, isCorrect: true },
      { questionId: 'q-b2c-6', selectedOption: 0, isCorrect: true },
      { questionId: 'q-b2c-7', selectedOption: 1, isCorrect: true },
      { questionId: 'q-b2c-8', selectedOption: 0, isCorrect: true },
      { questionId: 'q-b2c-9', selectedOption: 0, isCorrect: true },
      { questionId: 'q-b2c-10', selectedOption: 1, isCorrect: false }
    ]
  },
  {
    id: 'attempt-fin-1',
    courseId: 'corp-fin',
    weekNumber: 1,
    quizTitle: 'FIN 310: Capital Budgeting & WACC Assessment',
    date: '2026-10-23T18:15:00Z',
    score: 2,
    totalQuestions: 2,
    percentage: 100,
    timeSpentSeconds: 120,
    topicBreakdown: {
      'Capital Budgeting Metrics': { correct: 1, total: 1 },
      'Cost of Capital (WACC)': { correct: 1, total: 1 }
    },
    answers: [
      { questionId: 'q-fin-1', selectedOption: 0, isCorrect: true },
      { questionId: 'q-fin-2', selectedOption: 1, isCorrect: true }
    ]
  }
];

export const INITIAL_WEEKLY_REPORT: WeeklyInsightReport = {
  overallScoreGrade: 'A-',
  weeklyHeadline: 'Excellent start across your 6 business courses in Week 1!',
  summary: 'You logged 1,140 total study minutes (~19 hours) across your 6 semester courses. Your performance in B2C Marketing was outstanding (90% on CDJ concepts), and Corporate Finance showed mastery of WACC and capital budgeting. Focus your next study block on Business Mathematics derivative optimization and Enterprise Resource Planning Three-Way Matching.',
  strongestCourses: ['B2C Marketing', 'Corporate Finance'],
  atRiskCourses: [
    {
      courseName: 'Business Mathematics (MATH 205)',
      reason: 'Profit maximization derivatives and break-even formulas require active-recall practice before the upcoming quiz.',
      actionableNextStep: 'Take the 10-question practice set on marginal optimization calculus and review slide 3 rules.'
    },
    {
      courseName: 'Enterprise Resource Planning (ERP 320)',
      reason: 'Order-to-Cash and Procure-to-Pay journal entries need verification under timed test conditions.',
      actionableNextStep: 'Review the Three-Way Match slide diagram and quiz on Goods Issue inventory adjustments.'
    }
  ],
  recommendedStudySplit: [
    { courseName: 'B2C 101', recommendedHours: 4.5, priorityFocusTopic: 'Customer Lifetime Value & RFM Segmentation' },
    { courseName: 'ECON 202', recommendedHours: 4.5, priorityFocusTopic: 'IS-LM Equilibrium shifts and crowding out' },
    { courseName: 'ENTR 301', recommendedHours: 4.0, priorityFocusTopic: 'Lean Startup MVP and Value Proposition Canvas' },
    { courseName: 'ERP 320', recommendedHours: 4.0, priorityFocusTopic: 'Order-to-Cash (O2C) and Three-Way Matching' },
    { courseName: 'FIN 310', recommendedHours: 5.0, priorityFocusTopic: 'NPV vs IRR conflict resolution and WACC tax shields' },
    { courseName: 'MATH 205', recommendedHours: 4.5, priorityFocusTopic: 'Marginal revenue/cost derivatives & break-even units' }
  ],
  weeklyStudyTip: 'For quantitative business courses (Finance and Business Math), work through problem derivations with paper and pencil before reviewing answer keys. Active cognitive problem-solving builds 3x more exam confidence than passive reading.',
  generatedAt: '2026-10-23T22:00:00Z'
};
