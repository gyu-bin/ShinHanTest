// SidebarMenu.tsx
import React from 'react';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import {
    Home as HomeIcon,
    Storage as StorageIcon,
    Hub as HubIcon,
    TextSnippet as TextSnippetIcon,
    Tune as TuneIcon,
    SmartToy as SmartToyIcon,
    CloudUpload as CloudUploadIcon,
    Settings as SettingsIcon,
    Group as GroupIcon,
    AssignmentInd as AssignmentIndIcon,
    Dns as DnsIcon,
    Groups as GroupsIcon,
    Assignment as AssignmentIcon,
    Timeline as TimelineIcon,
    History as HistoryIcon,
    FilterAlt as FilterAltIcon,
    VpnKey as KeyIcon,
} from '@mui/icons-material';
import { NavLink, useLocation } from 'react-router-dom';

// ----------------- 타입 정의 -----------------
type MenuChild = {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string;
};

type MenuItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    children: MenuChild[];
};

// ----------------- 메뉴 정의 -----------------
const menu: MenuItem[] = [
    {
        key: 'home',
        label: '홈',
        icon: <HomeIcon />,
        children: [
            { key: 'modelgarden', label: '모델가든', icon: <HubIcon fontSize="small" />, path: '/home/model-garden' },
            { key: 'ide', label: 'IDE', icon: <TextSnippetIcon fontSize="small" />, path: '/home/ide' },
        ],
    },
    {
        key: 'data',
        label: '데이터',
        icon: <StorageIcon />,
        children: [
            { key: 'datastore', label: '데이터 저장소', icon: <StorageIcon fontSize="small" />, path: '/data/storage' },
            { key: 'datacatalog', label: '데이터 카탈로그', icon: <TextSnippetIcon fontSize="small" />, path: '/data/catalog' },
            { key: 'datatools', label: '데이터 도구', icon: <TuneIcon fontSize="small" />, path: '/data/tools' },
        ],
    },
    {
        key: 'model',
        label: '모델',
        icon: <HubIcon />,
        children: [
            { key: 'modelcatalog', label: '모델 카탈로그', icon: <HubIcon fontSize="small" />, path: '/model/catalog' },
            { key: 'modeleval', label: '모델 평가', icon: <TimelineIcon fontSize="small" />, path: '/model/evaluation' },
            { key: 'finetune', label: '파인튜닝', icon: <TuneIcon fontSize="small" />, path: '/model/finetune' },
        ],
    },
    {
        key: 'prompt',
        label: '프롬프트',
        icon: <TextSnippetIcon />,
        children: [
            { key: 'inference', label: '추론 프롬프트', icon: <TextSnippetIcon fontSize="small" />, path: '/prompt/inference' },
            { key: 'fewshot', label: '퓨샷', icon: <SmartToyIcon fontSize="small" />, path: '/prompt/fewshot' },
        ],
    },
    {
        key: 'playground',
        label: '플레이그라운드',
        icon: <SmartToyIcon />,
        children: [
            { key: 'main', label: '플레이그라운드', icon: <SmartToyIcon fontSize="small" />, path: '/playground' },
        ],
    },
    {
        key: 'agent',
        label: '에이전트',
        icon: <SmartToyIcon />,
        children: [
            { key: 'builder', label: '빌더', icon: <SmartToyIcon fontSize="small" />, path: '/agent/builder' },
            { key: 'tools', label: '도구', icon: <TuneIcon fontSize="small" />, path: '/agent/tools' },
            { key: 'evaluation', label: '에이전트 평가', icon: <TimelineIcon fontSize="small" />, path: '/agent/evaluation' },
        ],
    },
    {
        key: 'deploy',
        label: '배포',
        icon: <CloudUploadIcon />,
        children: [
            { key: 'modeldeploy', label: '모델 배포', icon: <CloudUploadIcon fontSize="small" />, path: '/deploy/model' },
            { key: 'agentdeploy', label: '에이전트 배포', icon: <CloudUploadIcon fontSize="small" />, path: '/deploy/agent' },
            { key: 'apikey', label: 'API KEY', icon: <KeyIcon fontSize="small" />, path: '/deploy/apikey' },
        ],
    },
    {
        key: 'notice',
        label: '공지사항',
        icon: <AssignmentIcon />,
        children: [
            { key: 'list', label: '목록', icon: <AssignmentIcon fontSize="small" />, path: '/notice/list' },
        ],
    },
    {
        key: 'admin',
        label: '관리',
        icon: <SettingsIcon />,
        children: [
            { key: 'user', label: '사용자 관리', icon: <GroupIcon fontSize="small" />, path: '/admin/user-management' },
            { key: 'role', label: '역할 관리', icon: <AssignmentIndIcon fontSize="small" />, path: '/admin/role-management' },
            { key: 'approve', label: '승인 관리', icon: <AssignmentIndIcon fontSize="small" />, path: '/admin/approve-management' },
            { key: 'group', label: '그룹 관리', icon: <GroupsIcon fontSize="small" />, path: '/admin/group-management' },
            { key: 'project', label: '프로젝트 관리', icon: <AssignmentIcon fontSize="small" />, path: '/admin/project-management' },
            { key: 'resource', label: '자원 관리', icon: <DnsIcon fontSize="small" />, path: '/admin/resource-management' },
            { key: 'session', label: '접속 관리', icon: <TimelineIcon fontSize="small" />, path: '/admin/session-management' },
            { key: 'history', label: '사용 이력관리', icon: <HistoryIcon fontSize="small" />, path: '/admin/history-management' },
            { key: 'filter', label: '보안 관리', icon: <FilterAltIcon fontSize="small" />, path: '/admin/safety-filter-management' },
        ],
    },
];

const SidebarMenu: React.FC = () => {
    const location = useLocation();
    const [selectedMain, setSelectedMain] = React.useState(menu[0].key);

    React.useEffect(() => {
        const found = menu.find((m) => m.children.some((c) => location.pathname.startsWith(c.path)));
        if (found) setSelectedMain(found.key);
    }, [location.pathname]);

    const mainMenuWidth = 72;
    const subMenuWidth = 240;
    const selectedMenu = menu.find((m) => m.key === selectedMain);

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Box sx={{ width: mainMenuWidth, background: '#fff', borderRight: '1px solid #e5e8ef', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <List sx={{ width: '100%', pt: 0 }}>
                    {menu.map((item) => (
                        <ListItemButton
                            key={item.key}
                            selected={selectedMain === item.key}
                            onClick={() => setSelectedMain(item.key)}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1.5, mb: 0.5, borderRadius: 2, minHeight: 48, '&.Mui-selected, &.Mui-selected:hover': { background: '#e3f2fd', color: '#1976d2', fontWeight: 700 }, '&:hover': { background: '#f5faff' } }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, color: selectedMain === item.key ? '#1976d2' : '#b0b8c1', mb: 0.5, fontSize: 28 }}>{item.icon}</ListItemIcon>
                            <Typography variant="caption" sx={{ fontSize: 12, mt: 0.5 }}>{item.label}</Typography>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
            <Box sx={{ width: subMenuWidth, background: '#f7fafd', borderRight: '1px solid #e5e8ef', pt: 0, boxShadow: '1px 0 0 #e5e8ef' }}>
                {selectedMenu && selectedMenu.children.length > 0 && (
                    <>
                        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', pl: 3, borderBottom: '1px solid #e5e8ef', background: '#fff' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#222' }}>{selectedMenu.label}</Typography>
                        </Box>
                        <List sx={{ pt: 1 }}>
                            {selectedMenu.children.map((child) => (
                                <ListItemButton
                                    key={child.key}
                                    component={NavLink}
                                    to={child.path}
                                    selected={location.pathname.startsWith(child.path)}
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 2,
                                        pl: 3,
                                        minHeight: 44,
                                        '&.Mui-selected, &.Mui-selected:hover': {
                                            background: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 700,
                                        },
                                        '&:hover': {
                                            background: '#f0f6ff',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: location.pathname === child.path ? '#1976d2' : '#b0b8c1', minWidth: 32 }}>{child.icon}</ListItemIcon>
                                    <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 15 }} />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default SidebarMenu;