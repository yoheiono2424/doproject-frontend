// 資格管理のデータ構造と型定義

export interface Qualification {
  id: string;
  category1: string; // 大カテゴリ
  category2: string; // 中カテゴリ
  qualificationName: string; // 資格名
  qualificationDetail?: string; // 詳細分類（第3階層）
  acquisitionDate: string; // 取得日（YYYY-MM-DD）
  expiryDate?: string; // 終了日（YYYY-MM-DD）※免許カテゴリのみ
  customName?: string; // 自由入力資格名
}

// 第3階層を持つ資格の詳細リスト
export interface QualificationDetail {
  name: string;
  details: string[];
}

// 第2階層（中カテゴリ）の構造
export interface QualificationCategory2 {
  name: string;
  items: (string | QualificationDetail)[];
}

// 第1階層（大カテゴリ）の構造
export interface QualificationCategory1 {
  name: string;
  subcategories: QualificationCategory2[];
}

// 資格マスターデータ
export const qualificationMasterData: QualificationCategory1[] = [
  {
    name: '免許',
    subcategories: [
      {
        name: '電気主任技術者',
        items: ['第三種電気主任技術者']
      },
      {
        name: '施工管理技士（１級）',
        items: [
          '１級電気工事施工管理技士',
          '１級土木施工管理技士',
          '１級管工事施工管理技士',
          '1級電気通信工事施工管理技士'
        ]
      },
      {
        name: '監理技術者資格者証',
        items: [
          {
            name: '監理技術者資格者証',
            details: ['電気', '機械(実経)', '電気通信（実経）', '管', '土木', '水道施設（土一）']
          }
        ]
      },
      {
        name: '施工管理技士（２級）',
        items: [
          '２級電気工事施工管理技士',
          '２級土木施工管理技士',
          '２級建設機械施工技士',
          '２級管工事施工管理技士',
          '２級電気通信工事施工管理技士'
        ]
      },
      {
        name: '電気工事士',
        items: ['第一種電気工事士免状', '第二種電気工事士免状']
      },
      {
        name: '発電設備関連',
        items: [
          '自家用発電設備専門技術者資格証',
          '特種電気工事資格者認定証（非常用予備発電装置工事）'
        ]
      },
      {
        name: '消防設備士免状',
        items: [
          {
            name: '消防設備士免状',
            details: ['甲第４類', '乙第７類', '乙第６類']
          }
        ]
      },
      {
        name: 'ポンプ施設管理技術者',
        items: ['１級ポンプ施設管理技術者資格', '２級ポンプ施設管理技術者資格']
      },
      {
        name: '計装士',
        items: ['１級計装士', '２級計装士']
      },
      {
        name: 'その他免許',
        items: ['登録電気工事基幹技能者', 'あと施工アンカー認定資格登録証']
      }
    ]
  },
  {
    name: '労働安全衛生',
    subcategories: [
      {
        name: '管理者・責任者',
        items: [
          '雇用管理責任者',
          '雇用衛生推進者養成講習終了証',
          '安全衛生推進者養成講習',
          '化学物質管理者講習(取扱事業場向け)修了証'
        ]
      },
      {
        name: '職長・安全衛生',
        items: [
          '職長・安全衛生責任者教育修了証',
          '職長・安全衛生責任者能力向上教育修了証',
          '監督者安全衛生教育講習修了証'
        ]
      },
      {
        name: '足場関連',
        items: ['施工管理者等のための足場点検実務研修']
      },
      {
        name: 'KYT・ゼロ災運動',
        items: ['ＫＹＴ講習', 'ゼロ災運動ＫＹＴトレーナー研修会']
      },
      {
        name: '各種安全教育',
        items: [
          'チェンソー以外の振動工具取扱者に対する安全衛生教育修了証',
          '熱中症予防指導員研修修了証',
          '平成28年熊本地震に係る復旧工事に従事する｢管理監督者等に対する安全衛生教育｣修了証',
          '新入者安全衛生教育'
        ]
      }
    ]
  },
  {
    name: '技能講習',
    subcategories: [
      {
        name: '作業主任者',
        items: [
          '足場の組立て等作業主任者',
          '土止め支保工作業主任者技能講習',
          '型わく支保工の組立て等',
          '地山の掘削作業主任者',
          '石綿作業主任者技能講習'
        ]
      },
      {
        name: '酸素欠乏・有害物質',
        items: [
          '第一種酸素欠乏危険作業主任者技能講習修了証',
          '第二種酸素欠乏危険作業主任者技能講習修了証',
          '酸素欠乏・硫化水素危険作業主任者技能講習修了証',
          '有機溶剤作業主任者技能講習修了証',
          '特定化学物質及び四アルキル鉛等作業主任者技能講習'
        ]
      },
      {
        name: '建設機械運転',
        items: [
          '小型移動式クレーン運転技能講習修了証',
          '車両系建設機械（解体用）運転技能特例講習',
          '車両系建設機械（整地掘削等用）運転技能特例講習',
          '車両系建設機械運転技能講習修了証',
          '不整地運搬車運転技能特例講習',
          '高所作業車運転技能特例講習修了証'
        ]
      },
      {
        name: '溶接・玉掛',
        items: ['ガス溶接技能講習修了証', '玉掛技能講習修了証']
      },
      {
        name: '電気工事関連',
        items: [
          {
            name: '高圧ケーブル工事技能認定証',
            details: ['端末', '直線']
          },
          '登録電気工事基幹技能者講習修了証'
        ]
      }
    ]
  },
  {
    name: '特別教育',
    subcategories: [
      {
        name: '溶接・研削',
        items: [
          'アーク溶接の業務に係る特別教育修了証',
          '自由研削といしの取替え、取替え時の試運転',
          '機械研削と石の取替え又は取替え時の試運転の業務に係る特別教育修了証'
        ]
      },
      {
        name: '電気工事',
        items: [
          '高圧・低圧電路作業',
          '高圧・特別高圧電気',
          '低圧電気取扱',
          '電気工事作業指揮者',
          '低圧電気特別教育修了証'
        ]
      },
      {
        name: '機械運転',
        items: [
          'クレーン運転の業務に係る特別教育修了証',
          '締め固め用機械（ローラー）特別教育終了証',
          '動力巻上げ機の運転'
        ]
      },
      {
        name: '有害物質・環境',
        items: [
          '特定粉じん作業業務',
          '有機溶剤取扱の業務',
          '廃棄物の焼却施設に関する業務（ダイオキシン類ばく露防止）',
          'ダイオキシン類作業者特別教育修了証',
          '石綿取扱い作業従事者特別教育'
        ]
      },
      {
        name: '酸素欠乏・高所作業',
        items: [
          '酸素欠乏症等危険作業特別教育修了証',
          '酸素欠乏・硫化水素危険作業に係る特別教育',
          'ロープ高所作業特別教育修了証'
        ]
      },
      {
        name: '保護具',
        items: ['保護具着用管理責任者教育修了証']
      }
    ]
  },
  {
    name: 'その他',
    subcategories: [
      {
        name: '水道・排水設備',
        items: [
          '排水設備工事責任技術者',
          '給水装置工事主任技術者',
          '下水道排水設備工事責任技術者証'
        ]
      },
      {
        name: '電力会社特有',
        items: ['昇降柱基本訓練特別教育　九州電力㈱']
      },
      {
        name: '建設関連',
        items: ['あと施工アンカー技術講習受講修了証', '配管工資格認定証', '非破壊検査技量認定書']
      },
      {
        name: '危険物・特殊資格',
        items: [
          '危険物取扱者免状',
          '特定化学物質等作業主任者',
          'フォークリフト運転技能講習',
          '床上げ操作式クレーン運転技能講習'
        ]
      },
      {
        name: '制御・通信',
        items: ['有接点シーケンス制御の実践技術', '第二級陸上特殊無線技士']
      }
    ]
  },
  {
    name: 'その他（自由入力）',
    subcategories: []
  }
];

// 第1階層の選択肢取得
export const getCategory1Options = (): string[] => {
  return qualificationMasterData.map((cat) => cat.name);
};

// 第2階層の選択肢取得
export const getCategory2Options = (category1: string): string[] => {
  const cat1 = qualificationMasterData.find((cat) => cat.name === category1);
  if (!cat1) return [];

  // 「その他（自由入力）」の場合は空配列
  if (category1 === 'その他（自由入力）') return [];

  return cat1.subcategories.map((sub) => sub.name);
};

// 第3階層の選択肢取得（存在する場合のみ）
export const getCategory3Options = (
  category1: string,
  category2: string
): string[] => {
  const cat1 = qualificationMasterData.find((cat) => cat.name === category1);
  if (!cat1) return [];

  const cat2 = cat1.subcategories.find((sub) => sub.name === category2);
  if (!cat2) return [];

  // items内にQualificationDetail型があるか確認
  for (const item of cat2.items) {
    if (typeof item !== 'string' && 'details' in item) {
      return item.details;
    }
  }

  return [];
};

// 資格名の選択肢取得（第2階層で完結する場合）
export const getQualificationNameOptions = (
  category1: string,
  category2: string
): string[] => {
  const cat1 = qualificationMasterData.find((cat) => cat.name === category1);
  if (!cat1) return [];

  const cat2 = cat1.subcategories.find((sub) => sub.name === category2);
  if (!cat2) return [];

  // 文字列型のみを返す（第3階層がある場合は除外）
  return cat2.items.filter((item) => typeof item === 'string') as string[];
};

// 第3階層が存在するか確認
export const hasCategory3 = (category1: string, category2: string): boolean => {
  const options = getCategory3Options(category1, category2);
  return options.length > 0;
};

// 免許カテゴリかどうか確認
export const isLicenseCategory = (category1: string): boolean => {
  return category1 === '免許';
};

// 自由入力カテゴリかどうか確認
export const isCustomCategory = (category1: string): boolean => {
  return category1 === 'その他（自由入力）';
};
