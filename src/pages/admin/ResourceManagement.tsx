import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const RESOURCE_COLORS: Record<'cpu' | 'memory' | 'gpu', string> = {
    cpu: '#8884d8',
    memory: '#f08080',
    gpu: '#4caf50',
};

const TASK_LABELS: Record<string, string> = {
    data: '데이터',
    finetuning: '학습',
    evaluation: '추론',
    serving: '배포',
};

const visibleTasks = ['data', 'finetuning', 'evaluation', 'serving'];

type ClusterResource = {
    cpu_total: number;
    cpu_used: number;
    memory_total: number;
    memory_used: number;
    gpu_total: number;
    gpu_used: number;
};

type TaskQuotaItem = {
    task_type: string;
    quota: number;
    type: 'cpu' | 'memory' | 'gpu';
};

type TaskUsedItem = {
    task_type: string;
    used: number;
    type: 'cpu' | 'memory' | 'gpu' | null;
};

type ResourceQuotaResponse = {
    task_quota: TaskQuotaItem[];
    task_used: TaskUsedItem[];
    gpu_total: number;
};

type ClusterResponse = {
    cluster_resource: ClusterResource;
};

type TaskPresetItem = {
    task_type: string;
    category: string;
    updated_at: string;
    resources: {
        size: string;
        cpu: number;
        memory: number;
        gpu: number;
    }[];
};
type RawPolicyItem = {
    task_type: string;
    size: string;
    cpu: number;
    memory: number;
    gpu: number;
};

type TaskPresetGrouped = {
    task_type: string;
    category: string;         // 예: '기본'
    updated_at: string;       // 임시: 하드코딩 or null 처리
    resources: RawPolicyItem[];
};
const ResourceManagement: React.FC = () => {
    const { get } = useApi();
    const [tabIndex, setTabIndex] = useState(0);

    const { data: clusterData, isLoading: loadingCluster } = useQuery<ClusterResponse>({
        queryKey: ['cluster_resource'],
        queryFn: () => get('/resources/cluster?node_type=task'),
        staleTime: Infinity,
    });

    const { data: quotaData, isLoading: loadingQuota } = useQuery<ResourceQuotaResponse>({
        queryKey: ['resource_quota'],
        queryFn: () => get('/resources/task_quota'),
        staleTime: Infinity,
    });

    const { data: taskPresetData = [], isLoading: loadingPolicy } = useQuery<RawPolicyItem[]>({
        queryKey: ['taskPreset'],
        queryFn: () =>
            get('/resources/task_policy').then((res: any) => {
                return Array.isArray(res.data) ? res.data : res;
            }),
    });
    console.log('taskPresetData', taskPresetData);
    const groupedTaskPresetData = useMemo((): TaskPresetItem[] => {
        const grouped: Record<string, TaskPresetItem> = {};

        taskPresetData.forEach((item) => {
            const key = item.task_type;
            if (!grouped[key]) {
                grouped[key] = {
                    task_type: key,
                    category: '기본',
                    updated_at: '2025-03-24 18:23:43',
                    resources: [],
                };
            }
            grouped[key].resources.push({
                size: item.size,
                cpu: item.cpu,
                memory: item.memory,
                gpu: item.gpu,
            });
        });

        return Object.values(grouped);
    }, [taskPresetData]);

    const isLoading = loadingCluster || loadingQuota;
    const cluster = clusterData?.cluster_resource;

    const quotaMap = useMemo(() => {
        if (!quotaData) return { quota: [], used: [], total: 0 };
        return {
            quota: quotaData.task_quota || [],
            used: quotaData.task_used || [],
            total: quotaData.gpu_total || 0,
        };
    }, [quotaData]);

    const taskData = useMemo(() => {
        if (!quotaData) return [];

        const grouped: Record<string, { cpu: number; memory: number; gpu: number }> = {};

        [...quotaMap.used, ...quotaMap.quota].forEach(({ task_type }) => {
            if (!grouped[task_type]) {
                grouped[task_type] = { cpu: 0, memory: 0, gpu: 0 };
            }
        });

        quotaMap.used.forEach(({ task_type, used, type }) => {
            const t = type ?? 'gpu';
            grouped[task_type][t as keyof typeof grouped[string]] = used;
        });

        return Object.entries(grouped).map(([task, usage]) => ({
            task,
            ...usage,
        }));
    }, [quotaMap]);

    const shouldDisplay = (task: { task: string; cpu: number; memory: number; gpu: number }) => {
        const hasUsage = task.cpu > 0 || task.memory > 0 || task.gpu > 0;
        const hasQuota = quotaMap.quota.find((q) => q.task_type === task.task)?.quota ?? 0;
        return visibleTasks.includes(task.task) || hasUsage || hasQuota > 0;
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>자원 관리</Typography>
            <Typography color="text.secondary" mb={0}>
                플랫폼 내 사용자별, 업무별 자원현황을 확인하고 관리할수 있습니다.
            </Typography>
            <Typography color="text.secondary" mb={0}>
                업무별 프리셋 관리를 통해 자원 할당량을 미리 설정할 수 있습니다.
            </Typography>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
                <Tab label="자원현황" />
                <Tab label="업무별 프리셋 관리" />
            </Tabs>

            {tabIndex === 0 && (
                <>{isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                        <Box display="flex">
                            <Box width="50%" pr={3} borderRight="1px solid #e0e0e0">
                                <Typography fontWeight={600} mb={2}>전체 사용량</Typography>
                                <Box display="flex" gap={4}>
                                    {cluster && (['cpu', 'memory', 'gpu'] as const).map((type) => {
                                        const used = cluster[`${type}_used`];
                                        const total = cluster[`${type}_total`];
                                        const percentage = total > 0 ? (used / total) * 100 : 0;
                                        return (
                                            <Box key={type} width={100}>
                                                <CircularProgressbar
                                                    value={percentage}
                                                    text={`${Math.round(percentage)}%`}
                                                    styles={buildStyles({
                                                        textSize: '16px',
                                                        pathColor: RESOURCE_COLORS[type],
                                                        textColor: RESOURCE_COLORS[type],
                                                        trailColor: '#eee',
                                                    })}
                                                />
                                                <Typography align="center" mt={1}>{type.toUpperCase()}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>

                            <Box width="50%" pl={3}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography fontWeight={600}>업무별 사용량</Typography>
                                    <Box display="flex" gap={2}>
                                        {(Object.keys(RESOURCE_COLORS) as Array<keyof typeof RESOURCE_COLORS>).map((type) => (
                                            <Box key={type} display="flex" alignItems="center" gap={0.5}>
                                                <Box width={12} height={12} borderRadius={2} bgcolor={RESOURCE_COLORS[type]} />
                                                <Typography variant="caption">{type.toUpperCase()}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {taskData.filter(shouldDisplay).map((task) => {
                                    const { cpu, memory, gpu } = task;
                                    const total = cpu + memory + gpu || 1;
                                    const percent = {
                                        cpu: (cpu / total) * 100,
                                        memory: (memory / total) * 100,
                                        gpu: (gpu / total) * 100,
                                    };

                                    return (
                                        <Box key={task.task} mb={1.5}>
                                            <Box display="flex" alignItems="center">
                                                <Box width="25%">
                                                    <Typography fontWeight={600}>{TASK_LABELS[task.task] ?? task.task}</Typography>
                                                </Box>
                                                <Box width="75%" display="flex" height={12} borderRadius={4} overflow="hidden" bgcolor="#eee">
                                                    {(['cpu', 'memory', 'gpu'] as const).map((type) => (
                                                        <Box
                                                            key={type}
                                                            width={`${percent[type]}%`}
                                                            bgcolor={RESOURCE_COLORS[type]}
                                                            height="100%"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Paper>
                )}</>
            )}

            {tabIndex === 1 && (
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                    {loadingPolicy ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            <CircularProgress />
                        </Box>
                    ) : taskPresetData && taskPresetData.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>No</TableCell>
                                        <TableCell>업무프리셋명</TableCell>
                                        <TableCell>유형</TableCell>
                                        <TableCell>사이즈</TableCell>
                                        <TableCell>CPU</TableCell>
                                        <TableCell>Memory</TableCell>
                                        <TableCell>GPU</TableCell>
                                        <TableCell>최종업데이트</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupedTaskPresetData.map((item, index) => (
                                        item.resources.map((res, resIndex) => (
                                            <TableRow key={`${item.task_type}-${res.size}`}>
                                                {resIndex === 0 && (
                                                    <>
                                                        <TableCell rowSpan={item.resources.length}>{index + 1}</TableCell>
                                                        <TableCell rowSpan={item.resources.length}>{item.task_type}</TableCell>
                                                        <TableCell rowSpan={item.resources.length}>{item.category}</TableCell>
                                                    </>
                                                )}
                                                <TableCell>{res.size}</TableCell>
                                                <TableCell>{res.cpu}</TableCell>
                                                <TableCell>{res.memory}</TableCell>
                                                <TableCell>{res.gpu}</TableCell>
                                                {resIndex === 0 && (
                                                    <TableCell rowSpan={item.resources.length}>{item.updated_at}</TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary">데이터가 없습니다.</Typography>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default ResourceManagement;