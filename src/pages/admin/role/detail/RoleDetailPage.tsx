import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Divider,
    CircularProgress, Button
} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import { useApi } from '../../../../hooks/useApi';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import RoleEditDrawer from "./RoleEditDrawer";
const CLIENT_ID = 'acb004f3-5ffc-49bc-900f-a1c390c1d077';



const RoleDetailPage = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const { get, delete: deleteApi } = useApi();
    const [tabIndex, setTabIndex] = useState(0);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const [editOpen, setEditOpen] = useState(false); // 추가

    /** 역할 삭제 */
    const deleteMutation = useMutation({
        mutationFn: async (roleName: string) => {
            await deleteApi(`/api/v1/projects/${CLIENT_ID}/roles/${roleName}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/admin/roles');
        },
    });

    const handleDelete = () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            deleteMutation.mutate(data?.name);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!roleId) return;
                const res = await get(`/projects/roles/${roleId}`);  // ✅ 바로 API 호출
                setData(res);
            } catch (err) {
                console.error('역할 정보를 불러오는 데 실패했습니다.', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roleId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <Typography color="error">역할 정보를 불러올 수 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight={700}>역할 상세</Typography>
            <Typography mt={1}>
                <b style={{ color: '#2b60d9' }}>'사용자 피드백 관리자'</b>의 기본 및 권한 정보를 확인합니다.<br />
                역할에 포함된 사용자 목록도 조회할 수 있습니다.
            </Typography>

            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mt: 3 }}>
                <Tab label="기본정보" />
                <Tab label="권한정보" />
                <Tab label="구성원 정보" />
            </Tabs>

            <Divider sx={{ mb: 3 }} />

            {tabIndex === 0 && (
                <BasicInfoTab
                    data={data}
                    onDelete={handleDelete}
                    onEdit={() => setEditOpen(true)} // 수정 버튼 핸들링
                />
            )}
            <RoleEditDrawer
                open={editOpen}
                onClose={() => setEditOpen(false)}
                roleName={data.name}
                initialDescription={data.description}
            />
            {tabIndex === 1 && <Typography>권한정보 탭 (roleId: {roleId})</Typography>}
            {tabIndex === 2 && <Typography>구성원정보 탭 (roleId: {roleId})</Typography>}
        </Box>
    );
};

interface BasicInfoTabProps {
    data: any;
    onDelete: () => void;
    onEdit: () => void;
}
const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ data, onDelete, onEdit }) => {
    if (!data) return <Typography>데이터가 없습니다.</Typography>;

    return (
        <Box>
            <Typography variant="subtitle2" mb={1}>기본정보</Typography>
            <Box border={1} borderColor="#eee" p={2} borderRadius={2}>
                <Typography><b>역할명:</b> {data.name}</Typography>
                <Typography><b>설명:</b> {data.description}</Typography>
                <Typography><b>유형:</b> 사용자 정의</Typography>
            </Box>

            <Typography variant="subtitle2" mt={4} mb={1}>등록정보</Typography>
            <Box border={1} borderColor="#eee" p={2} borderRadius={2} mb={2}>
                <Typography><b>생성일시:</b> {data.created_at}</Typography>
                <Typography><b>최종업데이트 일시:</b> {data.updated_at}</Typography>
                <Typography><b>생성자:</b> {data.creator}</Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button color="inherit" variant="outlined" onClick={onEdit}>
                    수정
                </Button>
                <Button color="error" variant="outlined" onClick={onDelete}>
                    삭제
                </Button>
            </Box>
        </Box>
    );
};

export default RoleDetailPage;