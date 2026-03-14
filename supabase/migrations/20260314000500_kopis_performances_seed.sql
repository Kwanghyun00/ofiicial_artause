-- ============================================================================
-- KOPIS 공연 데이터 직접 삽입 (2026-03-14 기준)
--
-- 연극 20건 + 뮤지컬 13건 (서울 및 주요 지역 공연중 공연)
-- source = 'kopis', 중복 방지: kopis_id 기준 ON CONFLICT 처리
-- ============================================================================

-- kopis_id 중복 체크를 위한 함수형 삽입
-- 이미 존재하는 kopis_id는 UPDATE, 없으면 INSERT

-- ── 연극 ─────────────────────────────────────────────────────────────────

INSERT INTO public.performances
  (slug, title, kopis_id, category, region, venue, period_start, period_end, poster_url, status, source, last_synced_at, sync_status, updated_at)
VALUES
  ('체인지-로그인-대학로-앵콜-PF286389',   '체인지 로그인 [대학로 (앵콜)]',                   'PF286389', '연극', '서울', '후암스테이지',                     '2026-03-05', '2026-03-29', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286389_260305_133835.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('김보책-korean-woyzeck-PF286244',       '김보책 (Korean Woyzeck)',                          'PF286244', '연극', '서울', '공간아울',                         '2026-03-13', '2026-03-22', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286244_260304_130904.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('이인환각연쇄고리-PF286143',             '이인환각연쇄고리: Find a Channelhead',             'PF286143', '연극', '서울', '콜드슬립(koldsleep)',               '2026-03-13', '2026-04-04', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286143_260303_151200.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('마피아게임-대학로-PF285694',             '마피아게임 [대학로]',                              'PF285694', '연극', '서울', '아라아트홀',                       '2026-03-07', '2026-03-31', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285694_260224_131148.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('돌고돌아-도라희-PF286003',               '돌고돌아, 도라희',                                 'PF286003', '연극', '서울', '성수 소극장(일루미 스튜디오)',       '2026-03-14', '2026-03-28', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286003_260227_144807.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('굿바이-PF285670',                        '굿바이',                                           'PF285670', '연극', '서울', '업스테이지 (UP Stage)',             '2026-03-12', '2026-03-22', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285670_260224_105627.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('산책하는-침략자-PF285865',               '산책하는 침략자',                                  'PF285865', '연극', '서울', '북촌창우극장',                     '2026-03-12', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285865_260226_123132.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('래빗홀-PF286365',                        '래빗홀',                                           'PF286365', '연극', '서울', '문래예술공장',                     '2026-03-12', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286365_260305_113842.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('춘풍-대학로-PF286176',                   '춘풍 [대학로]',                                    'PF286176', '연극', '서울', '씨어터조이',                       '2026-03-11', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286176_260303_164413.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('낙조-PF286096',                          '낙조',                                             'PF286096', '연극', '서울', '창작플랫폼 경험과 상상',           '2026-03-10', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286096_260303_133123.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('이건-그냥-흔한-우리-이야기-PF286070',   '이건 그냥 흔한 우리 이야기 [대학로]',             'PF286070', '연극', '서울', '예술공간 혜화',                     '2026-03-12', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286070_260303_123902.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('거인-앙갈로-광주-PF286627',              '거인 앙갈로 [광주]',                               'PF286627', '연극', '광주', '국립아시아문화전당',               '2026-03-14', '2026-03-22', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286627_260309_150822.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('잘-가그래이-청주-PF285964',              '잘 가그래이 [청주]',                               'PF285964', '연극', '충청북도', '정심아트홀',                   '2026-03-11', '2026-03-21', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285964_260227_131222.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('원-죄-창원-PF285816',                    '원: 죄 [창원]',                                    'PF285816', '연극', '경상남도', '사랑새아트홀',                 '2026-03-01', '2026-04-26', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285816_260225_174504.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('헨젤과-그레텔-대구-PF285695',            '헨젤과 그레텔 [대구]',                             'PF285695', '연극', '대구', '대백프라자',                       '2026-03-06', '2026-03-29', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285695_260224_132046.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('뜀뛰는-여관-천안-PF286029',              '뜀뛰는 여관 [천안]',                               'PF286029', '연극', '충청남도', '천안어린이꿈누리터',             '2026-03-14', '2026-03-22', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286029_260227_161930.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('내-친구-어린왕자-울산-PF286002',         '내 친구 어린왕자 [울산]',                          'PF286002', '연극', '울산', '레미어린이극장 [울산진장]',         '2026-03-07', '2026-04-11', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286002_260227_144519.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('들꽃찾아-서산-PF286208',                 '들꽃찾아 [서산]',                                  'PF286208', '연극', '충청남도', '서산시문화회관',                 '2026-03-12', '2026-03-14', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286208_260304_103740.gif', 'completed', 'kopis', NOW(), 'synced', NOW()),
  ('6월-26일-대전-PF285988',                 '6월 26일 [대전]',                                  'PF285988', '연극', '대전', '드림아트홀 [대전]',               '2026-03-12', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285988_260227_141040.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('대진대-1945-PF286600',                   '대진대학교 연기예술학과, 1945',                    'PF286600', '연극', '경기도', '대진대학교',                     '2026-03-12', '2026-03-14', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286600_260309_141935.jpg', 'completed', 'kopis', NOW(), 'synced', NOW())

ON CONFLICT (slug) DO UPDATE SET
  kopis_id       = EXCLUDED.kopis_id,
  title          = EXCLUDED.title,
  category       = EXCLUDED.category,
  region         = EXCLUDED.region,
  venue          = EXCLUDED.venue,
  period_start   = EXCLUDED.period_start,
  period_end     = EXCLUDED.period_end,
  poster_url     = EXCLUDED.poster_url,
  status         = EXCLUDED.status,
  source         = EXCLUDED.source,
  last_synced_at = EXCLUDED.last_synced_at,
  sync_status    = EXCLUDED.sync_status,
  updated_at     = EXCLUDED.updated_at;

-- ── 뮤지컬 ────────────────────────────────────────────────────────────────

INSERT INTO public.performances
  (slug, title, kopis_id, category, region, venue, period_start, period_end, poster_url, status, source, last_synced_at, sync_status, updated_at)
VALUES
  ('님과함께-디스코왕-PF286963',             '님과함께: 디스코왕',                              'PF286963', '뮤지컬', '서울', '낭만극장',                         '2026-02-27', '2026-03-29', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286963_260313_110540.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('김종욱-찾기-대학로-PF286497',             '김종욱 찾기 [대학로]',                             'PF286497', '뮤지컬', '서울', '틴틴홀',                           '2026-03-07', '2026-03-31', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF286497_260306_173930.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('조커-대학로-PF285654',                    '조커 [대학로]',                                    'PF285654', '뮤지컬', '서울', '극장 온 (ON)',                     '2026-03-12', '2026-03-29', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285654_260224_102655.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('하모니-대학로-PF285945',                  '하모니 [대학로]',                                  'PF285945', '뮤지컬', '서울', '열린극장',                         '2026-03-07', '2026-03-15', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285945_260227_105426.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('창작산실-적토-PF284597',                  '창작산실, 적토',                                   'PF284597', '뮤지컬', '서울', 'SH아트홀',                         '2026-03-07', '2026-03-29', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF284597_260206_110951.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('비스티-대학로-PF284888',                  '비스티 [대학로]',                                  'PF284888', '뮤지컬', '서울', '링크아트센터',                     '2026-03-11', '2026-06-07', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF284888_260211_102955.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('인화-대학로-PF284784',                    '인화 [대학로]',                                    'PF284784', '뮤지컬', '서울', '홍익대 대학로 아트센터',           '2026-03-13', '2026-06-07', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF284784_260209_145544.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('너를-위한-글자-대학로-PF284771',          '너를 위한 글자 [대학로]',                          'PF284771', '뮤지컬', '서울', '링크아트센터드림',                 '2026-03-04', '2026-05-31', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF284771_260209_142635.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('여명의-눈동자-서울-동작-PF285347',        '여명의 눈동자 [서울 동작]',                        'PF285347', '뮤지컬', '서울', 'Converse Stage Arena 여명',       '2026-02-24', '2026-04-26', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF285347_260219_142926.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('전설의-리틀-농구단-대학로-PF284414',      '전설의 리틀 농구단 [대학로]',                      'PF284414', '뮤지컬', '서울', '플러스씨어터',                     '2026-03-10', '2026-05-25', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF284414_260204_110740.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('roger-대학로-PF283930',                   'ROGER [대학로]',                                   'PF283930', '뮤지컬', '서울', 'NOL 서경스퀘어',                   '2026-03-05', '2026-05-31', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF283930_260127_125929.gif', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('스톤-대학로-PF283613',                    '스톤 [대학로]',                                    'PF283613', '뮤지컬', '서울', '예그린씨어터',                     '2026-02-10', '2026-04-26', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF283613_260121_150110.png', 'ongoing', 'kopis', NOW(), 'synced', NOW()),
  ('님만헤민-게스트하우스-PF283835',          '님만헤민 게스트하우스',                            'PF283835', '뮤지컬', '서울', '선돌극장',                         '2026-01-08', '2026-04-05', 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF283835_260126_124830.jpg', 'ongoing', 'kopis', NOW(), 'synced', NOW())

ON CONFLICT (slug) DO UPDATE SET
  kopis_id       = EXCLUDED.kopis_id,
  title          = EXCLUDED.title,
  category       = EXCLUDED.category,
  region         = EXCLUDED.region,
  venue          = EXCLUDED.venue,
  period_start   = EXCLUDED.period_start,
  period_end     = EXCLUDED.period_end,
  poster_url     = EXCLUDED.poster_url,
  status         = EXCLUDED.status,
  source         = EXCLUDED.source,
  last_synced_at = EXCLUDED.last_synced_at,
  sync_status    = EXCLUDED.sync_status,
  updated_at     = EXCLUDED.updated_at;
