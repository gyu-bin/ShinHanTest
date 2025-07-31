import React, { useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import RoleCreateDrawer from "./userDetail/detail/RoleCreateDrawer";

const PAGE_SIZE = 12;
const CLIENT_ID = 'acb004f3-5ffc-49bc-900f-a1c390c1d077';

/** 역할 타입 */
type Role = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

const RoleManagement: React.FC = () => {
    const [page, setPage] = useState(1);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { get, delete: deleteApi } = useApi();
    const [drawerOpen, setDrawerOpen] = useState(false);
    /** 역할 목록 조회 */
    const fetchRoles = async (): Promise<Role[]> => {
        const response = await get<{ data: Role[] }>(
            `/projects/${CLIENT_ID}/roles?page=${page}&size=${PAGE_SIZE}`
        );
        return response.data;
    };

    const { data: roles, isLoading } = useQuery<Role[]>({
        queryKey: ['roles', page],
        queryFn: fetchRoles,
        staleTime: 1000 * 60 * 5,
    });

    /** 역할 삭제 */
    const deleteMutation = useMutation({
        mutationFn: async (roleName: string) => {
            await deleteApi(`/projects/${CLIENT_ID}/roles/${roleName}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, role: Role) => {
        setAnchorEl(event.currentTarget);
        setSelectedRole(role);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRole(null);
    };

    const handleDelete = () => {
        if (selectedRole) {
            deleteMutation.mutate(selectedRole.name);
        }
        handleMenuClose();
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>역할 관리</Typography>
            <Typography color="text.secondary" mb={3} fontSize={15}>
                시스템의 역할을 관리하고 권한을 설정할 수 있습니다.
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button variant="contained" onClick={() => setDrawerOpen(true)}>
                    새 역할 만들기
                </Button>
                <RoleCreateDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    clientId={CLIENT_ID}
                />
                <TextField size="small" placeholder="역할명 입력" />
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f4f6f8' }}>
                                    <TableCell>역할명</TableCell>
                                    <TableCell>설명</TableCell>
                                    <TableCell>생성일</TableCell>
                                    <TableCell>수정일</TableCell>
                                    <TableCell align="right">관리</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roles?.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/admin/roles/${role.id}`)}
                                    >
                                        <TableCell>{role.name}</TableCell>
                                        <TableCell>{role.description ?? '-'}</TableCell>
                                        <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(role.updated_at).toLocaleDateString()}</TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <IconButton onClick={(e) => handleMenuOpen(e, role)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* 삭제 메뉴 */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleDelete}>삭제</MenuItem>
            </Menu>
        </Box>
    );
};

export default RoleManagement;