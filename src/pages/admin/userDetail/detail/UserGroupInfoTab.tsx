import React, { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    Menu,
    MenuItem,
    Tooltip,
    Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../../hooks/useApi';
import GroupJoinDrawer from './GroupJoinDrawer';

interface Group {
    id: string;
    name: string;
    path: string;
}

interface Props {
    userId: string;
}

const UserGroupInfoTab: React.FC<Props> = ({ userId }) => {
    const { get, put, delete: deleteApi } = useApi();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const queryClient = useQueryClient();

    const fetchGroups = async (): Promise<Group[]> => {
        const res = await get<{ data: Group[] }>(
            `/users/${userId}/group-mappings?page=1&size=10`
        );
        return res.data;
    };

    const { data = [], isLoading, isError } = useQuery({
        queryKey: ['userGroups', userId],
        queryFn: fetchGroups,
    });

    const deleteMutation = useMutation({
        mutationFn: async (groupId: string) =>
            deleteApi(`/users/${userId}/group-mappings?group_id=${groupId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userGroups', userId] });
        },
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        groupId: string
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedGroupId(groupId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedGroupId(null);
    };

    const handleDelete = () => {
        if (window.confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
            deleteMutation.mutate(selectedGroupId!);
        }
        handleMenuClose();
    };

    return (
        <>
            {isLoading && (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            )}
            {isError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    그룹 정보를 불러오는 데 실패했습니다.
                </Alert>
            )}
            {!isLoading && !isError && (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>No</TableCell>
                                <TableCell>그룹명</TableCell>
                                <TableCell>그룹설명</TableCell>
                                <TableCell>최종 업데이트</TableCell>
                                <TableCell align="center">⋯</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Alert severity="info" sx={{ my: 2 }}>
                                            그룹 정보가 없습니다.
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((group, index) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.path}</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="더보기">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, group.id)}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleDelete}>삭제</MenuItem>
            </Menu>

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" onClick={() => setDrawerOpen(true)}>
                    그룹참여하기
                </Button>
            </Box>

            <GroupJoinDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                userId={userId}
            />
        </>
    );
};

export default UserGroupInfoTab;