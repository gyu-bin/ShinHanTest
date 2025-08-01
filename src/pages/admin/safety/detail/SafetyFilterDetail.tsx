import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    CircularProgress,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../../../hooks/useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SafetyFilter {
    id: string;
    stopword: string;
    description: string;
    label: string;
    category: string;
    scope: string;
    status: 'ACTIVE' | 'INACTIVE';
    exception_sources: string[];
    created_at: string;
    updated_at: string;
    created_by: string;
}

const SafetyFilterDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { get, delete: deleteApi } = useApi();

    const { data: filter, isLoading } = useQuery<SafetyFilter>({
        queryKey: ['safetyFilterDetail', id],
        queryFn: () => get(`/safety-filters/${id}`),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteApi(`/safety-filters/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['safetyFilters'] });
            navigate('/admin/safety-filters');
            window.location.reload();
        },
    });

    if (isLoading || !filter) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>
                세이프티 필터 상세
            </Typography>

            {/* 기본정보 */}
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                기본정보
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>금지어</TableCell>
                            <TableCell>{filter.stopword}</TableCell>
                            <TableCell>분류</TableCell>
                            <TableCell>{filter.category}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>설명</TableCell>
                            <TableCell colSpan={3}>{filter.description}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>라벨</TableCell>
                            <TableCell>{filter.label}</TableCell>
                            <TableCell>필터링 범위</TableCell>
                            <TableCell>{filter.scope}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>상태</TableCell>
                            <TableCell colSpan={3}>
                                <Chip
                                    label={filter.status === 'ACTIVE' ? '사용중' : '비활성'}
                                    color={filter.status === 'ACTIVE' ? 'primary' : 'default'}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>예외 출처</TableCell>
                            <TableCell colSpan={3}>
                                {filter.exception_sources?.length > 0
                                    ? filter.exception_sources.join(', ')
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 등록정보 */}
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                등록정보
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>생성일시</TableCell>
                            <TableCell>{new Date(filter.created_at).toLocaleString()}</TableCell>
                            <TableCell>생성자</TableCell>
                            <TableCell>{filter.created_by}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>최종업데이트 일시</TableCell>
                            <TableCell>{new Date(filter.updated_at).toLocaleString()}</TableCell>
                            <TableCell />
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 버튼 */}
            <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => deleteMutation.mutate()}
                >
                    삭제
                </Button>
                <Button
                    variant="contained"
                    onClick={() => navigate(`/admin/safety-filters/${id}/edit`)}
                >
                    수정
                </Button>
            </Box>
        </Box>
    );
};

export default SafetyFilterDetail;