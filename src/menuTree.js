"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 메뉴 트리 자동 생성 (공통, 회원가입, 로그인 제외, 한글 path)
// 아이콘은 샘플로 지정, 실제 적용 시 교체 가능
const menuTree = [
    {
        key: 'home', label: '홈', icon: 'Home', path: '/홈',
    },
    {
        key: 'dashboard', label: '대시보드', icon: 'Dashboard', path: '/대시보드',
    },
    {
        key: 'modelgarden', label: '모델가든', icon: 'Hub', children: [
            { key: 'list', label: '목록', path: '/모델가든/목록' },
            { key: 'request', label: '모델 반입 요청', path: '/모델가든/모델-반입-요청' },
            { key: 'status', label: '모델 반입 현황 조회', path: '/모델가든/모델-반입-현황-조회' },
        ]
    },
    {
        key: 'ide', label: 'IDE', icon: 'Code', children: [
            { key: 'ide', label: 'IDE', path: '/IDE/IDE' },
        ]
    },
    {
        key: 'data', label: '데이터', icon: 'Storage', children: [
            {
                key: 'datastore', label: '데이터 저장소', children: [
                    { key: 'list', label: '목록', path: '/데이터/데이터-저장소/목록' },
                    { key: 'detail', label: '상세', path: '/데이터/데이터-저장소/상세' },
                ]
            },
            {
                key: 'catalog', label: '데이터 카탈로그', children: [
                    {
                        key: 'dataset', label: '데이터세트', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터-카탈로그/데이터세트/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터-카탈로그/데이터세트/상세' },
                            { key: 'edit', label: '수정', path: '/데이터/데이터-카탈로그/데이터세트/수정' },
                            { key: 'edit-train', label: '학습파일 수정', path: '/데이터/데이터-카탈로그/데이터세트/학습파일-수정' },
                            { key: 'add-train', label: '학습파일 추가', path: '/데이터/데이터-카탈로그/데이터세트/학습파일-추가' },
                        ]
                    },
                    {
                        key: 'create-dataset', label: '데이터 만들기', children: [
                            {
                                key: 'create-dataset-step', label: '데이터세트 만들기', children: [
                                    { key: 'step1', label: 'STEP1. 데이터 유형 및 세부정보', path: '/데이터/데이터-카탈로그/데이터-만들기/데이터세트-만들기/STEP1' },
                                    { key: 'step2', label: 'STEP2. 데이터 가져오기', path: '/데이터/데이터-카탈로그/데이터-만들기/데이터세트-만들기/STEP2' },
                                    { key: 'step3', label: 'STEP3. 프로세서', path: '/데이터/데이터-카탈로그/데이터-만들기/데이터세트-만들기/STEP3' },
                                    { key: 'step4', label: 'STEP4. 공개설정', path: '/데이터/데이터-카탈로그/데이터-만들기/데이터세트-만들기/STEP4' },
                                ]
                            }
                        ]
                    },
                    {
                        key: 'knowledge', label: '지식', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터-카탈로그/지식/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터-카탈로그/지식/상세' },
                            {
                                key: 'knowledge-detail', label: '지식 상세', children: [
                                    { key: 'setting', label: '지식 설정', path: '/데이터/데이터-카탈로그/지식/지식-상세/지식-설정' },
                                    { key: 'eval', label: '검색 성능 평가', path: '/데이터/데이터-카탈로그/지식/지식-상세/검색-성능-평가' },
                                    { key: 'add-file', label: '지식파일 추가', path: '/데이터/데이터-카탈로그/지식/지식-상세/지식파일-추가' },
                                    {
                                        key: 'add-file-method', label: '파일 추가 방식 선택', path: '/데이터/데이터-카탈로그/지식/지식-상세/지식파일-추가/파일-추가-방식-선택'
                                    },
                                    { key: 'file-detail', label: '지식파일 상세', path: '/데이터/데이터-카탈로그/지식/지식-상세/지식파일-상세' },
                                    { key: 'metadata', label: '메타데이터', path: '/데이터/데이터-카탈로그/지식/지식-상세/메타데이터' },
                                    {
                                        key: 'file-detail2', label: '파일 상세', children: [
                                            { key: 'file-setting', label: '지식파일 설정', path: '/데이터/데이터-카탈로그/지식/지식-상세/파일-상세/지식파일-설정' },
                                            { key: 'file-preview', label: '파일 설정 미리보기', path: '/데이터/데이터-카탈로그/지식/지식-상세/파일-상세/파일-설정-미리보기' },
                                            { key: 'edit-data', label: '데이터 수정', path: '/데이터/데이터-카탈로그/지식/지식-상세/파일-상세/데이터-수정' },
                                            { key: 'split-data', label: '데이터 분할', path: '/데이터/데이터-카탈로그/지식/지식-상세/파일-상세/데이터-분할' },
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        key: 'create-knowledge', label: '새 데이터 만들기', children: [
                            {
                                key: 'create-knowledge-step', label: '지식 만들기', children: [
                                    { key: 'step1', label: 'STEP1. 지식 이름 및 설명', path: '/데이터/데이터-카탈로그/새-데이터-만들기/지식-만들기/STEP1' },
                                    { key: 'step2', label: 'STEP2. 지식 세부 설정', path: '/데이터/데이터-카탈로그/새-데이터-만들기/지식-만들기/STEP2' },
                                    { key: 'step3', label: 'STEP3. 분할 및 임베딩 설정', path: '/데이터/데이터-카탈로그/새-데이터-만들기/지식-만들기/STEP3' },
                                    { key: 'step4', label: 'STEP4. 데이터 가져오기', path: '/데이터/데이터-카탈로그/새-데이터-만들기/지식-만들기/STEP4' },
                                    { key: 'step5', label: 'STEP4. 공개설정', path: '/데이터/데이터-카탈로그/새-데이터-만들기/지식-만들기/STEP5' },
                                ]
                            }
                        ]
                    },
                ]
            },
            {
                key: 'tools', label: '데이터도구', children: [
                    { key: 'create', label: '데이터도구 만들기', path: '/데이터/데이터도구/데이터도구-만들기' },
                    {
                        key: 'processor', label: '프로세서', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터도구/프로세서/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터도구/프로세서/상세' },
                            { key: 'edit', label: '수정', path: '/데이터/데이터도구/프로세서/수정' },
                        ]
                    },
                    {
                        key: 'ingestion', label: 'Ingestion Tools', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터도구/Ingestion-Tools/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터도구/Ingestion-Tools/상세' },
                            { key: 'edit', label: '수정', path: '/데이터/데이터도구/Ingestion-Tools/수정' },
                        ]
                    },
                    {
                        key: 'custom', label: 'Custom Scripts', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터도구/Custom-Scripts/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터도구/Custom-Scripts/상세' },
                            { key: 'edit', label: '수정', path: '/데이터/데이터도구/Custom-Scripts/수정' },
                        ]
                    },
                    {
                        key: 'vectordb', label: '벡터DB', children: [
                            { key: 'list', label: '목록', path: '/데이터/데이터도구/벡터DB/목록' },
                            { key: 'detail', label: '상세', path: '/데이터/데이터도구/벡터DB/상세' },
                            { key: 'edit', label: '수정', path: '/데이터/데이터도구/벡터DB/수정' },
                        ]
                    },
                ]
            },
        ]
    },
    // ... (이하 모델, 프롬프트, 파인튜닝, 에이전트, 배포, 관리 등 동일하게 추가)
];
exports.default = menuTree;
